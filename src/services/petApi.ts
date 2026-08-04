import { graphqlQuery } from './graphqlClient';

export interface Pet {
  id: string;
  name: string;
  profileImage?: string;
  species?: string;
  breed?: string;
  weight?: number;
  birthdate?: string;
  microchipId?: string;
  isOffensive?: boolean;
  isTagActivated?: boolean;
  clientIds?: string[];
  clients?: {
    items: {
      client: {
        id: string;
        firstName: string;
        lastName: string;
        phone?: string;
        displayName?: string;
      };
    }[];
  };
}

const GET_PET_BY_ID_QUERY = `
  query GetPet($id: ID!) {
    getPet(id: $id) {
      id
      name
      profileImage
      species
      breed
      weight
      birthdate
      microchipId
      isOffensive
      isTagActivated
      clientIds
      clients {
        items {
          client {
            id
            firstName
            lastName
            phone
            displayName
          }
        }
      }
    }
  }
`;

const GET_PET_BY_ID_PUBLIC_QUERY = `
  query GetPetPublic($id: ID!) {
    getPet(id: $id) {
      id
      name
      profileImage
      species
      breed
      weight
      birthdate
      microchipId
      isOffensive
      isTagActivated
    }
  }
`;

const GET_PET_BY_NFC_ID_QUERY = `
  query PetsByNfcId($nfcId: String!) {
    petsByNfcId(nfcId: $nfcId, limit: 1) {
      items {
        id
        name
        profileImage
        species
        breed
        weight
        birthdate
        microchipId
        isOffensive
        isTagActivated
        clientIds
        clients {
          items {
            client {
              id
              firstName
              lastName
              phone
              displayName
            }
          }
        }
      }
    }
  }
`;

const GET_PET_BY_NFC_ID_PUBLIC_QUERY = `
  query PetsByNfcIdPublic($nfcId: String!) {
    petsByNfcId(nfcId: $nfcId, limit: 1) {
      items {
        id
        name
        profileImage
        species
        breed
        weight
        birthdate
        microchipId
        isOffensive
        isTagActivated
      }
    }
  }
`;

const APPSYNC_GRAPHQL_ENDPOINT = "https://zzqlfjlslncu7kjjqkdedp7uwu.appsync-api.ap-southeast-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-pq3dyfbcuncunjstmawmtz3req";

async function fetchPetViaDirectApiKey(id: string, query: string): Promise<Pet | null> {
  const response = await fetch(APPSYNC_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({
      query,
      variables: { id },
    }),
  });

  if (!response.ok) {
    throw new Error(`Direct AppSync request failed with status ${response.status}`);
  }

  const result = (await response.json().catch(() => ({}))) as {
    data?: { getPet?: Pet | null };
    errors?: Array<{ message?: string }>;
  };

  if (result?.data?.getPet) return result.data.getPet;

  if (result?.errors?.length) {
    const message = result.errors.map((error) => error.message || "Unknown AppSync error").join(", ");
    throw new Error(message);
  }

  return null;
}

export async function getPetById(id: string): Promise<Pet | null> {
  const attempts: Array<{
    label: string;
    query: string;
    authMode?: 'apiKey' | 'userPool';
  }> = [
    { label: 'full-apiKey', query: GET_PET_BY_ID_QUERY, authMode: 'apiKey' },
    { label: 'public-apiKey', query: GET_PET_BY_ID_PUBLIC_QUERY, authMode: 'apiKey' },
    { label: 'full-userPool', query: GET_PET_BY_ID_QUERY, authMode: 'userPool' },
    { label: 'public-userPool', query: GET_PET_BY_ID_PUBLIC_QUERY, authMode: 'userPool' },
  ];

  let directPublicFallback: Pet | null = null;

  try {
    const directFullPet = await fetchPetViaDirectApiKey(id, GET_PET_BY_ID_QUERY);
    if (directFullPet) return directFullPet;
  } catch (error) {
    console.warn("getPetById direct AppSync full query failed", error);
  }

  try {
    directPublicFallback = await fetchPetViaDirectApiKey(id, GET_PET_BY_ID_PUBLIC_QUERY);
  } catch (error) {
    console.warn("getPetById direct AppSync public query failed", error);
  }

  for (const attempt of attempts) {
    try {
      const result = await graphqlQuery<{ getPet: Pet | null }>(
        attempt.query,
        { id },
        attempt.authMode ? { authMode: attempt.authMode } : undefined
      );

      if (result.getPet) return result.getPet;
    } catch (error) {
      console.warn(`getPetById attempt failed (${attempt.label})`, error);
    }
  }

  return directPublicFallback;
}

