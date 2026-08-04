const CLINIC_LISTING_FIELDS = `
        id
        name { zh en }
        address { zh en }
        district
        phoneNo
        serviceOfferings
        availableHours {
          mon { start end }
          tue { start end }
          wed { start end }
          thu { start end }
          fri { start end }
          sat { start end }
          sun { start end }
          otherConditions
        }
        coverPhoto
        verified
        totalRating
        numReviews
        is247
        partnerPlan
        partnerPlanExpiresAt
`;

const SALON_LISTING_FIELDS = CLINIC_LISTING_FIELDS;

const LODGING_LISTING_FIELDS = CLINIC_LISTING_FIELDS;

const RESTAURANT_LISTING_FIELDS = `
        id
        name { zh en }
        address { zh en }
        district
        availableHours {
          mon { start end }
          tue { start end }
          wed { start end }
          thu { start end }
          fri { start end }
          sat { start end }
          sun { start end }
          otherConditions
        }
        coverPhoto
        verified
        isDevListing
        petEntryPolicy
        petAccessArea
        petPolicyNotes { zh en }
        listingAlert { zh en }
        totalRating
        combinedRating
        is247
        fehdLicensed
        puppuccino
        externalMetadata
        partnerPlan
        partnerPlanExpiresAt
`;

const RESTAURANT_FULL_FIELDS = `
        id
        name { zh en }
        address { zh en }
        location { lat lon }
        district
        phoneNo
        availableHours {
          mon { start end }
          tue { start end }
          wed { start end }
          thu { start end }
          fri { start end }
          sat { start end }
          sun { start end }
          otherConditions
        }
        coverPhoto
        gallery
        verified
        isDevListing
        petEntryPolicy
        petAccessArea
        petPolicyNotes { zh en }
        listingAlert { zh en }
        photoSource
        website
        email
        totalRating
        combinedRating
        is247
        fehdLicensed
        puppuccino
        externalMetadata
        partnerPlan
        partnerPlanExpiresAt
`;

const PLACE_SEARCH_VARS = `
    $location: LocationInput!
    $region: String
    $district: String
    $districts: [String]
    $keyword: String
    $sortMethod: String
    $is247: Boolean
    $limit: Int
    $nextToken: [Float]
`;

const PLACE_SEARCH_ARGS = `
      location: $location
      region: $region
      district: $district
      districts: $districts
      keyword: $keyword
      sortMethod: $sortMethod
      is247: $is247
      limit: $limit
      nextToken: $nextToken
`;

const RESTAURANT_SEARCH_VARS = `
    $location: LocationInput!
    $region: String
    $district: String
    $districts: [String]
    $keyword: String
    $sortMethod: String
    $is247: Boolean
    $fehdLicensed: Boolean
    $verified: Boolean
    $petAccessArea: String
    $petEntryPolicy: String
    $includeDevListings: Boolean
    $limit: Int
    $nextToken: [Float]
`;

const RESTAURANT_SEARCH_ARGS = `
      location: $location
      region: $region
      district: $district
      districts: $districts
      keyword: $keyword
      sortMethod: $sortMethod
      is247: $is247
      fehdLicensed: $fehdLicensed
      verified: $verified
      petAccessArea: $petAccessArea
      petEntryPolicy: $petEntryPolicy
      includeDevListings: $includeDevListings
      limit: $limit
      nextToken: $nextToken
`;

export const verboseClinicSearchQuery = `
  query VerboseClinicSearch(${PLACE_SEARCH_VARS}) {
    verboseClinicSearch(${PLACE_SEARCH_ARGS}) {
      items {
${CLINIC_LISTING_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const dynamoClinicSearchQuery = `
  query DynamoClinicSearch(${PLACE_SEARCH_VARS}) {
    dynamoClinicSearch(${PLACE_SEARCH_ARGS}) {
      items {
${CLINIC_LISTING_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const verboseSalonSearchQuery = `
  query VerboseSalonSearch(${PLACE_SEARCH_VARS}) {
    verboseSalonSearch(${PLACE_SEARCH_ARGS}) {
      items {
${SALON_LISTING_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const dynamoSalonSearchQuery = `
  query DynamoSalonSearch(${PLACE_SEARCH_VARS}) {
    dynamoSalonSearch(${PLACE_SEARCH_ARGS}) {
      items {
${SALON_LISTING_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const verboseLodgingSearchQuery = `
  query VerboseLodgingSearch(${PLACE_SEARCH_VARS}) {
    verboseLodgingSearch(${PLACE_SEARCH_ARGS}) {
      items {
${LODGING_LISTING_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const dynamoLodgingSearchQuery = `
  query DynamoLodgingSearch(${PLACE_SEARCH_VARS}) {
    dynamoLodgingSearch(${PLACE_SEARCH_ARGS}) {
      items {
${LODGING_LISTING_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const verboseRestaurantListingSearchQuery = `
  query VerboseRestaurantSearch(${RESTAURANT_SEARCH_VARS}) {
    verboseRestaurantSearch(${RESTAURANT_SEARCH_ARGS}) {
      items {
${RESTAURANT_LISTING_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const verboseRestaurantFullSearchQuery = `
  query VerboseRestaurantSearch(${RESTAURANT_SEARCH_VARS}) {
    verboseRestaurantSearch(${RESTAURANT_SEARCH_ARGS}) {
      items {
${RESTAURANT_FULL_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const dynamoRestaurantListingSearchQuery = `
  query DynamoRestaurantSearch(${RESTAURANT_SEARCH_VARS}) {
    dynamoRestaurantSearch(${RESTAURANT_SEARCH_ARGS}) {
      items {
${RESTAURANT_LISTING_FIELDS}
      }
      total
      nextToken
    }
  }
`;

export const dynamoRestaurantFullSearchQuery = `
  query DynamoRestaurantSearch(${RESTAURANT_SEARCH_VARS}) {
    dynamoRestaurantSearch(${RESTAURANT_SEARCH_ARGS}) {
      items {
${RESTAURANT_FULL_FIELDS}
      }
      total
      nextToken
    }
  }
`;

/** @deprecated Prefer dynamoRestaurantListingSearchQuery / dynamoRestaurantFullSearchQuery */
export const dynamoRestaurantSearchQuery = dynamoRestaurantFullSearchQuery;
