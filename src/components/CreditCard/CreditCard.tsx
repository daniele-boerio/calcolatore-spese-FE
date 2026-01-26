import React from "react";
import "./CreditCard.scss";

// 1. Definiamo l'interfaccia per le Props
interface CreditCardProps {
  name: string;
  balance: number;
  logo?: string; // Opzionale
  colorClass: string;
}

const CreditCard: React.FC<CreditCardProps> = ({
  name,
  balance,
  logo,
  colorClass,
}) => {
  // Formattazione del saldo localizzata
  const formattedBalance = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(balance);

  return (
    <div className={`credit-card ${colorClass}`}>
      <div className="credit-card__header">
        <span className="credit-card__name">{name}</span>
        {logo && <img src={logo} alt={name} className="credit-card__logo" />}
      </div>
      <div className="credit-card__footer">
        <span className="credit-card__balance-label">Saldo:</span>
        <span className="credit-card__balance-value">{formattedBalance}</span>
      </div>
      {/* Decorazione cerchio in basso a destra */}
      <div className="credit-card__decoration"></div>
    </div>
  );
};

export default CreditCard;
