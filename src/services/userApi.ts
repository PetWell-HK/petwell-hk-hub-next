/**
 * User API Service
 * Handles checking if a user exists in the database for discount eligibility
 */

import { getPublicEnv } from '@/lib/env';

export interface UserCheckResult {
  exists: boolean;
  isRegisteredUser: boolean;
}

/**
 * Check if an email exists in the Client DynamoDB table
 * This will be used to determine if the customer is eligible for a discount
 * 
 * @param email The email address to check
 * @returns Promise with user check result
 */
export async function checkUserExists(email: string): Promise<UserCheckResult> {
  try {
    // Option 1: Use Lambda function (recommended for DynamoDB access)
    // Replace with your Lambda function URL
    const LAMBDA_ENDPOINT = getPublicEnv('VITE_CHECK_USER_LAMBDA_URL') || 
      'https://YOUR_LAMBDA_FUNCTION_URL.lambda-url.ap-southeast-1.on.aws/';
    
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        tableName: 'Client-3oftqi3qhna2tnkbxmomfnc67i-prod'
      }),
    });

    if (!response.ok) {
      // If Lambda doesn't exist yet, return false (no discount)
      console.warn('User check Lambda not available, assuming user does not exist');
      return { exists: false, isRegisteredUser: false };
    }

    const result = await response.json();
    return {
      exists: result.exists || false,
      isRegisteredUser: result.exists || false
    };
  } catch (error) {
    console.error('Error checking user existence:', error);
    // On error, assume user doesn't exist (no discount)
    return { exists: false, isRegisteredUser: false };
  }
}

/**
 * Alternative: Check via GraphQL if you have a query available
 * Uncomment and use this if you prefer GraphQL approach
 */
/*
export async function checkUserExistsGraphQL(email: string): Promise<UserCheckResult> {
  try {
    const CHECK_USER_QUERY = `
      query CheckUser($email: String!) {
        getUserByEmail(email: $email) {
          id
          email
        }
      }
    `;

    const result = await graphqlQuery<{ getUserByEmail: { id: string; email: string } | null }>(
      CHECK_USER_QUERY,
      { email: email.toLowerCase().trim() }
    );

    return {
      exists: !!result.getUserByEmail,
      isRegisteredUser: !!result.getUserByEmail
    };
  } catch (error) {
    console.error('Error checking user existence via GraphQL:', error);
    return { exists: false, isRegisteredUser: false };
  }
}
*/

