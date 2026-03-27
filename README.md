This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Login accounts

This app separates permissions between admin and member users.

- Admin: can edit shifts and staff list
- Member: read-only access

Default credentials (for local development):

- Admin: `admin` / `admin1234`
- Member: `member` / `member1234`

You can override these values with environment variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `MEMBER_USERNAME`
- `MEMBER_PASSWORD`
- `SESSION_SECRET`

## Supabase setup

This app now persists shift data in Supabase.

1. Create a Supabase project.
2. Run SQL from `supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local`.
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
5. Restart `npm run dev`.

Required env vars:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
