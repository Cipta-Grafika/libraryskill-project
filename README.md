<p align="center">
  <img src="./public/libraryskill.svg" alt="LibrarySkill Logo" width="120" height="120" />
</p>

<h1 align="center">LibrarySkill</h1>

<p align="center">
  A centralized platform to discover, author, review, and export structured prompt engineering skills and digital knowledge.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.9-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## ✨ Features

- **Author & Create** — Write structured Markdown skills with metadata, tags, and multi-block layouts
- **Review & Refine** — Collaborative review workflow before publishing
- **Discover** — Public catalog with search and category filtering
- **Export & Share** — Download any skill as a structured `.md` file; re-import seamlessly
- **Studio Dashboard** — Drag & drop `.md` import, draft auto-save, and skill management

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | 16.2.9 |
| UI Library | [React](https://react.dev) | 19.2.4 |
| Language | TypeScript | ^5 |
| Database | PostgreSQL | — |
| ORM | [Prisma](https://prisma.io) | ^7.8.0 |
| Auth | [NextAuth.js](https://next-auth.js.org) | ^4.24.14 |
| Rich Editor | [Tiptap](https://tiptap.dev) | ^3.27.1 |
| Icons | [Lucide React](https://lucide.dev) | ^1.22.0 |
| Styling | Vanilla CSS | — |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **≥ 18**
- PostgreSQL database (local or hosted)
- `npm` / `yarn` / `pnpm`

---

### 1. Clone the repository

```bash
git clone https://github.com/Cipta-Grafika/libraryskill-project.git
cd libraryskill-project
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/libraryskill"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

> Generate a secure secret with: `openssl rand -base64 32`

### 4. Set up the database

```bash
# Push schema to database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed

# (Optional) Open Prisma Studio
npx prisma studio
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
libraryskill/
├── prisma/              # Database schema & migrations
├── public/              # Static assets (logo, icons)
├── src/
│   ├── app/             # Next.js App Router pages & API routes
│   │   ├── api/         # REST API endpoints
│   │   ├── studio/      # Author dashboard & skill editor
│   │   ├── skills/      # Public skill catalog
│   │   └── ...
│   ├── components/      # Reusable UI components
│   └── styles/          # Global & module CSS
├── docs/                # Project documentation
├── .env.example         # Environment variable template
└── next.config.ts       # Next.js configuration
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Sync schema to database |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Built with 🔥 by <a href="https://github.com/astrocoding">Zaenal Alfian</a>
</p>
