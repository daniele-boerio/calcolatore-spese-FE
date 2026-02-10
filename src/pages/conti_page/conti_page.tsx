import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useI18n } from "../../i18n/use-i18n";
import Button from "../../components/button/button";
import "./conti_page.scss";
import { getConti } from "../../features/conti/api_calls";
import CardCarousel from "../../components/card_carousel/card_carousel";
import AccountDialog from "../../components/dialog/account_dialog/account_dialog";

export default function ContiPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const conti = useAppSelector((state) => state.conto.conti);
  const accountLoading = useAppSelector((state) => state.conto.loading);
  const [isCreateDialogVisible, setIsCreateDialogVisible] = useState(false);

  useEffect(() => {
    dispatch(getConti());
  }, [dispatch]);

  return (
    <>
      <div className="conti-page">
        <header className="conti-page__header">
          <div className="header-content">
            <h1>{t("nav_accounts")}</h1>
            <p className="subtitle">{t("manage_accounts_subtitle")}</p>
          </div>
        </header>

        <div className="conti-carousel">
          <CardCarousel conti={conti} direction="vertical" />
        </div>
        <Button
          icon="pi pi-plus"
          className="add-account-button"
          compact
          rounded
          onClick={() => setIsCreateDialogVisible(true)}
        />
      </div>
      <AccountDialog
        visible={isCreateDialogVisible}
        onHide={() => {
          setIsCreateDialogVisible(false);
        }}
        loading={accountLoading}
      />
    </>
  );
}
