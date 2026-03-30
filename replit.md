# Velda Cable Technics — Corporate Website

## Overview
Premium full-stack corporate website for **Velda Cable Technics**, a Belgian steel cable specialist since 1935. All content in Dutch. Dark industrial luxury aesthetic.

## Tech Stack
- **Frontend**: React + Vite + TanStack Query + Wouter (routing) + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI GPT-4o via Replit AI Integrations (streaming chat for quote assistant, cable calculator)

## Design System
- **Colors**: Primary green `#92AF2B` (HSL 85 53% 51%), charcoal backgrounds `#0a0a0a`/`#111111`, gray `#75726E`
- **Typography**: System fonts (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue"`)
- **UI**: Sharp corners (radius: 0), no rounded elements, micro animations
- **Language**: ALL text in Dutch

## Project Structure
```
shared/schema.ts        — Drizzle schema (products, sectors, timelineEvents, quoteRequests, contactMessages, conversations, messages, jobs, jobApplications, catalogDownloads, users)
server/routes.ts        — API routes + AI endpoints + admin CRUD + sitemap + robots.txt
server/storage.ts       — DatabaseStorage class with all CRUD operations (public + admin)
server/auth.ts          — Passport.js local strategy, session management, requireAdmin middleware
server/seed.ts          — Seed data (92 products, 10 categories, 9 sectors, 7 timeline events, 3 jobs, admin user)
client/src/App.tsx      — Routing (14 public pages + 11 admin pages with ProtectedRoute)
client/src/pages/       — Public pages (Home, Products, ProductDetail, etc.)
client/src/pages/admin/ — Admin CMS pages (Login, Dashboard, Products, Jobs, Applications, Messages, Quotes, Downloads, Export)
client/src/hooks/useSEO.ts — Dynamic SEO hook (title, description, OG/Twitter tags)
client/src/hooks/useAuth.ts — Auth state hook with login/logout mutations
client/src/components/  — Navbar, Footer, Hero, About, Sectors, UI components
client/public/catalog/  — Product images + SVG illustrations
client/public/catalogs/ — Downloadable PDF catalogs (behind leadgen form)
client/public/flyers/   — 9 sector PDF flyers + PNG images
```

## Product Catalog (92 products in 10 categories)
Data scraped from **wireropemate.com** + Velda-specific products.

### Categories & counts:
| Category | Count | Source |
|---|---|---|
| Cable Gripper | 12 | wireropemate.com |
| Looping Gripper | 7 | wireropemate.com |
| Swivel Joint | 6 | wireropemate.com |
| Plafondbevestiging | 12 | wireropemate.com |
| Staalkabels | 12 | wireropemate.com |
| Ophangkits | 9 | wireropemate.com |
| Display Systeem | 12 | wireropemate.com |
| CNC, Draaien en Gieten | 5 | wireropemate.com |
| Technische Kabels | 10 | Velda-specific (SVG cross-section illustrations) |
| Bowdenkabels | 2 | Velda-specific (custom SVG illustrations) |

## Custom SVG Illustrations
- `/catalog/wire-rope-1x19.svg` — 1×19 wire rope cross-section
- `/catalog/wire-rope-7x7.svg` — 7×7 wire rope cross-section
- `/catalog/wire-rope-7x19.svg` — 7×19 wire rope cross-section
- `/catalog/bowden-cable.svg` — Bowden cable illustration
- `/catalog/gas-cable.svg` — Gas/throttle cable illustration

## Downloadable Catalogs (behind leadgen form)
- `/catalogs/velda-catalogus.pdf` — Main product catalog
- `/catalogs/catalogue-qs.pdf` — Quality standards catalog
- `/catalogs/suspension-systems.pdf` — Suspension systems guide
- `/catalogs/presentatie-velda.pdf` — Company presentation

## Sectors (9 sectors with flyer PDFs)
Each sector has use cases plus downloadable PDF flyer with PNG preview images.

## Pages (14 total)
1. **Home** — Hero + About + Sectors
2. **Products** — 92 products in 10 categories, filterable, Quick View popup
3. **ProductDetail** — Image gallery, specs, AI product chat
4. **SectorsPage** — 9 sectors grid
5. **SectorDetail** — Sector details, flyer images, use cases
6. **QuoteTool** — 6-step wizard + AI chat assistant
7. **AboutPage** — Team, timeline, world map, certifications
8. **ContactPage** — Contact form with category selection
9. **CatalogsPage** — Catalog downloads with leadgen modal
10. **JobsPage** — Vacatures + sollicitatieformulier
11. **CalculatorPage** — 4 cable calculation tools with AI advice
12. **AlgemeneVoorwaarden** — Legal terms
13. **PrivacyBeleid** — GDPR privacy policy
14. **not-found** — 404 page (Dutch, Velda-styled)

## SEO
- Dynamic `document.title` + meta description per page via `useSEO` hook
- OG/Twitter meta tags updated per page
- JSON-LD structured data (Organization, LocalBusiness) in index.html
- Server-side `/sitemap.xml` endpoint
- Server-side `/robots.txt` endpoint
- `lang="nl-BE"` on HTML element
- No Google Fonts (system fonts only)

## Team Members (About page)
- Nelson Vroman — Zaakvoerder (real photo: `@assets/1746707807938_1771950139538.jpeg`)
- Christophe Pelckmans — Administratie & Financieel
- Femke Van Der Schueren — Order Verwerking
- Henri Van Linden — Internal Sales
- Hannes Vanoutryve — Sales Manager
- Tom Nachtergaele — Logistiek & Productie
- Photos: `client/src/assets/team/{name}.png`

## API Endpoints

### Public
- `GET /api/products` — List products (query: type, category, search)
- `GET /api/products/:slug` — Single product
- `GET /api/sectors` — List sectors
- `GET /api/sectors/:slug` — Single sector
- `GET /api/timeline` — Timeline events
- `GET /api/jobs` — Active job listings
- `GET /api/jobs/:slug` — Single job
- `POST /api/job-applications` — Submit job application
- `POST /api/catalog-downloads` — Register catalog download (leadgen)
- `POST /api/cable-calculator` — AI cable calculation advice (GPT-4o)
- `POST /api/quote-requests` — Create quote request
- `POST /api/contact` — Create contact message
- `POST /api/ai-quote-chat` — AI quote chat (streaming SSE)
- `POST /api/ai-product-chat` — AI product advice chat (streaming SSE)
- `GET /api/seed` — Re-seed database (dev only)
- `GET /sitemap.xml` — XML sitemap
- `GET /robots.txt` — Robots.txt

### Auth
- `POST /api/auth/login` — Admin login (username/password)
- `POST /api/auth/logout` — Admin logout
- `GET /api/auth/me` — Current user session

### Admin (protected by requireAdmin middleware)
- `GET /api/admin/stats` — Dashboard statistics
- `GET/POST /api/admin/products` — List/create products
- `GET/PUT/DELETE /api/admin/products/:id` — Read/update/delete product
- `GET/POST /api/admin/jobs` — List/create jobs
- `GET/PUT/DELETE /api/admin/jobs/:id` — Read/update/delete job
- `GET/DELETE /api/admin/job-applications` — List/delete applications
- `GET/DELETE /api/admin/contact-messages` — List/delete messages
- `GET/DELETE /api/admin/quote-requests` — List/delete quotes
- `PATCH /api/admin/quote-requests/:id/status` — Update quote status
- `GET /api/admin/catalog-downloads` — List downloads
- `GET /api/admin/export/:type` — Export data (format=csv|json, types: products/jobs/contacts/quotes/downloads/applications)

## Admin CMS
- **Login**: `/admin/login` (credentials: admin / velda2025)
- **Dashboard**: `/admin` — Overview stats + recent activity
- **Producten**: `/admin/producten` — Full CRUD with form
- **Vacatures**: `/admin/vacatures` — Full CRUD with form
- **Sollicitaties**: `/admin/sollicitaties` — View/delete applications
- **Berichten**: `/admin/berichten` — View/delete contact messages
- **Offertes**: `/admin/offertes` — View/delete/status management
- **Downloads**: `/admin/downloads` — View catalog download leads
- **Export**: `/admin/export` — CSV/JSON export for all data types

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Express session secret
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI API base URL (Replit integration)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (Replit integration)

## Design Polish (latest)
- Sharp corners enforced: removed `rounded-xl`/`rounded-2xl` from About stats cards, image container, SectorsPage cards/skeletons
- LinkedIn button de-rounded (About.tsx), URL corrected to Nelson Vroman
- Spinners de-rounded across AboutPage and JobsPage (square spin animation)
- Image lazy loading (`loading="lazy"` + `decoding="async"`) on product images, team photos, world map, sector background
- Footer language switcher (NL/FR/EN) removed — site is Dutch-only
- Mobile nav active state enhanced with `bg-primary/5` background
- Products "Toon alle" button: larger, green border, green fill on hover
- Product cards: green border hover + animated green bottom line
- Contact page: all info cards have hover border effect

## Owner Info
- **Owner**: Nelson Vroman, Zaakvoerder
- **LinkedIn**: https://be.linkedin.com/in/nelson-vroman-08020382
- **Logo**: `@/assets/images/velda-logo.png`
- **Owner photo**: `@assets/1746707807938_1771950139538.jpeg`
