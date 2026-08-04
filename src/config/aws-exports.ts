/* eslint-disable */
// Frontend-safe Amplify config for the static web app.
// These values are public identifiers, not secrets.

const runtimeOrigin =
    typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost:5173";

const oauthRedirectSignIn = `${runtimeOrigin}/auth/callback/`;
const oauthRedirectSignOut = `${runtimeOrigin}/`;

const awsmobile = {
    "aws_project_region": "ap-southeast-1",
    "aws_appsync_graphqlEndpoint": "https://zzqlfjlslncu7kjjqkdedp7uwu.appsync-api.ap-southeast-1.amazonaws.com/graphql",
    "aws_appsync_region": "ap-southeast-1",
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": "da2-pq3dyfbcuncunjstmawmtz3req",
    "aws_cognito_region": "ap-southeast-1",
    "aws_user_pools_id": "ap-southeast-1_vC1Zugxkg",
    "aws_user_pools_web_client_id": "mm6ek73uv5ikh82iidgm0fv0j",
    "oauth": {
        "domain": "petwell-auth-prod.auth.ap-southeast-1.amazoncognito.com",
        "scope": ["email", "openid", "profile"],
        "redirectSignIn": oauthRedirectSignIn,
        "redirectSignOut": oauthRedirectSignOut,
        "responseType": "code"
    },
    "aws_cognito_username_attributes": [
        "EMAIL",
        "PHONE_NUMBER"
    ],
    "aws_cognito_social_providers": ["GOOGLE", "APPLE"],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],
    "aws_user_files_s3_bucket": "petwellclientstoragee8eec-prod",
    "aws_user_files_s3_bucket_region": "ap-southeast-1"
};

export default awsmobile;

