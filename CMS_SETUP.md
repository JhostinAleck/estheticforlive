# CMS Setup Guide

This project is architected to support Headless CMS integration. Currently, it uses a mock service layer (`src/services/cms.ts`) that serves static data.

## Recommended CMS Options (Free Tier Friendly)
1. **Strapi** (Self-hosted or Cloud) - Great for structured content.
2. **Sanity.io** - Excellent developer experience, hosted.
3. **Contentful** - Industry standard, generous free tier.

## How to Integrate Strapi

1. **Install Strapi**
   ```bash
   npx create-strapi-app@latest my-project --quickstart
   ```

2. **Create Content Types**
   - **Service**:
     - `name` (Text)
     - `description` (Rich Text)
     - `price` (Text)
     - `category` (Enumeration: 'FACIALES', 'CORPORALES', etc.)
     - `image` (Media)
     - `icon` (Text - e.g., 'sparkles', 'zap')

3. **Enable API Access**
   - Go to Settings > Roles > Public.
   - Check `find` and `findOne` for the 'Service' content type.

4. **Update Frontend Service**
   Modify `src/services/cms.ts`:

   ```typescript
   const API_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

   export const cmsService = {
     async getServices() {
       const response = await fetch(`${API_URL}/api/services?populate=*`);
       const data = await response.json();
       // Transform Strapi response to match your App's Service interface
       return transformStrapiData(data);
     }
   };
   ```

5. **Environment Variables**
   Create `.env`:
   ```
   VITE_STRAPI_URL=http://localhost:1337
   ```

## How to Integrate Sanity

1. **Init Sanity**
   ```bash
   npm create sanity@latest
   ```

2. **Define Schema** (`schemas/service.js`)
   ```javascript
   export default {
     name: 'service',
     type: 'document',
     fields: [
       {name: 'name', type: 'string'},
       {name: 'category', type: 'string'},
       // ... other fields
     ]
   }
   ```

3. **Fetch Data**
   Install client: `npm install @sanity/client`
   Update `src/services/cms.ts` to query Sanity.
