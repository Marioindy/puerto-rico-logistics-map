# S3 Bucket Integration Plan

**Last Updated:** 2025-10-03
**Status:** Future Work / Not Yet Implemented

---

## Executive Summary

This document outlines how AWS S3 buckets could enhance the Puerto Rico Logistics Map project by providing scalable storage for facility documents, shipment attachments, and static assets. The recommendations focus on **practical logistics value** rather than speculative features.

---

## Use Cases (Prioritized)

### 1. Facility Documentation Storage ⭐⭐⭐ (HIGH VALUE)

**Current State:**
- Convex `geoLocales` table stores structured metadata (coordinates, operating hours, capacity)
- RFI survey data in `lib/content/rfi-locations.json` references certifications and services as text
- No actual document storage exists

**What S3 Enables:**

| Document Type | Business Value | Example Files |
|--------------|----------------|---------------|
| **Warehouse floor plans** | Logistics planning, space allocation | PDF layouts, CAD files, PNG diagrams |
| **Facility certifications** | Compliance verification, risk assessment | FDA permits, customs bonds, hazmat certs |
| **Insurance certificates** | Liability coverage validation | COI PDFs, policy documents |
| **Facility photos** | Visual verification of RFI responses | JPG/PNG exterior/interior shots |
| **Equipment manifests** | Operational capability assessment | Forklift specs, cold storage systems |

**Implementation Impact:**
- 69 RFI survey responses collected, only 4 have valid GPS coordinates
- Remaining 65 facilities likely have valuable documentation that could be stored in S3
- Facility operators could upload documents via admin panel (future feature)

**Technical Architecture:**
```typescript
// Convex schema addition (geoLocales table)
documents: v.optional(v.array(v.object({
  fileKey: v.string(),        // S3 object key
  fileName: v.string(),        // Display name
  fileType: v.string(),        // MIME type
  category: v.string(),        // "floor_plan" | "certification" | "photo" | "equipment"
  uploadedAt: v.number(),      // Timestamp
  uploadedBy: v.string(),      // Email (when auth is added)
  s3Url: v.string()           // Pre-signed URL (temporary)
})))
```

---

### 2. Shipment Tracking Attachments ⭐⭐ (MEDIUM-HIGH VALUE)

**Current State:**
- Convex `shipments` table tracks BOL/AWB numbers as optional strings
- No ability to attach actual shipping documents

**What S3 Enables:**

| Document Type | Use Case | Compliance Value |
|--------------|----------|------------------|
| **Bills of Lading (BOL)** | Carrier liability, ownership transfer | Required for disputes |
| **Air Waybills (AWB)** | Air freight receipts | Customs clearance |
| **Commercial invoices** | Cargo valuation | Import/export compliance |
| **Packing lists** | Cargo verification | Inspection reconciliation |
| **Delivery proof photos** | Chain of custody | Damage claims |

**Implementation Impact:**
- Shipment disputes become resolvable with signed BOL PDFs
- Customs audits simplified with immediate document access
- Reduces email back-and-forth between shippers/consignees

**Technical Architecture:**
```typescript
// Convex schema addition (shipments table)
attachments: v.optional(v.array(v.object({
  fileKey: v.string(),
  fileName: v.string(),
  fileType: v.string(),
  category: v.string(),        // "bol" | "awb" | "invoice" | "packing_list" | "delivery_proof"
  uploadedAt: v.number(),
  s3Url: v.string()
})))
```

---

### 3. Map Performance Optimization ⭐ (MEDIUM VALUE)

**Current State:**
- Google Maps API handles base map rendering
- Convex provides real-time facility data
- Default Google Maps markers used (no custom icons)

**What S3 + CloudFront Enables:**

| Asset Type | Performance Benefit | CDN Edge Caching |
|-----------|---------------------|------------------|
| **Custom facility icons** | Faster marker rendering | 90+ edge locations worldwide |
| **Facility thumbnails** | FacilityInfoPanel previews load instantly | Cached at nearest PoP |
| **Map overlays** | Puerto Rico regions, hurricane zones | Static GeoJSON served from CDN |

