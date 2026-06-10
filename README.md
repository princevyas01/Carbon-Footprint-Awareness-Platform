# CarbonLens — AI-Powered Personal Carbon Footprint Intelligence Platform

## 1. PROJECT TITLE
**CarbonLens** — AI-Powered Personal Carbon Footprint Intelligence Platform for India.

---

## 2. SUMMARY / ELEVATOR PITCH
CarbonLens is a premium, full-stack, offline-first personal carbon intelligence platform tailored specifically for Indian citizens. Designed with a deep-space "anti-gravity" visual identity, it combines precise local emission calculations, gamified eco-score levels, and intelligent coaching driven by Gemini models to help users track, understand, and reduce their daily carbon footprint. The application runs entirely client-side for user data, storing information securely in the browser and providing rich animations, responsive structures, and certified offset estimators.

---

## 3. KEY FEATURES
* **Carbon Logging Suite**: Single-click quick-log panel tracking emissions across 5 core categories with custom Indian alternatives (e.g. CNG auto-rickshaws, metro lines, traditional local diets).
* **India-Specific CEA Grid Calculator**: Uses the **Central Electricity Authority (CEA) CO₂ Baseline Database for the Indian Power Sector (2023)** to calculate state-level electrical grid footprints.
* **AI Carbon Coach**: Integrates the Gemini model to provide localized, actionable carbon-mitigation tips. Features an in-memory IP-based rate limiter (5-minute cooldown) and a local mock engine for offline use.
* **Gamification & Eco Score**: Dynamic XP tracking, daily checklist challenges, streak indicators, and instant badge celebrations.
* **Interactive Offsets**: Tree absorption calculators and certified Indian offset schemes (e.g., solar parks, reforestation) supporting direct mock investments.
* **Shareable Carbon Card**: Client-side PNG card canvas generator (`dom-to-image-more`) exporting a carbon footprint summary for social media.
* **PWA & Offline Operations**: Progressive Web App capabilities including manifest integration, assets, and a customized offline fallback display.

---

## 4. TARGET AUDIENCE
* **Indian citizens** looking to understand their personal contribution to greenhouse gas emissions.
* **Sustainability advocates** looking to challenge themselves and maintain daily green habits.
* **Climate educators** interested in local carbon conversion models and factors.
* **Developers** interested in building accessible, premium, offline-first carbon analytics tools.

---

## 5. EMISSION CONVERSION FACTORS & FORMULAS

CarbonLens converts user actions into carbon emissions (expressed in kg CO₂ equivalent) using the following formulas and factors:

### A. Formulas
1. **Transport**:
   $$\text{CO}_2\text{ (kg)} = \text{Distance (km)} \times \text{Factor}$$
2. **Food**:
   $$\text{CO}_2\text{ (kg)} = \text{Servings} \times \text{Factor}$$
3. **Energy**:
   $$\text{CO}_2\text{ (kg)} = (\text{Electricity (kWh)} \times \text{State Grid Factor}) + (\text{LPG Cylinders} \times 42.35) + (\text{Generator Hours} \times 1.5 \times \text{Gen Fuel Factor})$$
4. **Shopping**:
   $$\text{CO}_2\text{ (kg)} = \text{Spend (INR)} \times \text{Factor} \times \text{Multiplier (0.2 if Second-hand, else 1.0)}$$
5. **Flight Travel**:
   $$\text{CO}_2\text{ (kg)} = \text{Distance between Cities (km)} \times \text{Flight Base Factor (0.255)} \times \text{Class Multiplier} \times \text{Round-trip Multiplier (2.0 if Return, else 1.0)}$$

### B. Conversion Factors
* **Transport factors (per km)**:
  * Petrol Car: `0.21` kg CO₂/km
  * Diesel Car: `0.27` kg CO₂/km
  * CNG Auto: `0.17` kg CO₂/km
  * Two-wheeler: `0.09` kg CO₂/km
  * EV: `0.10` kg CO₂/km
  * Bus: `0.089` kg CO₂/km
  * Metro: `0.031` kg CO₂/km
  * Train: `0.041` kg CO₂/km
* **Food factors (per serving)**:
  * Beef Curry: `6.61` kg CO₂/serving
  * Mutton/Lamb: `5.84` kg CO₂/serving
  * Paneer/Dairy: `0.94` kg CO₂/serving
  * Rice Meal: `0.40` kg CO₂/serving
  * Dal: `0.24` kg CO₂/serving
  * Vegan Thali: `0.15` kg CO₂/serving
  * Idli/Dosa: `0.18` kg CO₂/serving
  * Roti+Sabzi: `0.22` kg CO₂/serving
