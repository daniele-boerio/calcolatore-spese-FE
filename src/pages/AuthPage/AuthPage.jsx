import { useState } from "react";
import { login, register } from "../../features/profile/apiCalls";
import InputText from "../../components/InputText/InputText";
import Button from "../../components/Button/Button";
import { Dialog } from "primereact/dialog";
import "./AuthPage.scss";
import { useAppDispatch, useAppSelector } from "../../store/store";
import Password from "../../components/Passoword/Passoword";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogHeader, setDialogHeader] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const loading = useAppSelector((state) => state.profile.loading);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || (!isLogin && !email)) {
      setDialogHeader("Campi Mancanti");
      setDialogContent(
        "Assicurati di aver compilato tutti i campi richiesti prima di procedere."
      );
      setDialogVisible(true);
      return;
    }
    try {
      if (isLogin) {
        dispatch(login({ username, password }));
      } else {
        dispatch(register({ email, username, password }));
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

        {!isLogin && (
          <InputText
            className="input-email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Inserisci la tua email"
          />
        )}

        <InputText
          className="input-username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Inserisci il tuo username"
        />

        <Password
          className="input-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Inserisci la tua password"
          feedback={!isLogin}
          toggleMask={true}
        />

        <Button
          className="btn-submit"
          onClick={handleSubmit}
          label={isLogin ? "Login" : "Crea Account"}
          loading={loading}
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
