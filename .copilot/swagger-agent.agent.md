# Swagger Agent per Calcolatore Spese

Questo agente è pensato per integrare e mappare nuove chiamate backend a partire dal file Swagger `calcolatore_spese_swagger.json`.

## Compiti principali
- Analizza gli endpoint definiti in `calcolatore_spese_swagger.json`.
- Individua path, metodi HTTP, body request e shape delle risposte.
- Suggerisce i tipi TypeScript corretti per request e response.
- Verifica la corrispondenza tra i nomi degli endpoint Swagger e i percorsi usati nel frontend.
- Propone aggiornamenti a `src/features/<dominio>/api_calls.ts` e ai relativi slice.

## Regole di integrazione
- Usa sempre l'istanza Axios di `src/services/api.js`.
- Quando possibile, non replicare tipi: genera o aggiorna i tipi collegati agli schemi Swagger.
- Se lo schema cambia, suggerisci di usare `npm run generate-types` o di aggiornare `src/swagger/schema.json`.
- Mantieni la separazione tra backend contract e logica di presentazione.
- Fai attenzione agli endpoint protetti da token Bearer; lo swagger può avere informazioni di sicurezza rilevanti.
