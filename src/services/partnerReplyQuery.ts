import { graphqlQuery } from './graphqlClient';

function stripPartnerReplySelection(query: string): string {
  return query
    .replace(/^\s*partnerReply\s*$/gm, '')
    .replace(/^\s*partnerReplyAt\s*$/gm, '');
}

/** Retry without partnerReply fields if the deployed schema does not have them yet. */
export async function graphqlQueryWithPartnerReplyFallback<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    return await graphqlQuery<T>(query, variables);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (/partnerReply/i.test(message) && /FieldUndefined/i.test(message)) {
      console.warn(
        'partnerReply not in schema yet; retrying detail query without partnerReply fields',
      );
      return graphqlQuery<T>(stripPartnerReplySelection(query), variables);
    }
    throw err;
  }
}
