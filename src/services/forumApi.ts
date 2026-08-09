import { getCurrentUser } from 'aws-amplify/auth';
import { graphqlQuery } from './graphqlClient';
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
  try {
    const limit = filters?.limit || 50;
    let result;

    // Use search if searchQuery is provided
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      try {
        const searchFilter: any = {
          and: [
            {
              isDeleted: { ne: true }
            },
            {
              or: [
                { title: { wildcard: `*${filters.searchQuery.toLowerCase()}*` } },
                { content: { wildcard: `*${filters.searchQuery.toLowerCase()}*` } }
              ]
            }
          ]
        };

        // Add category filter to search
        if (filters?.category) {
          searchFilter.and.push({ category: { eq: filters.category } });
        }

        // Add date range filter
        if (filters?.dateFrom || filters?.dateTo) {
          const dateFilter: any = {};
          if (filters.dateFrom) {
            dateFilter.gte = filters.dateFrom;
          }
          if (filters.dateTo) {
            dateFilter.lte = filters.dateTo;
          }
          searchFilter.and.push({ createdAt: dateFilter });
        }

        try {
          if (forumPostIsHotFieldSupported === false) {
            result = await graphqlQuery<{ searchForumPosts: { items: ForumPost[] } }>(
              SEARCH_FORUM_POSTS_QUERY_LEGACY,
              { filter: searchFilter, limit }
            );
          } else {
            result = await graphqlQuery<{ searchForumPosts: { items: ForumPost[] } }>(
              SEARCH_FORUM_POSTS_QUERY,
              { filter: searchFilter, limit }
            );
            forumPostIsHotFieldSupported = forumPostIsHotFieldSupported ?? true;
          }
        } catch (searchWithIsHotError: any) {
          if (!isIsHotFieldUndefinedError(searchWithIsHotError)) {
            throw searchWithIsHotError;
          }
          forumPostIsHotFieldSupported = false;
          logIsHotSchemaFallbackOnce();
          result = await graphqlQuery<{ searchForumPosts: { items: ForumPost[] } }>(
            SEARCH_FORUM_POSTS_QUERY_LEGACY,
            { filter: searchFilter, limit }
          );
        }

        const posts = result.searchForumPosts?.items || [];
        const postsWithAuthors = await fetchClientsForPosts(posts);
        return processPosts(postsWithAuthors, filters);
      } catch (searchError) {
        console.warn("Search failed, falling back to list query:", searchError);
        // Fall through to list query
      }
    }

    // Use regular list query
    const listFilter: any = {
      isDeleted: { ne: true }
    };

    // Add category filter
    if (filters?.category) {
      listFilter.category = { eq: filters.category };
    }

    // Add date range filter
    if (filters?.dateFrom || filters?.dateTo) {
      const dateFilter: any = {};
      if (filters.dateFrom) {
        dateFilter.ge = filters.dateFrom;
      }
      if (filters.dateTo) {
        dateFilter.le = filters.dateTo;
      }
      listFilter.createdAt = dateFilter;
    }

    try {
      if (forumPostIsHotFieldSupported === false) {
        result = await graphqlQuery<{ listForumPosts: { items: ForumPost[] } }>(
          LIST_FORUM_POSTS_QUERY_LEGACY,
          { filter: Object.keys(listFilter).length > 0 ? listFilter : undefined, limit }
        );
      } else {
        result = await graphqlQuery<{ listForumPosts: { items: ForumPost[] } }>(
          LIST_FORUM_POSTS_QUERY,
          { filter: Object.keys(listFilter).length > 0 ? listFilter : undefined, limit }
        );
        forumPostIsHotFieldSupported = forumPostIsHotFieldSupported ?? true;
      }
    } catch (listWithIsHotError: any) {
      if (!isIsHotFieldUndefinedError(listWithIsHotError)) {
        throw listWithIsHotError;
      }
      forumPostIsHotFieldSupported = false;
      logIsHotSchemaFallbackOnce();
      result = await graphqlQuery<{ listForumPosts: { items: ForumPost[] } }>(
        LIST_FORUM_POSTS_QUERY_LEGACY,
        { filter: Object.keys(listFilter).length > 0 ? listFilter : undefined, limit }
      );
    }

    const posts = result.listForumPosts?.items || [];
    const postsWithAuthors = await fetchClientsForPosts(posts);
    return processPosts(postsWithAuthors, filters);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    throw error;
  }
};

const normalizePostIsHot = (post: ForumPost): ForumPost => ({
  ...post,
  isHot: post.isHot ?? false,
});

