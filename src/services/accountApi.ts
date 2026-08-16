import { uploadData } from "aws-amplify/storage";
import { graphqlQuery } from "./graphqlClient";

export const ACCOUNT_PROFILE_QUERY_KEY = "myAccountProfile";
export const MAX_ACCOUNT_PETS = 5;

export interface AccountPet {
  id: string;
  name: string;
  profileImage?: string | null;
  species?: string | null;
  breed?: string | null;
  weight?: number | null;
  birthdate?: string | null;
  mainOwnerId?: string | null;
  clientIds?: string[] | null;
}

export interface AccountProfile {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  address?: string | null;
  profileImage?: string | null;
  pets: AccountPet[];
}

export interface AccountProfileUpdate {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  avatarFile?: File | null;
}

const GET_ACCOUNT_PROFILE_QUERY = `
  query GetAccountProfile($id: ID!) {
    getClient(id: $id) {
      id
      email
      phone
      firstName
      lastName
      displayName
      profileImage
      pets {
        items {
          pet {
            id
            name
            profileImage
            species
            breed
            weight
            birthdate
            mainOwnerId
            clientIds
          }
        }
      }
    }
  }
`;

const GET_ACCOUNT_ADDRESS_QUERY = `
  query GetAccountAddress($id: ID!) {
    getClient(id: $id) {
      id
      address
    }
  }
`;

const UPDATE_ACCOUNT_PROFILE_MUTATION = `
  mutation UpdateAccountProfile($input: UpdateClientInput!) {
    updateClient(input: $input) {
      id
      email
      phone
      firstName
      lastName
      displayName
      address
      profileImage
    }
  }
`;

type GetAccountProfileResult = {
  getClient: {
    id: string;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    address?: string | null;
    profileImage?: string | null;
    pets?: {
      items?: Array<{
        pet?: AccountPet | null;
      } | null> | null;
    } | null;
  } | null;
};

type UpdateAccountProfileResult = {
  updateClient: {
    id: string;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    address?: string | null;
    profileImage?: string | null;
  } | null;
};

function normalizePets(
  items?: Array<{ pet?: AccountPet | null } | null> | null,
): AccountPet[] {
  if (!items) return [];
  return items
    .map((item) => item?.pet)
    .filter((pet): pet is AccountPet => Boolean(pet?.id && pet.name));
}

export function getAccountDisplayName(
  profile?: Pick<AccountProfile, "displayName" | "firstName" | "lastName"> | null,
  fallback?: string,
): string {
  const fromDisplay = profile?.displayName?.trim();
  if (fromDisplay) return fromDisplay;
  const fromParts = [profile?.firstName, profile?.lastName]
    .filter((part) => Boolean(part?.trim()))
    .join(" ")
    .trim();
  if (fromParts) return fromParts;
  return fallback?.trim() || "";
}

export function toFormPhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("852") && digits.length >= 11) return digits.slice(-8);
  return digits.slice(0, 8);
}

export function toStoredPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(0, 8);
  return digits ? `+852${digits}` : "";
}

export function formatDisplayPhone(phone?: string | null): string {
  const local = toFormPhone(phone);
  if (local.length === 8) return `+852 ${local.slice(0, 4)} ${local.slice(4)}`;
  return phone?.trim() || "";
}

export function isHongKongPhone(phone: string): boolean {
  return /^\d{8}$/.test(phone.replace(/\D/g, ""));
}

export function isSharedPet(pet: AccountPet, userId?: string): boolean {
  return Boolean(userId && pet.mainOwnerId && pet.mainOwnerId !== userId);
}

export function isSharingPet(pet: AccountPet, userId?: string): boolean {
  const ownerCount = pet.clientIds?.filter(Boolean).length ?? 0;
  return Boolean(userId && pet.mainOwnerId === userId && ownerCount > 1);
}

export async function fetchMyAccountProfile(userId: string): Promise<AccountProfile> {
  const result = await graphqlQuery<GetAccountProfileResult>(
    GET_ACCOUNT_PROFILE_QUERY,
    { id: userId },
    { authMode: "userPool" },
  );

  const client = result.getClient;
  if (!client) {
    throw new Error("Account profile not found.");
  }

  let address: string | null = null;
  try {
    const addressResult = await graphqlQuery<{ getClient: { address?: string | null } | null }>(
      GET_ACCOUNT_ADDRESS_QUERY,
      { id: userId },
      { authMode: "userPool" },
    );
    address = addressResult.getClient?.address ?? null;
  } catch {
    address = null;
  }

  return {
    id: client.id,
    email: client.email,
    phone: client.phone,
    firstName: client.firstName || "",
    lastName: client.lastName || "",
    displayName: client.displayName,
    address,
    profileImage: client.profileImage,
    pets: normalizePets(client.pets?.items),
  };
}

async function uploadAccountAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const imageKey = `client/${userId}.${extension}`;
  await uploadData({
    key: imageKey,
    data: file,
    options: {
      contentType: file.type || "image/jpeg",
      accessLevel: "guest",
    },
  }).result;
  return `public/${imageKey}`;
}

export async function updateMyAccountProfile(
  userId: string,
  update: AccountProfileUpdate,
): Promise<void> {
  const firstName = update.firstName.trim();
  const lastName = update.lastName.trim();
  const displayName = `${firstName} ${lastName}`.trim();
  const phone = toStoredPhone(update.phone);
  const address = update.address?.trim() || null;
  let profileImage: string | undefined;

  if (update.avatarFile) {
    profileImage = await uploadAccountAvatar(userId, update.avatarFile);
  }

  await graphqlQuery<UpdateAccountProfileResult>(
    UPDATE_ACCOUNT_PROFILE_MUTATION,
    {
      input: {
        id: userId,
        firstName,
        lastName,
        displayName,
        phone,
        address,
        ...(profileImage ? { profileImage } : {}),
      },
    },
    { authMode: "userPool" },
  );
}
