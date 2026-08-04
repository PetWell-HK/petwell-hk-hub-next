const NAMETAG_REGISTER_ENDPOINT =
  "https://0ukczxqgz2.execute-api.ap-southeast-1.amazonaws.com/prod/public/nametag-register";

const NAMETAG_REGISTER_API_TOKEN = "92cf3013-bc53-4f1b-9f54-775a54bc980b";

export const NAMETAG_FIELDS = {
  PHONE: "電話號碼 (Phone No.)",
  PET_NAME: "寵物名字 (Pet Name)",
  PET_SPECIES: "寵物種類 (Pet Species)",
  PET_PHOTO: "寵物照片 (Pet Photo)",
  PET_BIRTHDAY: "寵物生日 (Pet Birthday) - Optional",
  MICROCHIP: "晶片號碼 (Microchip No.)",
  PET_WEIGHT: "寵物體重 (Pet Weight) - Optional",
  DELIVERY_METHOD: "自取/郵寄 (Self-pickup / SF Mail delivery) ",
  SF_ADDRESS: "SF站地址 SF Address",
  SPECIAL_REQUIREMENT: "特別要求 Special Requests -  可選填  Optional",
  GROUP_SHIPPING_PHONE:
    "如有想一起寄出的朋友，請註明其登記 PetWell 名牌時所使用的電話號碼 - 可選填\nIf you would like to send this along with someone else's name tag, please specify the phone number they used when registering it. - Optional",
} as const;

export type NametagRegisterInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  petName: string;
  petSpecies?: string;
  petPhotoFile?: File | null;
  petBirthday?: string;
  microchipNo?: string;
  petWeight?: string;
  sfAddress?: string;
  specialRequirement?: string;
  deliveryMethod?: string;
  groupShippingPhone?: string;
};

export type NametagRegisterResponse = {
  ok?: boolean;
  alreadyRegistered?: boolean;
  userId?: string;
  petId?: string;
  cognitoUserCreated?: boolean;
  error?: string;
  message?: string;
};

export function isNametagRegisterConfigured() {
  return Boolean(NAMETAG_REGISTER_ENDPOINT && NAMETAG_REGISTER_API_TOKEN);
}

export function getNametagRegisterConfigError() {
  if (!NAMETAG_REGISTER_API_TOKEN) return "Missing nametag API token.";
  return "";
}

async function fileToBase64(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read pet photo."));
    reader.readAsDataURL(file);
  });

  return dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
}

function toUserFacingErrorMessage(rawMessage?: string) {
  if (!rawMessage) return "Nametag registration failed.";

  const jsonStart = rawMessage.indexOf("{");
  if (jsonStart > -1) {
    const maybeJson = rawMessage.slice(jsonStart);
    try {
      const parsed = JSON.parse(maybeJson) as { error?: { message?: string } };
      if (parsed?.error?.message) return parsed.error.message;
    } catch {
      // Keep the raw message when payload is not valid JSON.
    }
  }

  return rawMessage;
}

async function sendNametagRegistrationRequest(input: NametagRegisterInput) {
  const petPhotoUpload = input.petPhotoFile
    ? {
        fileName: input.petPhotoFile.name,
        contentType: input.petPhotoFile.type || "application/octet-stream",
        dataBase64: await fileToBase64(input.petPhotoFile),
      }
    : undefined;

  const response = await fetch(NAMETAG_REGISTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiToken: NAMETAG_REGISTER_API_TOKEN,
      timestamp: new Date().toISOString(),
      email: input.email.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      petSpecies: input.petSpecies?.trim() || "",
      petPhotoUpload,
      attributes: {
        [NAMETAG_FIELDS.PHONE]: input.phone.trim(),
        [NAMETAG_FIELDS.PET_NAME]: input.petName.trim(),
        [NAMETAG_FIELDS.PET_SPECIES]: input.petSpecies?.trim() || "",
        [NAMETAG_FIELDS.PET_PHOTO]: input.petPhotoFile?.name || "",
        [NAMETAG_FIELDS.PET_BIRTHDAY]: input.petBirthday || "",
        [NAMETAG_FIELDS.MICROCHIP]: input.microchipNo?.trim() || "",
        [NAMETAG_FIELDS.PET_WEIGHT]: input.petWeight?.trim() || "",
        [NAMETAG_FIELDS.SF_ADDRESS]: input.sfAddress?.trim() || "",
        [NAMETAG_FIELDS.SPECIAL_REQUIREMENT]: input.specialRequirement?.trim() || "",
        [NAMETAG_FIELDS.DELIVERY_METHOD]: input.deliveryMethod?.trim() || "郵寄",
        [NAMETAG_FIELDS.GROUP_SHIPPING_PHONE]: input.groupShippingPhone?.trim() || "",
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as NametagRegisterResponse;
  return { response, data };
}

export async function submitNametagRegistration(input: NametagRegisterInput): Promise<NametagRegisterResponse> {
  if (!isNametagRegisterConfigured()) {
    throw new Error(getNametagRegisterConfigError() || "Nametag registration endpoint is not configured.");
  }

  const { response, data } = await sendNametagRegistrationRequest(input);
  if (!response.ok) {
    throw new Error(toUserFacingErrorMessage(data.message || data.error));
  }

  return data;
}