const processPosts = (posts: ForumPost[], filters?: ForumPostFilters): ForumPost[] => {
  // Normalize isHot (null/undefined -> false) then filter out null and deleted posts
  let filteredPosts = posts
    .filter((post): post is ForumPost => Boolean(post))
    .map(normalizePostIsHot)
    .filter((post) => !post.isDeleted);

  // Filter by tags if provided
  if (filters?.tags && filters.tags.length > 0) {
    filteredPosts = filteredPosts.filter(post =>
      post.tags && post.tags.some(tag =>
        filters.tags!.some(filterTag =>
          tag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
    );
  }

  // Sort posts
  filteredPosts.sort((a, b) => {
    // Pinned posts first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Then by sort option
    if (filters?.sortBy === 'hot') {
      // Sort by hot score (based on reply frequency and recency)
      // Use stored hotScore if available, otherwise calculate with available data
      const aHotScore = a.hotScore ?? calculateHotScore(
        a.replies, 
        a.likes, 
        a.dislikes || 0,
        undefined, // No reply timestamps in list view
        a.createdAt,
        a.lastReplyAt
      );
      const bHotScore = b.hotScore ?? calculateHotScore(
        b.replies, 
        b.likes, 
        b.dislikes || 0,
        undefined, // No reply timestamps in list view
        b.createdAt,
        b.lastReplyAt
      );
      if (bHotScore !== aHotScore) return bHotScore - aHotScore;
      // If hot scores are equal, sort by recent activity
      const aTime = a.lastReplyAt || a.createdAt;
      const bTime = b.lastReplyAt || b.createdAt;
      if (aTime && bTime) {
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      }
      return 0;
    } else if (filters?.sortBy === 'popular') {
      // Sort by likes, then replies, then views
      if (b.likes !== a.likes) return b.likes - a.likes;
      if (b.replies !== a.replies) return b.replies - a.replies;
      return b.views - a.views;
    } else if (filters?.sortBy === 'replies') {
      // Sort by replies, then by lastReplyAt
      if (b.replies !== a.replies) return b.replies - a.replies;
      if (b.lastReplyAt && a.lastReplyAt) {
        return new Date(b.lastReplyAt).getTime() - new Date(a.lastReplyAt).getTime();
      }
      return 0;
    } else {
      // Default: recent (by createdAt or lastReplyAt)
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

/**
 * Fetch hot topics (most discussed forum posts) sorted by hotScore
 * This shows posts with high reply frequency and recent activity (Recent Trends)
 */
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
  try {
    let result;
    try {
      result = await graphqlQuery<{ getForumPost: ForumPost }>(
        GET_FORUM_POST_QUERY,
        { id }
      );
      forumPostIsHotFieldSupported = forumPostIsHotFieldSupported ?? true;
    } catch (getWithIsHotError: any) {
      if (!isIsHotFieldUndefinedError(getWithIsHotError)) {
        throw getWithIsHotError;
      }
      forumPostIsHotFieldSupported = false;
      logIsHotSchemaFallbackOnce();
      result = await graphqlQuery<{ getForumPost: ForumPost }>(
        GET_FORUM_POST_QUERY_LEGACY,
        { id }
      );
    }

    // Check if post is deleted
    if (result.getForumPost.isDeleted) {
      throw new Error("Post not found or has been deleted");
    }

    const post = result.getForumPost;
    post.isHot = post.isHot ?? false;

    // Handle anonymous mode - never fetch or expose author info
    if (post.isAnonymous) {
      // Generate hash if not present
      if (!post.anonHash && post.id && post.authorId) {
        post.anonHash = generateAnonHash(post.id, post.authorId);
      }
      // Clear authorId for security
      post.authorId = '';
      post.author = undefined;
      return post;
    }

    // Fetch Client data for the author (only for non-anonymous posts)
    // Only use firstName+lastName from database, never use displayName (might contain email)
    if (post.authorId) {
      const client = await getClientById(post.authorId);
      if (client) {
        post.author = {
          firstName: client.firstName,
          lastName: client.lastName,
          // Do not include displayName - it might contain email, we only use firstName+lastName
        };
      }
    }

    return post;
  } catch (error) {
    console.error("Error fetching forum post:", error);
    throw error;
  }
};

// Fetch all replies for a specific post
export const getForumPostReplies = async (postId: string, limit: number = 100): Promise<ForumReply[]> => {
  try {
    // Paginate through all pages to collect every reply for this post.
    // AppSync applies the `filter` AFTER DynamoDB's page scan, so a single
    // request may return fewer items than actually exist.
    const allItems: ForumReply[] = [];
    let nextToken: string | null = null;

    do {
      const variables: Record<string, any> = {
        filter: { postId: { eq: postId } },
        limit,
      };
      if (nextToken) variables.nextToken = nextToken;

      const result = await graphqlQuery<{ listReplies: { items: ForumReply[]; nextToken?: string | null } }>(
        LIST_REPLIES_QUERY,
        variables
      );

      allItems.push(...(result.listReplies.items ?? []));
      nextToken = result.listReplies.nextToken ?? null;
    } while (nextToken);

    // Filter out null and deleted replies
    let filteredReplies = allItems
      .filter((reply): reply is ForumReply => Boolean(reply))
      .filter((reply) => !reply.isDeleted);

    // Fetch Client data for all reply authors
    const authorIds = [...new Set(filteredReplies.map(reply => reply.authorId).filter(Boolean))];
    const clientPromises = authorIds.map(id => getClientById(id));
    const clients = await Promise.all(clientPromises);
    
    const clientMap = new Map<string, Client>();
    authorIds.forEach((id, index) => {
      if (clients[index]) {
        clientMap.set(id, clients[index]!);
      }
    });

    // Attach Client data to replies
    filteredReplies = filteredReplies.map(reply => {
      const client = clientMap.get(reply.authorId);
      return {
        ...reply,
        author: client ? {
          firstName: client.firstName,
          lastName: client.lastName,
          displayName: client.displayName, // email safety is checked in getAuthorDisplayName
        } : undefined,
      };
    });

    // Sort replies by createdAt (oldest first - chronological order)
    filteredReplies.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return filteredReplies;
  } catch (error) {
    console.error("Error fetching forum replies:", error);
    throw error;
  }
};

// Parse timestamp and return relative time using date-fns
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
  try {
    // Validate required fields
    if (!input.title || !input.content || !input.authorId) {
      throw new Error('Title, content, and authorId are required');
    }

    // Validate title length (1-200 characters)
    if (input.title.length < 1 || input.title.length > 200) {
      throw new Error('Title must be between 1 and 200 characters');
    }

    // Validate content length (1-10000 characters)
    if (input.content.length < 1 || input.content.length > 10000) {
      throw new Error('Content must be between 1 and 10000 characters');
    }

    // Validate tags (max 10 tags, each 1-30 characters)
    if (input.tags && input.tags.length > 10) {
      throw new Error('Maximum 10 tags allowed');
    }

    if (input.tags) {
      input.tags.forEach((tag, index) => {
        if (tag.length < 1 || tag.length > 30) {
          throw new Error(`Tag at index ${index} must be between 1 and 30 characters`);
        }
      });
    }

    // Validate tagIds (max 10 tags)
    if (input.tagIds && input.tagIds.length > 10) {
      throw new Error('Maximum 10 tags allowed');
    }

    // anonHash is generated after create (needs postId). Lambda may set a temp hash.

    // Calculate initial hot score (0 for new post, no replies yet)
    const hotScore = calculateHotScore(
      input.replies ?? 0, 
      input.likes ?? 0, 
      input.dislikes ?? 0,
      undefined, // No replies yet for new post
      undefined, // Will be set by createdAt
      undefined  // No lastReplyAt for new post
    );

    // Get author name from Client (DynamoDB) - this is the source of truth
    // Only use DynamoDB Client data, do NOT fetch from Cognito
    let authorName = input.authorName;
    if (!input.isAnonymous && !authorName && input.authorId) {
      try {
        // Fetch Client from DynamoDB only
        // ALWAYS use firstName+lastName from database - this is the source of truth
        const client = await getClientById(input.authorId);
        if (client) {
          const firstName = client.firstName?.trim() || '';
          const lastName = client.lastName?.trim() || '';
          
          // ALWAYS use firstName+lastName from database, even if it's "User"
          // The database is the source of truth - if it says "User", use "User"
          // If the user wants a different name, they should update their Client record in the database
          if (firstName && lastName) {
            authorName = `${firstName} ${lastName}`.trim();
          } else if (firstName) {
            authorName = firstName;
          } else if (lastName) {
            authorName = lastName;
          }
        }
      } catch (clientError) {
        console.warn('Could not fetch Client for authorName:', clientError);
        // Continue without authorName - it's optional
      }
    }

    // Ensure required fields have default values (as per GraphQL schema - ForumPost Boolean! and Int!)
    const postInput: any = {
      title: sanitizeUserVisibleText(input.title).trim(),
      content: sanitizeUserVisibleText(input.content).trim(),
      authorId: input.authorId,
      category: input.category || "DOG", // Required field, default to "DOG" (狗狗)
      tags: input.tags && input.tags.length > 0 ? input.tags : undefined,
      attachments: input.attachments && input.attachments.length > 0 ? input.attachments : undefined,
      location: input.location && input.location.trim() ? input.location.trim() : undefined,
      likes: input.likes ?? 0,
      dislikes: input.dislikes ?? 0,
      replies: input.replies ?? 0,
      views: input.views ?? 0,
      isPinned: input.isPinned ?? false,
      isLocked: input.isLocked ?? false,
      isDeleted: input.isDeleted ?? false,
      isAnonymous: input.isAnonymous ?? false,
      isHot: false, // Boolean! in schema - must be explicit to avoid coerced null
      hotScore: hotScore,
    };

    // Add authorName if not anonymous - ALWAYS use what's in the database
    // The database is the source of truth - use whatever firstName+lastName is stored there
    if (!input.isAnonymous) {
      if (authorName && authorName.trim() !== '') {
        postInput.authorName = authorName.trim();
      }
    }

    // Do not send anonHash here — ModeratedForumPostInput does not define it.
    // Lambda generates a temporary hash when isAnonymous; we overwrite after create.

    const result = await graphqlQuery<{
      createModeratedForumPost: {
        status: string;
        blocked: boolean;
        riskScore?: number;
        riskReasons?: string[];
        matchedTerms?: string[];
        filteredContentId?: string;
        post?: ForumPost;
      };
    }>(
      CREATE_FORUM_POST_MUTATION,
      { input: postInput }
    );

    if (result.createModeratedForumPost.blocked) {
      return {
        pendingReview: true,
        filteredContentId: result.createModeratedForumPost.filteredContentId,
        moderationStatus: result.createModeratedForumPost.status,
        riskScore: result.createModeratedForumPost.riskScore,
        riskReasons: result.createModeratedForumPost.riskReasons,
        matchedTerms: result.createModeratedForumPost.matchedTerms,
      };
    }

    const createdPost = result.createModeratedForumPost.post;
    if (!createdPost) {
      throw new Error('Failed to create forum post');
    }
    createdPost.isHot = createdPost.isHot ?? false;

    // Update anonHash with proper hash based on postId (if anonymous)
    if (input.isAnonymous && createdPost.id) {
      try {
        const properHash = generateAnonHash(createdPost.id, input.authorId);
        
        // Update the post with the proper hash
        await graphqlQuery<{ updateForumPost: ForumPost }>(
          UPDATE_FORUM_POST_MUTATION,
          {
            input: {
              id: createdPost.id,
              anonHash: properHash
            }
          }
        );
        
        // Update the response object
        createdPost.anonHash = properHash;
      } catch (updateError) {
        console.warn('Error updating anonHash:', updateError);
        // If update fails, generate hash locally for display
        createdPost.anonHash = generateAnonHash(createdPost.id, input.authorId);
      }
    }

    // Create PostTag relationships if tagIds are provided
    let finalTagIds: string[] = [];
    
    if (input.tagIds && input.tagIds.length > 0) {
      finalTagIds = input.tagIds;
    } else if (input.tags && input.tags.length > 0) {
      // If tag names are provided (legacy), create/get tags and get their IDs
      try {
        const tagPromises = input.tags.map(tagName => getOrCreateTag(tagName));
        finalTagIds = await Promise.all(tagPromises);
      } catch (tagError) {
        console.warn('Error creating/getting tags from names:', tagError);
        // Continue without tags if this fails
      }
    }

    // Create PostTag relationships
    if (finalTagIds.length > 0 && createdPost.id) {
      try {
        const postTagPromises = finalTagIds
          .filter(tagId => tagId) // Filter out any null/undefined
          .map(tagId =>
            graphqlQuery<{ createPostTag: PostTag }>(
              CREATE_POST_TAG_MUTATION,
              {
                input: {
                  postId: createdPost.id,
                  tagId: tagId
                }
              }
            )
          );
        await Promise.all(postTagPromises);
      } catch (tagError) {
        console.warn('Error creating post tags:', tagError);
        // Don't fail the post creation if tags fail
      }
    }

    // Ensure hotScore is set in response (should already be set from creation)
    if (createdPost.hotScore === undefined || createdPost.hotScore === null) {
      createdPost.hotScore = calculateHotScore(
        createdPost.replies, 
        createdPost.likes, 
        createdPost.dislikes || 0,
        undefined,
        createdPost.createdAt,
        createdPost.lastReplyAt
      );
    }

    // Ensure isAnonymous is set
    createdPost.isAnonymous = input.isAnonymous ?? false;

    return createdPost;
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
};

// PostUpvote interface
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
export const checkUserLikedPost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const result = await graphqlQuery<{
      listPostUpvotes: { items: PostUpvote[] };
    }>(
      LIST_POST_UPVOTES_QUERY,
      {
        filter: {
          postId: { eq: postId },
          userId: { eq: userId }
        },
        limit: 1000 // Increased to avoid early termination in DynamoDB scans
      },
      { authMode: 'userPool' }
    );
    
    return result.listPostUpvotes?.items?.length > 0;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    return false;
  }
};

/**
 * Toggle like on a post (like if not liked, unlike if already liked)
 */
export const togglePostLike = async (
  postId: string,
  userEmail: string,
  currentLikes: number,
  currentDislikes: number,
  currentReplies: number
): Promise<{ liked: boolean; newLikesCount: number; newDislikesCount: number }> => {
  try {
    // Get or create Client for the user
    const userId = await getOrCreateClient(userEmail, userEmail);
    
    // Check if user has already liked or disliked
    const hasLiked = await checkUserLikedPost(postId, userId);
    const hasDisliked = await checkUserDislikedPost(postId, userId);
    
    // If user has disliked, remove the dislike first
    if (hasDisliked) {
      const downvotesResult = await graphqlQuery<{
        listPostDownvotes: { items: PostDownvote[] };
      }>(
        LIST_POST_DOWNVOTES_QUERY,
        {
          filter: {
            postId: { eq: postId },
            userId: { eq: userId }
          },
          limit: 1000 // Increased to avoid early termination in DynamoDB scans
        },
        { authMode: 'userPool' }
      );
      
      const downvote = downvotesResult.listPostDownvotes?.items?.[0];
      if (downvote) {
        await graphqlQuery<{ deletePostDownvote: { id: string } }>(
          DELETE_POST_DOWNVOTE_MUTATION,
          {
            input: { id: downvote.id }
          },
          { authMode: 'userPool' }
        );
      }
    }
    
    if (hasLiked) {
      // Unlike: Find and delete the upvote
      const upvotesResult = await graphqlQuery<{
        listPostUpvotes: { items: PostUpvote[] };
      }>(
        LIST_POST_UPVOTES_QUERY,
        {
          filter: {
            postId: { eq: postId },
            userId: { eq: userId }
          },
          limit: 1000 // Increased to avoid early termination in DynamoDB scans
        },
        { authMode: 'userPool' }
      );
      
      const upvote = upvotesResult.listPostUpvotes?.items?.[0];
      if (upvote) {
        // Delete the upvote
        await graphqlQuery<{ deletePostUpvote: { id: string } }>(
          DELETE_POST_UPVOTE_MUTATION,
          {
            input: { id: upvote.id }
          },
          { authMode: 'userPool' }
        );
        
        // Decrement likes count
        const newLikesCount = Math.max(0, currentLikes - 1);
        const newDislikesCount = hasDisliked ? Math.max(0, currentDislikes - 1) : currentDislikes;
        
        // Fetch reply timestamps for accurate hotScore calculation
        let replyTimestamps: string[] | undefined;
        let postCreatedAt: string | undefined;
        let lastReplyAt: string | undefined;
        try {
          const post = await getForumPostById(postId);
          postCreatedAt = post.createdAt;
          lastReplyAt = post.lastReplyAt;
          const allReplies = await getForumPostReplies(postId, 1000);
          replyTimestamps = allReplies
            .filter(reply => !reply.isDeleted && reply.createdAt)
            .map(reply => reply.createdAt!);
        } catch (err) {
          console.warn('Error fetching replies for hotScore calculation:', err);
          // Continue with fallback calculation
        }
        
        const newHotScore = calculateHotScore(
          currentReplies, 
          newLikesCount, 
          newDislikesCount,
          replyTimestamps,
          postCreatedAt,
          lastReplyAt
        );
        
        await graphqlQuery<{ updateForumPost: { id: string; likes: number; dislikes: number } }>(
          UPDATE_FORUM_POST_LIKES_MUTATION,
          {
            input: {
              id: postId,
              likes: newLikesCount,
              dislikes: newDislikesCount,
              hotScore: newHotScore
            }
          },
          { authMode: 'userPool' }
        );
        
        return { liked: false, newLikesCount, newDislikesCount };
      }
    } else {
      // Like: Double-check before creating (prevent race conditions)
      const doubleCheck = await checkUserLikedPost(postId, userId);
      if (doubleCheck) {
        // User already liked, return current state
        return { liked: true, newLikesCount: currentLikes, newDislikesCount: currentDislikes };
      }
      
      // Create new upvote
      let upvoteCreated = false;
      try {
        const createResult = await graphqlQuery<{ createPostUpvote: PostUpvote }>(
          CREATE_POST_UPVOTE_MUTATION,
          {
            input: {
              postId: postId,
              userId: userId
            }
          },
          { authMode: 'userPool' }
        );
        console.log('Post upvote created:', createResult);
        upvoteCreated = true;
      } catch (error: any) {
        console.error('Error creating post upvote:', error);
        // If error is due to duplicate, check again
        if (error?.message?.includes('duplicate') || error?.message?.includes('already exists')) {
          const alreadyLiked = await checkUserLikedPost(postId, userId);
          if (alreadyLiked) {
            console.log('Post upvote already exists, proceeding with update');
            upvoteCreated = true;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
      
      // Verify the upvote was created successfully
      const verifyLiked = await checkUserLikedPost(postId, userId);
      console.log('Verifying post upvote exists:', verifyLiked, 'upvoteCreated:', upvoteCreated);
      
      if (!verifyLiked && !upvoteCreated) {
        // Upvote wasn't created, return current state
        return { liked: false, newLikesCount: currentLikes, newDislikesCount: currentDislikes };
      }
      
      // Increment likes count
      const newLikesCount = currentLikes + 1;
      const newDislikesCount = hasDisliked ? Math.max(0, currentDislikes - 1) : currentDislikes;
      
      // Fetch reply timestamps for accurate hotScore calculation
      let replyTimestamps: string[] | undefined;
      let postCreatedAt: string | undefined;
      let lastReplyAt: string | undefined;
      try {
        const post = await getForumPostById(postId);
        postCreatedAt = post.createdAt;
        lastReplyAt = post.lastReplyAt;
        const allReplies = await getForumPostReplies(postId, 1000);
        replyTimestamps = allReplies
          .filter(reply => !reply.isDeleted && reply.createdAt)
          .map(reply => reply.createdAt!);
      } catch (err) {
        console.warn('Error fetching replies for hotScore calculation:', err);
        // Continue with fallback calculation
      }
      
      const newHotScore = calculateHotScore(
        currentReplies, 
        newLikesCount, 
        newDislikesCount,
        replyTimestamps,
        postCreatedAt,
        lastReplyAt
      );
      
      console.log('Updating post with likes:', { postId, newLikesCount, newDislikesCount, newHotScore });
      
      const updateResult = await graphqlQuery<{ updateForumPost: { id: string; likes: number; dislikes: number } }>(
        UPDATE_FORUM_POST_LIKES_MUTATION,
        {
          input: {
            id: postId,
            likes: newLikesCount,
            dislikes: newDislikesCount,
            hotScore: newHotScore
          }
        },
        { authMode: 'userPool' }
      );
      
      console.log('Post updated with likes:', updateResult);
      
      // Final verification: Ensure mutual exclusivity
      const finalLiked = await checkUserLikedPost(postId, userId);
      const finalDisliked = await checkUserDislikedPost(postId, userId);
      if (finalLiked && finalDisliked) {
        console.warn('Mutual exclusivity violation detected - both like and dislike exist, removing dislike');
        // Remove dislike to maintain mutual exclusivity
        const downvotesResult = await graphqlQuery<{
          listPostDownvotes: { items: PostDownvote[] };
        }>(
          LIST_POST_DOWNVOTES_QUERY,
          {
            filter: {
              postId: { eq: postId },
              userId: { eq: userId }
            },
            limit: 1000 // Increased to avoid early termination in DynamoDB scans
          },
          { authMode: 'userPool' }
        );
        const downvote = downvotesResult.listPostDownvotes?.items?.[0];
        if (downvote) {
          await graphqlQuery<{ deletePostDownvote: { id: string } }>(
            DELETE_POST_DOWNVOTE_MUTATION,
            {
              input: { id: downvote.id }
            },
            { authMode: 'userPool' }
          );
          const correctedDislikesCount = Math.max(0, newDislikesCount - 1);
          await graphqlQuery<{ updateForumPost: { id: string; dislikes: number } }>(
            UPDATE_FORUM_POST_DISLIKES_MUTATION,
            {
              input: {
                id: postId,
                dislikes: correctedDislikesCount,
                likes: newLikesCount
              }
            },
            { authMode: 'userPool' }
          );
          return { liked: true, newLikesCount, newDislikesCount: correctedDislikesCount };
        }
      }
      
      return { liked: true, newLikesCount, newDislikesCount };
    }
    
    return { liked: false, newLikesCount: currentLikes, newDislikesCount: currentDislikes };
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Queries for PostDownvote
const LIST_POST_DOWNVOTES_QUERY = `
  query ListPostDownvotes($filter: ModelPostDownvoteFilterInput, $limit: Int) {
    listPostDownvotes(filter: $filter, limit: $limit) {
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

const CREATE_POST_DOWNVOTE_MUTATION = `
  mutation CreatePostDownvote($input: CreatePostDownvoteInput!) {
    createPostDownvote(input: $input) {
      id
      postId
      userId
      createdAt
      updatedAt
    }
  }
`;

const DELETE_POST_DOWNVOTE_MUTATION = `
  mutation DeletePostDownvote($input: DeletePostDownvoteInput!) {
    deletePostDownvote(input: $input) {
      id
    }
  }
`;

const UPDATE_FORUM_POST_DISLIKES_MUTATION = `
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
 * Check if user has disliked a post
 */
export const checkUserDislikedPost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const result = await graphqlQuery<{
      listPostDownvotes: { items: PostDownvote[] };
    }>(
      LIST_POST_DOWNVOTES_QUERY,
      {
        filter: {
          postId: { eq: postId },
          userId: { eq: userId }
        },
        limit: 1000 // Increased from 1 to avoid early termination in DynamoDB scans
      },
      { authMode: 'userPool' }
    );
    
    return result.listPostDownvotes?.items?.length > 0;
  } catch (error) {
    console.error('Error checking if user disliked post:', error);
    return false;
  }
};

/**
 * Toggle dislike on a post (dislike if not disliked, undislike if already disliked)
 */
export const togglePostDislike = async (
  postId: string,
  userEmail: string,
  currentLikes: number,
  currentDislikes: number,
  currentReplies: number
): Promise<{ disliked: boolean; newDislikesCount: number; newLikesCount: number }> => {
  try {
    // Get or create Client for the user
    const userId = await getOrCreateClient(userEmail, userEmail);
    
    // Check if user has already liked or disliked
    const hasLiked = await checkUserLikedPost(postId, userId);
    const hasDisliked = await checkUserDislikedPost(postId, userId);
    
    // If user has liked, remove the like first
    if (hasLiked) {
      const upvotesResult = await graphqlQuery<{
        listPostUpvotes: { items: PostUpvote[] };
      }>(
        LIST_POST_UPVOTES_QUERY,
        {
          filter: {
            postId: { eq: postId },
            userId: { eq: userId }
          },
          limit: 1000 // Increased to avoid early termination in DynamoDB scans
        },
        { authMode: 'userPool' }
      );
      
      const upvote = upvotesResult.listPostUpvotes?.items?.[0];
      if (upvote) {
        await graphqlQuery<{ deletePostUpvote: { id: string } }>(
          DELETE_POST_UPVOTE_MUTATION,
          {
            input: { id: upvote.id }
          },
          { authMode: 'userPool' }
        );
      }
    }
    
    if (hasDisliked) {
      // Undislike: Find and delete the downvote
      const downvotesResult = await graphqlQuery<{
        listPostDownvotes: { items: PostDownvote[] };
      }>(
        LIST_POST_DOWNVOTES_QUERY,
        {
          filter: {
            postId: { eq: postId },
            userId: { eq: userId }
          },
          limit: 1000 // Increased to avoid early termination in DynamoDB scans
        },
        { authMode: 'userPool' }
      );
      
      const downvote = downvotesResult.listPostDownvotes?.items?.[0];
      if (downvote) {
        // Delete the downvote
        await graphqlQuery<{ deletePostDownvote: { id: string } }>(
          DELETE_POST_DOWNVOTE_MUTATION,
          {
            input: { id: downvote.id }
          },
          { authMode: 'userPool' }
        );
        
        // Decrement dislikes count
        const newDislikesCount = Math.max(0, currentDislikes - 1);
        const newLikesCount = hasLiked ? Math.max(0, currentLikes - 1) : currentLikes;
        
        // Fetch reply timestamps for accurate hotScore calculation
        let replyTimestamps: string[] | undefined;
        let postCreatedAt: string | undefined;
        let lastReplyAt: string | undefined;
        try {
          const post = await getForumPostById(postId);
          postCreatedAt = post.createdAt;
          lastReplyAt = post.lastReplyAt;
          const allReplies = await getForumPostReplies(postId, 1000);
          replyTimestamps = allReplies
            .filter(reply => !reply.isDeleted && reply.createdAt)
            .map(reply => reply.createdAt!);
        } catch (err) {
          console.warn('Error fetching replies for hotScore calculation:', err);
          // Continue with fallback calculation
        }
        
        const newHotScore = calculateHotScore(
          currentReplies, 
          newLikesCount, 
          newDislikesCount,
          replyTimestamps,
          postCreatedAt,
          lastReplyAt
        );
        
        await graphqlQuery<{ updateForumPost: { id: string; dislikes: number; likes: number } }>(
          UPDATE_FORUM_POST_DISLIKES_MUTATION,
          {
            input: {
              id: postId,
              dislikes: newDislikesCount,
              likes: newLikesCount,
              hotScore: newHotScore
            }
          },
          { authMode: 'userPool' }
        );
        
        return { disliked: false, newDislikesCount, newLikesCount };
      }
    } else {
      // Dislike: Double-check before creating (prevent race conditions)
      const doubleCheck = await checkUserDislikedPost(postId, userId);
      if (doubleCheck) {
        // User already disliked, return current state
        return { disliked: true, newDislikesCount: currentDislikes, newLikesCount: currentLikes };
      }
      
      // Create new downvote
      let downvoteCreated = false;
      try {
        const createResult = await graphqlQuery<{ createPostDownvote: PostDownvote }>(
          CREATE_POST_DOWNVOTE_MUTATION,
          {
            input: {
              postId: postId,
              userId: userId
            }
          },
          { authMode: 'userPool' }
        );
        console.log('Post downvote created:', createResult);
        downvoteCreated = true;
      } catch (error: any) {
        console.error('Error creating post downvote:', error);
        // If error is due to duplicate (e.g., unique constraint violation), check again
        if (error?.message?.includes('duplicate') || error?.message?.includes('already exists')) {
          const alreadyDisliked = await checkUserDislikedPost(postId, userId);
          if (alreadyDisliked) {
            console.log('Downvote already exists, proceeding with update');
            downvoteCreated = true;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
      
      // Verify the downvote was created successfully
      const verifyDisliked = await checkUserDislikedPost(postId, userId);
      console.log('Verifying downvote exists:', verifyDisliked, 'downvoteCreated:', downvoteCreated);
      
      if (!verifyDisliked && !downvoteCreated) {
        // Downvote wasn't created and creation failed, throw error
        throw new Error('Failed to create post downvote');
      }
      
      // Increment dislikes count
      const newDislikesCount = currentDislikes + 1;
      const newLikesCount = hasLiked ? Math.max(0, currentLikes - 1) : currentLikes;
      
      // Fetch reply timestamps for accurate hotScore calculation
      let replyTimestamps: string[] | undefined;
      let postCreatedAt: string | undefined;
      let lastReplyAt: string | undefined;
      try {
        const post = await getForumPostById(postId);
        postCreatedAt = post.createdAt;
        lastReplyAt = post.lastReplyAt;
        const allReplies = await getForumPostReplies(postId, 1000);
        replyTimestamps = allReplies
          .filter(reply => !reply.isDeleted && reply.createdAt)
          .map(reply => reply.createdAt!);
      } catch (err) {
        console.warn('Error fetching replies for hotScore calculation:', err);
        // Continue with fallback calculation
      }
      
      const newHotScore = calculateHotScore(
        currentReplies, 
        newLikesCount, 
        newDislikesCount,
        replyTimestamps,
        postCreatedAt,
        lastReplyAt
      );
      
      console.log('Updating post with dislikes:', { postId, newDislikesCount, newLikesCount, newHotScore });
      
      const updateResult = await graphqlQuery<{ updateForumPost: { id: string; dislikes: number; likes: number } }>(
        UPDATE_FORUM_POST_DISLIKES_MUTATION,
        {
          input: {
            id: postId,
            dislikes: newDislikesCount,
            likes: newLikesCount,
            hotScore: newHotScore
          }
        },
        { authMode: 'userPool' }
      );
      
      console.log('Post updated with dislikes:', updateResult);
      
      // Final verification: Ensure mutual exclusivity
      const finalLiked = await checkUserLikedPost(postId, userId);
      const finalDisliked = await checkUserDislikedPost(postId, userId);
      if (finalLiked && finalDisliked) {
        console.warn('Mutual exclusivity violation detected - both like and dislike exist, removing like');
        // Remove like to maintain mutual exclusivity
        const upvotesResult = await graphqlQuery<{
          listPostUpvotes: { items: PostUpvote[] };
        }>(
          LIST_POST_UPVOTES_QUERY,
          {
            filter: {
              postId: { eq: postId },
              userId: { eq: userId }
            },
            limit: 1000 // Increased to avoid early termination in DynamoDB scans
          },
          { authMode: 'userPool' }
        );
        const upvote = upvotesResult.listPostUpvotes?.items?.[0];
        if (upvote) {
          await graphqlQuery<{ deletePostUpvote: { id: string } }>(
            DELETE_POST_UPVOTE_MUTATION,
            {
              input: { id: upvote.id }
            },
            { authMode: 'userPool' }
          );
          const correctedLikesCount = Math.max(0, newLikesCount - 1);
          await graphqlQuery<{ updateForumPost: { id: string; likes: number } }>(
            UPDATE_FORUM_POST_DISLIKES_MUTATION,
            {
              input: {
                id: postId,
                likes: correctedLikesCount,
                dislikes: newDislikesCount
              }
            },
            { authMode: 'userPool' }
          );
          return { disliked: true, newDislikesCount, newLikesCount: correctedLikesCount };
        }
      }
      
      return { disliked: true, newDislikesCount, newLikesCount };
    }
    
    return { disliked: false, newDislikesCount: currentDislikes, newLikesCount: currentLikes };
  } catch (error) {
    console.error('Error toggling post dislike:', error);
    throw error;
  }
};

// ReplyUpvote interface
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
export const checkUserLikedReply = async (replyId: string, userId: string): Promise<boolean> => {
  try {
    const result = await graphqlQuery<{
      listReplyUpvotes: { items: ReplyUpvote[] };
    }>(
      LIST_REPLY_UPVOTES_QUERY,
      {
        filter: {
          replyId: { eq: replyId },
          userId: { eq: userId }
        },
        limit: 1000 // Increased from 1 to avoid early termination in DynamoDB scans
      },
      { authMode: 'userPool' }
    );
    
    return result.listReplyUpvotes?.items?.length > 0;
  } catch (error) {
    console.error('Error checking if user liked reply:', error);
    return false;
  }
};

/**
 * Check if user has disliked a reply
 */
export const checkUserDislikedReply = async (replyId: string, userId: string): Promise<boolean> => {
  try {
    const result = await graphqlQuery<{
      listReplyDownvotes: { items: ReplyDownvote[] };
    }>(
      LIST_REPLY_DOWNVOTES_QUERY,
      {
        filter: {
          replyId: { eq: replyId },
          userId: { eq: userId }
        },
        limit: 1000 // Increased from 1 to avoid early termination in DynamoDB scans
      },
      { authMode: 'userPool' }
    );
    
    return result.listReplyDownvotes?.items?.length > 0;
  } catch (error) {
    console.error('Error checking if user disliked reply:', error);
    return false;
  }
};

/**
 * Toggle like on a reply (like if not liked, unlike if already liked)
 */
export const toggleReplyLike = async (
  replyId: string,
  userEmail: string,
  currentLikes: number,
  currentDislikes: number = 0
): Promise<{ liked: boolean; newLikesCount: number; newDislikesCount: number }> => {
  try {
    // Get or create Client for the user
    const userId = await getOrCreateClient(userEmail, userEmail);
    
    // Check if user has already liked or disliked
    const hasLiked = await checkUserLikedReply(replyId, userId);
    const hasDisliked = await checkUserDislikedReply(replyId, userId);
    
    if (hasLiked) {
      // Unlike: Find and delete the upvote
      const upvotesResult = await graphqlQuery<{
        listReplyUpvotes: { items: ReplyUpvote[] };
      }>(
        LIST_REPLY_UPVOTES_QUERY,
        {
          filter: {
            replyId: { eq: replyId },
            userId: { eq: userId }
          },
          limit: 1000 // Increased to avoid early termination in DynamoDB scans
        },
        { authMode: 'userPool' }
      );
      
      const upvote = upvotesResult.listReplyUpvotes?.items?.[0];
      if (upvote) {
        // Delete the upvote
        await graphqlQuery<{ deleteReplyUpvote: { id: string } }>(
          DELETE_REPLY_UPVOTE_MUTATION,
          {
            input: { id: upvote.id }
          },
          { authMode: 'userPool' }
        );
        
        // Decrement likes count
        const newLikesCount = Math.max(0, currentLikes - 1);
        const newDislikesCount = currentDislikes; // No change to dislikes
        
        await graphqlQuery<{ updateReply: { id: string; likes: number; dislikes: number } }>(
          UPDATE_REPLY_LIKES_MUTATION,
          {
            input: {
              id: replyId,
              likes: newLikesCount,
              dislikes: newDislikesCount
            }
          },
          { authMode: 'userPool' }
        );
        
        return { liked: false, newLikesCount, newDislikesCount };
      }
    } else {
      // Like: If previously disliked, remove the dislike first
      if (hasDisliked) {
        const downvotesResult = await graphqlQuery<{
          listReplyDownvotes: { items: ReplyDownvote[] };
        }>(
          LIST_REPLY_DOWNVOTES_QUERY,
          {
            filter: {
              replyId: { eq: replyId },
              userId: { eq: userId }
            },
            limit: 1000 // Increased to avoid early termination in DynamoDB scans
          },
          { authMode: 'userPool' }
        );
        
        const downvote = downvotesResult.listReplyDownvotes?.items?.[0];
        if (downvote) {
          await graphqlQuery<{ deleteReplyDownvote: { id: string } }>(
            DELETE_REPLY_DOWNVOTE_MUTATION,
            {
              input: { id: downvote.id }
            },
            { authMode: 'userPool' }
          );
        }
      }
      
      // Create new upvote
      let upvoteCreated = false;
      try {
        const createResult = await graphqlQuery<{ createReplyUpvote: ReplyUpvote }>(
          CREATE_REPLY_UPVOTE_MUTATION,
          {
            input: {
              replyId: replyId,
              userId: userId
            }
          },
          { authMode: 'userPool' }
        );
        console.log('Reply upvote created:', createResult);
        upvoteCreated = true;
      } catch (error: any) {
        console.error('Error creating reply upvote:', error);
        // If error is due to duplicate, check again
        if (error?.message?.includes('duplicate') || error?.message?.includes('already exists')) {
          const alreadyLiked = await checkUserLikedReply(replyId, userId);
          if (alreadyLiked) {
            console.log('Reply upvote already exists, proceeding with update');
            upvoteCreated = true;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
      
      // Verify the upvote was created successfully
      const verifyLiked = await checkUserLikedReply(replyId, userId);
      console.log('Verifying reply upvote exists:', verifyLiked, 'upvoteCreated:', upvoteCreated);
      
      if (!verifyLiked && !upvoteCreated) {
        throw new Error('Failed to create reply upvote');
      }
      
      // Increment likes count, decrement dislikes if was disliked
      const newLikesCount = currentLikes + 1;
      const newDislikesCount = hasDisliked ? Math.max(0, currentDislikes - 1) : currentDislikes;
      
      console.log('Updating reply with likes:', { replyId, newLikesCount, newDislikesCount });
      
      const updateResult = await graphqlQuery<{ updateReply: { id: string; likes: number; dislikes: number } }>(
        UPDATE_REPLY_LIKES_MUTATION,
        {
          input: {
            id: replyId,
            likes: newLikesCount,
            dislikes: newDislikesCount
          }
        },
        { authMode: 'userPool' }
      );
      
      console.log('Reply updated with likes:', updateResult);
      
      // Final verification: Ensure mutual exclusivity
      const finalLiked = await checkUserLikedReply(replyId, userId);
      const finalDisliked = await checkUserDislikedReply(replyId, userId);
      if (finalLiked && finalDisliked) {
        console.warn('Mutual exclusivity violation detected for reply - both like and dislike exist, removing dislike');
        // Remove dislike to maintain mutual exclusivity
        const downvotesResult = await graphqlQuery<{
          listReplyDownvotes: { items: ReplyDownvote[] };
        }>(
          LIST_REPLY_DOWNVOTES_QUERY,
          {
            filter: {
              replyId: { eq: replyId },
              userId: { eq: userId }
            },
            limit: 1000 // Increased to avoid early termination in DynamoDB scans
          },
          { authMode: 'userPool' }
        );
        const downvote = downvotesResult.listReplyDownvotes?.items?.[0];
        if (downvote) {
          await graphqlQuery<{ deleteReplyDownvote: { id: string } }>(
            DELETE_REPLY_DOWNVOTE_MUTATION,
            {
              input: { id: downvote.id }
            },
            { authMode: 'userPool' }
          );
          const correctedDislikesCount = Math.max(0, newDislikesCount - 1);
          await graphqlQuery<{ updateReply: { id: string; dislikes: number } }>(
            UPDATE_REPLY_LIKES_MUTATION,
            {
              input: {
                id: replyId,
                dislikes: correctedDislikesCount,
                likes: newLikesCount
              }
            },
            { authMode: 'userPool' }
          );
          return { liked: true, newLikesCount, newDislikesCount: correctedDislikesCount };
        }
      }
      
      return { liked: true, newLikesCount, newDislikesCount };
    }
    
    return { liked: false, newLikesCount: currentLikes, newDislikesCount: currentDislikes };
  } catch (error) {
    console.error('Error toggling reply like:', error);
    throw error;
  }
};

export const toggleReplyDislike = async (
  replyId: string,
  userEmail: string,
  currentDislikes: number,
  currentLikes: number = 0
): Promise<{ disliked: boolean; newDislikesCount: number; newLikesCount: number }> => {
  try {
    // Get or create Client for the user
    const userId = await getOrCreateClient(userEmail, userEmail);
    
    // Check if user has already liked or disliked
    const hasLiked = await checkUserLikedReply(replyId, userId);
    const hasDisliked = await checkUserDislikedReply(replyId, userId);
    
    if (hasDisliked) {
      // Undislike: Find and delete the downvote
      const downvotesResult = await graphqlQuery<{
        listReplyDownvotes: { items: ReplyDownvote[] };
      }>(
        LIST_REPLY_DOWNVOTES_QUERY,
        {
          filter: {
            replyId: { eq: replyId },
            userId: { eq: userId }
          },
          limit: 1000 // Increased to avoid early termination in DynamoDB scans
        },
        { authMode: 'userPool' }
      );
      
      const downvote = downvotesResult.listReplyDownvotes?.items?.[0];
      if (downvote) {
        // Delete the downvote
        await graphqlQuery<{ deleteReplyDownvote: { id: string } }>(
          DELETE_REPLY_DOWNVOTE_MUTATION,
          {
            input: { id: downvote.id }
          },
          { authMode: 'userPool' }
        );
        
        // Decrement dislikes count
        const newDislikesCount = Math.max(0, currentDislikes - 1);
        const newLikesCount = currentLikes; // No change to likes
        
        await graphqlQuery<{ updateReply: { id: string; likes: number; dislikes: number } }>(
          UPDATE_REPLY_DISLIKES_MUTATION,
          {
            input: {
              id: replyId,
              dislikes: newDislikesCount,
              likes: newLikesCount
            }
          },
          { authMode: 'userPool' }
        );
        
        return { disliked: false, newDislikesCount, newLikesCount };
      }
    } else {
      // Dislike: If previously liked, remove the like first
      if (hasLiked) {
        const upvotesResult = await graphqlQuery<{
          listReplyUpvotes: { items: ReplyUpvote[] };
        }>(
          LIST_REPLY_UPVOTES_QUERY,
          {
            filter: {
              replyId: { eq: replyId },
              userId: { eq: userId }
            },
            limit: 1000 // Increased to avoid early termination in DynamoDB scans
          },
          { authMode: 'userPool' }
        );
        
        const upvote = upvotesResult.listReplyUpvotes?.items?.[0];
        if (upvote) {
          await graphqlQuery<{ deleteReplyUpvote: { id: string } }>(
            DELETE_REPLY_UPVOTE_MUTATION,
            {
              input: { id: upvote.id }
            },
            { authMode: 'userPool' }
          );
        }
      }
      
      // Create new downvote
      let downvoteCreated = false;
      try {
        const createResult = await graphqlQuery<{ createReplyDownvote: ReplyDownvote }>(
          CREATE_REPLY_DOWNVOTE_MUTATION,
          {
            input: {
              replyId: replyId,
              userId: userId
            }
          },
          { authMode: 'userPool' }
        );
        console.log('Reply downvote created:', createResult);
        downvoteCreated = true;
      } catch (error: any) {
        console.error('Error creating reply downvote:', error);
        // If error is due to duplicate, check again
        if (error?.message?.includes('duplicate') || error?.message?.includes('already exists')) {
          const alreadyDisliked = await checkUserDislikedReply(replyId, userId);
          if (alreadyDisliked) {
            console.log('Reply downvote already exists, proceeding with update');
            downvoteCreated = true;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
      
      // Verify the downvote was created successfully
      const verifyDisliked = await checkUserDislikedReply(replyId, userId);
      console.log('Verifying reply downvote exists:', verifyDisliked, 'downvoteCreated:', downvoteCreated);
      
      if (!verifyDisliked && !downvoteCreated) {
        throw new Error('Failed to create reply downvote');
      }
      
      // Increment dislikes count, decrement likes if was liked
      const newDislikesCount = currentDislikes + 1;
      const newLikesCount = hasLiked ? Math.max(0, currentLikes - 1) : currentLikes;
      
      console.log('Updating reply with dislikes:', { replyId, newDislikesCount, newLikesCount });
      
      const updateResult = await graphqlQuery<{ updateReply: { id: string; likes: number; dislikes: number } }>(
        UPDATE_REPLY_DISLIKES_MUTATION,
        {
          input: {
            id: replyId,
            dislikes: newDislikesCount,
            likes: newLikesCount
          }
        },
        { authMode: 'userPool' }
      );
      
      console.log('Reply updated with dislikes:', updateResult);
      
      // Final verification: Ensure mutual exclusivity
      const finalLiked = await checkUserLikedReply(replyId, userId);
      const finalDisliked = await checkUserDislikedReply(replyId, userId);
      if (finalLiked && finalDisliked) {
        console.warn('Mutual exclusivity violation detected for reply - both like and dislike exist, removing like');
        // Remove like to maintain mutual exclusivity
        const upvotesResult = await graphqlQuery<{
          listReplyUpvotes: { items: ReplyUpvote[] };
        }>(
          LIST_REPLY_UPVOTES_QUERY,
          {
            filter: {
              replyId: { eq: replyId },
              userId: { eq: userId }
            },
            limit: 1000 // Increased to avoid early termination in DynamoDB scans
          },
          { authMode: 'userPool' }
        );
        const upvote = upvotesResult.listReplyUpvotes?.items?.[0];
        if (upvote) {
          await graphqlQuery<{ deleteReplyUpvote: { id: string } }>(
            DELETE_REPLY_UPVOTE_MUTATION,
            {
              input: { id: upvote.id }
            },
            { authMode: 'userPool' }
          );
          const correctedLikesCount = Math.max(0, newLikesCount - 1);
          await graphqlQuery<{ updateReply: { id: string; likes: number } }>(
            UPDATE_REPLY_DISLIKES_MUTATION,
            {
              input: {
                id: replyId,
                likes: correctedLikesCount,
                dislikes: newDislikesCount
              }
            },
            { authMode: 'userPool' }
          );
          return { disliked: true, newDislikesCount, newLikesCount: correctedLikesCount };
        }
      }
      
      return { disliked: true, newDislikesCount, newLikesCount };
    }
    
    return { disliked: false, newDislikesCount: currentDislikes, newLikesCount: currentLikes };
  } catch (error) {
    console.error('Error toggling reply dislike:', error);
    throw error;
  }
};

// Moderated create Reply Mutation
const CREATE_REPLY_MUTATION = `
  mutation CreateModeratedReply($input: ModeratedReplyInput!) {
    createModeratedReply(input: $input) {
      status
      blocked
      message
      filteredContentId
      riskScore
      riskReasons
      matchedTerms
      reply {
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
    }
  }
`;

const UPDATE_FORUM_POST_REPLIES_MUTATION = `
  mutation UpdateForumPost($input: UpdateForumPostInput!) {
    updateForumPost(input: $input) {
      id
      replies
      lastReplyAt
    }
  }
`;

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
  try {
    // Validate required fields
    if (!input.content || input.content.trim() === '') {
      throw new Error('Reply content is required');
    }
    if (!input.postId) {
      throw new Error('Post ID is required');
    }
    if (!input.authorId) {
      throw new Error('Author ID is required');
    }

    // Get or create Client for the user
    const userId = await getOrCreateClient(userEmail, userEmail);
    
    // Ensure authorId matches the authenticated user
    if (userId !== input.authorId) {
      throw new Error('Author ID must match authenticated user');
    }

    // Prepare reply input
    const replyInput: any = {
      content: sanitizeUserVisibleText(input.content).trim(),
      postId: input.postId,
      authorId: input.authorId,
      likes: input.likes ?? 0,
      dislikes: input.dislikes ?? 0,
      isDeleted: input.isDeleted ?? false,
      attachments: input.attachments && input.attachments.length > 0 ? input.attachments : undefined,
    };

    // Add parentReplyId if provided (for nested replies)
    if (input.parentReplyId) {
      replyInput.parentReplyId = input.parentReplyId;
    }

    // Create the reply
    const result = await graphqlQuery<{
      createModeratedReply: {
        status: string;
        blocked: boolean;
        riskScore?: number;
        riskReasons?: string[];
        matchedTerms?: string[];
        filteredContentId?: string;
        reply?: ForumReply;
      };
    }>(
      CREATE_REPLY_MUTATION,
      { input: replyInput },
      { authMode: 'userPool' }
    );

    if (result.createModeratedReply.blocked) {
      return {
        pendingReview: true,
        filteredContentId: result.createModeratedReply.filteredContentId,
        moderationStatus: result.createModeratedReply.status,
        riskScore: result.createModeratedReply.riskScore,
        riskReasons: result.createModeratedReply.riskReasons,
        matchedTerms: result.createModeratedReply.matchedTerms,
      };
    }

    const createdReply = result.createModeratedReply.reply;
    if (!createdReply) {
      throw new Error('Failed to create reply');
    }

    // Update post replies count and last reply timestamp only.
    // hotScore is updated by the scheduler Lambda.
    try {
      // First, get the current post to compute the next replies count
      const post = await getForumPostById(input.postId);
      const newRepliesCount = (post.replies || 0) + 1;

      await graphqlQuery<{ updateForumPost: { id: string; replies: number; lastReplyAt: string } }>(
        UPDATE_FORUM_POST_REPLIES_MUTATION,
        {
          input: {
            id: input.postId,
            replies: newRepliesCount,
            lastReplyAt: createdReply.createdAt || new Date().toISOString()
          }
        },
        { authMode: 'userPool' }
      );
    } catch (updateError) {
      console.warn('Error updating post replies count:', updateError);
      // Don't fail the reply creation if updating post fails
    }

    // Fetch Client data for the author
    try {
      const author = await getClientById(input.authorId);
      if (author) {
        createdReply.author = {
          firstName: author.firstName,
          lastName: author.lastName,
        };
      }
    } catch (authorError) {
      console.warn('Error fetching reply author:', authorError);
      // Continue without author data
    }

    return createdReply;
  } catch (error) {
    console.error('Error creating forum reply:', error);
    throw error;
  }
};

/**
 * Get all users who liked a specific post
 */
export const getPostLikes = async (postId: string): Promise<PostUpvote[]> => {
  try {
    const result = await graphqlQuery<{
      listPostUpvotes: { items: PostUpvote[] };
    }>(
      LIST_POST_UPVOTES_QUERY,
      {
        filter: {
          postId: { eq: postId }
        },
        limit: 1000 // Get up to 1000 likes
      }
    );
    
    return result.listPostUpvotes?.items || [];
  } catch (error) {
    console.error('Error getting post likes:', error);
    throw error;
  }
};

/**
 * Get all users who liked a specific reply
 */
export const getReplyLikes = async (replyId: string): Promise<ReplyUpvote[]> => {
  try {
    const result = await graphqlQuery<{
      listReplyUpvotes: { items: ReplyUpvote[] };
    }>(
      LIST_REPLY_UPVOTES_QUERY,
      {
        filter: {
          replyId: { eq: replyId }
        },
        limit: 1000 // Get up to 1000 likes
      }
    );
    
    return result.listReplyUpvotes?.items || [];
  } catch (error) {
    console.error('Error getting reply likes:', error);
    throw error;
  }
};

/**
 * Get all posts liked by a specific user
 */
export const getUserLikedPosts = async (userId: string): Promise<PostUpvote[]> => {
  try {
    const result = await graphqlQuery<{
      listPostUpvotes: { items: PostUpvote[] };
    }>(
      LIST_POST_UPVOTES_QUERY,
      {
        filter: {
          userId: { eq: userId }
        },
        limit: 1000 // Get up to 1000 liked posts
      },
      { authMode: 'userPool' }
    );
    
    return result.listPostUpvotes?.items || [];
  } catch (error) {
    console.error('Error getting user liked posts:', error);
    throw error;
  }
};

/**
 * Get all posts disliked by a specific user (optimized batch query)
 */
export const getUserDislikedPosts = async (userId: string): Promise<PostDownvote[]> => {
  try {
    const result = await graphqlQuery<{
      listPostDownvotes: { items: PostDownvote[] };
    }>(
      LIST_POST_DOWNVOTES_QUERY,
      {
        filter: {
          userId: { eq: userId }
        },
        limit: 1000 // Get up to 1000 disliked posts
      },
      { authMode: 'userPool' }
    );
    
    return result.listPostDownvotes?.items || [];
  } catch (error) {
    console.error('Error getting user disliked posts:', error);
    throw error;
  }
};

/**
 * Get all replies liked by a specific user (optimized batch query)
 */
export const getUserLikedReplies = async (userId: string): Promise<ReplyUpvote[]> => {
  try {
    const result = await graphqlQuery<{
      listReplyUpvotes: { items: ReplyUpvote[] };
    }>(
      LIST_REPLY_UPVOTES_QUERY,
      {
        filter: {
          userId: { eq: userId }
        },
        limit: 1000 // Get up to 1000 liked replies
      },
      { authMode: 'userPool' }
    );
    
    return result.listReplyUpvotes?.items || [];
  } catch (error) {
    console.error('Error getting user liked replies:', error);
    throw error;
  }
};

/**
 * Get all replies disliked by a specific user (optimized batch query)
 */
export const getUserDislikedReplies = async (userId: string): Promise<ReplyDownvote[]> => {
  try {
    const result = await graphqlQuery<{
      listReplyDownvotes: { items: ReplyDownvote[] };
    }>(
      LIST_REPLY_DOWNVOTES_QUERY,
      {
        filter: {
          userId: { eq: userId }
        },
        limit: 1000 // Get up to 1000 disliked replies
      },
      { authMode: 'userPool' }
    );
    
    return result.listReplyDownvotes?.items || [];
  } catch (error) {
    console.error('Error getting user disliked replies:', error);
    throw error;
  }
};

/**
 * Get all user interactions (likes/dislikes) for posts and replies in batch
 * This is much more efficient than checking each post/reply individually
 * Returns Sets of IDs for O(1) lookup performance
 */
export const getUserInteractions = async (userId: string): Promise<{
  likedPostIds: Set<string>;
  dislikedPostIds: Set<string>;
  likedReplyIds: Set<string>;
  dislikedReplyIds: Set<string>;
}> => {
  try {
    // Fetch all interactions in parallel (4 queries total instead of N*2 queries)
    const [likedPosts, dislikedPosts, likedReplies, dislikedReplies] = await Promise.all([
      getUserLikedPosts(userId),
      getUserDislikedPosts(userId),
      getUserLikedReplies(userId),
      getUserDislikedReplies(userId)
    ]);
    
    // Debug: Log what we fetched
    console.log('getUserInteractions - Raw data:', {
      likedPostsCount: likedPosts.length,
      dislikedPostsCount: dislikedPosts.length,
      likedRepliesCount: likedReplies.length,
      dislikedRepliesCount: dislikedReplies.length,
      sampleLikedPost: likedPosts[0],
      sampleDislikedPost: dislikedPosts[0]
    });
    
    const likedPostIds = new Set(likedPosts.map(upvote => upvote.postId));
    const dislikedPostIds = new Set(dislikedPosts.map(downvote => downvote.postId));
    const likedReplyIds = new Set(likedReplies.map(upvote => upvote.replyId));
    const dislikedReplyIds = new Set(dislikedReplies.map(downvote => downvote.replyId));
    
    console.log('getUserInteractions - Processed IDs:', {
      likedPostIds: Array.from(likedPostIds),
      dislikedPostIds: Array.from(dislikedPostIds),
      likedReplyIds: Array.from(likedReplyIds),
      dislikedReplyIds: Array.from(dislikedReplyIds)
    });
    
    return {
      likedPostIds,
      dislikedPostIds,
      likedReplyIds,
      dislikedReplyIds
    };
  } catch (error) {
    console.error('Error getting user interactions:', error);
    // Return empty sets on error
    return {
      likedPostIds: new Set<string>(),
      dislikedPostIds: new Set<string>(),
      likedReplyIds: new Set<string>(),
      dislikedReplyIds: new Set<string>()
    };
  }
};

/**
 * Get all replies/comments by a specific user
 */
export const getUserReplies = async (userId: string): Promise<ForumReply[]> => {
  try {
    const result = await graphqlQuery<{
      listReplies: { items: ForumReply[] };
    }>(
      LIST_REPLIES_QUERY,
      {
        filter: {
          authorId: { eq: userId }
        },
        limit: 1000 // Get up to 1000 replies
      },
      { authMode: 'userPool' }
    );
    
    return result.listReplies?.items?.filter((reply): reply is ForumReply => 
      Boolean(reply) && !reply.isDeleted
    ) || [];
  } catch (error) {
    console.error('Error getting user replies:', error);
    throw error;
  }
};

/**
 * Get all replies/comments on a specific post (with author info)
 */
export const getPostComments = async (postId: string): Promise<ForumReply[]> => {
  try {
    return await getForumPostReplies(postId, 1000);
  } catch (error) {
    console.error('Error getting post comments:', error);
    throw error;
  }
};