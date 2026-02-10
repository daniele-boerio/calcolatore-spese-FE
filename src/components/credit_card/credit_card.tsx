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
}

export default function CreditCard({
  id,
  name,
  balance,
  logo,
  index,
  onEdit,
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

  const availableColors = [
    "card-blue",
    "card-green",
    "card-red",
    "card-dark",
    "card-purple",
    "card-orange",
    "card-turquoise",
    "card-indigo",
  ];

  const colorClass = availableColors[index % availableColors.length];

  return (
    <div className={`credit-card ${colorClass}`}>
      <div className="credit-card__actions">
        <Button
          icon="pi pi-pencil"
          className="trasparent-button"
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
