import { graphqlQuery } from './graphqlClient';

export interface OrganizedEvent {
  id: string;
  organizerId?: string | null;
  organizerEmail?: string | null;
  organizerName?: string | null;
  name: string;
  description?: string | null;  // Made nullable to match schema
  photos: string[];
  dateTime?: string | null;  // Made nullable to match schema
  deadline?: string | null;
  location?: string | null;  // Made nullable to match schema
  address?: string | null;
  district?: string | null;
  i18n?: string | Record<string, unknown> | null;
  capacity?: number | null;
  price?: number | null;
  category?: string | null;
  paymentRequired?: boolean | null;  // Made nullable to match schema
  remark?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  redirection?: boolean | null;
  redirected_url?: string | null;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  organizer?: {
    name: string;
    profileImage?: string;
    bannerImage?: string;
  };
  bookings?: {
    items: Array<{
      id: string;
      paymentStatus: string;
    }>;
  };
}

const LIST_ORGANIZED_EVENTS_QUERY = `
  query ListOrganizedEvents($limit: Int, $nextToken: String) {
    listOrganizedEvents(limit: $limit, nextToken: $nextToken) {
      items {
        id
        organizerId
        organizerEmail
        organizerName
        name
        description
        photos
        dateTime
        deadline
        location
        address
        district
        i18n
        capacity
        price
        category
        paymentRequired
        remark
        openTime
        closeTime
        redirection
        redirected_url
        viewCount
        createdAt
        updatedAt
        organizer {
          name
          profileImage
          bannerImage
        }
        bookings {
          items {
            id
            paymentStatus
          }
        }
      }
      nextToken
    }
  }
`;

export const GET_ORGANIZED_EVENT_QUERY = `
  query GetOrganizedEvent($id: ID!) {
    getOrganizedEvent(id: $id) {
      id
      organizerId
      organizerEmail
      organizerName
      name
      description
      photos
      dateTime
      deadline
      location
      address
      district
      i18n
      capacity
      price
      category
      paymentRequired
      remark
      openTime
      closeTime
      redirection
      redirected_url
      viewCount
      createdAt
      updatedAt
      organizer {
        name
        profileImage
        bannerImage
      }
      bookings {
        items {
          id
          paymentStatus
        }
      }
    }
  }
`;

export interface FetchEventsOptions {
  limit?: number;
  nextToken?: string | null;
  category?: string | null;
}

export interface EventsResponse {
  items: OrganizedEvent[];
  nextToken: string | null;
}

export type EventStatus = 'startingSoon' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const EVENT_STARTING_SOON_MS = 24 * 60 * 60 * 1000;

/**
 * Helper function to check if a value is valid (not null, undefined, or empty string)
 */
function isValidValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'string' && value.toLowerCase() === 'null') return false;
  return true;
}

/**
 * Helper function to normalize paymentRequired (handle both string and boolean)
 */
function normalizePaymentRequired(value: any): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0' || lower === '') return false;
  }
  return null;
}

/**
 * Validate if an event item has all required fields
 */
function isValidEvent(item: any): boolean {
  if (!item || typeof item !== 'object') return false;
  
  const hasId = isValidValue(item.id);
  const hasName = isValidValue(item.name);
  const hasDescription = isValidValue(item.description);
  const hasDateTime = isValidValue(item.dateTime);
  const hasLocation = isValidValue(item.location);
  const paymentRequired = normalizePaymentRequired(item.paymentRequired);
  const hasPaymentRequired = paymentRequired !== null;
  
  return hasId && hasName && hasDescription && hasDateTime && hasLocation && hasPaymentRequired;
}

/**
 * Fetch all organized events from the database
 */
