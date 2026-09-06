import { getCurrentUser } from 'aws-amplify/auth';
import { graphqlQuery } from './graphqlClient';
import { forumGetVotes, forumRequest } from './forumHttp';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import i18n from '@/i18n/config';
import { sanitizeUserVisibleText } from '@/utils/bbcodeParser';

// Client interface
export interface Client {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  weight?: number;
}

export interface ClientRegistrationProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  weightKg?: number;
  displayName?: string;
}

// Queries for Client
// Use the byEmail index query first for reliable lookup.
const CLIENTS_BY_EMAIL_QUERY = `
  query ClientsByEmail($email: ID!, $limit: Int) {
    clientsByEmail(email: $email, limit: $limit) {
      items {
        id
        email
        phone
        firstName
        lastName
        displayName
      }
    }
  }
`;

// Fallback query (kept for backward compatibility in case index query is unavailable)
const LIST_CLIENTS_BY_EMAIL_FILTER_QUERY = `
  query GetClientByEmail($email: ID!, $limit: Int) {
    listClients(filter: { email: { eq: $email } }, limit: $limit) {
      items {
        id
        email
        phone
        firstName
        lastName
        displayName
      }
    }
  }
`;

const LIST_CLIENTS_PAGE_QUERY = `
  query ListClientsPage($limit: Int, $nextToken: String) {
    listClients(limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        phone
        firstName
        lastName
        displayName
      }
      nextToken
    }
  }
`;

const CREATE_CLIENT_MUTATION = `
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) {
      id
      email
      phone
      firstName
      lastName
      displayName
    }
  }
`;

const UPDATE_CLIENT_MUTATION = `
  mutation UpdateClient($input: UpdateClientInput!) {
    updateClient(input: $input) {
      id
      email
      phone
      firstName
      lastName
      displayName
    }
  }
`;

// Cache for Client lookups (to avoid repeated queries)
const clientCache = new Map<string, { clientId: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const normalizeClientDisplayName = (displayName?: string): string | undefined => {
  const normalized = displayName?.trim();
  return normalized ? normalized : undefined;
};

const normalizeClientPhone = (phone?: string): string | undefined => {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  return digits ? `+852${digits}` : undefined;
};

const normalizeClientWeight = (weightKg?: number): number | undefined => {
  if (typeof weightKg !== "number" || Number.isNaN(weightKg) || weightKg <= 0) {
    return undefined;
  }

  return Math.round(weightKg * 10) / 10;
};

const dedupeClientsById = (clients: Client[]): Client[] => {
  const map = new Map<string, Client>();
  for (const client of clients) {
    if (client?.id && !map.has(client.id)) {
      map.set(client.id, client);
    }
  }
  return Array.from(map.values());
};

const fetchClientsByEmailCandidate = async (email: string): Promise<Client[]> => {
  const results: Client[] = [];

  try {
    const indexResult = await graphqlQuery<{
      clientsByEmail?: { items?: Client[] };
    }>(
      CLIENTS_BY_EMAIL_QUERY,
      { email, limit: 50 },
      { authMode: 'userPool' }
    );
    results.push(...(indexResult.clientsByEmail?.items || []));
  } catch {
    // ignore and fallback below
  }

  try {
    const filterResult = await graphqlQuery<{
      listClients?: { items?: Client[] };
    }>(
      LIST_CLIENTS_BY_EMAIL_FILTER_QUERY,
      { email, limit: 50 },
      { authMode: 'userPool' }
    );
    results.push(...(filterResult.listClients?.items || []));
  } catch {
    // ignore and fallback handled by caller
  }

  return dedupeClientsById(results);
};

export const getClientsByEmail = async (email: string): Promise<Client[]> => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return [];
  }

  const candidates = Array.from(new Set([trimmedEmail, trimmedEmail.toLowerCase()]));
  const normalizedCandidates = candidates.map((candidate) => candidate.trim().toLowerCase());
  const aggregated: Client[] = [];

  for (const candidate of candidates) {
    const matched = await fetchClientsByEmailCandidate(candidate);
    aggregated.push(...matched);
  }

  let deduped = dedupeClientsById(aggregated);
  if (deduped.length > 0) {
    return deduped;
  }

  let nextToken: string | undefined;
  let page = 0;
  do {
    const pageResult = await graphqlQuery<{
      listClients?: { items?: Client[]; nextToken?: string | null };
    }>(
      LIST_CLIENTS_PAGE_QUERY,
      { limit: 100, nextToken },
      { authMode: 'userPool' }
    );

    const items = pageResult.listClients?.items || [];
    const matched = items.filter((client) => {
      const clientEmail = client?.email?.trim().toLowerCase();
      return Boolean(clientEmail && normalizedCandidates.includes(clientEmail));
    });
    deduped = dedupeClientsById([...deduped, ...matched]);

    nextToken = pageResult.listClients?.nextToken || undefined;
    page += 1;
  } while (nextToken && page < 10);

  return deduped;
};

const lookupClientByEmail = async (email: string): Promise<Client | undefined> => {
  const pickBestClient = (clients?: Client[]) => {
    const items = (clients || []).filter(Boolean);
    return items.find((client) => isClientProfileComplete(client)) || items[0];
  };

  // 1) Preferred: query by the byEmail index.
  try {
    const indexResult = await graphqlQuery<{
      clientsByEmail: { items: Client[] };
    }>(
      CLIENTS_BY_EMAIL_QUERY,
      { email, limit: 20 },
      { authMode: 'userPool' }
    );
    const byIndex = pickBestClient(indexResult.clientsByEmail?.items);
    if (byIndex) return byIndex;
  } catch (indexError) {
    // Fallback to listClients filter if index query fails
  }

  // 2) Fallback: listClients with email filter.
  const filterResult = await graphqlQuery<{
    listClients: { items: Client[] };
  }>(
    LIST_CLIENTS_BY_EMAIL_FILTER_QUERY,
    { email, limit: 20 },
    { authMode: 'userPool' }
  );
  return pickBestClient(filterResult.listClients?.items);
};

export const getClientByEmail = async (email: string): Promise<Client | undefined> => {
  const clients = await getClientsByEmail(email);
  return clients.find((client) => isClientProfileComplete(client)) || clients[0];
};

export const areAllMatchingClientProfilesComplete = async (email: string): Promise<boolean> => {
  const clients = await getClientsByEmail(email);
  if (clients.length === 0) {
    return false;
  }
  return clients.some((client) => isClientProfileComplete(client));
};

export const isClientProfileComplete = (client?: Client | null): boolean => {
  if (!client) {
    return false;
  }

  const hasFirstName = Boolean(client.firstName?.trim());
  const hasLastName = Boolean(client.lastName?.trim());
  const hasPhone = Boolean(client.phone?.trim());

  return hasFirstName && hasLastName && hasPhone;
};

