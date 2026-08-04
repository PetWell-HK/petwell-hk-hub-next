/**
 * User Discount API Service
 * Checks if a user email exists in DynamoDB and provides discount eligibility
 */

export interface UserDiscountResponse {
  isRegisteredUser: boolean;
  discountPercent?: number;
  message?: string;
}

/**
 * Check if email exists in DynamoDB and if user is eligible for discount
 * Uses Lambda function to securely access DynamoDB
 */
export async function checkUserDiscount(email: string): Promise<UserDiscountResponse> {
  try {
    // Lambda function endpoint for user discount check
    const lambdaEndpoint = 'https://buqhgpascvig55e7wwehay75i40xrvxw.lambda-url.ap-southeast-1.on.aws/';

    const response = await fetch(lambdaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        action: 'check-user-discount',
      }),
    });

    if (!response.ok) {
      // If Lambda doesn't exist yet, return no discount
      if (response.status === 404 || response.status === 403) {
        console.warn('User discount Lambda not configured, skipping discount check');
        return { isRegisteredUser: false };
      }
      
      const errorText = await response.text();
      console.error('Error checking user discount:', errorText);
      return { isRegisteredUser: false };
    }

    // Parse response - Lambda Function URL returns the body directly as JSON
    const result = await response.json();
    
    return {
      isRegisteredUser: result.isRegisteredUser || false,
      discountPercent: result.isRegisteredUser ? (result.discountPercent || 10) : undefined,
      message: result.message,
    };
  } catch (error) {
    console.error('Error checking user discount:', error);
    // Fail gracefully - don't block checkout if discount check fails
    return { isRegisteredUser: false };
  }
}

