import React, { useState } from "react";
import { login, register } from "../../features/profile/api_calls";
import InputText from "../../components/input_text/input_text";
import Button from "../../components/button/button";
import "./auth_page.scss";
import { useAppDispatch, useAppSelector } from "../../store/store";
import Password from "../../components/password/password";
import { useI18n } from "../../i18n/use-i18n";
import { selectProfileLoading } from "../../features/profile/profile_slice";

export default function AuthPage() {
  const { t } = useI18n();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const loading = useAppSelector(selectProfileLoading);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    if (e) e.preventDefault();

    if (isLogin) {
      await dispatch(login({ username, password }));
    } else {
      await dispatch(register({ email, username, password }));
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
        <h2>{isLogin ? t("login") : t("sign_in")}</h2>

        {!isLogin && (
          <InputText
            className="input-email"
            label={t("email")}
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder={t("email_placeholder")}
          />
        )}

        <InputText
          className="input-username"
          label={t("username")}
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          placeholder={t("username_placeholder")}
        />

        <Password
          className="input-password"
          label={t("password")}
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder={t("password_placeholder")}
          feedback={!isLogin}
          toggleMask={true}
        />

        <Button
          className="btn-submit"
          onClick={handleSubmit}
          label={isLogin ? t("login") : t("sign_in")}
          loading={loading}
        />

        <p className="auth-toggle-text">
          {isLogin ? "Non hai un account?" : "Hai già un account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? t("sign_in_space") : t("login_space")}
          </span>
        </p>
      </div>
    </div>
  );
}
