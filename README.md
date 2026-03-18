# CineMatch

AI-powered movie and TV recommendation platform built for ENSF 400 Assignment 4 using `Next.js`, `TypeScript`, `Prisma`, and `PostgreSQL`.

This repository implements the code portion of the system described across:
- [Assignment1_ENSF400_L01_Group01.pdf](/Users/huojunyu/Downloads/ENSF400/Assignment1_ENSF400_L01_Group01.pdf)
- [ENSF400 Assignment2.pdf](/Users/huojunyu/Downloads/ENSF400/ENSF400%20Assignment2.pdf)
- [Assignment3_ENSF400_L01_Group01.pdf](/Users/huojunyu/Downloads/ENSF400/Assignment3_ENSF400_L01_Group01.pdf)
- [Assignment4.pdf](/Users/huojunyu/Downloads/ENSF400/Assignment4.pdf)

## Stack

- `Next.js 16` full-stack app router
- `React 19`
- `Prisma`
- `PostgreSQL` via `DATABASE_URL` from Render
- `bcryptjs` for password hashing
- `Resend` or `Nodemailer` for email verification
- `OpenAI API` with fallback recommendation logic when no API key is configured

## What Has Been Implemented

### Core user flows

- User registration with email and password
- Email format validation
- Password complexity validation
- Password hashing
- Login and logout with session cookies
- Email verification token flow
- Onboarding questionnaire after registration
- Guest mode recommendation flow
- Persistent user preference profile storage
- Recommendation dashboard with at least 5 recommendations
- Explanations shown for each recommendation
- Natural-language recommendation requests
- Manual recommendation adjustment with one-time or permanent changes
- Content browsing with multi-filter support
- 1-5 star ratings
- Reviews with user-editable submission flow
- Comments
- Reporting inappropriate content
- Admin-only moderation dashboard
- Expanded engagement/admin metrics

### Infrastructure and data model

- PostgreSQL schema for users, sessions, verification tokens, profiles, content, ratings, reviews, comments, reports, and recommendation batches
- Seed script with sample content and an admin account
- Shared server actions for auth, onboarding, recommendations, reviews, comments, ratings, reports, and moderation
- Environment template for Render database and optional API keys

### Quality checks completed

- `npm run lint`
- `npm run build`

## Requirements Coverage

### Assignment 1 feature coverage

Implemented:
- `FR-001.1` to `FR-001.6`: registration, validation, password rules, verification email flow, login, logout
- `FR-002.1` to `FR-002.4`: onboarding questionnaire and profile persistence
- `FR-003.1` to `FR-003.4`: recommendation generation, LLM integration path, 5 recommendations, explanations
- `FR-004.1` to `FR-004.3`: ratings, reviews, comments
- `FR-005.1` to `FR-005.5`: content filtering, reporting, moderation dashboard, basic metrics
- `FR-006.1` to `FR-006.3`: manual include/exclude controls and refreshed recommendations

Partially implemented or simplified:
- `FR-004.4`: ratings, reviews, and comments now influence recommendation scoring, but the weighting is heuristic rather than a trained personalization model.
- LLM integration is implemented with an OpenAI path and a fallback local scoring path. If `OPENAI_API_KEY` is not set, the fallback path is used.
- Verification email is implemented, but if neither `RESEND_API_KEY` nor SMTP credentials are configured it logs the verification link instead of sending a real email.

Not implemented from Assignment 1 scope:
- Third-party movie metadata integration is not implemented; the app uses seeded internal content data.

### Assignment 2 WBS / acceptance alignment

Covered well:
- `1.1 Registration System`
- `1.2 Email Notification Service`
- `1.3 Login and Session System`
- `2.1 Initial Questionnaire Form`
- `2.2 User Profile Storage`
- `3.1 LLM Interface`
- `3.2 Recommendation Generation System`
- `3.3 Manual Adjustment Controller`
- `4.1 Star Rating System`
- `4.2 Review and Comment System`
- `4.3 Content Filtering Engine`
- `5.1 Content Reporting System`
- `5.2 Moderation Dashboard`
- `6.1 Relational Database System`
- `6.2 Password Security Module`

Partial gaps against the design intent:
- Real email delivery depends on `RESEND_API_KEY` or SMTP env configuration.
- Performance target of "within 3 seconds under normal conditions" has not been formally benchmarked.
- Analytics are richer than before, but still not a full BI-style dashboard.

### Assignment 3 planning alignment

The implemented code covers the main planned modules from your activity list:
- registration UI/backend/testing-ready structure
- email workflow
- login/session management
- questionnaire UI and persistence
- profile schema and storage API
- LLM interface and recommendation generation
- recommendation display
- manual adjustment
- star rating
- review/comment storage
- filtering
- reporting
- moderation dashboard
- database/security setup

### Assignment 4 code requirement alignment

Satisfied by this repository:
- Features from Assignment 1 are implemented in code
- Framework choice is valid: `Next.js`
- The codebase is ready to be used with Git branches and PR workflow

Still outside the codebase itself:
- Branch-per-feature workflow
- Pull requests
- Teammate review comments
- Final report PDF with screenshots
- Repository link submission

Those are team process and submission tasks, not app-code tasks.

## Remaining Work

### Required before demoing with real services

- Put the real Render PostgreSQL URL into `.env` as `DATABASE_URL`
- Run migrations against the real database
- Run the seed script
- Optionally add `OPENAI_API_KEY`
- Optionally add SMTP credentials for real verification emails

### Strongly recommended next improvements

- Add automated tests for auth, validation, and server actions
- Add better content catalog coverage or integrate a media metadata API
- Add stronger NLP or embedding-based interpretation for freeform recommendation prompts
- Add more advanced moderation analytics and trends over time

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the template and fill in your values:

```bash
cp .env.example .env
```

3. Required env vars:

```env
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Optional env vars:

```env
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
RESEND_API_KEY=""
RESEND_FROM="onboarding@resend.dev"
```

5. Run database setup:

```bash
npm run prisma:migrate
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Seeded Admin Account

After running the seed script:

- Email: `admin@cinematch.local`
- Password: `Admin1234`

## Project Structure

- [src/app](/Users/huojunyu/Downloads/ENSF400/app/src/app): pages and routes
- [src/components](/Users/huojunyu/Downloads/ENSF400/app/src/components): reusable UI pieces
- [src/lib](/Users/huojunyu/Downloads/ENSF400/app/src/lib): auth, Prisma, validation, mail, recommendation logic
- [src/server/actions.ts](/Users/huojunyu/Downloads/ENSF400/app/src/server/actions.ts): server actions for app workflows
- [prisma/schema.prisma](/Users/huojunyu/Downloads/ENSF400/app/prisma/schema.prisma): database schema
- [prisma/seed.mjs](/Users/huojunyu/Downloads/ENSF400/app/prisma/seed.mjs): sample content and admin seed

## Current Status Summary

This project now meets the main coding goals for Assignment 4 and covers the major software features defined in Assignments 1 to 3. The biggest remaining items are service configuration, testing depth, and optional stretch improvements such as better content metadata coverage, stronger prompt understanding, and more advanced analytics.