**Implementation Impact:**
- Reduced map load times for users in Puerto Rico (variable connectivity)
- Lower bandwidth costs (Amplify serves app, CloudFront serves assets)
- Custom branding with Puerto Rico-specific iconography

**Technical Architecture:**
```bash
# S3 bucket structure
s3://pr-logistics-assets/
  icons/
    warehouse-marker.svg
    port-marker.svg
    airport-marker.svg
  thumbnails/
    {geoLocaleId}-thumb.webp
  overlays/
    pr-regions.geojson
    hurricane-zones.geojson
```

```typescript
// next.config.js
const config = {
  images: {
    domains: ['d1234567890.cloudfront.net'], // CloudFront distribution
  },
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://d1234567890.cloudfront.net'
    : undefined
};
```

---

### 4. Analytics and Backup ⭐ (LOW-MEDIUM VALUE)

**Current State:**
- Convex handles real-time data queries
- No automated backup strategy
- RFI survey Excel file stored in `docs/` (Git-tracked, not version-controlled)

**What S3 Enables:**

| Use Case | Retention Strategy | Cost Optimization |
|----------|-------------------|-------------------|
| **Daily Convex exports** | S3 Standard (30 days) → Glacier (2+ years) | $0.023/GB/month (Standard) → $0.004/GB/month (Glacier) |
| **Historical shipments** | Archive completed shipments after 6 months | Lifecycle policies automate transitions |
| **RFI survey preservation** | Versioned Excel files with metadata | S3 Versioning prevents accidental overwrites |

**Implementation Impact:**
- Disaster recovery: Restore Convex data from S3 snapshots
- Compliance: 7-year data retention for shipping records (industry standard)
- Audit trail: Track changes to RFI survey data over time

**Technical Architecture:**
```typescript
// Convex cron job (daily backup)
export const dailyBackup = internalAction({
  handler: async (ctx) => {
    const geoLocales = await ctx.runQuery(api.geoLocales.list, {});
    const shipments = await ctx.runQuery(api.shipments.list, {});

    const backup = {
      timestamp: Date.now(),
      geoLocales,
      shipments
    };

    // Upload to S3 via AWS SDK
    await s3.putObject({
      Bucket: 'pr-logistics-backups',
      Key: `backups/${new Date().toISOString()}.json`,
      Body: JSON.stringify(backup)
    });
  }
});
```

---

## What We DON'T Recommend

| Anti-Pattern | Why Not | Better Alternative |
|-------------|---------|-------------------|
| ❌ **Host entire Next.js app on S3** | Amplify handles SSR/routing better | Keep current Amplify setup |
| ❌ **Store geolocation data in S3** | Convex optimized for real-time queries | S3 would add latency |
| ❌ **Public S3 uploads (no auth)** | Security risk without user accounts | Wait until auth is implemented |

---

## Implementation Roadmap

### Phase 1: Facility Documents (Weeks 1-2)

