// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

// Base PrimeReact, importata PRIMA di App: il CSS finisce nel bundle
// nell'ordine in cui i moduli vengono visitati, e i nostri override su token
// (App.scss + styles/_primereact.scss) devono venire dopo, non prima.
// Il tema lara ha i colori hard-coded e non segue le custom properties: da qui
// arriva solo la struttura, la palette la mettiamo noi.
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import App from "./App";

import { Provider } from "react-redux";
import { store } from "./store/store.ts";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
