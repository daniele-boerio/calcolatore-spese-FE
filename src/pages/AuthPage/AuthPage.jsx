import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLogin } from "../../features/auth/authSlice";
import InputText from "../../components/inputtext/inputtext";
import Button from "../../components/button/button";
import { Dialog } from "primereact/dialog";
import "./AuthPage.scss";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogHeader, setDialogHeader] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !username)) {
      setDialogHeader("Campi Mancanti");
      setDialogContent(
        "Assicurati di aver compilato tutti i campi richiesti prima di procedere."
      );
      setDialogVisible(true);
      return;
    }
    try {
      if (isLogin) {
        // Endpoint FastAPI per il login (usa form-data come richiesto da OAuth2)
        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);

        const response = await axios.post(`${API_BASE_URL}/login`, formData);
        dispatch(setLogin(response.data.access_token, formData.data.username));
      } else {
        // Registrazione: inviamo anche lo username
        await axios.post(`${API_BASE_URL}/register`, {
          email,
          username,
          password,
        });
        alert("Registrazione completata!");
        setDialogHeader("Registrazione completata");
        setDialogContent("");
        setDialogVisible(true);
        setIsLogin(true);
      }
    } catch (error) {
      setDialogHeader("Errore");
      setDialogContent(
        error.response?.data?.detail ||
          "Si è verificato un errore durante l'operazione. Riprova più tardi."
      );
      setDialogVisible(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container" onKeyDown={handleKeyDown}>
        <h2>{isLogin ? "Accedi" : "Registrati"}</h2>

        <InputText
          className="input-email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Inserisci la tua email"
        />

        {!isLogin && (
          <InputText
            className="input-username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Inserisci il tuo username"
          />
        )}

        <InputText
          className="input-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Inserisci la tua password"
        />

        <Button
          className="btn-submit"
          onClick={handleSubmit}
          label={isLogin ? "Login" : "Crea Account"}
        />

        <p className="auth-toggle-text">
          {isLogin ? "Non hai un account?" : "Hai già un account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Registrati" : " Accedi"}
          </span>
        </p>
      </div>
      <Dialog
        header={dialogHeader}
        visible={dialogVisible}
        onHide={() => {
          if (!dialogVisible) return;
          setDialogVisible(false);
        }}
      >
        <p>{dialogContent}</p>
      </Dialog>
    </div>
  );
};

export default AuthPage;
