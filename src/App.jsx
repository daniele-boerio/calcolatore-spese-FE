import { useSelector } from "react-redux";
import AuthPage from "./pages/auth_page/auth_page";
import TabBar from "./components/tab_bar/tab_bar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.scss";
import { useAppDispatch } from "./store/store";
import { Suspense, useEffect } from "react";
import { getProfile, restoreSession } from "./features/profile/api_calls";
import { ProgressSpinner } from "primereact/progressspinner";
import ErrorDialog from "./components/dialog/error_dialog/error_dialog";
import { ConfirmPopup } from "primereact/confirmpopup";
import BankProposalsGate from "./components/bank_proposals_gate/bank_proposals_gate";
import SheetHost from "./components/sheet_host/sheet_host";
import ToastHost from "./components/toast/toast";
import { useThemeSync } from "./features/ui/use_theme";
import { lazyWithRetry } from "./services/lazy_with_retry";

// Code-splitting per route: ogni pagina è un chunk separato caricato solo
// quando ci si naviga, così non gravano sul bundle iniziale.
//
// `lazyWithRetry` e non `lazy`: il chunk della home viene chiesto
// all'avvio, cioè nel momento in cui la rete di un telefono è meno
// affidabile (vedi services/lazy_with_retry).
const HomePage = lazyWithRetry(() => import("./pages/home_page/home_page"));
const TransactionPage = lazyWithRetry(
  () => import("./pages/transaction_page/transaction_page"),
);
const CategoryPage = lazyWithRetry(
  () => import("./pages/category_page/category_page"),
);
const CategoryDetailPage = lazyWithRetry(
  () => import("./pages/category_detail_page/category_detail_page"),
);
const ContiPage = lazyWithRetry(() => import("./pages/conti_page/conti_page"));
const DebitiPage = lazyWithRetry(() => import("./pages/debiti_page/debiti_page"));
const AnalysisPage = lazyWithRetry(
  () => import("./pages/analysis_page/analysis_page"),
);
const RecurringsPage = lazyWithRetry(
  () => import("./pages/recurrings_page/recurrings_page"),
);
const SettingsPage = lazyWithRetry(
  () => import("./pages/settings_page/settings_page"),
);
const AltroPage = lazyWithRetry(() => import("./pages/altro_page/altro_page"));
const InvestimentiPage = lazyWithRetry(
  () => import("./pages/investimenti_page/investimenti_page"),
);
const ResetPasswordPage = lazyWithRetry(
  () => import("./pages/reset_password_page/reset_password_page"),
);
const BankCallbackPage = lazyWithRetry(
  () => import("./pages/bank_callback_page/bank_callback_page"),
);

function RouteFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
      <ProgressSpinner />
    </div>
  );
}

function App() {
  const { isAuthenticated } = useSelector((state) => state.profile);

  // Tiene `data-theme` su <html> allineato alla preferenza salvata.
  useThemeSync();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // L'access token può essere scaduto: ci pensa l'interceptor a rinnovarlo
      // col cookie e a rigiocare questa chiamata. Se anche il cookie è finito
      // si torna al login in silenzio: è un tentativo, non un'operazione
      // dell'utente da commentare con un errore.
      dispatch(getProfile());
      return;
    }

    // Nessun access token, ma il cookie httpOnly potrebbe reggere ancora la
    // sessione (es. localStorage svuotato da Safari/ITP): proviamo a recuperarla.
    dispatch(restoreSession()).then((action) => {
      if (action.payload) {
        dispatch(getProfile());
      }
    });
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/bank-callback" element={<BankCallbackPage />} />
              <Route path="*" element={<AuthPage />} />
            </Routes>
          </Suspense>
        ) : (
          <>
            <BankProposalsGate /> {/* Controllo automatico proposte bancarie */}
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* I sei slot della tab bar */}
                <Route path="/" element={<HomePage />} />
                <Route path="/transactions" element={<TransactionPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/accounts" element={<ContiPage />} />
                <Route path="/investments" element={<InvestimentiPage />} />
                <Route path="/altro" element={<AltroPage />} />

                {/* Destinazioni secondarie: ricorrenze e debiti dai Movimenti,
                    categorie e impostazioni da "Altro". */}
                <Route path="/categories" element={<CategoryPage />} />
                {/* Dettaglio di una categoria, aperto da Analisi. */}
                <Route
                  path="/categories/:id"
                  element={<CategoryDetailPage />}
                />
                {/* I tag sono la terza vista di "Categorie e tag". */}
                <Route
                  path="/tags"
                  element={<Navigate to="/categories?vista=tags" replace />}
                />
                <Route path="/recurrings" element={<RecurringsPage />} />
                <Route path="/debts" element={<DebitiPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                <Route path="/bank-callback" element={<BankCallbackPage />} />

                {/* Statistiche e Grafici si sono fuse in Analisi */}
                <Route
                  path="/statistics"
                  element={<Navigate to="/analysis" replace />}
                />
                <Route
                  path="/charts"
                  element={
                    <Navigate to="/analysis?scope=categories" replace />
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <TabBar />
            <SheetHost />
            <ToastHost />
          </>
        )}
      </div>
      <ConfirmPopup />
      <ErrorDialog />
    </Router>
  );
}

export default App;
