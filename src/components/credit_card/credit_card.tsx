import "./credit_card.scss";
import { useI18n } from "../../i18n/use-i18n";
import Button from "../button/button";
import { confirmPopup } from "primereact/confirmpopup";
import { useAppDispatch } from "../../store/store";
import { deleteConto } from "../../features/conti/api_calls";

interface CreditCardProps {
  id: string;
  name: string;
  balance: number;
  logo?: string;
  index: number;
  onEdit: () => void;
  color: string;
}

export default function CreditCard({
  id,
  name,
  balance,
  logo,
  index,
  onEdit,
  color,
}: CreditCardProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const formattedBalance = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(balance);

  const handleDeleteAccount = (event: any) => {
    confirmPopup({
      target: event.currentTarget,
      message: t("delete_message"),
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
