import { useI18n } from "../../i18n/use-i18n";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { Page, PageContent, PageHeader } from "../../components/page/page";
import {
  selectHideAmounts,
  selectTheme,
  setTheme,
  toggleHideAmounts,
} from "../../features/ui/ui_slice";
import type { ThemePreference } from "../../features/ui/theme";
import {
  selectProfileEmail,
  selectProfileUsername,
} from "../../features/profile/profile_slice";
import { logout } from "../../features/profile/api_calls";
import "./settings_page.scss";

const THEMES: ThemePreference[] = ["light", "dark", "system"];

const initialsOf = (username: string | null) =>
  (username ?? "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export default function SettingsPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const theme = useAppSelector(selectTheme);
  const hideAmounts = useAppSelector(selectHideAmounts);
  const username = useAppSelector(selectProfileUsername);
  const email = useAppSelector(selectProfileEmail);

  return (
    <Page className="settings-page">
      <PageHeader>
        <h1 className="page-title">{t("nav_settings")}</h1>
      </PageHeader>

      <PageContent>
        <section className="settings-card settings-profile">
          <span className="settings-profile__avatar">
            {initialsOf(username)}
          </span>
          <div className="settings-profile__identity">
            <span className="settings-profile__name">{username}</span>
            <span className="settings-profile__email">{email}</span>
          </div>
        </section>

        <section className="settings-group">
          <h2 className="settings-group__title">{t("settings_appearance")}</h2>

          <div className="settings-card">
            <div
              className="theme-picker"
              role="radiogroup"
              aria-label={t("settings_appearance")}
            >
              {THEMES.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={option === theme}
                  className={`theme-picker__option theme-picker__option--${option}`}
                  onClick={() => dispatch(setTheme(option))}
                >
                  <span className="theme-picker__preview" aria-hidden="true" />
                  <span className="theme-picker__label">
                    {t(`theme_${option}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="settings-group">
          <h2 className="settings-group__title">{t("settings_privacy")}</h2>

          <div className="settings-card">
            <label className="settings-row">
              <span className="settings-row__text">
                <span className="settings-row__label">
                  {t("settings_hide_amounts")}
                </span>
                <span className="settings-row__hint">
                  {t("settings_hide_amounts_hint")}
                </span>
              </span>

              <input
                type="checkbox"
                className="toggle"
                checked={hideAmounts}
                onChange={() => dispatch(toggleHideAmounts())}
              />
            </label>
          </div>
        </section>

        <button
          type="button"
          className="settings-logout"
          onClick={() => dispatch(logout())}
        >
          <i className="pi pi-sign-out" aria-hidden="true" />
          {t("logout")}
        </button>
      </PageContent>
    </Page>
  );
}
