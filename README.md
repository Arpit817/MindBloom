# MindBloom 🌱

> A full-stack spaced-repetition and active-recall web application for students.

**Never forget what you learned in class.**

MindBloom helps students revise regularly using spaced repetition and active recall. After class, a student creates a note, adds 2–3 revision questions, and MindBloom schedules reviews at optimal intervals — so exam night doesn't feel like meeting your notes for the first time.

---

## Features

- 📖 **Structured Notes** — Create notes with typed content and up to 10 uploaded photos
- 🧠 **Active Recall** — Answer questions from memory before revealing the answer
- ⏱️ **Spaced Repetition** — Smart review schedule: 2 → 7 → 14 → 30 days
- 🎨 **Subject Tracking** — Organise notes by colour-coded subjects with freshness scores
- 📺 **YouTube Study Plans** — Link videos/playlists and create day-wise or step-wise learning plans
- 📊 **Progress Analytics** — Revision streaks, completion rates, subject health charts
- 🔔 **In-App Reminders** — Dashboard shows due reviews and overdue learning tasks

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Validation | Zod |
| Charts | Recharts |
| Hosting | Vercel (free tier) |
| Cost | ₹0 |

---

## Local Setup

### Prerequisites

- Node.js v18+
- npm v9+
- A free [Supabase](https://supabase.com) account

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arpit817/MindBloom.git
   cd MindBloom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and fill in your Supabase URL and anon key
   ```

4. **Run database migrations** *(Stage 2)*
   ```sql
   -- Run the SQL files in supabase/migrations/ in your Supabase SQL editor
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Your Supabase anon/public key |

See [`.env.example`](.env.example) for the template.

---

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run tests (available from Stage 7+)
```

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable React components
│   ├── ui/           # Base UI components (Button, Input, Modal, etc.)
│   ├── layout/       # Sidebar, Navbar, MobileNavigation
│   └── shared/       # Cross-feature components (FreshnessBadge, etc.)
├── lib/              # Supabase clients and data-fetching helpers
├── utils/            # Pure utility functions (dates, formatting, etc.)
├── types/            # TypeScript types for all database tables
└── hooks/            # Custom React hooks
```

---

## Deployment

Production deployment on Vercel is planned for **Stage 16**.

The app will be deployed at a free Vercel subdomain (e.g. `https://mindbloom.vercel.app`).

---

## Author

**Arpit Anand Patel**  
GitHub: [@Arpit817](https://github.com/Arpit817)  
Email: arpitpatel7388@gmail.com

---

## License

MIT — Free to use for academic and personal projects.
