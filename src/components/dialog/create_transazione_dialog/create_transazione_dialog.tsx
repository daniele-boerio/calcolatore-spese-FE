import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { SelectButton } from "primereact/selectbutton";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import Dropdown from "../../dropdown/dropdown";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import "./create_transazione_dialog.scss";
import { createTransaction } from "../../../features/transactions/api_calls";
import {
  CreateTransactionParams,
  tipoTransaction,
} from "../../../features/transactions/interfaces";
import { useI18n } from "../../../i18n/use-i18n";

interface CreateTransactionDialogProps {
  visible: boolean;
  onHide: () => void;
}

export default function CreateTransactionDialog({
  visible,
  onHide,
}: CreateTransactionDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const conti = useAppSelector((state) => state.conto.conti);
  const categorie = useAppSelector((state) => state.categoria.categorie);
  const tags = useAppSelector((state) => state.tag.tags);
  const tutteLeTransazioni = useAppSelector(
    (state) => state.transaction.transactions,
  );

  const [tipo, setTipo] = useState<tipoTransaction>("USCITA");
  const [importo, setImporto] = useState<number | null>(0);
  const [data, setData] = useState<Date | null>(new Date());
  const [descrizione, setDescrizione] = useState("");
  const [contoId, setContoId] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [sottoCategoriaId, setSottoCategoriaId] = useState<string | null>(null);
  const [tagId, setTagId] = useState<string | null>(null);
  const [parentTransactionId, setParentTransactionId] = useState<string | null>(
    null,
  );

  const tipoOptions = [
    { label: t("income"), value: "ENTRATA" },
    { label: t("expenses"), value: "USCITA" },
    { label: t("compensation"), value: "RIMBORSO" },
  ];

  useEffect(() => {
    if (!visible) {
      setTipo("USCITA");
      setImporto(0);
      setData(new Date());
      setDescrizione("");
      setContoId(null);
      setCategoriaId(null);
      setSottoCategoriaId(null);
      setTagId(null);
      setParentTransactionId(null);
    }
  }, [visible]);

  const filteredSottoCategorie = useMemo(() => {
    const cat = categorie.find((c) => c.id === categoriaId);
    return cat?.sottocategorie || [];
  }, [categoriaId, categorie]);

  const handleSave = async () => {
    const payload: CreateTransactionParams = {
      importo: importo ?? 0,
      tipo,
      data: data ? data.toISOString() : "",
      descrizione,
      conto_id: contoId ?? "",
      categoria_id: categoriaId,
      sottocategoria_id: sottoCategoriaId,
      tag_id: tagId,
      parent_transaction_id: parentTransactionId,
    };
    await dispatch(createTransaction(payload));
    onHide();
  };

  return (
    <Dialog
      header={t("new_transaction")}
      visible={visible}
      className="create-transaction-dialog"
      style={{ width: "90vw", maxWidth: "50rem" }}
      onHide={onHide}
      footer={
        <div className="dialog-footer">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            label={t("save")}
            onClick={handleSave}
            disabled={!importo || !contoId}
          />
        </div>
      }
      draggable={false}
      resizable={false}
    >
      <div className="transaction-form">
        {/* Selettore Tipo */}
        <SelectButton
          value={tipo}
          options={tipoOptions}
          onChange={(e) => setTipo(e.value || "USCITA")}
          className="type-selector"
        />

        {/* Importo e Data (Spesso stanno bene vicini) */}
        <div className="form-row">
          <div className="field">
            <label className="field-label">{t("amount")}</label>
            <InputNumber
              value={importo}
              onValueChange={(e) => setImporto(e.value ?? null)}
              mode="currency"
              currency="EUR"
              locale="it-IT"
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field-label">{t("date")}</label>
            <Calendar
              value={data}
              onChange={(e) => setData(e.value as Date)}
              showIcon
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>

        {/* Conto e Categoria */}
        <div className="form-row">
          <div className="field">
            <Dropdown
              label={t("bank_account")}
              value={contoId}
              options={conti}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setContoId(e.value)}
              placeholder={t("bank_account_placeholder")}
            />
          </div>
          <div className="field">
            <Dropdown
              label={t("tag")}
              value={tagId}
              options={tags}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setTagId(e.value)}
              placeholder={t("tag_placeholder")}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <Dropdown
              label={t("category")}
              value={categoriaId}
              options={categorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setCategoriaId(e.value)}
              placeholder={t("category_placeholder")}
            />
          </div>
          <div className="field">
            <Dropdown
              label={t("sub_category")}
              value={sottoCategoriaId}
              options={filteredSottoCategorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setSottoCategoriaId(e.value)}
              placeholder={t("sub_category_placeholder")}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <InputText
              label={t("description")}
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder={t("description_placeholder")}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
