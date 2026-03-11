import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useI18n } from "../../i18n/use-i18n";
import Button from "../../components/button/button";
import "./conti_page.scss";
import { getConti } from "../../features/conti/api_calls";
import AccountDialog from "../../components/dialog/account_dialog/account_dialog";
import CreditCard from "../../components/credit_card/credit_card"; // Assicurati che il percorso sia giusto
import { Conto } from "../../features/conti/interfaces";
import {
  selectContiConti,
  selectContiLoading,
} from "../../features/conti/conto_slice";

export default function ContiPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const conti = useAppSelector(selectContiConti);
  const accountLoading = useAppSelector(selectContiLoading);

  const [isCreateDialogVisible, setIsCreateDialogVisible] = useState(false);
  // Stato per l'edit
  const [selectedAccount, setSelectedAccount] = useState<Conto | null>(null);

  useEffect(() => {
    dispatch(getConti());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setSelectedAccount(null);
    setIsCreateDialogVisible(true);
  };

  const handleOpenEdit = (account: Conto) => {
    setSelectedAccount(account);
    setIsCreateDialogVisible(true);
  };

  return (
    <>
      <div className="conti-page">
        {/* HEADER */}
        <header className="page-header">
          <div className="header-content">
            <h1>{t("nav_accounts")}</h1>
            <p className="subtitle">{t("manage_accounts_subtitle")}</p>
          </div>
        </header>

        {/* CONTENITORE A GRIGLIA */}
        <div className="split-wrapper">
          <section className="conti-list">
            <div className="scrollable-area">
              <div className="conti-grid">
                {conti.length > 0 ? (
                  conti.map((conto, index) => (
                    <CreditCard
                      key={conto.id}
                      id={conto.id}
                      name={conto.nome}
                      balance={conto.saldo}
                      index={index}
                      color={conto.color ? conto.color : "4b6cb7"}
                      onEdit={() => handleOpenEdit(conto)}
                    />
                  ))
                ) : (
                  <p className="no-data">{t("no_data")}</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* FAB BUTTON */}
        <Button
          icon="pi pi-plus"
          className="add-account-button"
          compact
          rounded
          onClick={handleOpenCreate}
        />
      </div>

      {/* DIALOG CREAZIONE/MODIFICA */}
      <AccountDialog
        visible={isCreateDialogVisible}
        account={selectedAccount!}
        onHide={() => {
          setIsCreateDialogVisible(false);
          setSelectedAccount(null);
        }}
        loading={accountLoading}
      />
    </>
  );
}
