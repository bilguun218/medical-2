# NOVYTAS Corporate Website

Production-oriented corporate website and separate admin system for NOVYTAS LLC.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS and shadcn-style UI primitives
- Framer Motion
- Prisma and PostgreSQL
- Auth.js credentials login
- React Hook Form and Zod

## Local Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
2. Install dependencies with `npm install`.
3. Run `npm run prisma:dev` to create the database schema.
4. Run `npm run seed` to create the first admin user and source-based product categories.
5. Start development with `npm run dev`.

The public website is available at `/mn` and `/en`. The admin system is available at `/admin`.

## Source Content

Corporate content is derived from the supplied NOVYTAS company profile document. Product records, news articles, phone, email, full address, business hours, map embed, product images, specifications, and PDF attachments were not present in the source document, so no fabricated content was added.
