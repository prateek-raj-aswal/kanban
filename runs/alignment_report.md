# Alignment Report: Music Production Marketplace

## 1. Clarified Requirements
Based on your initial idea, the platform will be an online marketplace for digital music production assets.
*   **Platform Type:** Web application.
*   **Primary Entities:** Sellers (Sound designers, beatmakers), Buyers (Artists, producers), and Digital Assets (Drum kits, sample packs, beats).
*   **Core Actions:** Uploading large digital files, audio preview/playback, secure checkout, and digital delivery.

## 2. Assumptions
*   **Digital Only:** There is no physical product shipping; all deliveries are digital downloads.
*   **Audio Protection:** Audio previews will need to be protected (e.g., watermarking, limited length, or low bitrate) to prevent theft.
*   **Storage:** The system will need to handle large file sizes, requiring robust object storage (e.g., AWS S3, Google Cloud Storage) and secure, expiring download links.
*   **Payments:** A third-party payment gateway (like Stripe) will be used to process transactions securely.
*   **Empty Context:** The `context/product.md`, `context/constraints.md`, and `context/tech-stack.md` files are currently empty, so we are starting from a completely blank slate technologically.

## 3. Open Questions (Action Required)
To proceed with planning, we need to resolve the following ambiguities:

1.  **Vendor Model:** Is this a **multi-vendor marketplace** (like BeatStars/Splice, where any producer can create an account and sell) or a **single-vendor store** (just for you to sell your own kits/beats)?
2.  **Monetization & Splits:** If it is multi-vendor, how will payments be handled? Do you need automatic revenue splitting (e.g., via Stripe Connect) between the platform and the seller?
3.  **Licensing Structure:** Will beats have multiple licensing tiers (e.g., Basic Lease, Premium Lease, Exclusive Rights), or is it a simple one-price-per-item model?
4.  **Audio Previews:** Should the platform automatically watermark uploaded audio, or will sellers be required to upload a separate, pre-watermarked "preview" track?
5.  **Technology Preferences:** Do you have any preferred technologies for the frontend (e.g., React, Next.js, Vue), backend (e.g., Node.js, Spring Boot, Python), or database (e.g., PostgreSQL, MongoDB)?
