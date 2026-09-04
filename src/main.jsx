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

import PrimeReact from "primereact/api";

// Dove PrimeReact appoggia i suoi overlay nella pila.
//
// Pannelli dei dropdown, calendari e Dialog non stanno nel DOM del componente:
// finiscono in un portale su <body> con uno z-index che PrimeReact calcola da
// solo, partendo da queste basi. Le sue di serie (overlay 1000, modal 1100)
// stavano *sotto* ai livelli nostri, e tutto quello che PrimeReact apriva da
// dentro un bottom sheet finiva disegnato dietro al foglio: nel rimborso non si
// apriva un solo dropdown, e i chip "Dividi" e "Rendi ricorrente" sembravano
// non fare niente.
//
// La scala, dal basso: tab bar 900, toast 1100, sheet 1200, PrimeReact 1400,
// alert 1500 (la conferma sta sopra a tutto). I numeri nostri stanno nei
// rispettivi .scss; questi sono solo le *basi* da cui PrimeReact parte —
// l'annidamento se lo gestisce lui, un overlay aperto dentro una Dialog
// riparte dall'ultimo z-index assegnato, non dalla base.
PrimeReact.zIndex = {
  overlay: 1400,
  menu: 1400,
  modal: 1400,
  tooltip: 1400,
  // La nostra di toast è un'altra (components/toast, 1100): questa resta solo
  // per non lasciare un buco nella configurazione.
  toast: 1400,
};

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
