import { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import InputText from "../../input_text/input_text";
import "./bank_connect_dialog.scss";
import { useAppDispatch } from "../../../store/store";
import {
  getInstitutions,
  startBankAuth,
} from "../../../features/conti/api_calls";
import { Conto, Institution } from "../../../features/conti/interfaces";
import { useI18n } from "../../../i18n/use-i18n";

interface BankConnectDialogProps {
  visible: boolean;
  onHide: () => void;
  conto?: Conto | null;
}

export default function BankConnectDialog({
  visible,
  onHide,
  conto,
}: BankConnectDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) {
      setInstitutions([]);
      setSearch("");
      setRedirecting(false);
      return;
    }

    let active = true;
    setLoading(true);
    dispatch(getInstitutions("IT"))
      .unwrap()
      .then((data) => {
        if (active) setInstitutions(data);
      })
      .catch(() => {
        // L'errore è già mostrato dall'errorMiddleware
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [visible, dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return institutions;
    return institutions.filter((i) => i.name.toLowerCase().includes(q));
  }, [institutions, search]);

  const handleSelect = (institution: Institution) => {
    if (!conto || redirecting) return;
    setRedirecting(true);
    dispatch(
      startBankAuth({
        conto_id: conto.id,
        aspsp_name: institution.name,
        aspsp_country: institution.country,
      }),
    )
      .unwrap()
      .then(({ url }) => {
        // Step 3: redirect in uscita verso la banca.
        window.location.href = url;
      })
      .catch(() => {
        setRedirecting(false);
      });
  };

  return (
    <Dialog
      header={t("link_bank_title")}
      visible={visible}
      className="dialog-custom bank-connect-dialog"
      style={{ width: "95vw", maxWidth: "32rem" }}
      onHide={onHide}
      blockScroll={true}
      draggable={false}
      resizable={false}
    >
      <div className="bank-connect-content">
        <p className="bank-connect-subtitle">{t("link_bank_subtitle")}</p>

        {redirecting ? (
          <div className="bank-connect-status">
            <ProgressSpinner style={{ width: "48px", height: "48px" }} />
            <span>{t("redirecting_to_bank")}</span>
          </div>
        ) : (
          <>
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search_bank")}
              icon="pi pi-search"
              iconPos="left"
              inputMode="search"
            />

            {loading ? (
              <div className="bank-connect-status">
                <ProgressSpinner style={{ width: "48px", height: "48px" }} />
              </div>
            ) : filtered.length > 0 ? (
              <ul className="bank-list">
                {filtered.map((institution) => (
                  <li key={`${institution.name}-${institution.country}`}>
                    <button
                      type="button"
                      className="bank-list__item"
                      onClick={() => handleSelect(institution)}
                    >
                      {institution.logo ? (
                        <img
                          src={institution.logo}
                          alt={institution.name}
                          className="bank-list__logo"
                        />
                      ) : (
                        <i className="pi pi-building bank-list__logo-placeholder" />
                      )}
                      <span className="bank-list__name">{institution.name}</span>
                      <i className="pi pi-chevron-right bank-list__chevron" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">{t("no_banks_found")}</p>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}