* **Energy grid factors (CEA 2023, kg CO₂/kWh)**:
  * Delhi: `0.82`
  * Karnataka: `0.48`
  * Kerala: `0.42`
  * Gujarat: `0.88`
  * Uttar Pradesh: `0.91`
  * Maharashtra: `0.72`
  * Tamil Nadu: `0.54`
  * National Default: `0.82`
  * LPG Cylinder Factor: `42.35` kg CO₂/cylinder
  * Petrol Generator Fuel Factor: `2.31` kg CO₂/L
  * Diesel Generator Fuel Factor: `2.68` kg CO₂/L
* **Shopping factors (per INR spent)**:
  * Clothing: `0.012` kg/₹
  * Electronics: `0.015` kg/₹
  * Food Grocery: `0.005` kg/₹
  * Furniture: `0.008` kg/₹
  * Services: `0.002` kg/₹
  * Other: `0.008` kg/₹
* **Flight class multipliers**:
  * Economy: `1.0`
  * Business: `2.8`
  * First: `4.0`

---

## 6. GAMIFICATION SCORING RULES

CarbonLens rewards users with Experience Points (XP / Eco Score) to motivate carbon reductions:

### A. Scoring Events
* **Activity Logged**: `+10` XP (Awarded for logging any daily activity)
* **Streak Maintained**: `+20` XP (Awarded if the user logs on consecutive days)
* **7-Day Milestone**: `+100` XP (Awarded upon completing a 7-day logging streak)
* **Challenge Completed**: `+50` XP (Awarded upon completing any active checklist challenge)
* **Below Average Monthly**: `+200` XP (Awarded if monthly footprint is kept below India's average)
* **Inactivity Penalty**: `-20` XP (Deducted if the user goes 48 hours or more without logging any activity)

### B. Level Thresholds
* **Carbon Rookie**: `0` - `199` XP (Level Icon: `🌑`)
* **Green Sprout**: `200` - `399` XP (Level Icon: `🌿`)
* **Eco Warrior**: `400` - `599` XP (Level Icon: `🌊`)
* **Solar Champion**: `600` - `799` XP (Level Icon: `☀️`)
* **Carbon Zero Hero**: `800` - `1000` XP (Level Icon: `🌍`)

---

## 7. DEPLOYMENT OR RUN INSTRUCTIONS

### A. Local Run Instructions
1. **Clone the repository** and navigate to the root directory.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Open Application**: Navigate to [http://localhost:3000](http://localhost:3000).

### B. Running Tests
Run the Vitest suite to verify calculations, storage interfaces, and notifications:
```bash
npx vitest run
```

### C. Build & Compile Checks
Compile and verify the production output:
```bash
npm run build
```

---

## 8. ENVIRONMENT VARIABLES
CarbonLens uses the following environment variables. Place them in a `.env.local` file in the root directory:

* `GEMINI_API_KEY` (Optional): The Google Gemini API key to power personal AI insights. If left unset, the platform will gracefully default to a local rules-based engine for offline utility.

---

## 9. TECH STACK & ARCHITECTURE
* **Framework**: Next.js 14 (App Router)
* **Libraries**: React 18, Lucide React (Icons), Recharts (Data visualization), dom-to-image-more (Social sharing)
* **Styling**: Tailwind CSS & custom Vanilla CSS layout layers
* **Theme Management**: LocalStorage-backed theme provider (light & dark mode support)
* **State Management**: React Context Provider with Reducer dispatch patterns
* **Linter & Compiler**: ESLint with TypeScript strict checks

---

## 10. DEVELOPMENT ROADMAP
* **Multi-language support**: Support Hindi, Tamil, Bengali, and other major Indian regional languages.
* **Integrations**: IoT smart meter integration for automatic electricity consumption logs.
* **Peer Challenges**: Social sharing challenges allowing friends to compare eco-scores and progress in real-time.

---

## 11. CONTRIBUTION GUIDELINES
1. Fork the repository and create a new feature branch (`git checkout -b feature/MyFeature`).
2. Maintain standard file headers (`@file`, `@description`, `@module`, `@author CarbonLens Team`) on all new source files.
3. Write Vitest unit tests for any new calculations or state mutation engines.
4. Ensure typescript strictly typechecks with zero warnings: `npx tsc --noEmit`.
5. Open a Pull Request detailing changes, test logs, and visual updates if applicable.

---

## 12. LICENSE
Distributed under the MIT License. See `LICENSE` for more information.
