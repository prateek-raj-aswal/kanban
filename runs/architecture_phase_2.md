# Architecture Design: Phase 2 (Licensing & Catalog)

## 1. Domain Entities

### `LicenseOption`
Represents a pricing tier and usage rights for a specific product.
*   **id**: UUID (Primary Key)
*   **product**: ManyToOne relationship with `Product`
*   **tierName**: String (e.g., "Basic", "Premium", "Exclusive", or "Standard" for packs)
*   **price**: BigDecimal
*   **distributionLimit**: Integer (Maximum streams/sales allowed. `-1` for unlimited)
*   **audioFormat**: String (e.g., "High-Quality MP3", "WAV + Trackouts")
*   **createdAt**: Timestamp

*Note: The `Product` entity will be updated with a `@OneToMany` mapping to `LicenseOption`.*

## 2. API Contracts

### Add License to Product (STORY-2.1 & STORY-2.2)
**Endpoint:** `POST /api/v1/products/{productId}/licenses`
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "tierName": "Basic Lease",
  "price": 29.99,
  "distributionLimit": 500000,
  "audioFormat": "High-Quality MP3"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "tierName": "Basic Lease",
  "price": 29.99,
  "distributionLimit": 500000,
  "audioFormat": "High-Quality MP3",
  "createdAt": "2026-05-05T12:00:00Z"
}
```

### Get Product Licenses
**Endpoint:** `GET /api/v1/products/{productId}/licenses`
**Response (200 OK):** Array of License objects.
