import { useSelector } from "react-redux";
import AuthPage from "./pages/AuthPage/AuthPage";
import HomePage from "./pages/HomePage/HomePage";
import Navbar from "./components/Navbar/Navbar"; // Importa la tua nuova Navbar
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.scss";
import TransactionPage from "./pages/TransactionPage/TransactionPage";
import CategoryTagsPage from "./pages/CategoryTagsPage/CategoryTagsPage";

function App() {
  const { isAuthenticated } = useSelector((state) => state.profile);

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
    </Router>
  );
}

export default App;
