import type { ResourcesConfig } from "aws-amplify";

export const runtimeOrigin =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const COGNITO_DOMAIN = "petwell-auth-prod.auth.ap-southeast-1.amazoncognito.com";
export const COGNITO_USER_POOL_ID = "ap-southeast-1_vC1Zugxkg";
export const COGNITO_USER_POOL_CLIENT_ID = "mm6ek73uv5ikh82iidgm0fv0j";
export const OAUTH_SCOPES = ["email", "openid", "profile"] as const;
export const redirectSignIn = `${runtimeOrigin}/auth/callback/`;
export const redirectSignOut = `${runtimeOrigin}/`;

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: COGNITO_USER_POOL_ID,
      userPoolClientId: COGNITO_USER_POOL_CLIENT_ID,
      loginWith: {
        email: true,
        oauth: {
          domain: COGNITO_DOMAIN,
          scopes: [...OAUTH_SCOPES],
          redirectSignIn: [redirectSignIn],
          redirectSignOut: [redirectSignOut],
          responseType: "code" as const,
          providers: ["Google", "Apple"] as ("Google" | "Apple")[],
        },
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: "https://zzqlfjlslncu7kjjqkdedp7uwu.appsync-api.ap-southeast-1.amazonaws.com/graphql",
      region: "ap-southeast-1",
      defaultAuthMode: "apiKey" as const,
      apiKey: "da2-pq3dyfbcuncunjstmawmtz3req",
    },
  },
  Storage: {
    S3: {
      bucket: "petwellclientstoragee8eec-prod",
      region: "ap-southeast-1",
    },
  },
};

export default amplifyConfig;
