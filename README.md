# Local Marketing BP Collaboration Hub (Culture Plans Hub)

POC full-stack app for regional + national marketing teams to upload PPTX campaign decks, run data checks, manage campaign data, and export/import Excel updates.

## Repo Structure

```
/frontend  React + Vite + TypeScript UI
/backend   Node + Express + Prisma API
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run dev
```

The API will run on `http://localhost:4000`.

### PPT Template

Place the PPTX template at:

```
backend/templates/culture_campaign_template.pptx
```

The generator replaces `{{PLACEHOLDER}}` keys in slide XML.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app will run on `http://localhost:5173`.

## Scripts

Backend:
- `npm run dev` – start Express API with hot reload
- `npm run prisma:migrate` – run Prisma migrations

Frontend:
- `npm run dev` – start Vite dev server

## Notes

- Excel export/import uses a single sheet with one row per campaign and flattened columns.
- Uploading PPTX runs a data check before submission.
- Excel import generates updated PPTX decks and emails the original submitter (SMTP env vars required).
