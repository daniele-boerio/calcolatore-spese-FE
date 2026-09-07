import { Component, ErrorInfo, ReactNode } from "react";
import { t } from "../../i18n";
import "./error_boundary.scss";

/**
 * L'ultima rete sotto l'albero React.
 *
 * Senza un ErrorBoundary un errore lanciato durante il render non viene
 * catturato da nessuno e React smonta l'intera radice: `#root` resta vuoto e
 * l'utente vede una schermata bianca, senza un messaggio né un modo per
 * uscirne. Su iPhone, con l'app in home, "uscirne" vuol dire chiudere e
 * riaprire — che è esattamente il sintomo che questo componente elimina.
 *
 * Il caso di gran lunga più frequente non è un bug nel render ma un chunk di
 * pagina che non si scarica (vedi `services/lazy_with_retry`), quindi lo
 * distinguiamo: lì il messaggio giusto parla di connessione, non di errore
 * dell'app.
 */

// I motori scrivono questo errore ognuno a modo suo: WebKit "Importing a module
// script failed", Chrome "Failed to fetch dynamically imported module", Vite
// aggiunge la sua per il CSS preso in preload.
const CHUNK_ERROR_HINTS = [
  "dynamically imported module",
  "importing a module script failed",
  "unable to preload css",
  "failed to fetch",
  "load failed",
];

const isChunkError = (error: Error | null): boolean => {
  const message = (error?.message ?? "").toLowerCase();
  return CHUNK_ERROR_HINTS.some((hint) => message.includes(hint));
};

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Non c'è raccolta errori lato server: la console resta l'unico posto dove
    // ritrovare lo stack collegando l'iPhone al Web Inspector.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  // Un reload e non un `setState({error: null})`: `React.lazy` si ricorda per
  // sempre della promise rifiutata, quindi rimontare lo stesso albero
  // ripresenterebbe subito lo stesso errore. Ricaricare la pagina è l'unico
  // modo di dare al chunk una possibilità vera.
  private retry = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const offline = isChunkError(error);

    return (
      <div className="error-boundary" role="alert">
        <span className="error-boundary__icon" aria-hidden="true">
          <i
            className={
              offline ? "pi pi-wifi" : "pi pi-exclamation-triangle"
            }
          />
        </span>

        <div className="error-boundary__text">
          <h1 className="error-boundary__title">
            {t(offline ? "error_title_chunk" : "error_title_crash")}
          </h1>
          <p className="error-boundary__message">
            {t(offline ? "error_chunk" : "error_crash")}
          </p>
        </div>

        <button
          type="button"
          className="error-boundary__action"
          onClick={this.retry}
        >
          {t("error_retry")}
        </button>
      </div>
    );
  }
}
