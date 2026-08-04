import { 
  decodeJWT,
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser, 
  fetchUserAttributes,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword
} from 'aws-amplify/auth';
import { cognitoUserPoolsTokenProvider, generateCodeVerifier, generateState } from 'aws-amplify/auth/cognito';
import { areAllMatchingClientProfilesComplete, getClientByEmail, getOrCreateClient, updateExistingClientProfile } from './forumApi';
import {
  COGNITO_DOMAIN,
  COGNITO_USER_POOL_CLIENT_ID,
  OAUTH_SCOPES,
  redirectSignIn,
  redirectSignOut
} from '@/config/amplify';

// ============================================================================
// AUTHENTICATION OPERATIONS
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const SOCIAL_OAUTH_STATE_KEY = 'petwell.oauth.state';
const SOCIAL_OAUTH_VERIFIER_KEY = 'petwell.oauth.verifier';

type SignInParams = Parameters<typeof signIn>[0];

/**
 * Handle signIn with automatic sign-out on "already signed in" errors.
 * Maps USER_PASSWORD_AUTH to USER_SRP_AUTH for public Cognito app clients.
 */
export const signInWithAutoSignOut = async (signInParams: SignInParams, maxRetries = 1) => {
  let lastError: unknown = null;
  const normalizedSignInParams: SignInParams = {
    ...signInParams,
    options: {
      ...signInParams?.options,
      authFlowType:
        signInParams?.options?.authFlowType === 'USER_PASSWORD_AUTH'
          ? 'USER_SRP_AUTH'
          : signInParams?.options?.authFlowType,
    },
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await signIn(normalizedSignInParams);
    } catch (error: any) {
      lastError = error;

      const isAlreadySignedInError =
        error.message?.includes('already signed in') ||
        error.message?.includes('already authenticated') ||
        error.message?.includes('User is already signed in') ||
        error.name === 'UserAlreadySignedInException' ||
        error.name === 'UserAlreadyAuthenticatedException';

      if (isAlreadySignedInError && attempt < maxRetries) {
        try {
          await signOut({ global: true });
        } catch {
          try {
            await signOut();
          } catch {
            try {
              await getCurrentUser();
              throw error;
            } catch {
              // User is not signed in, continue with retry
            }
          }
        }
        await delay(500);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

const deriveProfileFromUserAttributes = (attributes: Record<string, string | undefined>) => {
  const displayName = attributes.name?.trim();
  const firstName = attributes.given_name?.trim() || displayName?.split(" ")[0]?.trim();
  const lastName = attributes.family_name?.trim() || "";

  return {
    firstName,
    lastName,
    displayName: displayName || [firstName, lastName].filter(Boolean).join(" ") || undefined
  };
};

const buildFallbackUserInfo = (user: { userId: string; username: string }) => ({
  userId: user.userId,
  username: user.username,
  email: user.username?.includes('@') ? user.username.trim().toLowerCase() : '',
  rawEmail: user.username?.includes('@') ? user.username.trim() : '',
  isAdmin: false
});

const getStoredTokenUserInfo = async () => {
  const tokens = await cognitoUserPoolsTokenProvider.authTokenStore.loadTokens();

  if (!tokens?.accessToken) {
    return null;
  }

  const idTokenPayload = tokens.idToken?.payload ?? {};
  const accessTokenPayload = tokens.accessToken.payload ?? {};
  const email = String(
    idTokenPayload.email ||
    accessTokenPayload.username ||
    tokens.username ||
    ''
  ).trim().toLowerCase();
  const username = String(
    idTokenPayload.name ||
    idTokenPayload['cognito:username'] ||
    accessTokenPayload.username ||
    tokens.username ||
    email ||
    'User'
  ).trim();
  const userId = String(
    idTokenPayload.sub ||
    accessTokenPayload.sub ||
    tokens.username ||
    ''
  ).trim();

  const attributes: Record<string, string | undefined> = {
    email: email || undefined,
    name: typeof idTokenPayload.name === 'string' ? idTokenPayload.name : undefined,
    given_name: typeof idTokenPayload.given_name === 'string' ? idTokenPayload.given_name : undefined,
    family_name: typeof idTokenPayload.family_name === 'string' ? idTokenPayload.family_name : undefined
  };

  return {
    userInfo: {
      userId,
      username,
      email,
      rawEmail: String(
        idTokenPayload.email ||
        accessTokenPayload.username ||
        tokens.username ||
        email ||
        ''
      ).trim(),
      isAdmin: false
    },
    attributes
  };
};

const ensureClientProfileForUser = async (
  email: string,
  attributes: Record<string, string | undefined>
) => {
  try {
    const existingClient = await getClientByEmail(email);
    if (!existingClient) {
      return;
    }

    await updateExistingClientProfile(email, email, deriveProfileFromUserAttributes(attributes));
  } catch (profileError) {
    console.warn('Unable to ensure client profile for authenticated user:', profileError);
  }
};

const getSocialProfileCompletionStatus = async (email: string) => {
  const isComplete = await areAllMatchingClientProfilesComplete(email);
  return !isComplete;
};

const toBase64Url = (value: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const createCodeChallenge = async (verifier: string) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  );
  return toBase64Url(digest);
};

const getAuthorizeUrl = ({
  provider,
  state,
  codeChallenge
}: {
  provider: 'Google' | 'SignInWithApple';
  state: string;
  codeChallenge: string;
}) => {
  const query = new URLSearchParams({
    redirect_uri: redirectSignIn,
    response_type: 'code',
    client_id: COGNITO_USER_POOL_CLIENT_ID,
    identity_provider: provider,
    scope: OAUTH_SCOPES.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  if (provider === 'Google') {
    query.set('prompt', 'select_account consent');
  }

  return `https://${COGNITO_DOMAIN}/oauth2/authorize?${query.toString()}`;
};

const getHostedUiLogoutUrl = () => {
  const query = new URLSearchParams({
    client_id: COGNITO_USER_POOL_CLIENT_ID,
    logout_uri: redirectSignOut
  });

  return `https://${COGNITO_DOMAIN}/logout?${query.toString()}`;
};

const beginSocialLogin = async (provider: 'Google' | 'SignInWithApple') => {
  const verifier = generateCodeVerifier(128);
  const state = generateState();
  const verifierValue = verifier.value;
  const codeChallenge = verifier.toCodeChallenge();

  window.sessionStorage.setItem(SOCIAL_OAUTH_STATE_KEY, state);
  window.sessionStorage.setItem(SOCIAL_OAUTH_VERIFIER_KEY, verifierValue);
  window.location.assign(getAuthorizeUrl({ provider, state, codeChallenge }));
};

const clearPendingSocialOAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(SOCIAL_OAUTH_STATE_KEY);
  window.sessionStorage.removeItem(SOCIAL_OAUTH_VERIFIER_KEY);
};

/**
 * Sign up a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} username - User's display name
 * @param {boolean} isAdmin - Whether user should have admin privileges
 */
export const signUpUser = async (email: string, password: string, username?: string, isAdmin: boolean = false) => {
  try {
    console.log('Signing up user:', { email, username, isAdmin });
    
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email
        }
      }
    });

    console.log('Sign up result:', { isSignUpComplete, userId, nextStep });

    // Don't create user in database until email is verified
    // User will be created after email verification in confirmUserSignUp

    return { isSignUpComplete, userId, nextStep };
  } catch (error: any) {
    console.error('Error signing up user:', error);
    throw error;
  }
};

