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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Extra library

zustand per gestire gli stati globali
supabase per gestire il DB, autenticazione ecc
npm install @radix-ui/react-icons
npm install react-leaflet leaflet
npm install -D @types/leaflet
npm install web-push
npm i --save-dev @types/web-push
npx web-push generate-vapid-keys
npm install browser-image-compression
npm install @radix-ui/react-slider

## Description project structure

La cartella [components] contiene le varie componenti riusabili in piu zone.

La cartella [(stack)] contiene i vari stack, () serve solo per raggruppare cartelle e non viene inserito nel path.

La cartella [(tabs)] contiene i vari tab, () serve solo per raggruppare cartelle e non viene inserito nel path.

Ho divisto stack e tabs per chiarezza e per rimuovere la tab di navigazione quando si usa stack.

La cartella [features] me la sono fatta suggerire da AI siccome è utile farlo cosi per grandi progetti. La cartella [components] contiene componenti specifici di quella pagina. La cartella [hooks] integra services + store. La cartella [services] sono chiamate a vari servizi per esempio al DB. La cartella [store] contiene lo stato di vari dati.

## Utenti di prova credenziali

## Descrizione del flow dell'app

## Preso spunto da

npx create-next-app -e with-supabase