async function fetchPetByNfcViaDirectApiKey(
  nfcId: string,
  query: string,
): Promise<Pet | null> {
  const response = await fetch(APPSYNC_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({
      query,
      variables: { nfcId },
    }),
  });

  if (!response.ok) {
    throw new Error(`Direct AppSync request failed with status ${response.status}`);
  }

  const result = (await response.json().catch(() => ({}))) as {
    data?: { petsByNfcId?: { items?: Pet[] | null } | null };
    errors?: Array<{ message?: string }>;
  };

  const pet = result?.data?.petsByNfcId?.items?.[0];
  if (pet) return pet;

  if (result?.errors?.length) {
    const message = result.errors.map((error) => error.message || "Unknown AppSync error").join(", ");
    throw new Error(message);
  }

  return null;
}

export async function getPetByNFCId(nfcId: string): Promise<Pet | null> {
  const attempts: Array<{
    label: string;
    query: string;
    authMode?: 'apiKey' | 'userPool';
  }> = [
    { label: 'full-apiKey', query: GET_PET_BY_NFC_ID_QUERY, authMode: 'apiKey' },
    { label: 'public-apiKey', query: GET_PET_BY_NFC_ID_PUBLIC_QUERY, authMode: 'apiKey' },
    { label: 'full-userPool', query: GET_PET_BY_NFC_ID_QUERY, authMode: 'userPool' },
    { label: 'public-userPool', query: GET_PET_BY_NFC_ID_PUBLIC_QUERY, authMode: 'userPool' },
  ];

  let directPublicFallback: Pet | null = null;

  try {
    const directFullPet = await fetchPetByNfcViaDirectApiKey(nfcId, GET_PET_BY_NFC_ID_QUERY);
    if (directFullPet) return directFullPet;
  } catch (error) {
    console.warn("getPetByNFCId direct AppSync full query failed", error);
  }

  try {
    directPublicFallback = await fetchPetByNfcViaDirectApiKey(
      nfcId,
      GET_PET_BY_NFC_ID_PUBLIC_QUERY,
    );
  } catch (error) {
    console.warn("getPetByNFCId direct AppSync public query failed", error);
  }

  for (const attempt of attempts) {
    try {
      const result = await graphqlQuery<{ petsByNfcId: { items: Pet[] } }>(
        attempt.query,
        { nfcId },
        attempt.authMode ? { authMode: attempt.authMode } : undefined,
      );

      const pet = result.petsByNfcId?.items?.[0];
      if (pet) return pet;
    } catch (error) {
      console.warn(`getPetByNFCId attempt failed (${attempt.label})`, error);
    }
  }

  return directPublicFallback;
}

/** Resolve a scanned tag value to a pet: try pet ID first, then nfcId index. */
export async function resolvePetByTagId(tagId: string): Promise<Pet | null> {
  const petById = await getPetById(tagId);
  if (petById) return petById;
  return getPetByNFCId(tagId);
}

// Helper function to get the primary owner's information
export function getPrimaryOwner(pet: Pet) {
  const clients = (pet.clients?.items || []).filter((item) => item?.client);
  if (clients.length === 0) {
    return null;
  }
  
  // Return the first client as the primary owner
  const primaryOwner = clients[0]?.client;
  return primaryOwner || null;
}

// Helper function to get owner's display name
export function getOwnerDisplayName(pet: Pet): string {
  const owner = getPrimaryOwner(pet);
  if (!owner) return 'Owner';

  const displayName = (owner.displayName || '').trim();
  if (displayName) return displayName;

  const firstName = (owner.firstName || '').trim();
  const lastName = (owner.lastName || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Owner';
}

// Helper function to get owner's phone number
export function getOwnerPhoneNumber(pet: Pet): string | null {
  const owner = getPrimaryOwner(pet);
  const phoneNumber = (owner?.phone || '').trim();
  return phoneNumber || null;
}
