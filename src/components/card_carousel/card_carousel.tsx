import React, { useState } from "react";
import CreditCard from "../credit_card/credit_card";
import "./card_carousel.scss";
// Importiamo l'interfaccia Conto definita nello slice dei conti
import { Conto } from "../../features/conti/interfaces";
import { useI18n } from "../../i18n/use-i18n";
import { useAppSelector } from "../../store/store";
import UpdateAccountDialog from "../dialog/update_account_dialog/update_account_dialog";

interface CardCarouselProps {
  conti: Conto[];
  direction?: "horizontal" | "vertical";
}

export default function CardCarousel({
  conti,
  direction = "horizontal",
}: CardCarouselProps) {
  const { t } = useI18n();
  const accountLoading = useAppSelector((state) => state.conto.loading);
  const [isDialogUpdateVisible, setIsDialogUpdateVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Conto | null>(null);

  const containerClass = `card-carousel is-${direction}`;

  return (
    <>
      <div className="card-carousel-wrapper">
        <h3 className="carousel-title">{t("bank_accounts")}</h3>
        <div className={containerClass}>
          {conti.map((account, index) => (
            <CreditCard
              id={account.id}
              key={account.id}
              name={account.nome}
              balance={account.saldo}
              index={index}
              onEdit={() => {
                setIsDialogUpdateVisible(true);
                setSelectedAccount(account);
              }}
            />
          ))}
        </div>
      </div>
      {selectedAccount && (
        <UpdateAccountDialog
          visible={isDialogUpdateVisible}
          account={selectedAccount} // Niente più "!"
          onHide={() => {
            setIsDialogUpdateVisible(false);
            setSelectedAccount(null);
          }}
          loading={accountLoading}
        />
      )}
    </>
  );
}
