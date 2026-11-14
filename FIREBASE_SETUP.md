# Firebase SIMANIS UHM

## Status

The app reads and writes its demo account and academic collections in Firestore.
The login is a demonstration: a `demoPassword` is checked when present, but it
is readable in Firestore and is not secure authentication. Firebase Authentication
is not used. Collection fields are listed in `firestore.schema.md`.

## Local development

1. Copy `.env.example` to `.env.local`.
2. In Firebase Console, open **Project settings > General > Your apps** and copy
   the Web app config values into the matching `VITE_FIREBASE_*` variables.
3. Run `npm install` and `npm run dev`.

Firebase Web app config is used by browser code. Never place a service account
JSON, private key, or Admin SDK credential in a `VITE_*` variable or frontend
source code.

## Vercel

Add the same six `VITE_FIREBASE_*` variables under Vercel **Settings >
Environment Variables** for the environments that will use the app, then
redeploy. Do not commit `.env.local`. These variables configure the client but
do not grant database access; Firestore Security Rules control that access.

## Firestore access

The local `firestore.rules` denies all access. Rules published manually in the
Firebase Console may differ; deploying the local file with the CLI would replace
the Console rules. The temporary public Console rules are for synthetic demo data
only: everyone can access and alter it, regardless of the role selected in the app.
On an empty database, use the app's setup button to create a synthetic admin and
basic study data. Other demo records are not uploaded automatically.
