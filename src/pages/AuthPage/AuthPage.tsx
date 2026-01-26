import React, { useState } from "react";
import { login, register } from "../../features/profile/apiCalls";
import InputText from "../../components/InputText/InputText";
import Button from "../../components/Button/Button";
import { Dialog } from "primereact/dialog";
import "./AuthPage.scss";
import { useAppDispatch, useAppSelector } from "../../store/store";
import Password from "../../components/Password/Password";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Stati per la Dialog di errore locale
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [dialogHeader, setDialogHeader] = useState<string>("");
  const [dialogContent, setDialogContent] = useState<string>("");

  const loading = useAppSelector((state) => state.profile.loading);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    if (e) e.preventDefault();

    if (!username || !password || (!isLogin && !email)) {
      setDialogHeader("Campi Mancanti");
      setDialogContent("Assicurati di aver compilato tutti i campi richiesti.");
      setDialogVisible(true);
      return;
    }

    try {
      if (isLogin) {
        await dispatch(login({ username, password })).unwrap();
      } else {
        await dispatch(register({ email, username, password })).unwrap();
      }
    } catch (error: any) {
      setDialogHeader("Errore");
      setDialogContent(error?.detail || "Si è verificato un errore.");
      setDialogVisible(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="Inserisci la tua email"
          />
        )}

        <InputText
          className="input-username"
          label="Username"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          placeholder="Inserisci il tuo username"
        />

        <Password
          className="input-password"
          label="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
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
        onHide={() => setDialogVisible(false)}
        style={{ width: "90vw", maxWidth: "400px" }}
      >
        <p>{dialogContent}</p>
      </Dialog>
    </div>
  );
};

export default AuthPage;
