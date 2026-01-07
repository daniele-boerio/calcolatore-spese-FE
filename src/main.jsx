// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Temi e Core di PrimeReact
import "primereact/resources/themes/lara-dark-cyan/theme.css"; // Tema scuro
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { Provider } from 'react-redux';
import { store } from './store/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);