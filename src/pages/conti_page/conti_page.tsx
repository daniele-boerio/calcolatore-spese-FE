import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useI18n } from "../../i18n/use-i18n";
import Button from "../../components/button/button";
import "./conti_page.scss";
import { getConti } from "../../features/conti/api_calls";
import AccountDialog from "../../components/dialog/account_dialog/account_dialog";
import BankConnectDialog from "../../components/dialog/bank_connect_dialog/bank_connect_dialog";
import ImportStatementDialog from "../../components/dialog/import_statement_dialog/import_statement_dialog";
import CreditCard from "../../components/credit_card/credit_card"; // Assicurati che il percorso sia giusto
import { Conto } from "../../features/conti/interfaces";
import {
  selectContiConti,
  selectContiLoading,
} from "../../features/conti/conto_slice";
import { selectIsOpenBankingAdmin } from "../../features/profile/profile_slice";

export default function ContiPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const conti = useAppSelector(selectContiConti);
  const accountLoading = useAppSelector(selectContiLoading);
  const isOpenBankingAdmin = useAppSelector(selectIsOpenBankingAdmin);

  const [isCreateDialogVisible, setIsCreateDialogVisible] = useState(false);
  // Stato per l'edit
  const [selectedAccount, setSelectedAccount] = useState<Conto | null>(null);

  // Stato per il collegamento bancario (Open Banking)
  const [isBankDialogVisible, setIsBankDialogVisible] = useState(false);
  const [bankAccount, setBankAccount] = useState<Conto | null>(null);

  // Stato per l'import di un estratto conto PDF
  const [isImportDialogVisible, setIsImportDialogVisible] = useState(false);

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

  const handleOpenLinkBank = (account: Conto) => {
    setBankAccount(account);
    setIsBankDialogVisible(true);
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
          <div className="header-actions">
            <Button
              icon="pi pi-file-import"
              iconPos="left"
              label={t("import_statement_title")}
              className="action-button"
              onClick={() => setIsImportDialogVisible(true)}
            />
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
                      bankLinked={!!conto.bank_connector_account_id}
                      onLinkBank={
                        isOpenBankingAdmin
                          ? () => handleOpenLinkBank(conto)
                          : undefined
                      }
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

      {/* DIALOG COLLEGAMENTO BANCARIO */}
      <BankConnectDialog
        visible={isBankDialogVisible}
        conto={bankAccount}
        onHide={() => {
          setIsBankDialogVisible(false);
          setBankAccount(null);
        }}
      />

      {/* DIALOG IMPORT ESTRATTO CONTO PDF */}
      <ImportStatementDialog
        visible={isImportDialogVisible}
        onHide={() => setIsImportDialogVisible(false)}
      />
    </>
  );
}
