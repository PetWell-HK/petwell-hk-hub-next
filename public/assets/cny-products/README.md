# CNY Products Images

This folder contains product images for the Chinese New Year products store.

## Image Files - Gallery Support

Each product can have **multiple images** (gallery). Please upload product images here with the following naming convention:

### Naming Convention

For products with multiple images (gallery):
- `{productId}-1.jpg` - First image (main/cover image)
- `{productId}-2.jpg` - Second image
- `{productId}-3.jpg` - Third image
- ... and so on

### Product Image Files

- **pet-backpack** (狗狗/貓小背包):
  - `pet-backpack-1.jpg`
  - `pet-backpack-2.jpg`
  - `pet-backpack-3.jpg`

- **chun-lian** (揮春):
  - `chun-lian-1.jpg`
  - `chun-lian-2.jpg`

- **cat-scratch-board** (貓抓板):
  - `cat-scratch-board-1.jpg`
  - `cat-scratch-board-2.jpg`

- **red-envelope** (紅包袋):
  - `red-envelope-1.jpg`
  - `red-envelope-2.jpg`
  - `red-envelope-3.jpg`

## Image Specifications

- **Format**: JPG or PNG
- **Recommended size**: 800x600px or 1200x900px
- **Max file size**: 2MB per image
- **Aspect ratio**: 4:3 or 16:9 (keep consistent across all images for same product)
- **Minimum**: At least 1 image per product (will be treated as gallery with 1 image)

## Usage

Images are referenced in `src/data/cnyProductsData.ts` as an array:
```typescript
imageUrls: [
  '/src/assets/cny-products/{productId}-1.jpg',
  '/src/assets/cny-products/{productId}-2.jpg',
  // ... more images
]
```

## Gallery Features

- Product listing page shows the first image
- Product detail page shows:
  - Main large image with navigation arrows (if multiple images)
  - Thumbnail gallery below main image
  - Image counter (e.g., "1 / 3")
  - Hover to show navigation arrows

