import "./credit_card.scss";
import { useI18n } from "../../i18n/use-i18n";
import Button from "../button/button";
import { confirmPopup } from "primereact/confirmpopup";
import { useAppDispatch } from "../../store/store";
import { deleteConto } from "../../features/conti/api_calls";
import api from "../../services/api";

interface CreditCardProps {
  id: string;
  name: string;
  balance: number;
  logo?: string;
  index: number;
  onEdit: () => void;
  onLinkBank?: () => void;
  bankLinked?: boolean;
  color: string;
}

export default function CreditCard({
  id,
  name,
  balance,
  logo,
  index,
  onEdit,
  onLinkBank,
  bankLinked,
  color,
}: CreditCardProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const formattedBalance = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(balance);

  const handleDeleteAccount = async (event: any) => {
    // Catturiamo il target PRIMA dell'await: dopo il tick async React può
    // azzerare currentTarget e il popup non avrebbe più un ancoraggio.
    const target = event.currentTarget;

    // Mostriamo quante transazioni verranno nascoste: chi cancella un conto
    // per sbaglio deve capire cosa sta per succedere. La cancellazione è
    // reversibile lato BE (soft-delete), ma qui vogliamo comunque un freno.
    let message: string;
    try {
      const response = await api.get<{ total: number }>(
        `/transazioni/paginated?conto_id=${id}&size=1`,
      );
      const count = response.data?.total ?? 0;
      message =
        count > 0
          ? t("delete_conto_message").replace("{count}", String(count))
          : t("delete_conto_message_zero");
    } catch {
      // Il conteggio è solo informativo: se fallisce non blocchiamo la delete,
      // chiediamo comunque conferma con un messaggio prudente.
      message = t("delete_conto_error_count");
    }

    confirmPopup({
      target,
      message,
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: t("yes"),
      rejectLabel: t("no"),
      accept: () => {
        dispatch(deleteConto({ id }));
      },
      reject: () => {},
    });
  };

  const darkenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = ((num >> 8) & 0x00ff) - amt,
      B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  const baseColor = color.startsWith("#") ? color : `#${color}`;
  const secondaryColor = darkenColor(baseColor, 30);

  const cardStyle = {
    background: `linear-gradient(135deg, ${baseColor} 0%, ${secondaryColor} 100%)`,
  };

  return (
    <div className={`credit-card`} style={cardStyle}>
      <div className="credit-card__actions">
        {onLinkBank && (
          <Button
            icon={bankLinked ? "pi pi-verified" : "pi pi-building"}
            className="trasparent-button-account"
            labelNoTraduction={bankLinked ? t("bank_connected") : t("link_bank")}
            compact
            onClick={(e) => {
              onLinkBank();
              e.stopPropagation();
            }}
          />
        )}
        <Button
          icon="pi pi-pencil"
          className="trasparent-button-account"
          compact
          onClick={(e) => {
            onEdit();
            e.stopPropagation();
          }}
        />
        <Button
          icon="pi pi-trash"
          className="trasparent-danger-button"
          compact
          onClick={(e) => {
            handleDeleteAccount(e);
            e.stopPropagation();
          }}
        />
      </div>

      <div className="credit-card__header">
        <span className="credit-card__name">{name}</span>
        {logo && <img src={logo} alt={name} className="credit-card__logo" />}
      </div>

      <div className="credit-card__footer">
        <span className="credit-card__balance-label">{t("balance")}</span>
        <span className="credit-card__balance-value">{formattedBalance}</span>
      </div>

      <div className="credit-card__decoration"></div>
    </div>
  );
}
