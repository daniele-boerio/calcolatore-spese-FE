# Project Agents

Questo repository contiene agenti progettati per supportare lo sviluppo di nuove funzionalità nella UI React/Vite e l'integrazione con il backend tramite lo swagger `calcolatore_spese_swagger.json`.

## feature-agent
- Obiettivo: aggiungere o estendere funzionalità frontend usando le best practice del progetto.
- Deve usare le convenzioni già presenti in `src/features/*`:
  - `api_calls.ts` per le chiamate backend con `createAsyncThunk`
  - `*.slice.ts` per lo stato e i reducer
  - componenti e dialog nelle cartelle esistenti
- Deve riutilizzare l'istanza Axios di `src/services/api.js` per tutte le chiamate API.
- Deve privilegiare l'uso di `useAppDispatch` e `useAppSelector`.
- Deve mantenere coerenza con le UI basate su MUI e PrimeReact, e lo stile SASS esistente.
- Deve fare attenzione a non modificare file globali senza una reale necessità.

## swagger-agent
- Obiettivo: estendere o mappare nuove chiamate backend usando il file Swagger `calcolatore_spese_swagger.json`.
- Deve cercare i percorsi API e gli schemi nel file Swagger per definire tipi, validazione e payload.
- Deve suggerire l'uso di `npm run generate-types` se si aggiorna o si espande lo schema OAS.
- Deve considerare i percorsi attuali di `src/features/*` e integrare nuove API con la struttura Redux Toolkit.

## ui-agent
- Obiettivo: mantenere la coerenza visiva e l'esperienza utente.
- Deve rispettare la struttura dei componenti e dialog esistenti in `src/components/`.
- Deve aggiornare testi e localizzazioni in `src/i18n/en.json` e `src/i18n/it.json`.
- Deve preferire l'uso di `src/components/*` esistenti per azioni comuni come dialog, bottoni, input e dropdown.
