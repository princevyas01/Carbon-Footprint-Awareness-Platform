# CarbonLens — AI-Powered Personal Carbon Footprint Intelligence Platform

CarbonLens is a premium, full-stack, offline-first personal carbon intelligence platform tailored specifically for Indian citizens. Designed with a deep-space "anti-gravity" visual identity, it combines precise local emission calculations, gamified eco-score levels, and intelligent coaching driven by Gemini 2.0 Flash to help users track, understand, and reduce their carbon footprint.

---

## 🌟 Visual Identity & Design Principles

* **Aesthetic Theme**: Deep space orbital view of Earth's atmosphere, combining bioluminescent green data highlights with glassmorphic cards and subtle pulse animations.
* **Responsive Layout**: Custom sidebar layout for desktop screens and a bottom navigation tab bar for mobile screens.
* **Accessibility (WCAG 2.1 AA)**: Outlines, aria-labels, high-contrast states, skip-to-content links, and full keyboard-navigable dialogs. Supports `prefers-reduced-motion` media queries.

---

## 🚀 Key Features

1. **Carbon Logging Suite**: Single-click quick-log panel tracking emissions across 5 core categories with custom Indian alternatives (e.g. CNG auto-rickshaws, metro lines, traditional local diets).
2. **India-Specific CEA Grid Calculator**: Uses the **Central Electricity Authority (CEA) CO₂ Baseline Database for the Indian Power Sector (2023)** to calculate state-level electrical grid footprints.
3. **AI Carbon Coach**: Integrates Gemini 2.0 Flash to provide localized, actionable carbon-mitigation tips. Features an in-memory IP-based rate limiter (5-minute cooldown) and a local mock engine for offline use.
4. **Gamification & Eco Score**: Dynamic XP tracking, daily checklist challenges, streak indicators, and instant badge celebrations.
5. **Interactive Offsets**: Tree absorption calculators and certified Indian offset schemes (e.g., solar parks, reforestation) supporting direct mock investments.
6. **Shareable Carbon Card**: Client-side PNG card canvas generator (`dom-to-image-more`) exporting a 400x220px carbon footprint summary for social media.
7. **PWA & Offline Operations**: Progressive Web App capabilities including manifest integration, assets, and a customized offline fallback display.

---

## 📊 Carbon Emission Factors Reference

The calculations follow EPA guidelines, the IPCC, and India-specific studies (e.g., CEA baseline):

### 1. Transport Emissions (per km)
| Vehicle Type | Factor (kg CO₂/km) | Details |
|---|---|---|
| **Petrol Car** | `0.21` | Standard internal combustion engine |
| **Diesel Car** | `0.27` | High density diesel particulate |
| **CNG Auto** | `0.17` | Clean natural gas transport alternative |
| **Two-wheeler**| `0.09` | Motorbikes and scooters |
| **EV** | `0.10` | Average grid charging footprint (India) |
| **Bus** | `0.089` | Average mass public transit |
| **Metro** | `0.031` | Highly efficient electric transit |
| **Train** | `0.041` | National railway mix |

### 2. Diet & Food (per serving)
| Meal Type | Factor (kg CO₂/serving) | Details |
|---|---|---|
| **Beef Curry** | `6.61` | High-methane ruminant beef lifecycle |
| **Mutton/Lamb**| `5.84` | Mutton rearing lifecycle |
| **Paneer/Dairy**| `0.94` | High-demand dairy footprint in India |
| **Rice Meal** | `0.40` | Paddy field methane |
| **Dal** | `0.24` | Legumes (low footprint protein) |
| **Vegan Thali**| `0.15` | Plant-based Indian thali |
| **Idli/Dosa** | `0.18` | Fermented batter foods |
| **Roti+Sabzi** | `0.22` | Wheat and seasonal vegetables |

### 3. State Grid Electricity (CEA 2023, kg CO₂/kWh)
* **Delhi**: `0.82` (Coal mix heavy)
* **Karnataka**: `0.48` (Clean hydel/renewables)
* **Kerala**: `0.42` (High clean energy ratio)
* **Gujarat**: `0.88`
* **Uttar Pradesh**: `0.91` (Thermal-heavy grid)
* **Maharashtra**: `0.72`
* **Tamil Nadu**: `0.54`
* **National Default**: `0.82`

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide icons, Recharts
* **Backend**: Next.js API Routes, Google Generative AI (Gemini SDK)
* **PWA**: `next-pwa` service worker generator, `manifest.json`
* **Testing**: Vitest (23 unit tests covering calculations, level-ups, storage, and notifications)

---

## ⚙️ Installation & Running Guide

### 1. Prerequisites
* Node.js (v18.x or later)
* npm (v9.x or later)

### 2. Setup Environment
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no API key is provided, CarbonLens will gracefully default to its local rule-based coaching engine).*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Run Test Suite
CarbonLens includes a comprehensive Vitest test suite.
```bash
npx vitest run
```
Output:
```bash
 ✓ tests/notifications.test.ts (7 tests)
 ✓ tests/scoring.test.ts (2 tests)
 ✓ tests/calculations.test.ts (10 tests)
 ✓ tests/storage.test.ts (4 tests)

 Test Files  4 passed (4)
      Tests  23 passed (23)
```

### 6. Build for Production
Verify production compiling and asset bundling:
```bash
npm run build
npm run start
```

---

## Architecture
```mermaid
graph TD
    A[User] --> B[Dashboard]
    B --> C[CarbonContext]
    C --> D[localStorage]
    B --> E[/api/insight]
    E --> F[Gemini API]
    A --> G[Activity Logger]
    G --> C
    C --> H[Charts & KPIs]
```

## Data Sources
| Data | Value | Source |
|------|-------|--------|
| India grid average | 0.82 kg CO2/kWh | CEA Annual Report 2023 |
| India per-capita average | 1.9T/year | World Bank 2022 |
| Petrol car emission | 0.21 kg CO2/km | IPCC AR6 |
| Beef meal emission | 6.61 kg CO2/serving | Poore & Nemecek 2018 |
| Metro emission | 0.031 kg CO2/km | IEA Transport Data |
| Flight emission | 0.255 kg CO2/km | ICAO Carbon Calculator |

## Security Measures
- Gemini API key used server-side only (never exposed to client)
- All numeric inputs validated and clamped to realistic ranges
- Rate limiting on AI endpoint (1 request per 5 minutes)
- Content Security Policy headers configured in next.config.js
- No dangerouslySetInnerHTML used anywhere in codebase

## Assumptions
1. India grid average of 0.82 kg CO2/kWh used when state is unknown
2. India per-capita average: 158 kg CO2/month (World Bank 2022)
3. Spend-based shopping factors estimated from lifecycle assessment literature
4. Flight distances calculated for major Indian city pairs only
5. All data stored locally on device — no backend database