export const createClientProfileForCurrentUser = async (
  userEmail: string,
  authenticatedUserEmail?: string,
  profile?: ClientRegistrationProfile
): Promise<string> => {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const normalizedAuthenticatedEmail = authenticatedUserEmail?.trim().toLowerCase();
  const normalizedFirstName = profile?.firstName?.trim();
  const normalizedLastName = profile?.lastName?.trim();
  const normalizedDisplayName = normalizeClientDisplayName(
    profile?.displayName || [normalizedFirstName, normalizedLastName].filter(Boolean).join(" ")
  );
  const normalizedPhone = normalizeClientPhone(profile?.phone);
  const normalizedWeight = normalizeClientWeight(profile?.weightKg);

  if (normalizedAuthenticatedEmail && normalizedEmail !== normalizedAuthenticatedEmail) {
    throw new Error(`Security violation: Cannot create Client with email ${userEmail}. You are authenticated as ${authenticatedUserEmail}.`);
  }

  // Match the mobile app: key Client.id to Cognito sub so /users/<id>,
  // reviewerId, and owner auth all resolve to the same identity.
  const currentUser = await getCurrentUser();
  const cognitoSub = currentUser.userId || currentUser.username;
  if (!cognitoSub) {
    throw new Error('Cannot create Client without an authenticated Cognito user id.');
  }

  const createInput: any = {
    id: cognitoSub,
    email: normalizedEmail,
    firstName: (normalizedFirstName || normalizedDisplayName || 'User').trim(),
    lastName: normalizedLastName || '',
  };

  if (normalizedDisplayName) {
    createInput.displayName = normalizedDisplayName;
  }
  if (normalizedPhone) {
    createInput.phone = normalizedPhone;
  }
  if (normalizedWeight !== undefined) {
    createInput.weight = normalizedWeight;
  }

  const createClientResult = await graphqlQuery<{ createClient: Client | null }>(
    CREATE_CLIENT_MUTATION,
    { input: createInput },
    { authMode: 'userPool' }
  );

  const client = createClientResult.createClient;
  if (!client?.id) {
    throw new Error(`Client creation returned no id for email: ${userEmail}`);
  }

  clientCache.set(normalizedEmail, {
    clientId: client.id,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return client.id;
};

/**
 * Get or create Client for the current user
 * This returns Client.id to use as authorId when creating posts
 */
export const getOrCreateClient = async (
  userEmail: string,
  authenticatedUserEmail?: string,
  profile?: ClientRegistrationProfile
): Promise<string> => {
  try {
    const normalizedEmail = userEmail.trim().toLowerCase();
    const normalizedAuthenticatedEmail = authenticatedUserEmail?.trim().toLowerCase();
    const normalizedFirstName = profile?.firstName?.trim();
    const normalizedLastName = profile?.lastName?.trim();
    const normalizedDisplayName = normalizeClientDisplayName(
      profile?.displayName || [normalizedFirstName, normalizedLastName].filter(Boolean).join(" ")
    );
    const normalizedPhone = normalizeClientPhone(profile?.phone);
    const normalizedWeight = normalizeClientWeight(profile?.weightKg);
    const hasProfileValues = Boolean(
      normalizedFirstName ||
      normalizedLastName ||
      normalizedDisplayName ||
      normalizedPhone ||
      normalizedWeight !== undefined
    );

    // SECURITY: Validate that the email matches the authenticated user's email
    // This prevents users from creating posts with other people's emails
    if (normalizedAuthenticatedEmail && normalizedEmail !== normalizedAuthenticatedEmail) {
      throw new Error(`Security violation: Cannot create Client with email ${userEmail}. You are authenticated as ${authenticatedUserEmail}. You can only create posts with your own email.`);
    }

    // Check cache first
    const cached = clientCache.get(normalizedEmail);
    if (!hasProfileValues && cached && cached.expiresAt > Date.now()) {
      return cached.clientId;
    }

    // Step 1: Get Client by normalized email
    let client = await lookupClientByEmail(normalizedEmail);
    const foundExistingClient = Boolean(client);
    
    // Step 2: Create Client if it doesn't exist
    // Note: We do NOT extract name from email - use "User" as fallback
    // The user should update their profile to set their real name
    if (!client) {
      try {
        const clientId = await createClientProfileForCurrentUser(
          normalizedEmail,
          normalizedAuthenticatedEmail,
          profile
        );
        client = { id: clientId, email: normalizedEmail, firstName: normalizedFirstName || normalizedDisplayName || 'User', lastName: normalizedLastName || '' };
        
        // If creation returned null, it might be an auth issue or the Client already exists
        if (!client) {
          // Wait a bit and try fetching again (in case it was created but not immediately available)
          await new Promise(resolve => setTimeout(resolve, 500));
          client = await lookupClientByEmail(normalizedEmail);
          
          if (!client) {
            throw new Error(`Client creation returned null for email: ${userEmail}. This might be due to authentication permissions. Please ensure you are logged in.`);
          }
        }
        
        if (!client.id) {
          throw new Error(`Client creation returned a Client without an id for email: ${userEmail}`);
        }
      } catch (createError: any) {
        console.error('Error creating Client:', createError);
        // If creation fails (e.g., Client already exists, auth issue), try to fetch again
        client = await lookupClientByEmail(normalizedEmail);
        
        if (!client) {
          const errorMessage = createError.message || createError.toString();
          // Provide more helpful error message
          let detailedError = `Failed to create or find Client for email: ${userEmail}.`;
          if (errorMessage.includes('Unauthorized') || errorMessage.includes('email')) {
            detailedError += ` You must be logged in to create a forum post. Please ensure you are authenticated with the correct email address.`;
          } else {
            detailedError += ` ${errorMessage}`;
          }
          throw new Error(detailedError);
        }
      }
    }

    // Ensure client exists and has an id
    if (!client || !client.id) {
      throw new Error(`Client record is missing required 'id' field for email: ${userEmail}`);
    }

    if (foundExistingClient && hasProfileValues) {
      const updateInput: any = { id: client.id };

      if (normalizedFirstName && client.firstName !== normalizedFirstName) {
        updateInput.firstName = normalizedFirstName;
      }
      if (normalizedLastName && client.lastName !== normalizedLastName) {
        updateInput.lastName = normalizedLastName;
      }
      if (normalizedDisplayName && client.displayName !== normalizedDisplayName) {
        updateInput.displayName = normalizedDisplayName;
      }
      if (normalizedPhone && client.phone !== normalizedPhone) {
        updateInput.phone = normalizedPhone;
      }
      if (normalizedWeight !== undefined && client.weight !== normalizedWeight) {
        updateInput.weight = normalizedWeight;
      }

      if (Object.keys(updateInput).length > 1) {
        const updateClientResult = await graphqlQuery<{ updateClient: Client | null }>(
          UPDATE_CLIENT_MUTATION,
          { input: updateInput },
          { authMode: 'userPool' }
        );
        client = updateClientResult.updateClient || client;
      }
    }

    // Cache the result
    clientCache.set(normalizedEmail, {
      clientId: client.id,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return client.id;
  } catch (error) {
    console.error('Error getting or creating Client:', error);
    throw error;
  }
};

export const updateExistingClientProfile = async (
  userEmail: string,
  authenticatedUserEmail?: string,
  profile?: ClientRegistrationProfile
): Promise<string> => {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const normalizedAuthenticatedEmail = authenticatedUserEmail?.trim().toLowerCase();
  const normalizedFirstName = profile?.firstName?.trim();
  const normalizedLastName = profile?.lastName?.trim();
  const normalizedDisplayName = normalizeClientDisplayName(
    profile?.displayName || [normalizedFirstName, normalizedLastName].filter(Boolean).join(" ")
  );
  const normalizedPhone = normalizeClientPhone(profile?.phone);
  const normalizedWeight = normalizeClientWeight(profile?.weightKg);

  if (normalizedAuthenticatedEmail && normalizedEmail !== normalizedAuthenticatedEmail) {
    throw new Error(`Security violation: Cannot update Client with email ${userEmail}. You are authenticated as ${authenticatedUserEmail}.`);
  }

  const clients = await getClientsByEmail(normalizedEmail);
  if (clients.length === 0) {
    throw new Error(`Client profile not found for ${normalizedEmail}. Please contact support instead of creating a duplicate profile.`);
  }
  let primaryClientId = clients[0].id;

  for (const client of clients) {
    const updateInput: any = { id: client.id };
    if (normalizedFirstName && client.firstName !== normalizedFirstName) {
      updateInput.firstName = normalizedFirstName;
    }
    if (normalizedLastName && client.lastName !== normalizedLastName) {
      updateInput.lastName = normalizedLastName;
    }
    if (normalizedDisplayName && client.displayName !== normalizedDisplayName) {
      updateInput.displayName = normalizedDisplayName;
    }
    if (normalizedPhone && client.phone !== normalizedPhone) {
      updateInput.phone = normalizedPhone;
    }
    if (normalizedWeight !== undefined && client.weight !== normalizedWeight) {
      updateInput.weight = normalizedWeight;
    }

    if (Object.keys(updateInput).length > 1) {
      await graphqlQuery<{ updateClient: Client | null }>(
        UPDATE_CLIENT_MUTATION,
        { input: updateInput },
        { authMode: 'userPool' }
      );
    }
  }

  clientCache.set(normalizedEmail, {
    clientId: primaryClientId,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return primaryClientId;
};

/**
 * Ensure the authenticated user has a Client profile and optionally persist a display name.
 */
export const ensureClientProfile = async (
  userEmail: string,
  authenticatedUserEmail?: string,
  profile?: ClientRegistrationProfile
): Promise<string> => {
  const clientId = await getOrCreateClient(userEmail, authenticatedUserEmail, profile);
  const normalizedDisplayName = normalizeClientDisplayName(
    profile?.displayName || [profile?.firstName?.trim(), profile?.lastName?.trim()].filter(Boolean).join(" ")
  );

  if (normalizedDisplayName) {
    await updateClientName(userEmail, normalizedDisplayName);
  }

  return clientId;
};

/**
 * Update a Client's display name (firstName) after registration
 */
export const updateClientName = async (email: string, displayName: string): Promise<void> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDisplayName = normalizeClientDisplayName(displayName);

    if (!normalizedDisplayName) {
      return;
    }
    
    // Look up client by email
    const client = await lookupClientByEmail(normalizedEmail);
    if (!client) {
      console.warn('Client not found for username update:', normalizedEmail);
      return;
    }

    if (client.firstName === normalizedDisplayName && client.displayName === normalizedDisplayName) {
      return;
    }

    await graphqlQuery(
      UPDATE_CLIENT_MUTATION,
      {
        input: {
          id: client.id,
          firstName: normalizedDisplayName,
          displayName: normalizedDisplayName,
        },
      },
      { authMode: 'userPool' }
    );
    
    // Clear cache so the new name is picked up
    clientCache.delete(normalizedEmail);
  } catch (error) {
    console.error('Error updating client name:', error);
    throw error;
  }
};

// Fixed Forum Categories (comprehensive list for pet forum)
export const FORUM_CATEGORIES = [
  // Pet Types
  { value: "DOG", label: "狗狗" },
  { value: "CAT", label: "貓貓" },
  { value: "SMALL_ANIMAL", label: "小動物" },
  
  // Life & Community
  { value: "LIFE_SHARING", label: "生活分享" },
  { value: "EVENTS", label: "活動" },
  { value: "ADOPTION", label: "領養" },
  
  // Health & Care
  { value: "HEALTH", label: "健康" },
  { value: "GROOMING", label: "美容" },
  { value: "DIET", label: "飲食" },
  { value: "TRAINING", label: "訓練" },
  { value: "BEHAVIOR", label: "行為問題" },
  
  // Services & Products
  { value: "PRODUCT_REVIEW", label: "用品評價" },
  { value: "TRADING", label: "交易" },
  { value: "TRAVEL", label: "旅遊" },
  { value: "LODGING", label: "住宿" },
  
  // Emergency & Support
  { value: "LOST_FOUND", label: "走失協尋" },
  { value: "EMERGENCY", label: "緊急求助" },
] as const;

export type ForumCategoryValue = typeof FORUM_CATEGORIES[number]['value'];

// Helper to get category label with i18n support
export const getCategoryLabel = (value: string, language?: string): string => {
  const lang = language || i18n.language || 'zh';
  const translationKey = `forum.categories.${value}`;
  const translated = i18n.t(translationKey, { lng: lang });
  
  // If translation exists and is not the key itself, use it
  if (translated && translated !== translationKey) {
    return translated;
  }
  
  // Fallback to hardcoded label
  const category = FORUM_CATEGORIES.find(cat => cat.value === value);
  return category?.label || value;
};

// Helper to get all category options with i18n support
export const getForumCategories = (language?: string) => {
  const lang = language || i18n.language || 'zh';
  return FORUM_CATEGORIES.map(cat => ({
    value: cat.value,
    label: getCategoryLabel(cat.value, lang)
  }));
};

// Forum Tag Interface
export interface ForumTag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Post-Tag Junction Interface
export interface PostTag {
  id: string;
  postId: string;
  tagId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[]; // Legacy tags field
  attachments: string[];
  likes: number;
  dislikes?: number; // Optional for backward compatibility
  replies: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  category: string; // Category (fixed enum values or legacy strings)
  location: string;
  createdAt?: string;
  updatedAt?: string;
  lastReplyAt?: string;
  // Anonymous mode fields
  isAnonymous?: boolean;
  anonHash?: string;
  // Author display name (firstName + lastName) - stored at creation time
  // Optional: not set for anonymous posts
  authorName?: string;
  // Hot ranking score
  hotScore?: number;
  // Marked by scheduler Lambda
  isHot?: boolean;
  // Author info (hidden if anonymous) - kept for backward compatibility
  author?: {
    firstName: string;
    lastName: string;
    displayName?: string;
  };
  // New tag relationships
  postTags?: Array<{
    tag: ForumTag;
  }>;
}

export interface ForumReply {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentReplyId: string | null;
  likes: number;
  dislikes?: number; // Optional for backward compatibility
  isDeleted: boolean;
  attachments: string[];
  createdAt?: string;
  updatedAt?: string;
  author?: {
    firstName: string;
    lastName: string;
    displayName?: string;
  };
}

const LIST_FORUM_POSTS_QUERY = `
  query ListForumPosts($filter: ModelForumPostFilterInput, $limit: Int) {
    listForumPosts(filter: $filter, limit: $limit) {
      items {
        id
        title
        content
        authorId
        tags
        attachments
        likes
        dislikes
        replies
        views
        isPinned
        isLocked
        isDeleted
        category
        location
        createdAt
        updatedAt
        lastReplyAt
        isAnonymous
        anonHash
        authorName
        hotScore
        isHot
      }
    }
  }
`;

// Backward-compatible query for environments where ForumPost.isHot is not in schema yet
const LIST_FORUM_POSTS_QUERY_LEGACY = `
  query ListForumPosts($filter: ModelForumPostFilterInput, $limit: Int) {
    listForumPosts(filter: $filter, limit: $limit) {
      items {
        id
        title
        content
        authorId
        tags
        attachments
        likes
        dislikes
        replies
        views
        isPinned
        isLocked
        isDeleted
        category
        location
        createdAt
        updatedAt
        lastReplyAt
        isAnonymous
        anonHash
        authorName
        hotScore
      }
    }
  }
`;

const GET_CLIENT_BY_ID_QUERY = `
  query GetClient($id: ID!) {
    getClient(id: $id) {
      id
      firstName
      lastName
      displayName
    }
  }
`;

const SEARCH_FORUM_POSTS_QUERY = `
  query SearchForumPosts($filter: SearchableForumPostFilterInput, $limit: Int) {
    searchForumPosts(filter: $filter, limit: $limit) {
      items {
        id
        title
        content
        authorId
        tags
        attachments
        likes
        dislikes
        replies
        views
        isPinned
        isLocked
        isDeleted
        category
        location
        createdAt
        updatedAt
        lastReplyAt
        isAnonymous
        anonHash
        authorName
        hotScore
        isHot
      }
    }
  }
`;

// Backward-compatible query for environments where ForumPost.isHot is not in schema yet
const SEARCH_FORUM_POSTS_QUERY_LEGACY = `
  query SearchForumPosts($filter: SearchableForumPostFilterInput, $limit: Int) {
    searchForumPosts(filter: $filter, limit: $limit) {
      items {
        id
        title
        content
        authorId
        tags
        attachments
        likes
        dislikes
        replies
        views
        isPinned
        isLocked
        isDeleted
        category
        location
        createdAt
        updatedAt
        lastReplyAt
        isAnonymous
        anonHash
        authorName
        hotScore
      }
    }
  }
`;

const GET_FORUM_POST_QUERY = `
  query GetForumPost($id: ID!) {
    getForumPost(id: $id) {
      id
      title
      content
      authorId
      tags
      attachments
      likes
      dislikes
      replies
      views
      isPinned
      isLocked
      isDeleted
      category
      location
      createdAt
      updatedAt
      lastReplyAt
      isAnonymous
      anonHash
      authorName
      hotScore
      isHot
    }
  }
`;

const LIST_REPLIES_QUERY = `
  query ListReplies($filter: ModelReplyFilterInput, $limit: Int, $nextToken: String) {
    listReplies(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        content
        postId
        authorId
        parentReplyId
        likes
        dislikes
        isDeleted
        attachments
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Tag Queries
const LIST_TAGS_QUERY = `
  query ListTags($filter: ModelForumTagFilterInput, $limit: Int) {
    listForumTags(filter: $filter, limit: $limit) {
      items {
        id
        name
        createdAt
        updatedAt
      }
    }
  }
`;

const SEARCH_TAGS_QUERY = `
  query SearchTags($filter: SearchableForumTagFilterInput, $limit: Int) {
    searchForumTags(filter: $filter, limit: $limit) {
      items {
        id
        name
        createdAt
        updatedAt
      }
    }
  }
`;

// Backward-compatible query for environments where ForumPost.isHot is not in schema yet
const GET_FORUM_POST_QUERY_LEGACY = `
  query GetForumPost($id: ID!) {
    getForumPost(id: $id) {
      id
      title
      content
      authorId
      tags
      attachments
      likes
      dislikes
      replies
      views
      isPinned
      isLocked
      isDeleted
      category
      location
      createdAt
      updatedAt
      lastReplyAt
      isAnonymous
      anonHash
      authorName
      hotScore
    }
  }
`;

let forumPostIsHotFieldSupported: boolean | undefined;
let loggedIsHotSchemaFallback = false;

const isIsHotFieldUndefinedError = (error: any): boolean => {
  const message = String(error?.message || error || "");
  const fromErrors =
    Array.isArray(error?.errors) &&
    error.errors.some((e: any) => {
      const msg = String(e?.message ?? "");
      const path = e?.path && Array.isArray(e.path) ? e.path.join("") : "";
      return (
        (msg.includes("Cannot return null for non-nullable type") && (msg.includes("ForumPost") || path.includes("isHot"))) ||
        msg.includes("isHot") ||
        path.includes("isHot")
      );
    });
  return (
    fromErrors ||
    message.includes("Field 'isHot' in type 'ForumPost' is undefined") ||
    message.includes('Cannot query field "isHot" on type "ForumPost"') ||
    message.includes("Cannot query field 'isHot' on type 'ForumPost'") ||
    (message.includes("Cannot return null for non-nullable type") && (message.includes("isHot") || message.includes("ForumPost")))
  );
};

const logIsHotSchemaFallbackOnce = () => {
  if (loggedIsHotSchemaFallback) return;
  loggedIsHotSchemaFallback = true;
  console.warn(
    "[forumApi] ForumPost.isHot is not available in current GraphQL schema. Falling back to legacy queries without isHot."
  );
};

export interface ForumPostFilters {
  category?: string; // Category filter (enum value or legacy string)
  tags?: string[]; // Legacy tag names
  tagIds?: string[]; // New tag IDs
  searchQuery?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  limit?: number;
  sortBy?: 'recent' | 'popular' | 'replies' | 'hot';
}

// Cache for Client data to avoid repeated queries
const clientDataCache = new Map<string, { data: Client; expiresAt: number }>();
const CLIENT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch Client data by ID (with caching)
 */
const getClientById = async (clientId: string): Promise<Client | null> => {
  try {
    // Check cache first
    const cached = clientDataCache.get(clientId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const result = await graphqlQuery<{ getClient: Client | null }>(
      GET_CLIENT_BY_ID_QUERY,
      { id: clientId }
    );

    if (result.getClient) {
      clientDataCache.set(clientId, {
        data: result.getClient,
        expiresAt: Date.now() + CLIENT_CACHE_TTL,
      });
    }

    return result.getClient;
  } catch (error) {
    console.error(`Error fetching Client ${clientId}:`, error);
    return null;
  }
};

/**
 * Generate anonymous hash for posts
 * Format: "匿名用戶 #XXXX" where XXXX is last 4 chars of hash
 */
export const generateAnonHash = (postId: string, authorId: string): string => {
  // Create a deterministic hash from postId and authorId
  const combined = `${postId}-${authorId}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex string and take last 4 chars
  const hexHash = Math.abs(hash).toString(16).padStart(4, '0').slice(-4).toUpperCase();
  return hexHash;
};

/**
 * Calculate hot score based on reply frequency and recency
 * Uses time-decay algorithm: more recent replies contribute more to the score
 * 
 * @param replies - Total number of replies
 * @param likes - Total number of likes
 * @param dislikes - Total number of dislikes
 * @param replyTimestamps - Array of reply creation timestamps (ISO strings)
 * @param postCreatedAt - Post creation timestamp (ISO string)
 * @param lastReplyAt - Last reply timestamp (ISO string)
 */
export const calculateHotScore = (
  replies: number, 
  likes: number, 
  dislikes: number = 0,
  replyTimestamps?: string[],
  postCreatedAt?: string,
  lastReplyAt?: string
): number => {
  const now = Date.now();
  let score = 0;
  
  // Base score from likes/dislikes (less weight than replies)
  score += likes * 0.5;
  score -= dislikes * 0.25;
  
  // If we have reply timestamps, calculate frequency-based score
  if (replyTimestamps && replyTimestamps.length > 0) {
    const sortedTimestamps = replyTimestamps
      .filter(ts => ts) // Filter out null/undefined
      .map(ts => new Date(ts).getTime())
      .sort((a, b) => b - a); // Most recent first
    
    // Calculate time-decay score for each reply
    // More recent replies contribute exponentially more
    sortedTimestamps.forEach((timestamp, index) => {
      const hoursAgo = (now - timestamp) / (1000 * 60 * 60); // Hours since reply
      
      // Time decay: replies in last 24h get full weight, then exponential decay
      let timeWeight = 1.0;
      if (hoursAgo <= 24) {
        // Full weight for last 24 hours
        timeWeight = 1.0;
      } else if (hoursAgo <= 168) { // 7 days
        // Decay to 0.5 over 7 days
        timeWeight = 0.5 + (0.5 * (1 - (hoursAgo - 24) / 144));
      } else if (hoursAgo <= 720) { // 30 days
        // Decay to 0.2 over 30 days
        timeWeight = 0.2 + (0.3 * (1 - (hoursAgo - 168) / 552));
      } else {
        // Very old replies get minimal weight
        timeWeight = Math.max(0.05, 0.2 * Math.exp(-(hoursAgo - 720) / 720));
      }
      
      // Recent replies get bonus (first 10 replies get extra weight)
      const recencyBonus = index < 10 ? 1.2 : 1.0;
      
      // Each reply contributes: base weight * time decay * recency bonus
      score += 2.0 * timeWeight * recencyBonus;
    });
  } else {
    // Fallback: if no timestamps, use simple calculation with lastReplyAt
    if (lastReplyAt) {
      const lastReplyTime = new Date(lastReplyAt).getTime();
      const hoursSinceLastReply = (now - lastReplyTime) / (1000 * 60 * 60);
      
      // Apply time decay to total replies based on last reply time
      let timeWeight = 1.0;
      if (hoursSinceLastReply <= 24) {
        timeWeight = 1.0;
      } else if (hoursSinceLastReply <= 168) {
        timeWeight = 0.5 + (0.5 * (1 - (hoursSinceLastReply - 24) / 144));
      } else {
        timeWeight = Math.max(0.2, 0.5 * Math.exp(-(hoursSinceLastReply - 168) / 720));
      }
      
      score += replies * 2.0 * timeWeight;
    } else {
      // No reply data, use simple calculation
      score += replies * 2.0;
    }
  }
  
  // Boost for posts with high reply frequency (many replies in short time)
  if (replyTimestamps && replyTimestamps.length >= 5) {
    const recentReplies = replyTimestamps.filter(ts => {
      const hoursAgo = (now - new Date(ts).getTime()) / (1000 * 60 * 60);
      return hoursAgo <= 24;
    }).length;
    
    // Frequency bonus: more replies in last 24h = higher score
    if (recentReplies >= 10) {
      score *= 1.5; // 50% boost for very active posts
    } else if (recentReplies >= 5) {
      score *= 1.3; // 30% boost for active posts
    } else if (recentReplies >= 3) {
      score *= 1.15; // 15% boost for moderately active posts
    }
  }
  
  return Math.max(0, score); // Ensure non-negative
};

/**
 * Get all forum categories with i18n support (fixed list, no API call needed)
 * @param language Optional language code (zh/en). Defaults to current i18n language.
 */
export const fetchForumCategories = (language?: string) => {
  const lang = language || i18n.language || 'zh';
  return FORUM_CATEGORIES.map(cat => ({
    value: cat.value,
    label: getCategoryLabel(cat.value, lang)
  }));
};

/**
 * Fetch all forum tags (with optional search)
 */
export const fetchForumTags = async (searchQuery?: string, limit: number = 100): Promise<ForumTag[]> => {
  try {
    if (searchQuery && searchQuery.trim()) {
      // Use search query
      const searchFilter: any = {
        name: { wildcard: `*${searchQuery.toLowerCase()}*` }
      };
      
      const result = await graphqlQuery<{ searchForumTags: { items: ForumTag[] } }>(
        SEARCH_TAGS_QUERY,
        { filter: searchFilter, limit }
      );
      return result.searchForumTags?.items || [];
    } else {
      // Use regular list query
      const result = await graphqlQuery<{ listForumTags: { items: ForumTag[] } }>(
        LIST_TAGS_QUERY,
        { limit }
      );
      return result.listForumTags?.items || [];
    }
  } catch (error) {
    console.error("Error fetching forum tags:", error);
    throw error;
  }
};

/**
 * Create or get tag by name
 */
export const getOrCreateTag = async (tagName: string): Promise<string> => {
  try {
    // First, try to find existing tag
    const existingTags = await fetchForumTags(tagName, 1);
    if (existingTags.length > 0 && existingTags[0]?.name.toLowerCase() === tagName.toLowerCase()) {
      return existingTags[0].id;
    }
    
    // Create new tag
    const CREATE_TAG_MUTATION = `
      mutation CreateTag($input: CreateForumTagInput!) {
        createForumTag(input: $input) {
          id
          name
        }
      }
    `;
    
    const result = await graphqlQuery<{ createForumTag: ForumTag }>(
      CREATE_TAG_MUTATION,
      {
        input: {
          name: tagName.trim()
        }
      }
    );
    
    return result.createForumTag.id;
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
};

/**
 * Batch fetch Client data for multiple authorIds
 * Handles anonymous mode - never returns author info if post is anonymous
 */
const fetchClientsForPosts = async (posts: ForumPost[]): Promise<ForumPost[]> => {
  // Filter out anonymous posts from author fetching
  const nonAnonymousPosts = posts.filter(post => !post.isAnonymous);
  const authorIds = [...new Set(nonAnonymousPosts.map(post => post.authorId).filter(Boolean))];
  
  // Batch fetch all Clients (in parallel) - only for non-anonymous posts
  const clientPromises = authorIds.map(id => getClientById(id));
  const clients = await Promise.all(clientPromises);
  
  // Create a map of clientId -> Client
  const clientMap = new Map<string, Client>();
  authorIds.forEach((id, index) => {
    if (clients[index]) {
      clientMap.set(id, clients[index]!);
    }
  });
  
  // Attach Client data to posts (only for non-anonymous posts)
  return posts.map(post => {
    // If anonymous, don't fetch or attach author info
    if (post.isAnonymous) {
      // Generate hash if not present
      if (!post.anonHash && post.id && post.authorId) {
        post.anonHash = generateAnonHash(post.id, post.authorId);
      }
      return {
        ...post,
        author: undefined, // Never expose author for anonymous posts
        authorId: '', // Clear authorId for security
      };
    }
    
    // For non-anonymous posts, fetch author info
    // Only use firstName+lastName from database, never use displayName (might contain email)
    const client = clientMap.get(post.authorId);
    
    // Debug logging to help identify issues
    if (post.authorId && !client) {
      console.warn(`⚠️ Client not found for authorId: ${post.authorId} (post: ${post.id})`);
    } else if (client) {
      // Verify we have valid firstName/lastName (not email)
      const firstName = client.firstName?.trim() || '';
      const lastName = client.lastName?.trim() || '';
      if (firstName.includes('@') || lastName.includes('@')) {
        console.error(`❌ Client has email in firstName/lastName! authorId: ${post.authorId}, firstName: ${firstName}, lastName: ${lastName}`);
      }
    }
    
    return {
      ...post,
      author: client ? {
        firstName: client.firstName,
        lastName: client.lastName,
        displayName: client.displayName, // email safety is checked in getAuthorDisplayName
      } : undefined,
    };
  });
};

export const fetchAllForumPosts = async (filters?: ForumPostFilters): Promise<ForumPost[]> => {
  const limit = Math.min(Math.max(filters?.limit || 50, 1), 100);
  if (filters?.searchQuery?.trim()) {
    const params = new URLSearchParams({
      q: filters.searchQuery.trim(),
      limit: String(limit),
    });
    const result = await forumRequest<{ items?: ForumPost[] }>(`/api/forum/search?${params.toString()}`);
    return processPosts(result.items || [], filters);
  }
  const sort = filters?.sortBy === "hot" || filters?.sortBy === "popular" ? filters.sortBy : "recent";
  const params = new URLSearchParams({ sort, limit: String(limit) });
  if (filters?.category) params.set("category", filters.category);
  const result = await forumRequest<{ items?: ForumPost[] }>(`/api/forum/posts?${params.toString()}`);
  return processPosts(result.items || [], filters);
};

const normalizePostIsHot = (post: ForumPost): ForumPost => ({
  ...post,
  isHot: post.isHot ?? false,
});

const processPosts = (posts: ForumPost[], filters?: ForumPostFilters): ForumPost[] => {
  let filteredPosts = posts
    .filter((post): post is ForumPost => Boolean(post))
    .map(normalizePostIsHot)
    .filter((post) => !post.isDeleted);

  if (filters?.tags && filters.tags.length > 0) {
    filteredPosts = filteredPosts.filter(post =>
      post.tags && post.tags.some(tag =>
        filters.tags!.some(filterTag =>
          tag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
    );
  }

  if (filters?.dateFrom || filters?.dateTo) {
    filteredPosts = filteredPosts.filter((post) => {
      const created = post.createdAt ? new Date(post.createdAt).getTime() : 0;
      if (filters.dateFrom && created < new Date(filters.dateFrom).getTime()) return false;
      if (filters.dateTo && created > new Date(filters.dateTo).getTime()) return false;
      return true;
    });
  }

  filteredPosts.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (filters?.sortBy === 'hot') {
      const aHotScore = a.hotScore ?? calculateHotScore(
        a.replies,
        a.likes,
        a.dislikes || 0,
        undefined,
        a.createdAt,
        a.lastReplyAt
      );
      const bHotScore = b.hotScore ?? calculateHotScore(
        b.replies,
        b.likes,
        b.dislikes || 0,
        undefined,
        b.createdAt,
        b.lastReplyAt
      );
      if (bHotScore !== aHotScore) return bHotScore - aHotScore;
      const aTime = a.lastReplyAt || a.createdAt;
      const bTime = b.lastReplyAt || b.createdAt;
      if (aTime && bTime) {
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      }
      return 0;
    } else if (filters?.sortBy === 'popular') {
      if (b.likes !== a.likes) return b.likes - a.likes;
      if (b.replies !== a.replies) return b.replies - a.replies;
      return b.views - a.views;
    } else if (filters?.sortBy === 'replies') {
      if (b.replies !== a.replies) return b.replies - a.replies;
      if (b.lastReplyAt && a.lastReplyAt) {
        return new Date(b.lastReplyAt).getTime() - new Date(a.lastReplyAt).getTime();
      }
      return 0;
    } else {
      const aTime = a.lastReplyAt || a.createdAt;
      const bTime = b.lastReplyAt || b.createdAt;
      if (aTime && bTime) {
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      }
      return 0;
    }
  });

  return filteredPosts;
};

export const fetchHotTopics = async (limit: number = 10): Promise<ForumPost[]> => {
  try {
    // Fetch all posts and sort by hotScore
    const allPosts = await fetchAllForumPosts({
      sortBy: 'hot',
      limit: limit * 3 // Fetch more to filter out deleted posts
    });
    
    // Filter and sort by hotScore (descending)
    // Only include posts with recent activity (replies in last 7 days) or high engagement
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const hotTopics = allPosts
      .filter(post => {
        if (post.isDeleted || post.replies === 0) return false;
        
        // Include if has recent reply activity (last 7 days) or high engagement
        const hasRecentActivity = post.lastReplyAt && 
          new Date(post.lastReplyAt).getTime() > sevenDaysAgo;
        const hasHighEngagement = (post.replies >= 5) || (post.likes >= 10);
        
        return hasRecentActivity || hasHighEngagement;
      })
      .sort((a, b) => {
        const aScore = a.hotScore ?? calculateHotScore(
          a.replies,
          a.likes,
          a.dislikes || 0,
          undefined,
          a.createdAt,
          a.lastReplyAt
        );
        const bScore = b.hotScore ?? calculateHotScore(
          b.replies,
          b.likes,
          b.dislikes || 0,
          undefined,
          b.createdAt,
          b.lastReplyAt
        );
        return bScore - aScore;
      })
      .slice(0, limit);
    
    return hotTopics;
  } catch (error) {
    console.error('Error fetching hot topics:', error);
    throw error;
  }
};

// Get all unique categories from posts
export const getCategories = (posts: ForumPost[]): string[] => {
  const categories = new Set<string>();
  posts.forEach(post => {
    if (post.category) {
      categories.add(post.category);
    }
  });
  return Array.from(categories).sort();
};

// Get all unique tags from posts
export const getAllTags = (posts: ForumPost[]): string[] => {
  const tags = new Set<string>();
  posts.forEach(post => {
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
};

// Get display name for author (handles anonymous mode)
// Always uses firstName+lastName from DynamoDB Client, never uses email or displayName
export const getAuthorDisplayName = (
  post?: ForumPost,
  author?: { firstName?: string; lastName?: string; displayName?: string }, 
  authorId?: string,
  language?: string
): string => {
  const lang = language || i18n.language || 'zh';
  
  // Check if post is anonymous
  if (post?.isAnonymous) {
    const hash = post.anonHash || (post.id && authorId ? generateAnonHash(post.id, authorId) : '0000');
    return `${i18n.t('forum.anonymousUser', { lng: lang })} #${hash}`;
  }
  
  // Priority 1: Use stored authorName from post (most efficient, no need to fetch Client)
  // ALWAYS use authorName if it exists - the database is the source of truth
  if (post?.authorName && post.authorName.trim()) {
    return post.authorName.trim();
  }
  
  // Priority 2: Use displayName if set and safe (not an email)
  if (author?.displayName) {
    const dn = author.displayName.trim();
    if (dn && !dn.includes('@')) {
      return dn;
    }
  }

  // Priority 3: Use firstName+lastName from Client (DynamoDB)
  if (author) {
    const { firstName, lastName } = author;
    
    // ALWAYS use firstName+lastName from database - this is the source of truth
    // Use whatever is stored in the database, even if it's "User"
    const firstNameTrimmed = (firstName || '').trim();
    const lastNameTrimmed = (lastName || '').trim();
    
    // Safety check: reject any value that looks like an email
    if (firstNameTrimmed.includes('@') || lastNameTrimmed.includes('@')) {
      console.error(`❌ Rejecting email-like value in firstName/lastName: firstName="${firstNameTrimmed}", lastName="${lastNameTrimmed}", authorId="${authorId || 'unknown'}"`);
      // Fall through to generic fallback
    } else if (firstNameTrimmed || lastNameTrimmed) {
      // Combine firstName and lastName from database (use whatever is stored)
      if (firstNameTrimmed && lastNameTrimmed) {
        return `${firstNameTrimmed} ${lastNameTrimmed}`.trim();
      }
      if (firstNameTrimmed) {
        return firstNameTrimmed;
      }
      if (lastNameTrimmed) {
        return lastNameTrimmed;
      }
    }
  }
  
  // Fallback: if we have authorId but no client data or only fallback name, show generic name
  // Never show email or ID
  // Note: If author data is missing, it means fetchClientsForPosts didn't fetch it
  // The component should ensure Client data is fetched before calling this function
  if (authorId && !author) {
    console.warn(`⚠️ No author data for authorId: ${authorId}. Client data should be fetched before display.`);
  }
  
  if (authorId) {
    return i18n.t('forum.genericUser', { lng: lang });
  }
  return i18n.t('forum.anonymous', { lng: lang });
};

// Fetch a single forum post by ID
export const getForumPostById = async (id: string): Promise<ForumPost> => {
  const result = await forumRequest<{ post: ForumPost }>(`/api/forum/posts/${encodeURIComponent(id)}`);
  const post = result.post;
  if (!post || post.isDeleted) {
    throw new Error("Post not found or has been deleted");
  }
  post.isHot = post.isHot ?? false;
  if (post.isAnonymous) {
    if (!post.anonHash && post.id && post.authorId) {
      post.anonHash = generateAnonHash(post.id, post.authorId);
    }
    post.authorId = "";
    post.author = undefined;
    return post;
  }
  if (post.author) {
    post.author = {
      firstName: post.author.firstName || "",
      lastName: post.author.lastName || "",
      displayName: post.author.displayName,
    };
  }
  return post;
};
export const getForumPostReplies = async (postId: string, limit: number = 100): Promise<ForumReply[]> => {
  const result = await forumRequest<{ items?: ForumReply[] }>(
    `/api/forum/posts/${encodeURIComponent(postId)}/replies?limit=${Math.min(Math.max(limit, 1), 500)}`,
  );
  const filteredReplies = (result.items || [])
    .filter((reply): reply is ForumReply => Boolean(reply))
    .filter((reply) => !reply.isDeleted)
    .map((reply) => ({
      ...reply,
      author: reply.author
        ? {
            firstName: reply.author.firstName || "",
            lastName: reply.author.lastName || "",
            displayName: reply.author.displayName,
          }
        : undefined,
    }));
  filteredReplies.sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  return filteredReplies;
};
export const getRelativeTime = (
  timestamp?: string, 
  locale: string = 'zh'
): string | null => {
  if (!timestamp) {
    return null;
  }
  
  try {
    // Handle various timestamp formats
    let cleanedTimestamp = timestamp;
    
    // Remove microseconds (more than 3 decimal places) if present
    cleanedTimestamp = timestamp.replace(/(\.\d{3})\d+/, '$1');
    
    // Try to parse the date
    const date = new Date(cleanedTimestamp);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      // Try parsing without modifications
      const fallbackDate = new Date(timestamp);
      if (isNaN(fallbackDate.getTime())) {
        throw new Error('Invalid date');
      }
      // Use date-fns to format relative time with proper locale
      const localeObj = locale === 'en' ? enUS : zhTW;
      return formatDistanceToNow(fallbackDate, { 
        addSuffix: true, 
        locale: localeObj 
      });
    }
    
    // Use date-fns to format relative time with proper locale
    const localeObj = locale === 'en' ? enUS : zhTW;
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: localeObj 
    });
  } catch (error) {
    console.error('Error parsing timestamp:', timestamp, error);
    return null;
  }
};

// Moderated create Forum Post Mutation
const CREATE_FORUM_POST_MUTATION = `
  mutation CreateModeratedForumPost($input: ModeratedForumPostInput!) {
    createModeratedForumPost(input: $input) {
      status
      blocked
      message
      filteredContentId
      riskScore
      riskReasons
      matchedTerms
      post {
        id
        title
        content
        authorId
        tags
        attachments
        likes
        dislikes
        replies
        views
        isPinned
        isLocked
        isDeleted
        createdAt
        updatedAt
        category
        location
        isAnonymous
        anonHash
        authorName
        hotScore
        isHot
      }
    }
  }
`;

// Create PostTag Mutation
const CREATE_POST_TAG_MUTATION = `
  mutation CreatePostTag($input: CreatePostTagInput!) {
    createPostTag(input: $input) {
      id
      postId
      tagId
    }
  }
`;

// Update Forum Post Mutation (for updating anonHash after creation)
const UPDATE_FORUM_POST_MUTATION = `
  mutation UpdateForumPost($input: UpdateForumPostInput!) {
    updateForumPost(input: $input) {
      id
      anonHash
      hotScore
    }
  }
`;

export interface CreateForumPostInput {
  title: string;
  content: string;
  authorId: string;
  tags?: string[]; // Legacy tags (for backward compatibility)
  tagIds?: string[]; // New tag IDs (via PostTag junction table)
  attachments?: string[];
  category: string; // Category (enum value: DOG, CAT, SMALL_ANIMAL, HEALTH, PRODUCT_REVIEW, LOST_FOUND)
  location?: string;
  likes?: number; // Default to 0 if not provided
  dislikes?: number; // Default to 0 if not provided
  replies?: number; // Default to 0 if not provided
  views?: number; // Default to 0 if not provided
  isPinned?: boolean; // Default to false if not provided
  isLocked?: boolean; // Default to false if not provided
  isDeleted?: boolean; // Default to false if not provided
  isAnonymous?: boolean; // Default to false if not provided
  isHot?: boolean; // Schema Boolean! - we always send false on create
  anonHash?: string; // Auto-generated if isAnonymous is true
  authorName?: string; // Author display name (firstName + lastName) - optional, not set for anonymous
}

export interface ModeratedPendingReview {
  pendingReview: true;
  filteredContentId?: string;
  moderationStatus?: string;
  riskScore?: number;
  riskReasons?: string[];
  matchedTerms?: string[];
}

export const createForumPost = async (input: CreateForumPostInput): Promise<ForumPost | ModeratedPendingReview> => {
  if (!input.title || !input.content || !input.authorId) {
    throw new Error("Title, content, and authorId are required");
  }
  if (input.title.length < 1 || input.title.length > 200) {
    throw new Error("Title must be between 1 and 200 characters");
  }
  if (input.content.length < 1 || input.content.length > 10000) {
    throw new Error("Content must be between 1 and 10000 characters");
  }
  if (input.tags && input.tags.length > 10) {
    throw new Error("Maximum 10 tags allowed");
  }
  let authorName = input.authorName;
  if (!input.isAnonymous && !authorName && input.authorId) {
    try {
      const client = await getClientById(input.authorId);
      if (client) {
        const firstName = client.firstName?.trim() || "";
        const lastName = client.lastName?.trim() || "";
        if (firstName && lastName) authorName = `${firstName} ${lastName}`.trim();
        else if (firstName) authorName = firstName;
        else if (lastName) authorName = lastName;
      }
    } catch (clientError) {
      console.warn("Could not fetch Client for authorName:", clientError);
    }
  }
  const result = await forumRequest<{
    blocked?: boolean;
    pendingReview?: boolean;
    status?: string;
    filteredContentId?: string;
    riskScore?: number;
    riskReasons?: string[];
    matchedTerms?: string[];
    post?: ForumPost;
  }>("/api/forum/posts", {
    method: "POST",
    auth: true,
    body: {
      title: sanitizeUserVisibleText(input.title).trim(),
      content: sanitizeUserVisibleText(input.content).trim(),
      category: input.category || "DOG",
      tags: input.tags,
      attachments: input.attachments,
      location: input.location,
      isAnonymous: input.isAnonymous ?? false,
      authorName: input.isAnonymous ? undefined : authorName,
    },
  });
  if (result.blocked || result.pendingReview) {
    return {
      pendingReview: true,
      filteredContentId: result.filteredContentId,
      moderationStatus: result.status,
      riskScore: result.riskScore,
      riskReasons: result.riskReasons,
      matchedTerms: result.matchedTerms,
    };
  }
  if (!result.post) throw new Error("Failed to create post");
  return result.post;
};
export interface PostUpvote {
  id: string;
  postId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostDownvote {
  id: string;
  postId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Queries for PostUpvote
const LIST_POST_UPVOTES_QUERY = `
  query ListPostUpvotes($filter: ModelPostUpvoteFilterInput, $limit: Int) {
    listPostUpvotes(filter: $filter, limit: $limit) {
      items {
        id
        postId
        userId
        createdAt
        updatedAt
      }
    }
  }
`;

const CREATE_POST_UPVOTE_MUTATION = `
  mutation CreatePostUpvote($input: CreatePostUpvoteInput!) {
    createPostUpvote(input: $input) {
      id
      postId
      userId
      createdAt
      updatedAt
    }
  }
`;

const DELETE_POST_UPVOTE_MUTATION = `
  mutation DeletePostUpvote($input: DeletePostUpvoteInput!) {
    deletePostUpvote(input: $input) {
      id
    }
  }
`;

const UPDATE_FORUM_POST_LIKES_MUTATION = `
  mutation UpdateForumPost($input: UpdateForumPostInput!) {
    updateForumPost(input: $input) {
      id
      likes
      dislikes
      hotScore
    }
  }
`;

/**
 * Check if user has liked a post
 */
export const checkUserLikedPost = async (postId: string, _userId: string): Promise<boolean> => {
  try {
    const { postVotes } = await forumGetVotes({ postIds: [postId] });
    return postVotes[postId] === 1;
  } catch (error) {
    console.error("Error checking if user liked post:", error);
    return false;
  }
};
export const togglePostLike = async (
  postId: string,
  _userEmail: string,
  _currentLikes: number,
  _currentDislikes: number,
  _currentReplies: number
): Promise<{ liked: boolean; newLikesCount: number; newDislikesCount: number }> => {
  const { postVotes } = await forumGetVotes({ postIds: [postId] });
  const liked = postVotes[postId] !== 1;
  await forumRequest(`/api/forum/posts/${encodeURIComponent(postId)}/vote`, {
    method: "POST",
    auth: true,
    body: { value: liked ? 1 : 0 },
  });
  const post = await getForumPostById(postId);
  return {
    liked,
    newLikesCount: post.likes ?? 0,
    newDislikesCount: post.dislikes ?? 0,
  };
};
export const checkUserDislikedPost = async (postId: string, _userId: string): Promise<boolean> => {
  try {
    const { postVotes } = await forumGetVotes({ postIds: [postId] });
    return postVotes[postId] === -1;
  } catch (error) {
    console.error("Error checking if user disliked post:", error);
    return false;
  }
};
export const togglePostDislike = async (
  postId: string,
  _userEmail: string,
  _currentLikes: number,
  _currentDislikes: number,
  _currentReplies: number
): Promise<{ disliked: boolean; newLikesCount: number; newDislikesCount: number }> => {
  const { postVotes } = await forumGetVotes({ postIds: [postId] });
  const disliked = postVotes[postId] !== -1;
  await forumRequest(`/api/forum/posts/${encodeURIComponent(postId)}/vote`, {
    method: "POST",
    auth: true,
    body: { value: disliked ? -1 : 0 },
  });
  const post = await getForumPostById(postId);
  return {
    disliked,
    newLikesCount: post.likes ?? 0,
    newDislikesCount: post.dislikes ?? 0,
  };
};
export interface ReplyUpvote {
  id: string;
  replyId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

// ReplyDownvote interface
export interface ReplyDownvote {
  id: string;
  replyId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Queries for ReplyUpvote
const LIST_REPLY_UPVOTES_QUERY = `
  query ListReplyUpvotes($filter: ModelReplyUpvoteFilterInput, $limit: Int) {
    listReplyUpvotes(filter: $filter, limit: $limit) {
      items {
        id
        replyId
        userId
        createdAt
        updatedAt
      }
    }
  }
`;

const CREATE_REPLY_UPVOTE_MUTATION = `
  mutation CreateReplyUpvote($input: CreateReplyUpvoteInput!) {
    createReplyUpvote(input: $input) {
      id
      replyId
      userId
      createdAt
      updatedAt
    }
  }
`;

const DELETE_REPLY_UPVOTE_MUTATION = `
  mutation DeleteReplyUpvote($input: DeleteReplyUpvoteInput!) {
    deleteReplyUpvote(input: $input) {
      id
    }
  }
`;

const UPDATE_REPLY_LIKES_MUTATION = `
  mutation UpdateReply($input: UpdateReplyInput!) {
    updateReply(input: $input) {
      id
      likes
      dislikes
    }
  }
`;

// Queries for ReplyDownvote
const LIST_REPLY_DOWNVOTES_QUERY = `
  query ListReplyDownvotes($filter: ModelReplyDownvoteFilterInput, $limit: Int) {
    listReplyDownvotes(filter: $filter, limit: $limit) {
      items {
        id
        replyId
        userId
        createdAt
        updatedAt
      }
    }
  }
`;

const CREATE_REPLY_DOWNVOTE_MUTATION = `
  mutation CreateReplyDownvote($input: CreateReplyDownvoteInput!) {
    createReplyDownvote(input: $input) {
      id
      replyId
      userId
      createdAt
      updatedAt
    }
  }
`;

const DELETE_REPLY_DOWNVOTE_MUTATION = `
  mutation DeleteReplyDownvote($input: DeleteReplyDownvoteInput!) {
    deleteReplyDownvote(input: $input) {
      id
    }
  }
`;

const UPDATE_REPLY_DISLIKES_MUTATION = `
  mutation UpdateReply($input: UpdateReplyInput!) {
    updateReply(input: $input) {
      id
      likes
      dislikes
    }
  }
`;

/**
 * Check if user has liked a reply
 */
export const checkUserLikedReply = async (replyId: string, _userId: string): Promise<boolean> => {
  try {
    const { replyVotes } = await forumGetVotes({ replyIds: [replyId] });
    return replyVotes[replyId] === 1;
  } catch (error) {
    console.error("Error checking if user liked reply:", error);
    return false;
  }
};
export const checkUserDislikedReply = async (replyId: string, _userId: string): Promise<boolean> => {
  try {
    const { replyVotes } = await forumGetVotes({ replyIds: [replyId] });
    return replyVotes[replyId] === -1;
  } catch (error) {
    console.error("Error checking if user disliked reply:", error);
    return false;
  }
};
export const toggleReplyLike = async (
  replyId: string,
  _userEmail: string,
  _currentLikes: number,
  _currentDislikes: number
): Promise<{ liked: boolean; newLikesCount: number; newDislikesCount: number }> => {
  const { replyVotes } = await forumGetVotes({ replyIds: [replyId] });
  const liked = replyVotes[replyId] !== 1;
  const voted = await forumRequest<{ reply?: ForumReply }>(`/api/forum/replies/${encodeURIComponent(replyId)}/vote`, {
    method: "POST",
    auth: true,
    body: { value: liked ? 1 : 0 },
  });
  return {
    liked,
    newLikesCount: voted.reply?.likes ?? 0,
    newDislikesCount: voted.reply?.dislikes ?? 0,
  };
};
export const toggleReplyDislike = async (
  replyId: string,
  _userEmail: string,
  _currentLikes: number,
  _currentDislikes: number
): Promise<{ disliked: boolean; newLikesCount: number; newDislikesCount: number }> => {
  const { replyVotes } = await forumGetVotes({ replyIds: [replyId] });
  const disliked = replyVotes[replyId] !== -1;
  const voted = await forumRequest<{ reply?: ForumReply }>(`/api/forum/replies/${encodeURIComponent(replyId)}/vote`, {
    method: "POST",
    auth: true,
    body: { value: disliked ? -1 : 0 },
  });
  return {
    disliked,
    newLikesCount: voted.reply?.likes ?? 0,
    newDislikesCount: voted.reply?.dislikes ?? 0,
  };
};
export interface CreateReplyInput {
  content: string;
  postId: string;
  authorId: string;
  parentReplyId?: string | null;
  attachments?: string[];
  likes?: number;
  dislikes?: number;
  isDeleted?: boolean;
}

/**
 * Create a reply/comment on a post
 */
export const createForumReply = async (
  input: CreateReplyInput,
  userEmail: string
): Promise<ForumReply | ModeratedPendingReview> => {
  if (!input.content || input.content.trim() === "") {
    throw new Error("Reply content is required");
  }
  if (!input.postId) {
    throw new Error("Post ID is required");
  }
  if (!input.authorId) {
    throw new Error("Author ID is required");
  }
  const userId = await getOrCreateClient(userEmail, userEmail);
  if (userId !== input.authorId) {
    throw new Error("Author ID must match authenticated user");
  }
  const result = await forumRequest<{
    blocked?: boolean;
    pendingReview?: boolean;
    status?: string;
    filteredContentId?: string;
    riskScore?: number;
    riskReasons?: string[];
    matchedTerms?: string[];
    reply?: ForumReply;
  }>(`/api/forum/posts/${encodeURIComponent(input.postId)}/replies`, {
    method: "POST",
    auth: true,
    body: {
      content: sanitizeUserVisibleText(input.content).trim(),
      parentReplyId: input.parentReplyId || undefined,
      attachments: input.attachments,
    },
  });
  if (result.blocked || result.pendingReview) {
    return {
      pendingReview: true,
      filteredContentId: result.filteredContentId,
      moderationStatus: result.status,
      riskScore: result.riskScore,
      riskReasons: result.riskReasons,
      matchedTerms: result.matchedTerms,
    };
  }
  const createdReply = result.reply;
  if (!createdReply) throw new Error("Failed to create reply");
  try {
    const author = await getClientById(input.authorId);
    if (author) {
      createdReply.author = {
        firstName: author.firstName,
        lastName: author.lastName,
      };
    }
  } catch (authorError) {
    console.warn("Error fetching reply author:", authorError);
  }
  return createdReply;
};
export const getPostLikes = async (_postId: string): Promise<PostUpvote[]> => {
  return [];
};
export const getReplyLikes = async (_replyId: string): Promise<ReplyUpvote[]> => {
  return [];
};
export const getUserLikedPosts = async (_userId: string): Promise<PostUpvote[]> => {
  return [];
};
export const getUserDislikedPosts = async (_userId: string): Promise<PostDownvote[]> => {
  return [];
};
export const getUserLikedReplies = async (_userId: string): Promise<ReplyUpvote[]> => {
  return [];
};
export const getUserDislikedReplies = async (_userId: string): Promise<ReplyDownvote[]> => {
  return [];
};
export const getUserInteractions = async (
  _userId: string,
  opts?: { postIds?: string[]; replyIds?: string[] }
): Promise<{
  likedPostIds: Set<string>;
  dislikedPostIds: Set<string>;
  likedReplyIds: Set<string>;
  dislikedReplyIds: Set<string>;
}> => {
  const empty = {
    likedPostIds: new Set<string>(),
    dislikedPostIds: new Set<string>(),
    likedReplyIds: new Set<string>(),
    dislikedReplyIds: new Set<string>(),
  };
  try {
    const postIds = opts?.postIds || [];
    const replyIds = opts?.replyIds || [];
    if (!postIds.length && !replyIds.length) return empty;
    const { postVotes, replyVotes } = await forumGetVotes({ postIds, replyIds });
    for (const [id, value] of Object.entries(postVotes)) {
      if (value === 1) empty.likedPostIds.add(id);
      if (value === -1) empty.dislikedPostIds.add(id);
    }
    for (const [id, value] of Object.entries(replyVotes)) {
      if (value === 1) empty.likedReplyIds.add(id);
      if (value === -1) empty.dislikedReplyIds.add(id);
    }
    return empty;
  } catch (error) {
    console.error("Error getting user interactions:", error);
    return empty;
  }
};
export const getUserReplies = async (_userId: string): Promise<ForumReply[]> => {
  return [];
};
export const getPostComments = async (postId: string): Promise<ForumReply[]> => {
  try {
    return await getForumPostReplies(postId, 1000);
  } catch (error) {
    console.error('Error getting post comments:', error);
    throw error;
  }
};