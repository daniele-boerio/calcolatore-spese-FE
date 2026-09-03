import { RefObject, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Una posizione per percorso, viva quanto la sessione: cambiare tab non deve
// far ripartire la lista dall'inizio.
const positions = new Map<string, number>();

export function useScrollRestoration(
  ref: RefObject<HTMLElement | null>,
): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.scrollTop = positions.get(pathname) ?? 0;

    const remember = () => positions.set(pathname, element.scrollTop);
    element.addEventListener("scroll", remember, { passive: true });

    return () => {
      remember();
      element.removeEventListener("scroll", remember);
    };
  }, [pathname, ref]);
}
