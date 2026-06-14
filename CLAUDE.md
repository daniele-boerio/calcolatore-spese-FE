# FE — React 19 + TypeScript + Vite

SPA for the Calcolatore Spese app. Redux Toolkit state, MUI 7 + PrimeReact UI,
Axios for I/O, SCSS for styling, i18n (it/en), charts via chart.js + @mui/x-charts.

## Anatomy of a domain (`src/features/<dominio>/`)

Each domain is a vertical slice with the same three files:

- `api_calls.ts` — `createAsyncThunk` thunks. **All** HTTP goes through the shared
  Axios instance `import api from "../../services/api"` — never call `axios`/`fetch`
  directly. Catch as `AxiosError` and `rejectWithValue(err.response?.data || "msg")`.
- `<dominio>_slice.ts` — `createSlice`; mutate state in `extraReducers`. Cross-domain
  pending/rejected handling is done with `addMatcher` on the action-type prefix.
- `interfaces.ts` — request param types, entity types, and the `<Dominio>State` shape.

Store is in `src/store/store.ts`. **Always** use the typed hooks
`useAppDispatch` / `useAppSelector` (exported there), and read state through the
`select*` selectors exported by each slice — never reach into `state.x.y` ad hoc in a
component.

## Hard rules (learned from the existing code)

- **Money values arrive as strings** (BE `Decimal`) and are converted to `Number` in
  the slice via a `mapTransaction`-style mapper before they reach the UI. Keep that
  boundary: do not parse money in components.
- IDs may be string or number across the app; existing code compares with
  `String(a) === String(b)`. Follow that — don't assume numeric equality.
- Query params are built with `URLSearchParams`, appending array values one-by-one
  (see `getTransactionsPaginated`). Reuse that helper pattern for filtered lists.
- New user-facing text → add the key to **both** `src/i18n/en.json` and
  `src/i18n/it.json`. Never hardcode a visible string.
- Errors surface through `errorMiddleware` + the `error` slice; don't build ad-hoc
  error UI when a thunk rejection already flows there.
- UI: reuse `src/components/*` (dialogs, inputs, dropdown, table) and the existing
  SCSS. MUI and PrimeReact coexist — pick whichever the sibling component already uses.

## Types & the API contract

- TS types for the backend can be generated: `npm run generate-types`
  (`openapi-typescript` → `src/types/api/schema.d.ts`, source `src/swagger/schema.json`).
  When an endpoint's shape changes, regenerate rather than hand-writing types.
- The authoritative contract is `calcolatore_spese_swagger.json` at the FE root.

## Don't

- Don't put business logic in presentational components — it belongs in the thunk/slice.
- Don't add a state library, data-fetching lib, or test runner without being asked;
  none is configured (`npm run lint` is the only quality gate today).
- Don't edit `vite.config.js` / `package.json` unless the task genuinely requires it.
- `App.jsx`, `main.jsx`, and `services/api.js` are intentionally JS — leave them JS.
