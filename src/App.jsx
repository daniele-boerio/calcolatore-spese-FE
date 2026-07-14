import { useSelector } from "react-redux";
import AuthPage from "./pages/auth_page/auth_page";
import Navbar from "./components/navbar/navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.scss";
import { useAppDispatch } from "./store/store";
import { lazy, Suspense, useEffect } from "react";
import { getProfile, restoreSession } from "./features/profile/api_calls";
import { ProgressSpinner } from "primereact/progressspinner";
import ErrorDialog from "./components/dialog/error_dialog/error_dialog";
import { ConfirmPopup } from "primereact/confirmpopup";
import BankProposalsGate from "./components/bank_proposals_gate/bank_proposals_gate";

// Code-splitting per route: ogni pagina è un chunk separato caricato solo
// quando ci si naviga. Le pagine pesanti (statistiche/grafici, che portano
// chart.js + @mui/x-charts) non gravano più sul bundle iniziale.
const HomePage = lazy(() => import("./pages/home_page/home_page"));
const TransactionPage = lazy(
  () => import("./pages/transaction_page/transaction_page"),
);
const CategoryPage = lazy(() => import("./pages/category_page/category_page"));
const ContiPage = lazy(() => import("./pages/conti_page/conti_page"));
const DebitiPage = lazy(() => import("./pages/debiti_page/debiti_page"));
const TagsPage = lazy(() => import("./pages/tags_page/tags_page"));
const StatisticsPage = lazy(
  () => import("./pages/statistics_page/statistics_page"),
);
const ChartsPage = lazy(() => import("./pages/charts_page/charts_page"));
const InvestimentiPage = lazy(
  () => import("./pages/investimenti_page/investimenti_page"),
);
const ResetPasswordPage = lazy(
  () => import("./pages/reset_password_page/reset_password_page"),
);
const BankCallbackPage = lazy(
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

  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // L'access token può essere scaduto: ci pensa l'interceptor a rinnovarlo
      // col cookie e a rigiocare questa chiamata.
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
            <Navbar /> {/* Resta sempre qui in alto */}
            <BankProposalsGate /> {/* Controllo automatico proposte bancarie */}
            <div className="page-content">
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Quando l'URL cambia, React Router decide cosa mostrare qui sotto */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/transactions" element={<TransactionPage />} />
                  <Route path="/categories" element={<CategoryPage />} />
                  <Route path="/tags" element={<TagsPage />} />
                  <Route path="/accounts" element={<ContiPage />} />
                  <Route path="/debts" element={<DebitiPage />} />
                  <Route path="/investments" element={<InvestimentiPage />} />
                  <Route path="/statistics" element={<StatisticsPage />} />
                  <Route path="/charts" element={<ChartsPage />} />
                  <Route path="/bank-callback" element={<BankCallbackPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>
          </>
        )}
      </div>
      <ConfirmPopup />
      <ErrorDialog />
    </Router>
  );
}

export default App;
