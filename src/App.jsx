import { useSelector } from "react-redux";
import AuthPage from "./pages/auth_page/auth_page";
import HomePage from "./pages/home_page/home_page";
import Navbar from "./components/navbar/navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.scss";
import TransactionPage from "./pages/transaction_page/transaction_page";
import { useAppDispatch } from "./store/store";
import { useEffect } from "react";
import CategoryPage from "./pages/category_page/category_page";
import { getProfile } from "./features/profile/api_calls";
import ErrorDialog from "./components/dialog/error_dialog/error_dialog";
import ContiPage from "./pages/conti_page/conti_page";
import { ConfirmPopup } from "primereact/confirmpopup";
import TagsPage from "./pages/tags_page/tags_page";
import StatisticsPage from "./pages/statistics_page/statistics_page";
import ResetPasswordPage from "./pages/reset_password_page/reset_password_page";

function App() {
  const { isAuthenticated } = useSelector((state) => state.profile);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<AuthPage />} />
          </Routes>
        ) : (
          <>
            <Navbar /> {/* Resta sempre qui in alto */}
            <div className="page-content">
              <Routes>
                {/* Quando l'URL cambia, React Router decide cosa mostrare qui sotto */}
                <Route path="/" element={<HomePage />} />
                <Route path="/transactions" element={<TransactionPage />} />
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/accounts" element={<ContiPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
              </Routes>
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