/**
 * Confirm user sign up with verification code
 * @param {string} email - User's email
 * @param {string} confirmationCode - Verification code from email
 */
export const confirmUserSignUp = async (email: string, confirmationCode: string) => {
  try {
    console.log('Confirming sign up for:', email);
    
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode
    });

    console.log('Sign up confirmation result:', { isSignUpComplete });

    if (isSignUpComplete) {
      // Create user in our GraphQL database (admin status will be set later via AdminSetup screen)
      await createUserInDatabase(email, email, false);
    }

    return { isSignUpComplete };
  } catch (error: any) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
};

/**
 * Resend verification code
 * @param {string} email - User's email
 */
export const resendVerificationCode = async (email: string) => {
  try {
    console.log('Resending verification code for:', email);
    
    await resendSignUpCode({
      username: email
    });

    console.log('Verification code resent successfully');
  } catch (error: any) {
    console.error('Error resending verification code:', error);
    throw error;
  }
};

/**
 * Reset user password
 * @param {string} email - User's email
 */
export const resetUserPassword = async (email: string) => {
  try {
    console.log('Resetting password for:', email);
    
    const { nextStep } = await resetPassword({
      username: email
    });

    console.log('Password reset initiated:', nextStep);
    return { nextStep };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Confirm password reset with verification code
 * @param {string} email - User's email
 * @param {string} confirmationCode - Verification code from email
 * @param {string} newPassword - New password
 */
export const confirmPasswordReset = async (email: string, confirmationCode: string, newPassword: string) => {
  try {
    console.log('Confirming password reset for:', email);
    
    await confirmResetPassword({
      username: email,
      confirmationCode,
      newPassword
    });

    console.log('Password reset confirmed successfully');
  } catch (error: any) {
    console.error('Error confirming password reset:', error);
    throw error;
  }
};

/**
 * Sign in user
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
export const signInUser = async (email: string, password: string) => {
  try {
    console.log('Signing in user:', email);
    
    const { isSignedIn, nextStep } = await signInWithAutoSignOut({
      username: email,
      password,
      options: {
        authFlowType: 'USER_PASSWORD_AUTH',
      },
    });

    console.log('Sign in result:', { isSignedIn, nextStep });

    if (isSignedIn) {
      // Get user info
      const userInfo = await getCurrentUserInfo();
      return { isSignedIn, nextStep, userInfo };
    }

    return { isSignedIn, nextStep };
  } catch (error: any) {
    console.error('Error signing in user:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'An unknown error occurred';
    
    if (error.name === 'NotAuthorizedException') {
      errorMessage = 'Incorrect email or password. Please check your credentials and try again.';
    } else if (error.name === 'UserNotConfirmedException') {
      // Create a special error that the UI can handle
      const verificationError: any = new Error('ACCOUNT_NOT_VERIFIED');
      verificationError.name = 'UserNotConfirmedException';
      verificationError.originalError = error;
      throw verificationError;
    } else if (error.name === 'UserNotFoundException') {
      errorMessage = 'No account found with this email address. Please sign up first.';
    } else if (error.name === 'TooManyRequestsException') {
      errorMessage = 'Too many failed attempts. Please wait a few minutes before trying again.';
    } else if (error.name === 'InvalidParameterException') {
      errorMessage = 'Invalid email or password format.';
    } else if (error.name === 'LimitExceededException') {
      errorMessage = 'Account temporarily locked due to too many failed attempts.';
    } else if (error.name === 'PasswordResetRequiredException') {
      errorMessage = 'Password reset is required. Please reset your password.';
    } else if (error.name === 'UserTemporarilyLockedException') {
      errorMessage = 'Account temporarily locked. Please try again later.';
    }
    
    // Create a new error with the improved message
    const enhancedError: any = new Error(errorMessage);
    enhancedError.name = error.name;
    enhancedError.originalError = error;
    
    throw enhancedError;
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  try {
    console.log('Signing out user');
    
    await signOut();
    clearPendingSocialOAuth();
    
    console.log('User signed out successfully');

    if (typeof window !== 'undefined') {
      window.location.assign(getHostedUiLogoutUrl());
    }
  } catch (error: any) {
    console.error('Error signing out user:', error);
    throw error;
  }
};

/**
 * Redirect to Google OAuth sign-in
 */
export const signInWithGoogle = async () => {
  await beginSocialLogin('Google');
};

/**
 * Redirect to Apple OAuth sign-in
 */
export const signInWithApple = async () => {
  await beginSocialLogin('SignInWithApple');
};

/**
 * Get current user information
 */
export const getCurrentUserInfo = async () => {
  try {
    const user = await getCurrentUser();
    
    try {
      const userAttributes = await fetchUserAttributes();
      
      // Note: Admin check would need to be implemented based on your GraphQL schema
      // For now, we'll set it to false
      const isAdmin = false; // await isCurrentUserAdmin();
      const rawEmail = (userAttributes.email || user.username || '').trim();
      const email = rawEmail.toLowerCase();
      const profile = deriveProfileFromUserAttributes(userAttributes);

      if (email) {
        await ensureClientProfileForUser(email, userAttributes);
      }
      
      const userInfo = {
        userId: user.userId,
        username: profile.displayName || user.username,
        email,
        rawEmail,
        isAdmin: isAdmin
      };

      console.log('Current user info:', userInfo);
      return userInfo;
    } catch (attrError: any) {
      if (attrError.message?.includes('revoked') ||
          attrError.message?.includes('expired')) {
        console.warn('Token revoked or expired, signing out user');
        try {
          await signOutUser();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        throw new Error('Session expired. Please log in again.');
      }

      const storedTokenInfo = await getStoredTokenUserInfo();
      if (storedTokenInfo) {
        if (storedTokenInfo.userInfo.email) {
          await ensureClientProfileForUser(
            storedTokenInfo.userInfo.email,
            storedTokenInfo.attributes
          );
        }
        console.warn('Falling back to token-derived user info because attributes could not be loaded:', attrError);
        return storedTokenInfo.userInfo;
      }

      console.warn('Falling back to basic user info because attributes could not be loaded:', attrError);
      return buildFallbackUserInfo(user);
    }
  } catch (error: any) {
    // If user is not authenticated, throw a more specific error
    if (error.name === 'UserUnAuthenticatedException') {
      throw new Error('User not authenticated');
    }
    console.error('Error getting current user info:', error);
    throw error;
  }
};

/**
 * Wait for Hosted UI redirect auth to complete, then return current user info.
 */
export const completeSocialLogin = async ({
  maxAttempts = 8,
  delayMs = 500
}: {
  maxAttempts?: number;
  delayMs?: number;
} = {}) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const userInfo = await getCurrentUserInfo();

      if (userInfo?.userId) {
        const requiresProfileCompletion = userInfo.email
          ? await getSocialProfileCompletionStatus(userInfo.email)
          : false;
        return { userInfo, requiresProfileCompletion };
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < maxAttempts - 1) {
      await delay(delayMs);
    }
  }

  throw lastError || new Error('Social login could not be completed. Please try again.');
};

export const completeSocialLoginWithCode = async (code: string, state: string) => {
  const expectedState =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem(SOCIAL_OAUTH_STATE_KEY)
      : null;
  const codeVerifier =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem(SOCIAL_OAUTH_VERIFIER_KEY)
      : null;

  if (!expectedState || !codeVerifier) {
    throw new Error('Social login session expired. Please try again.');
  }

  if (state !== expectedState) {
    clearPendingSocialOAuth();
    throw new Error('Social login state mismatch. Please try again.');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: COGNITO_USER_POOL_CLIENT_ID,
    code,
    redirect_uri: redirectSignIn,
    code_verifier: codeVerifier
  });

  const response = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    clearPendingSocialOAuth();
    throw new Error('Failed to exchange social login code for tokens.');
  }

  const tokenResult = await response.json();
  const accessToken = decodeJWT(tokenResult.access_token);
  const idToken = tokenResult.id_token ? decodeJWT(tokenResult.id_token) : undefined;
  const accessTokenIssuedAtInMillis = (accessToken.payload.iat || 0) * 1000;
  const currentTime = new Date().getTime();
  const clockDrift = accessTokenIssuedAtInMillis > 0 ? accessTokenIssuedAtInMillis - currentTime : 0;
  const username =
    String(
      idToken?.payload['cognito:username'] ||
      accessToken.payload.username ||
      idToken?.payload.email ||
      accessToken.payload.sub ||
      ''
    );

  await cognitoUserPoolsTokenProvider.tokenOrchestrator.setTokens({
    tokens: {
      accessToken,
      idToken,
      refreshToken: tokenResult.refresh_token,
      clockDrift,
      username
    }
  });

  clearPendingSocialOAuth();

  const storedTokenInfo = await getStoredTokenUserInfo();
  const userInfo = storedTokenInfo?.userInfo ?? await getCurrentUserInfo();

  if (storedTokenInfo?.userInfo.email) {
    await ensureClientProfileForUser(
      storedTokenInfo.userInfo.email,
      storedTokenInfo.attributes
    );
  }

  const requiresProfileCompletion = userInfo.email
    ? await getSocialProfileCompletionStatus(userInfo.email)
    : false;

  return { userInfo, requiresProfileCompletion };
};

