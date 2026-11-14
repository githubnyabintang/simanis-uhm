# Firebase SIMANIS UHM

## Status

The app reads and writes its demo account and academic collections in Firestore.
The login is a demonstration: a `demoPassword` is checked when present, but it
is readable in Firestore and is not secure authentication. Firebase Authentication
is not used. Collection fields are listed in `firestore.schema.md`.

## Local development

1. The tracked `.env` contains the project's Firebase Web configuration.
2. Run `npm install` and `npm run dev`. If a different local project is needed,
   copy `.env.example` to `.env.local` and supply that project's Web config;
   `.env.local` takes precedence over `.env`.

Firebase Web app config is used by browser code. Never place a service account
JSON, private key, or Admin SDK credential in a `VITE_*` variable or frontend
source code.

## Vercel

Vercel's Vite build reads the tracked `.env`, so separate Firebase environment
variables are not required. Variables configured in Vercel override `.env`.
The Web configuration is public and does not grant database access by itself;
Firestore Security Rules control that access. Do not commit `.env.local`.

## Firestore access

The local `firestore.rules` denies all access. Rules published manually in the
Firebase Console may differ; deploying the local file with the CLI would replace
the Console rules. The temporary public Console rules are for synthetic demo data
only: everyone can access and alter it, regardless of the role selected in the app.
On an empty database, use the app's setup button to create a synthetic admin and
basic study data. Other demo records are not uploaded automatically.
