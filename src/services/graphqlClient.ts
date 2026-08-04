import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { ensureAmplifyConfigured } from '@/lib/amplifyInit';
import { getClientCrawlerPolicy } from '@/utils/crawlerPolicy';

ensureAmplifyConfigured();

// Use Amplify's client for all GraphQL operations
// It automatically handles:
// - API_KEY authentication for public queries (when not logged in)
// - Cognito token authentication for mutations and authenticated queries (when logged in)
const amplifyClient = generateClient();

/**
 * Check if user is authenticated
 */
async function isUserAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute a GraphQL query/mutation with optional auth mode override
 * Uses Amplify's client which automatically handles authentication:
 * - API_KEY for public operations (when not authenticated)
 * - Cognito tokens for authenticated operations (when logged in)
 */
export async function graphqlQuery<T>(
  query: string, 
  variables?: Record<string, any>,
  options?: { authMode?: 'apiKey' | 'userPool' }
): Promise<T> {
  try {
    // Log configuration for debugging
    const config = Amplify.getConfig();
    const endpoint = config?.API?.GraphQL?.endpoint;
    const isAuthenticated = await isUserAuthenticated();
    
    // Better mutation detection - check for 'mutation' keyword (case-insensitive)
    const normalizedQuery = query.trim().replace(/\s+/g, ' ');
    const isMutation = /^\s*mutation\s+/i.test(normalizedQuery);
    
    console.log('GraphQL Endpoint from Amplify config:', endpoint);
    console.log('User authenticated:', isAuthenticated);
    console.log('Is mutation:', isMutation);
    console.log('Query preview:', normalizedQuery.substring(0, 50) + '...');
    
    // For mutations, we need authenticated users - check authentication
    // BUT: Allow mutations with explicit apiKey auth mode (for public operations like CNY orders)
    if (isMutation && !isAuthenticated && options?.authMode !== 'apiKey') {
      throw new Error('Authentication required for mutations. Please log in.');
    }
    
    // Auth mode selection:
    // - Use override if provided (for queries that need authenticated access, e.g., Client email field)
    // - For mutations: use 'userPool' if authenticated (required for create/update/delete)
    // - For queries: use 'apiKey' for public reads (ForumPost allows public read)
    //   Using 'apiKey' ensures public queries work regardless of auth status
    //   BUT: Some queries need 'userPool' to read protected fields (e.g., Client.email)
    let authMode: 'apiKey' | 'userPool';
    if (options?.authMode) {
      authMode = options.authMode;
    } else if (isMutation && isAuthenticated) {
      authMode = 'userPool';  // Mutations need USER_POOL when authenticated
    } else {
      authMode = 'apiKey';   // Queries use API_KEY for public access by default
    }

    const crawlerPolicy = getClientCrawlerPolicy();
    if (authMode === 'apiKey' && crawlerPolicy.isBlocked) {
      throw new Error('Automated access is not allowed for this public API.');
    }
    
    console.log('Using auth mode:', authMode, options?.authMode ? '(override)' : '(auto)');
    
    const result: any = await amplifyClient.graphql({
      query,
      variables: variables || {},
      authMode: authMode as 'apiKey' | 'oidc' | 'userPool' | 'iam' | 'lambda',
    });

    // Handle errors
    if (result && 'errors' in result && result.errors && result.errors.length > 0) {
      // If there's data along with errors, return the data (partial success)
      // This is common when some items in a list have null values for non-nullable fields
      if (result.data) {
        console.warn('GraphQL query returned errors but has partial data:', {
          errorCount: result.errors.length,
          errors: result.errors.map((e: any) => ({
            message: e.message,
            path: e.path,
          })),
        });
        return result.data as T;
      }
      // If no data, throw error with detailed message
      const errorMessages = result.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    // Return data
    if (result && 'data' in result) {
      return (result.data || {}) as T;
    }
    
    // If result doesn't have expected structure, return as-is
    return result as T;
  } catch (error: any) {
    console.error('GraphQL query error:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    throw formatError(error);
  }
}

function formatError(error: any): Error {
  let errorMessage = 'Unknown error';
  
  // Check for network/DNS errors first
  if (error?.message?.includes('ERR_NAME_NOT_RESOLVED') || 
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('network error')) {
    errorMessage = `Network error: Cannot resolve AppSync endpoint. Please check:
1. Your internet connection
2. If the AppSync API exists in AWS Console
3. DNS settings or firewall blocking the connection
Original error: ${error?.message || 'ERR_NAME_NOT_RESOLVED'}`;
  } else if (error.errors && Array.isArray(error.errors)) {
    errorMessage = error.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
  } else if (error.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    try {
      errorMessage = JSON.stringify(error);
    } catch {
      errorMessage = String(error);
    }
  }
  
  if (errorMessage.includes('GraphQL errors')) {
    return error;
  }
  
  return new Error(`GraphQL request failed: ${errorMessage}`);
}
