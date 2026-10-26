# PromptVista — Premium AI Image Prompt Discovery Platform

> **Tagline:** *See It. Copy It. Create It.*

PromptVista is a high-performance, editorial-grade AI image prompt discovery platform. It empowers digital artists, designers, and prompt engineers to discover curated reference visuals, explore verified prompt recipes with exact camera lenses and lighting parameters, copy them with a single click, and synthesize stunning original artwork in Midjourney, Flux.1, Stable Diffusion, and DALL-E.

---

## 📸 Key Features

- **Editorial Visual Design System**:
  - Deep navy-black aesthetic (`#101018`) with glowing vivid violet accents (`#8B5CF6`) and soft lavender highlights (`#C4B5FD`).
  - Seamless Light / Dark theme toggle with persistence in `localStorage`.
  - Responsive layouts tailored for mobile, tablet, and ultra-wide desktop displays.

- **12 Curated Visual Categories**:
  - Nature & Landscapes, Abstract Backgrounds, Product Photography, Minimalist Art, Black Silhouettes, Fantasy & Cinematic Art, Architecture & Interiors, Food Photography, Botanical Illustrations, Textures & Patterns, 3D Art, and Editorial & Conceptual Art.
  - Dynamic prompt counts computed from actual active dataset records.

- **Production-Ready PromptCard & 1-Click Copy**:
  - Instant clipboard copying with temporary `"Copied!"` button states and floating notification toasts.
  - Cross-browser legacy clipboard fallback modal for restricted permissions.
  - Image preview shimmer placeholders and aspect ratio preservation (`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `21:9`).
  - Interactive favorites bookmarking with real-time navbar counter sync.

- **Dedicated Prompt Detail Pages (`/prompts/:slug`)**:
  - High-resolution visual showcase with full-screen Lightbox mode.
  - Selectable prompt panel with character count.
  - Dedicated Negative Prompt / Exclusion panel.
  - Compatible tools indicators (Midjourney v6, Flux.1 Dev, SDXL, DALL-E 3) without claiming official endorsement.
  - Contextual related prompt recommendations.
  - Native Web Share API integration with copy-link fallback.
  - Community content reporting workflow modal (DMCA, quality, attribution).

- **Multi-Dimensional Search & Filtering (`/explore`)**:
  - Full-text search across titles, descriptions, prompts, and tags with live autocomplete suggestions.
  - Filter by Category, Visual Style, Aspect Ratio, and Free vs. Premium tiers.
  - Sorting by Newest, Oldest, and Alphabetical (A-Z).
  - Bi-directional URL synchronization (`?q=...&category=...&style=...&ar=...&sort=...`).

- **Creator Content Studio (`/admin`)**:
  - Visual prompt authoring form with live real-time card preview.
  - Automated syntax checking and slug generation.
  - Single-click full-dataset export as JSON.
  - Supabase database connection and Row Level Security (RLS) health checker.

- **Optional Cloud & Backend Integration (Supabase)**:
  - Works 100% offline with zero configuration using local seed data and browser caching.
  - Ready to connect to Supabase for authentication, cloud-synced user favorites, and database-backed prompt management with strict Row Level Security (RLS) policies.

- **SEO & Performance**:
  - Pre-configured `robots.txt` and `sitemap.xml`.
  - Dynamic OpenGraph and Twitter card metadata for social preview discovery.
  - Optimized chunk splitting (`vendor-react`, `vendor-ui`, `vendor-supabase`) yielding fast sub-second bundle loads.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **React 19 + TypeScript** | Component architecture and type-safe domain models |
| **Vite 8** | High-speed build tooling and local development server |
| **Tailwind CSS v3.4** | Custom editorial design tokens, dark mode classes, and glow shadows |
| **React Router v7** | Client-side routing with automatic scroll restoration |
| **Framer Motion** | Micro-animations, toasts, and dialog transitions |
| **Lucide React** | Clean, accessible iconography |
| **Supabase JS** | Optional PostgreSQL database, authentication, and RLS |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** v18+ or v20+
- **npm** or **pnpm** / **yarn**

### 2. Clone and Install Dependencies
```bash
# Navigate to the workspace directory
cd "e:/my web side"

# Install all required packages
npm install
```

### 3. Running Website vs. Standalone Admin Panel

We have separated the **Main Public Website** and the **Private Admin Panel** into distinct files and entry points:

#### Option A: Quick 1-Click Launch (Windows .bat files)
- **Start Main Public Website**: Double-click [`start-website.bat`](file:///e:/my%20web%20side/start-website.bat) (opens `http://localhost:5173/`)
- **Start Private Admin Panel**: Double-click [`start-admin.bat`](file:///e:/my%20web%20side/start-admin.bat) (opens `http://localhost:5173/admin.html`)

#### Option B: Terminal npm commands
```bash
# Start Main Public Website (Visitors experience)
npm run dev
# -> Opens http://localhost:5173/ (index.html)

# Start Private Account Holder Admin Panel only
npm run dev:admin
# -> Opens http://localhost:5173/admin.html (admin.html)
```

---

## 🔐 Account Holder Admin Panel (`admin.html`)

The admin panel is private and completely hidden from public users:
- **Default Master Passcode**: `admin123` (can be changed anytime directly from the panel).
- **Manage Prompts (লাইভ প্রম্পট পরিচালনা)**:
  - Search and filter all live prompt recipes.
  - 1-click **Remove / Delete** with confirmation modal to safely delete any prompt and reference image.
- **Add Prompt & PC Image Upload (কম্পিউটার থেকে ছবি ও প্রম্পট আপলোড)**:
  - Direct local file upload from your PC (`PNG`, `JPG`, `WebP`) using automatic Base64 encoding.
  - Or paste image URL (Unsplash, Cloudinary, etc.).
  - Real-time card preview before publishing.
  - 1-click publish that instantly reflects across the entire website.
- **Monetization & ouo.io Background Shortlink (ব্যাকগ্রাউন্ড শর্ট লিংক)**:
  - **Hidden in Background**: Links are never shown on the website as spam text or visible links.
  - **All Buttons (2-Step)**: 1st click on any button opens the ouo.io shortlink in a background new tab; 2nd click executes the button action.
  - **Guaranteed Excluded Features (100% Ad-Free)**:
    - 🔍 **Search** (Search inputs, search forms, autocomplete)
    - 🧭 **Explore** (`/explore` navigation links and browse buttons)
    - 📂 **Categories** (`/categories` navigation links)
    - 🔥 **Trending** (Trending filter tabs and chips)
    - 🎁 **Free Prompts** (`/free-prompts` navigation links)
  - **Every Image Click (2-Step)**: 1st click opens ouo.io in a new tab; 2nd click navigates to the prompt detail page (`/prompts/:slug`).
  - **Copy Button (2-Step)**: 1st click opens ouo.io; button pulses "Click to Copy"; 2nd click copies the prompt to clipboard and shows green confirmation.
  - **First Touch on Website**: First touch/click anywhere on the website opens the shortlink once per visitor session (optional).
  - **Admin Panel Controls**: Dedicated inputs for Global ouo Link, Button Specific ouo Link, Prompt Specific ouo Link, and Cooldown interval.
  - **Live Test Button**: Test active short link directly from the panel.

---

### 4. Production Build
```bash
# Compiles TypeScript and builds optimized production assets for both index.html and admin.html
npm run build

# Preview the production build locally
npm run preview
```

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xyz.supabase.co`) | *(Optional - falls back to local data)* |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous Supabase key with RLS enforcement | *(Optional)* |
| `VITE_SITE_URL` | Public production domain for canonical URLs | `https://promptvista.pages.dev` |
| `VITE_ANALYTICS_DOMAIN` | Optional domain for privacy-first analytics | *(Optional)* |

> **Note:** PromptVista does **not** require Supabase to function. If environment variables are omitted, all browsing, searching, copying, and favoriting operates smoothly via local storage.

---

## 🗄️ Optional Supabase Database Setup

To enable multi-device user sync and database-backed administration:

1. Create a free project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository and run the script. This will create:
   - `categories` table with public read permissions.
   - `prompts` table with public read permissions for published recipes.
   - `user_favorites` table with Row Level Security allowing users to view and modify only their own saved items.
   - `content_reports` table allowing anonymous community report submissions.
4. Copy your project URL and anonymous public key to `.env`.
5. Open `/admin` in PromptVista and click **Verify Supabase RLS Endpoint** to confirm the connection.

---

## 🌐 Deployment to Cloudflare Pages or Vercel

### Deploying on Cloudflare Pages
1. Push your repository to GitHub or GitLab.
2. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** -> **Create application** -> **Pages**.
3. Select your repository.
4. Build configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Under **Environment variables**, optionally add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. Click **Save and Deploy**.

### Deploying on Vercel
1. Run `npx vercel` or import the repository in the Vercel Dashboard.
2. Framework Preset will be automatically detected as **Vite**.
3. Output Directory: `dist`.
4. Deploy.

---

## 🧭 Project Architecture

```
e:/my web side/
├── public/
│   ├── favicon.svg          # Custom PromptVista aperture/spark icon
│   ├── robots.txt           # Search engine indexing directives
│   └── sitemap.xml          # XML sitemap for SEO discovery
├── src/
│   ├── assets/              # Static media assets
│   ├── components/          # Reusable UI components
│   │   ├── AuthModal.tsx             # Supabase authentication / local sync dialog
│   │   ├── CategoryCard.tsx          # Visual category card with count badge
│   │   ├── CopyFallbackModal.tsx     # Accessible manual copy dialog
│   │   ├── FeaturedCategories.tsx    # 12-category showcase grid
│   │   ├── FilterBar.tsx             # Multi-dimensional search and filter panel
│   │   ├── Footer.tsx                # Editorial footer with ethics statement
│   │   ├── Hero.tsx                  # Hero section with mosaic and search
│   │   ├── HowItWorks.tsx            # 3-step visual workflow section
│   │   ├── Navbar.tsx                # Header with navigation, theme, & favorites
│   │   ├── PromptCard.tsx            # Core prompt card with 1-click copy
│   │   ├── PromptGrid.tsx            # Responsive multi-column grid & empty states
│   │   └── ReportModal.tsx           # Content and DMCA reporting workflow
│   ├── context/
│   │   └── ToastContext.tsx          # Global animated notification toast provider
│   ├── data/
│   │   ├── categories.ts             # 12 category metadata records
│   │   └── seedPrompts.ts            # 24 authentic prompt records with camera specs
│   ├── hooks/
│   │   ├── useAnalytics.ts           # Privacy-first event tracking
│   │   ├── useDocumentHead.ts        # Dynamic title and OpenGraph metadata
│   │   ├── useFavorites.ts           # Saved prompts with cross-tab persistence
│   │   └── useTheme.ts               # Light/dark mode toggle
│   ├── lib/
│   │   ├── analytics.ts              # Telemetry dispatcher
│   │   ├── clipboard.ts              # Multi-fallback clipboard utility
│   │   ├── monetization.ts           # Isolated optional sponsored partner module
│   │   ├── prompts.ts                # Filtering, sorting, and search logic
│   │   └── supabase.ts               # Supabase client with graceful offline fallback
│   ├── pages/
│   │   ├── AboutPage.tsx             # Platform mission and ethics
│   │   ├── AdminPage.tsx             # Content Studio for authoring & DB inspection
│   │   ├── CategoriesPage.tsx        # Complete 12-category directory
│   │   ├── CategoryDetailPage.tsx    # Filtered view for individual category
│   │   ├── ExplorePage.tsx           # Full search and filter interface
│   │   ├── FavoritesPage.tsx         # User's saved favorite collection & JSON export
│   │   ├── FreePromptsPage.tsx       # 100% free prompt directory
│   │   ├── HomePage.tsx              # Main landing page
│   │   ├── NotFoundPage.tsx          # Custom 404 page
│   │   ├── PrivacyPage.tsx           # Privacy policy
│   │   ├── PromptDetailPage.tsx      # Comprehensive prompt recipe showcase
│   │   └── TermsPage.tsx             # Terms of service and licensing rules
│   ├── types/
│   │   └── index.ts                  # Domain models and TypeScript interfaces
│   ├── App.tsx                       # Root routing and layout setup
│   ├── index.css                     # Tailwind base tokens, glassmorphism, & scrollbars
│   └── main.tsx                      # Application entry point
├── supabase/
│   └── schema.sql                    # PostgreSQL schema, RLS policies, and indexes
├── .env.example                      # Template for optional environment variables
├── index.html                        # Google Fonts, OpenGraph, and SEO meta tags
├── tailwind.config.js                # PromptVista custom color palette & shadows
├── tsconfig.app.json                 # TypeScript compiler configuration
└── vite.config.ts                    # Optimized code splitting configuration
```

---

## 📜 Ethical Platform Standards

1. **Independent Discovery**: PromptVista is an educational prompt discovery catalog. We do not claim official partnerships with Midjourney Inc., Stability AI, or OpenAI.
2. **Authentic Data Only**: No fake download counters, fabricated user counts, or misleading countdown timers.
3. **Open Access**: Browsing, searching, and copying free prompts does not require registration or credit cards.
4. **Attribution**: Reference images are presented with photographer attributions and open license designations.

---

## 📄 License

The PromptVista source code is released under the **MIT License**. Reference images are attributed to their respective creators under Unsplash Free Commercial and Creative Commons licenses.