/**
 * Check if user exists by attempting to sign in with dummy password
 * This is used to determine if user should see login or signup flow
 */
export const checkUserExists = async (email: string): Promise<'NEW_USER' | 'EXISTING_USER' | 'SPECIAL_USER' | null> => {
  try {
    // Try to sign in with dummy password to check if user exists
    await signInWithAutoSignOut({
      username: email,
      password: 'X7p!wqLz2#',
      options: {
        authFlowType: 'USER_PASSWORD_AUTH',
      },
    });
    
    // If sign in doesn't throw, user exists (but password is wrong)
    // We'd need to check user class from database here
    // For now, return EXISTING_USER
    return 'EXISTING_USER';
  } catch (error: any) {
    if (error.name === "UserNotFoundException") {
      return "NEW_USER";
    }
    if (error.name === "NotAuthorizedException") {
      // User exists but password is wrong
      // In the mobile app, this checks user class from database
      // For now, return EXISTING_USER
      return 'EXISTING_USER';
    }
    // Other errors - return null to indicate unknown
    return null;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create user in GraphQL database
 * @param {string} email - User's email
 * @param {string} username - User's display name
 * @param {boolean} isAdmin - Whether user has admin privileges
 */
const createUserInDatabase = async (email: string, username: string, isAdmin: boolean = false) => {
  try {
    console.log('Creating user in database:', { email, username, isAdmin });
    const normalizedUsername = username?.trim();
    await getOrCreateClient(
      email,
      email,
      normalizedUsername && normalizedUsername !== email
        ? { firstName: normalizedUsername }
        : undefined
    );
  } catch (error: any) {
    console.error('Error creating user in database:', error);
    throw error;
  }
};