**Prerequisites:**
- AWS account with S3 access
- IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions
- Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`

**Tasks:**
1. **S3 Bucket Setup**
   ```bash
   aws s3api create-bucket \
     --bucket pr-logistics-documents \
     --region us-east-1 \
     --acl private

   # Enable versioning
   aws s3api put-bucket-versioning \
     --bucket pr-logistics-documents \
     --versioning-configuration Status=Enabled

   # Block public access
   aws s3api put-public-access-block \
     --bucket pr-logistics-documents \
     --public-access-block-configuration \
       "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
   ```

2. **CORS Configuration** (for Next.js uploads)
   ```json
   {
     "CORSRules": [{
       "AllowedOrigins": ["https://your-amplify-domain.amplifyapp.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }]
   }
   ```

3. **Convex Schema Update**
   ```typescript
   // convex/schema.ts
   import { defineSchema, defineTable } from "convex/server";
   import { v } from "convex/values";

   export default defineSchema({
     geoLocales: defineTable({
       // ... existing fields ...
       documents: v.optional(v.array(v.object({
         fileKey: v.string(),
         fileName: v.string(),
         fileType: v.string(),
         category: v.string(),
         uploadedAt: v.number(),
         uploadedBy: v.optional(v.string()),
       })))
     })
     // ... existing indexes ...
   });
   ```

4. **Next.js Upload API Route**
   ```typescript
   // app/api/upload/route.ts
   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
   import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
   import { NextRequest, NextResponse } from "next/server";

   const s3Client = new S3Client({
     region: process.env.AWS_REGION!,
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
     }
   });

   export async function POST(req: NextRequest) {
     const { fileName, fileType, geoLocaleId } = await req.json();

     const fileKey = `facilities/${geoLocaleId}/${Date.now()}-${fileName}`;

     const command = new PutObjectCommand({
       Bucket: process.env.S3_BUCKET_NAME!,
       Key: fileKey,
       ContentType: fileType,
     });

     const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

     return NextResponse.json({ signedUrl, fileKey });
   }
   ```

5. **Frontend Upload Component**
   ```typescript
   // app/rfimap/components/DocumentUploader.tsx
   "use client";

   import { useState } from "react";
   import { useMutation } from "convex/react";
   import { api } from "@/convex/_generated/api";

   export function DocumentUploader({ geoLocaleId }: { geoLocaleId: string }) {
     const [uploading, setUploading] = useState(false);
     const updateGeoLocale = useMutation(api.geoLocales.adminUpdate);

     const handleUpload = async (file: File) => {
       setUploading(true);

       // Get pre-signed URL
       const { signedUrl, fileKey } = await fetch("/api/upload", {
         method: "POST",
         body: JSON.stringify({
           fileName: file.name,
           fileType: file.type,
           geoLocaleId
         })
       }).then(r => r.json());

       // Upload to S3
       await fetch(signedUrl, {
         method: "PUT",
         body: file,
         headers: { "Content-Type": file.type }
       });

       // Update Convex record
       await updateGeoLocale({
         adminKey: process.env.ADMIN_SECRET_KEY!,
         id: geoLocaleId,
         documents: [{
           fileKey,
           fileName: file.name,
           fileType: file.type,
           category: "general",
           uploadedAt: Date.now()
         }]
       });

       setUploading(false);
     };

     return (
       <input
         type="file"
         onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
         disabled={uploading}
       />
     );
   }
   ```

### Phase 2: Shipment Attachments (Weeks 3-4)

- Similar S3 structure: `shipments/{shipmentId}/{timestamp}-{filename}`
- Add `attachments` array to `shipments` Convex table
- Create shipment document viewer in FacilityInfoPanel

### Phase 3: Static Asset CDN (Month 2)

**Prerequisites:**
- CloudFront distribution created
- S3 bucket policy allows CloudFront OAI (Origin Access Identity)

**Tasks:**
1. **CloudFront Distribution**
   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name pr-logistics-assets.s3.amazonaws.com \
     --default-root-object index.html
   ```

2. **Update next.config.js**
   ```typescript
   const config = {
     assetPrefix: process.env.CLOUDFRONT_URL,
     images: {
       domains: [process.env.CLOUDFRONT_URL!.replace('https://', '')]
     }
   };
   ```

3. **Custom Map Markers**
   - Design SVG icons for warehouse/port/airport
   - Upload to `s3://pr-logistics-assets/icons/`
   - Update `InteractiveMap.tsx` to use CloudFront URLs

### Phase 4: Automated Backups (Month 3)

**Tasks:**
1. **Convex Cron Job** (runs daily at 2 AM UTC)
   ```typescript
   // convex/crons.ts
   import { cronJobs } from "convex/server";
   import { internal } from "./_generated/api";

   const crons = cronJobs();

   crons.daily(
     "daily backup",
     { hourUTC: 2, minuteUTC: 0 },
     internal.backup.dailyBackup
   );

   export default crons;
   ```

2. **S3 Lifecycle Policy**
   ```json
   {
     "Rules": [{
       "Id": "MoveToGlacier",
       "Status": "Enabled",
       "Transitions": [{
         "Days": 30,
         "StorageClass": "GLACIER"
       }],
       "NoncurrentVersionExpiration": { "NoncurrentDays": 90 }
     }]
   }
   ```

---

## Cost Estimation

### Monthly Costs (Projected)

| Service | Usage | Cost |
|---------|-------|------|
| **S3 Standard Storage** | 50 GB documents | $1.15/month |
| **S3 Glacier Storage** | 500 GB backups | $2.00/month |
| **S3 PUT Requests** | 10,000 uploads | $0.05/month |
| **S3 GET Requests** | 100,000 downloads | $0.40/month |
| **CloudFront Data Transfer** | 100 GB/month | $8.50/month |
| **CloudFront Requests** | 1M requests | $1.00/month |
| **TOTAL** | | **~$13.10/month** |

**Cost Optimization Tips:**
- Use S3 Intelligent-Tiering for documents accessed irregularly
- Compress images (WebP format) before uploading
- Set CloudFront TTL to 1 year for static assets

---

## Security Considerations

### 1. Private Buckets Only
```bash
# Never allow public access
aws s3api put-public-access-block \
  --bucket pr-logistics-documents \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 2. Pre-Signed URLs with Expiration
```typescript
// URLs expire after 1 hour
const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
```

### 3. Server-Side Encryption
```bash
# Enable default encryption
aws s3api put-bucket-encryption \
  --bucket pr-logistics-documents \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

### 4. IAM Principle of Least Privilege
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject"
    ],
    "Resource": "arn:aws:s3:::pr-logistics-documents/*"
  }]
}
```

---

## Monitoring and Alerts

### CloudWatch Alarms

1. **High S3 Costs**
   - Trigger: Monthly costs exceed $20
   - Action: SNS notification to admin email

2. **Failed Uploads**
   - Trigger: 4xx error rate > 5% for 5 minutes
   - Action: Check CORS/IAM permissions

3. **CloudFront Cache Hit Rate**
   - Trigger: Cache hit rate < 80%
   - Action: Review TTL settings

---

## Migration Path

### From Current State → S3-Enabled

1. **No Data Loss**: Existing Convex records remain unchanged
2. **Additive Schema Changes**: `documents` and `attachments` fields are optional
3. **Gradual Rollout**:
   - Week 1: Deploy S3 upload API (no UI changes)
   - Week 2: Add document uploader to admin panel
   - Week 3: Migrate existing RFI survey attachments (if any)
   - Week 4: Enable shipment attachments

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Document Upload Success Rate** | >95% | CloudWatch S3 PUT success rate |
| **Average Document Retrieval Time** | <500ms | CloudFront cache hit latency |
| **Storage Cost per Facility** | <$0.50/month | S3 storage costs / number of geoLocales |
| **Backup Completeness** | 100% daily | Cron job success logs |

---

## References

- [AWS S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [Next.js with S3 File Uploads](https://vercel.com/templates/next.js/aws-s3-image-upload-nextjs)
- [CloudFront + S3 Performance Guide](https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/)
- [Convex + External Storage Patterns](https://docs.convex.dev/production/integrations)

---

## Questions / Decisions Needed

- [ ] Which AWS region? (Recommendation: `us-east-1` for lowest latency to Puerto Rico)
- [ ] Bucket naming convention? (Recommendation: `pr-logistics-{env}-{purpose}`)
- [ ] File size limits? (Recommendation: 10 MB for documents, 5 MB for images)
- [ ] Who has upload permissions? (Recommendation: Admin users only until auth is added)
- [ ] Retention policy for shipment attachments? (Recommendation: 7 years per industry standard)

---

**Next Steps:**
1. Review this plan with stakeholders
2. Set up AWS account and create first S3 bucket
3. Implement Phase 1 (facility documents) as proof of concept
4. Measure performance and costs before proceeding to Phase 2
