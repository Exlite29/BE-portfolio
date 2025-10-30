# Portfolio Backend (Prisma + MongoDB + TypeScript)

This project provides a TypeScript Express backend using Prisma (MongoDB) to store contact form submissions and Nodemailer to send email notifications.

## Setup

1. Copy `.env.example` to `.env` and fill values (DATABASE_URL, EMAIL_USER, EMAIL_PASS, YOUR_EMAIL).

2. Install dependencies:

```powershell
cd c:\Users\Admin\OneDrive\Desktop\portfolio\backend
npm install
```

3. Generate Prisma client and push schema to the database:

```powershell
npx prisma generate
npx prisma db push
```

Note: For MongoDB, `prisma db push` is typically used to apply schema changes. Ensure your `DATABASE_URL` points to the correct MongoDB cluster.

4. Run in development:

```powershell
npm run dev
```

Or build and run:

```powershell
npm run build
npm start
```

## API

- POST /api/contact
  - Body: { name, email, message }
  - Success: 201 { success: true, message, data }
  - Errors: 400 validation, 500 server/prisma errors

## Files

- `prisma/schema.prisma` - Prisma schema using MongoDB
- `src/prismaClient.ts` - Prisma client instance
- `src/server.ts` - Express server
- `src/routes/contact.ts` - Contact route using Prisma
- `src/types/contact.ts` - TypeScript interfaces

## Notes

- Do not commit `.env` to version control.
- Use app-specific passwords for Gmail or proper SMTP credentials.
- Consider adding rate-limiting and CAPTCHA to prevent spam.
