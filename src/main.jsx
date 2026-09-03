// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Temi e Core di PrimeReact
// Base PrimeReact. Il tema lara ha i colori hard-coded (non segue le custom
// properties): la palette vera arriva dagli override su token in App.scss e nei
// componenti condivisi. Si parte dalla variante chiara perché il tema di
// default del design è quello.
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { Provider } from "react-redux";
import { store } from "./store/store.ts";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