export async function fetchAllEvents(options: FetchEventsOptions = {}): Promise<EventsResponse> {
  try {
    const { limit = 100, nextToken = null } = options;
    
    const result = await graphqlQuery<{ listOrganizedEvents: EventsResponse }>(
      LIST_ORGANIZED_EVENTS_QUERY,
      { limit, nextToken }
    );

    // Extract data even if GraphQL returned errors (partial data scenario)
    const rawData = result?.listOrganizedEvents || { items: [], nextToken: null };

    // Filter out invalid events (missing required fields or null items)
    // Also filter out items that are null (GraphQL may return null for items with errors)
    const validItems = (rawData.items || [])
      .filter((item) => item !== null && item !== undefined) // Remove null items first
      .filter((item) => {
        const isValid = isValidEvent(item);
        
        if (!isValid) {
          console.warn('Filtering out invalid event:', {
            id: item?.id,
            hasName: isValidValue(item?.name),
            hasDescription: isValidValue(item?.description),
            hasDateTime: isValidValue(item?.dateTime),
            hasLocation: isValidValue(item?.location),
            hasPaymentRequired: normalizePaymentRequired(item?.paymentRequired) !== null,
          });
        }
        
        return isValid;
      });

    console.log('Fetched events:', {
      total: rawData.items?.length || 0,
      valid: validItems.length,
      filtered: (rawData.items?.length || 0) - validItems.length,
    });

    return {
      items: validItems,
      nextToken: rawData.nextToken,
    };
  } catch (error: any) {
    // Try to extract partial data from error response
    // GraphQL may return errors but still include partial data
    let rawData: EventsResponse | null = null;
    
    // Check multiple possible error structures
    if (error.data?.listOrganizedEvents) {
      rawData = error.data.listOrganizedEvents;
    } else if (error.response?.data?.listOrganizedEvents) {
      rawData = error.response.data.listOrganizedEvents;
    } else if (error.listOrganizedEvents) {
      rawData = error.listOrganizedEvents;
    }
    
    if (rawData) {
      // Filter out null items and invalid events
      const validItems = (rawData.items || [])
        .filter((item) => item !== null && item !== undefined)
        .filter((item) => isValidEvent(item));
      
      if (validItems.length > 0) {
        console.warn('GraphQL returned errors but extracted valid events:', {
          validCount: validItems.length,
          totalCount: rawData.items?.length || 0,
        });
        
        return {
          items: validItems,
          nextToken: rawData.nextToken,
        };
      }
    }
    
    console.error('Error fetching events:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return { items: [], nextToken: null };
  }
}

/**
 * Fetch a single event by ID
 */
export async function fetchEventById(id: string): Promise<OrganizedEvent | null> {
  try {
    const result = await graphqlQuery<{ getOrganizedEvent: OrganizedEvent | null }>(
      GET_ORGANIZED_EVENT_QUERY,
      { id }
    );

    if (!result.getOrganizedEvent) {
      return null;
    }

    // Validate required fields
    const event = result.getOrganizedEvent;
    if (
      !event.id ||
      !event.name ||
      !event.description ||
      !event.dateTime ||
      !event.location ||
      typeof event.paymentRequired !== 'boolean'
    ) {
      console.warn('Invalid event data:', event.id);
      return null;
    }

    return event;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return null;
  }
}

/**
 * Calculate event status based on deadline and dateTime
 * Logic:
 * - If event starts within the next 24 hours → startingSoon
 * - If event hasn't started yet (now < dateTime) → upcoming
 * - If event has started but not ended (now >= dateTime and now < deadline) → ongoing
 * - If no deadline is provided, the event is considered completed once dateTime has passed
 * - If event has ended (deadline exists and now >= deadline) → completed
 */
export function calculateEventStatus(event: OrganizedEvent): EventStatus {
  // If dateTime is missing, consider event as cancelled/invalid
  if (!event.dateTime) {
    return 'cancelled';
  }
  
  const now = new Date();
  const eventStart = new Date(event.dateTime);
  const eventEnd = event.deadline ? new Date(event.deadline) : null;
  const timeUntilStart = eventStart.getTime() - now.getTime();

  // If event hasn't started yet
  if (now < eventStart) {
    if (timeUntilStart <= EVENT_STARTING_SOON_MS) {
      return 'startingSoon';
    }
    return 'upcoming';
  }

  // If we have an end date (deadline)
  if (eventEnd) {
    // If current time is past the end date
    if (now >= eventEnd) {
      return 'completed';
    }
    // If event has started but not ended
    return 'ongoing';
  }

  // If no end date, consider the event finished once its dateTime has passed
  if (now >= eventStart) {
    return 'completed';
  }

  return 'upcoming';
}

/**
 * Get attendee count from bookings (only completed payments)
 */
export function getAttendeeCount(event: OrganizedEvent): number {
  if (!event.bookings?.items) return 0;
  
  return event.bookings.items.filter(
    (booking) => booking.paymentStatus === 'COMPLETED' || booking.paymentStatus === 'SUCCEEDED'
  ).length;
}

/**
 * Extract district from location string (HK-specific)
 */
export function extractDistrict(location: string): string {
  const districts = ['港島', '九龍', '新界', '離島'];
  for (const district of districts) {
    if (location.includes(district)) {
      return district;
    }
  }
  
  // Try to extract from common patterns
  if (location.includes('Central') || location.includes('中環') || location.includes('金鐘') || location.includes('灣仔')) {
    return '港島';
  }
  if (location.includes('Tsim Sha Tsui') || location.includes('尖沙咀') || location.includes('旺角') || location.includes('九龍灣')) {
    return '九龍';
  }
  if (location.includes('Sha Tin') || location.includes('沙田') || location.includes('將軍澳') || location.includes('元朗')) {
    return '新界';
  }
  
  return '香港';
}

