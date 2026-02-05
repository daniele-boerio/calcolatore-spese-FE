import { useSelector } from "react-redux";
import AuthPage from "./pages/auth_page/auth_page";
import HomePage from "./pages/home_page/home_page";
import Navbar from "./components/navbar/navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.scss";
import TransactionPage from "./pages/transaction_page/transaction_page";
import { useAppDispatch } from "./store/store";
import { useEffect } from "react";
import CategoryTagsPage from "./pages/category_tags_page/category_tags_page";
import { getProfile } from "./features/profile/api_calls";
import { ErrorDialog } from "./components/dialog/error_dialog/error_dialog";

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
          <AuthPage />
        ) : (
          <>
            <Navbar /> {/* Resta sempre qui in alto */}
            <div className="page-content">
              <Routes>
                {/* Quando l'URL cambia, React Router decide cosa mostrare qui sotto */}
                <Route path="/" element={<HomePage />} />
                <Route path="/transazioni" element={<TransactionPage />} />
                <Route path="/categorie-tags" element={<CategoryTagsPage />} />
              </Routes>
            </div>
          </>
        )}
      </div>
      <ErrorDialog />
    </Router>
  );
}

export default App;
