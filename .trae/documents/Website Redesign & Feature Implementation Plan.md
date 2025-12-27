# Esthetic For Live - Website Update Plan

## 1. Navbar Redesign
- **Visibility Enhancement**: Adjust the "Servicios" text color logic in `Navbar.tsx`.
    - **Inactive State (Transparent Bg)**: Increase contrast (e.g., pure white with slight text-shadow or semi-transparent background pill on hover).
    - **Active/Scrolled State**: Ensure dark text (`text-secondary`) is legible.
    - **Interactive States**: Add distinct hover (`text-accent`), active (`text-accent` + underline), and focus styles.

## 2. Map Restoration
- **Re-implement Map**: Restore the Google Maps iframe in `Footer.tsx` (or a dedicated Contact section) that was removed in the previous turn.
- **Responsive Design**: Ensure it stacks correctly on mobile and expands on desktop.

## 3. Professional Iconography
- **Replace Emojis**: Update `src/data/services.ts` to use `lucide-react` icon names (string identifiers) instead of emojis.
- **Icon Component**: Create a helper to dynamically render Lucide icons based on the string name in `ServiceCard.tsx` and `ServicesPage.tsx`.
    - Example: 'facial' -> `<Sparkles />`, 'body' -> `<Activity />`.

## 4. Appointment Form & Interaction
- **Booking Modal**: Create a `BookingModal.tsx` component.
    - **Fields**: Name, Contact (Phone/Email), Preferred Date, Details.
    - **Validation**: Simple HTML5 validation or state-based checks.
    - **Action**: On submit, format the message: "Hola, estoy interesado en {servicio}. Mi nombre es {nombre}..." and redirect to the WhatsApp API link (since we have no backend). This fulfills the "Integración" requirement in a static context.

## 5. Vercel Integration
- **Configuration**: Create `vercel.json` with recommended settings for a Vite Single Page App (SPA) to handle routing (`rewrites`).
- **Deployment**: Provide instructions on how to connect the GitHub repo to Vercel (user action required for the actual hook setup).

## 6. CMS Integration (Architecture)
- **CMS Service Layer**: Create `src/services/cms.ts` to abstract data fetching.
- **Mock Implementation**: Initially, this will return the data from `src/data/services.ts`.
- **Adaptability**: Design it so the user can later swap the mock for a real API call (e.g., `fetch('https://strapi.estheticforlive.com/api/services')`) without changing the UI components.
- **Documentation**: Add a `CMS_SETUP.md` guide explaining how to set up Strapi/Sanity and connect it.

## 7. Content Updates
- **Services Update**: Update the text in `HomePage.tsx` (ServicesGrid) and `ServicesPage.tsx` to match the "Explora nuestra gama completa..." copy provided.
- **Transformations**: Update the `SocialProof.tsx` section with the "Resultados Reales" copy and "Antes/Después" labels.

## Execution Steps
1.  **Modify `Navbar.tsx`**: Fix contrast issues.
2.  **Update `Footer.tsx`**: Add the map back.
3.  **Refactor `services.ts`**: Replace emojis with icon keys.
4.  **Update `ServiceCard.tsx`**: Render Lucide icons.
5.  **Create `BookingModal.tsx`**: Implement form logic.
6.  **Create `vercel.json`**: Add deployment config.
7.  **Create `src/services/cms.ts`**: Implement the service layer pattern.
8.  **Update Content**: Apply text changes to Home and Services pages.
