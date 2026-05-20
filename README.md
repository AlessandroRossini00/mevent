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

## Librerie aggiuntive

Il progetto utilizza alcune librerie esterne per gestire funzionalità specifiche:

- `zustand`: gestione dello stato globale;
- `supabase`: database, autenticazione, storage e servizi backend;
- `@radix-ui/react-icons`: icone utilizzate nell’interfaccia;
- `@radix-ui/react-slider`: slider custom per filtri e controlli UI;
- `react-leaflet` e `leaflet`: gestione delle mappe e della selezione posizione;
- `web-push`: invio di notifiche push;
- `browser-image-compression`: compressione delle immagini lato client prima dell’upload.

## Dipendenze installate

```bash
npm install @radix-ui/react-icons
npm install react-leaflet leaflet
npm install @radix-ui/react-slider
npm install web-push
npm install browser-image-compression
npm install -D @types/leaflet
npm install -D @types/web-push
```

## Utenti di prova e credenziali

Nella cartella `scripts` sono presenti gli script utilizzati per generare utenti di prova ed eventi associati utili per il testing dell’app.

In particolare:

- `scripts/seed-explore-users-and-events.mjs`: contiene la logica di creazione degli utenti, dei profili e degli eventi di test;
- `scripts/explore-seed-data.mjs`: contiene i dati seed, come utenti fake, eventi e membership di esempio.

Dopo aver eseguito il comando di seed, è possibile utilizzare gli utenti generati per testare il comportamento dell’applicazione.

Esempio:

- email: `explore-seed+viewer@example.com`
- password: `Test123456!`

## Comando usato per generare le chiavi VAPID necessarie alle notifiche push

```bash
npx web-push generate-vapid-keys
```

## Comandi generali

```bash
npm run dev
npm run build
npm run start
npm run seed:explore
```

## Descrizione della struttura del progetto

La cartella [components] contiene le varie componenti riusabili in piu zone.

La cartella [(stack)] contiene i vari stack, () serve solo per raggruppare cartelle e non viene inserito nel path.

La cartella [(tabs)] contiene i vari tab, () serve solo per raggruppare cartelle e non viene inserito nel path.

Ho divisto [(stack)] e [(tabs)] per chiarezza e per rimuovere la tab di navigazione quando si usa stack.

La cartella `features` organizza il codice per dominio funzionale.  
Ogni feature raccoglie al suo interno tutto ciò che serve per gestire una specifica area dell’applicazione.

Per ogni feature sono presenti queste sottocartelle:

- `features/*/components`: contiene i componenti UI legati a quella specifica feature;
- `features/*/hooks`: contiene i custom hooks utilizzati da quella feature;
- `features/*/services`: contiene la logica applicativa e i servizi della feature, come query al database ecc...;
- `features/*/store`: contiene lo stato condiviso della feature, ad esempio store Zustand o altra logica di state management.

Le principali feature del progetto sono:

- `features/auth`: gestisce autenticazione;
- `features/chat`: gestisce la chat degli eventi;
- `features/events`: gestisce la creazione, modifica, eliminazione e partecipazione agli eventi;
- `features/explore`: gestisce la sezione di esplorazione degli eventi con i vari filtri;
- `features/profile`: gestisce il profilo utente;
- `features/pwa`: gestisce gli aspetti Progressive Web App, come service worker, registrazione PWA e notifiche push.

La cartella [lib/supabase] contiene tutto il setup per supabase.

## Utenti di prova credenziali

Nella cartella [scripts] c'è lo script che crea utenti [seed-explore-users-and-events.mjs] e vari dati degli utenti [explore-seed-data.mj].

## Descrizione del flow dell'app

L’applicazione segue un flusso centrato sull’utente autenticato e sulla gestione degli eventi.

### 1. Autenticazione

L’utente può:

- accedere con email e password;
- accedere tramite Google;
- registrarsi creando un nuovo account.

Dopo la registrazione o il primo accesso, se il profilo non è ancora completo, l’utente viene indirizzato alla fase di onboarding per completare le informazioni principali.

### 2. Completamento profilo

Nel primo accesso l’utente completa il proprio profilo inserendo:

- username;
- nome completo;
- data di nascita;
- città;
- bio;
- immagine profilo.

Una volta completato il profilo, l’utente viene reindirizzato all’applicazione principale.

### 3. Esplorazione eventi

Nella sezione `Explore` l’utente può:

- visualizzare eventi pubblici disponibili;
- filtrare gli eventi per categoria, data, prezzo e distanza;
- consultare rapidamente le informazioni principali di ogni evento;
- partecipare a un evento, se disponibile.

Gli eventi a cui l’utente partecipa non vengono più mostrati nella sezione di esplorazione.

### 4. Gestione eventi personali

Nella sezione `Events` l’utente può:

- visualizzare tutti gli eventi a cui partecipa o che ha creato;
- filtrare tra eventi creati, eventi a cui partecipa o tutti;
- creare un nuovo evento;
- modificare o eliminare un evento creato;
- abbandonare un evento a cui partecipa, se non ne è il creator.

### 5. Creazione evento

Durante la creazione di un evento, l’utente può inserire:

- titolo;
- descrizione;
- categoria;
- data e ora;
- posizione;
- prezzo;
- numero massimo di partecipanti;
- immagine di copertina.

Dopo la creazione, l’utente viene automaticamente aggiunto come admin dell’evento.

### 6. Chat evento

Ogni evento dispone di una chat dedicata.  
Gli utenti partecipanti possono:

- visualizzare i messaggi associati all’evento;
- inviare nuovi messaggi;
- ricevere aggiornamenti realtime della conversazione.

### 7. Profilo utente

Nella sezione `Profile` l’utente può:

- visualizzare le proprie informazioni;
- aggiornare i dati del profilo;
- cambiare immagine profilo.

### 8. Funzionalità PWA

L’app include funzionalità Progressive Web App, tra cui:

- installazione su dispositivo;
- service worker;
- gestione notifiche push, se abilitate dall’utente.

## Preso spunto da

npx create-next-app -e with-supabase

DEVO MODIFICARE LE CHIAVI PER CONNESSIONE IP SU SUPABASE
