# Architecture Design: Phase 1 (Core Backend Foundation)

## 1. Domain Entities

### `Product`
The core entity representing an asset on the marketplace.
*   **id**: UUID (Primary Key)
*   **title**: String
*   **description**: String
*   **coverImageUrl**: String
*   **productType**: Enum (`DRUM_KIT`, `SAMPLE_PACK`, `BEAT`)
*   **fileUrl**: String (Path/URI to the original uploaded ZIP or WAV file)
*   **bpm**: Integer (Nullable, relevant for beats)
*   **musicKey**: String (Nullable, relevant for beats)
*   **previewUrl**: String (Nullable, generated later by FFmpeg for beats)
*   **createdAt**: Timestamp
*   **updatedAt**: Timestamp

## 2. API Contracts

### Upload Asset (STORY-1.1 & STORY-1.2)
**Endpoint:** `POST /api/v1/products`
**Content-Type:** `multipart/form-data`

**Request Form Fields:**
*   `title` (String, required)
*   `description` (String, optional)
*   `productType` (String, required, one of DRUM_KIT, SAMPLE_PACK, BEAT)
*   `bpm` (Integer, optional)
*   `musicKey` (String, optional)
*   `coverImage` (File, optional)
*   `assetFile` (File, required)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "...",
  "productType": "DRUM_KIT",
  "coverImageUrl": "/uploads/covers/uuid.jpg",
  "fileUrl": "/uploads/assets/uuid.zip",
  "bpm": null,
  "musicKey": null,
  "previewUrl": null,
  "createdAt": "2026-05-05T12:00:00Z"
}
```

## 3. Storage Strategy
For Phase 1, files will be stored in the local file system within a configured uploads directory (e.g., `uploads/covers`, `uploads/assets`, `uploads/previews`). The API will return paths relative to a static resource handler or download endpoint.

## 4. SQLite Configuration
SQLite will be used via the `org.xerial:sqlite-jdbc` and `org.hibernate.orm:hibernate-community-dialects` dependencies in Spring Boot.
