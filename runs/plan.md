# BeatVault - PRD & User Stories (Initial Iteration)

## 1. Product Requirements Document (PRD)

**Objective:** Build a premium, single-vendor online marketplace for selling digital music production assets (drum kits, sample packs, and beats). The platform must handle large file uploads, automatic audio watermarking, and tiered licensing.

**Scope for Initial Iteration:**
*   **Vendor Model:** Single-vendor (store owner). Architecture should support multi-vendor expansion later.
*   **Monetization:** Deferred (mock checkout only).
*   **Assets:** Drum Kits (Zip), Sample Packs (Zip), Beats (Audio).
*   **Licensing:** 3 tiers for beats (e.g., Basic Lease, Premium Lease, Exclusive), 1 tier for kits/packs.
*   **Core Feature:** Automated audio watermarking using FFmpeg on the backend (Spring Boot).
*   **Tech Stack:** Next.js (React), Spring Boot, SQLite.

## 2. Vertical Slices (Phases)

*   **Phase 1: Foundation & Asset Management** (Backend focus)
*   **Phase 2: Licensing & Catalog** (Backend/DB focus)
*   **Phase 3: Storefront UI** (Frontend focus)
*   **Phase 4: Cart & Delivery** (Full-stack integration)

## 3. User Stories

### Phase 1: Foundation & Asset Management
*   **STORY-1.1:** As an admin/seller, I want to upload a drum kit or sample pack (ZIP file) and provide metadata (title, cover image, description).
*   **STORY-1.2:** As an admin/seller, I want to upload a beat (WAV/MP3) and provide metadata (title, BPM, key, cover image).
*   **STORY-1.3:** As an admin/seller, when I upload a beat, the system automatically applies an audio watermark and generates a lower-bitrate preview file.

### Phase 2: Licensing & Catalog
*   **STORY-2.1:** As an admin/seller, I can define 3 licensing tiers (e.g., Basic, Premium, Exclusive) for beats with different prices and usage terms.
*   **STORY-2.2:** As an admin/seller, I can set a single price and standard license for drum kits and sample packs.

### Phase 3: Storefront UI
*   **STORY-3.1:** As a buyer, I can view a responsive grid of available products on the homepage.
*   **STORY-3.2:** As a buyer, I can play the watermarked audio preview of a beat directly from the storefront without leaving the page.
*   **STORY-3.3:** As a buyer, I can view the details of a specific product, including its licensing options.

### Phase 4: Cart & Delivery
*   **STORY-4.1:** As a buyer, I can select a license tier for a beat or a standard license for a pack and add it to a session-based cart.
*   **STORY-4.2:** As a buyer, I can complete a mock checkout process and receive a secure, expiring download link for the high-quality assets.
