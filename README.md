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
| Language | JavaScript (ES6+ / JSX) |
| Styling | Tailwind CSS v4 |
| Database | MongoDB Atlas (M0 Free Tier) |
| ODM | Mongoose |
| Authentication | Native JWT (`jose` + `bcryptjs` + HTTP-only cookies) |
| File Storage | AWS S3 (5 GB Free Tier via Presigned URLs) |
| Validation | Zod |
| Hosting | Vercel (free tier) |
| Cost | ₹0 |

---

## Local Setup

### Prerequisites

- Node.js v18+
- npm v9+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- An [AWS](https://aws.amazon.com/) account (S3 5 GB free tier)

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
   # Edit .env.local and fill in your MongoDB URI and AWS S3 keys
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | 32+ character random string for signing JWT cookies |
| `AWS_REGION` | ✅ | AWS Region for your S3 bucket (e.g. `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | ✅ | IAM Access Key ID with S3 permissions |
| `AWS_SECRET_ACCESS_KEY` | ✅ | IAM Secret Access Key |
| `AWS_S3_BUCKET_NAME` | ✅ | Name of your AWS S3 bucket |

See [`.env.example`](.env.example) and [`docs/MONGODB_S3_SETUP.md`](docs/MONGODB_S3_SETUP.md) for details.

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
