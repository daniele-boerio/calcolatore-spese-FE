import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { SelectButton } from "primereact/selectbutton";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import Dropdown from "../../dropdown/dropdown";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import "./transaction_dialog.scss";
import {
  createTransaction,
  updateTransaction,
} from "../../../features/transactions/api_calls";
import {
  tipoTransaction,
  Transaction,
} from "../../../features/transactions/interfaces";
import { useI18n } from "../../../i18n/use-i18n";
import { Calendar } from "primereact/calendar";
import { getConti } from "../../../features/conti/api_calls";
import { getCategorie } from "../../../features/categorie/api_calls";
import { getTags } from "../../../features/tags/api_calls";

interface TransactionDialogProps {
  visible: boolean;
  onHide: () => void;
  transaction?: Transaction; // Se passata, siamo in modalità EDIT
}

export default function TransactionDialog({
  visible,
  onHide,
  transaction,
}: TransactionDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Dati da store
  const conti = useAppSelector((state) => state.conto.conti);
  const categorie = useAppSelector((state) => state.categoria.categorie);
  const tags = useAppSelector((state) => state.tag.tags);

  // Stati del form
  const [tipo, setTipo] = useState<tipoTransaction>("USCITA");
  const [importo, setImporto] = useState<string>("");
  const [data, setData] = useState<Date | null>(new Date());
  const [descrizione, setDescrizione] = useState("");
  const [contoId, setContoId] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [sottoCategoriaId, setSottoCategoriaId] = useState<string | null>(null);
  const [tagId, setTagId] = useState<string | null>(null);

  // Effetto per il popolamento (Edit) o reset (Create)
  useEffect(() => {
    if (visible) {
      if (transaction) {
        // Modalità UPDATE
        setTipo(transaction.tipo);
        setImporto(transaction.importo.toString());
        setData(new Date(transaction.data));
        setDescrizione(transaction.descrizione || "");
        setContoId(transaction.conto_id);
        setCategoriaId(transaction.categoria_id);
        setSottoCategoriaId(transaction.sottocategoria_id);
        setTagId(transaction.tag_id);
      } else {
        // Modalità CREATE (Reset)
        setTipo("USCITA");
        setImporto("");
        setData(new Date());
        setDescrizione("");
        setContoId(null);
        setCategoriaId(null);
        setSottoCategoriaId(null);
        setTagId(null);
      }
    }
  }, [visible, transaction]);

  // Caricamento dati iniziali
  useEffect(() => {
    dispatch(getConti());
    dispatch(getCategorie());
    dispatch(getTags());
  }, [dispatch]);

  const filteredSottoCategorie = useMemo(() => {
    const cat = categorie.find((c) => c.id === categoriaId);
    return cat?.sottocategorie || [];
  }, [categoriaId, categorie]);

  const handleSave = async () => {
    const formattedDate = data
      ? `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`
      : "";

    const numericImporto = parseFloat(importo);

    const payload: any = {
      importo: isNaN(numericImporto) ? 0 : numericImporto,
      tipo,
      data: formattedDate,
      descrizione,
      conto_id: contoId ?? "",
      categoria_id: categoriaId,
      sottocategoria_id: sottoCategoriaId,
      tag_id: tagId,
    };

    if (transaction?.id) {
      // Chiamata Update se abbiamo l'ID
      await dispatch(updateTransaction({ id: transaction.id, ...payload }));
    } else {
      // Chiamata Create
      await dispatch(createTransaction(payload));
    }

    onHide();
  };

  const tipoOptions = [
    { label: t("income"), value: "ENTRATA" },
    { label: t("expenses"), value: "USCITA" },
    { label: t("compensation"), value: "RIMBORSO" },
  ];

  const handleImportoChange = (val: string) => {
    let cleanedValue = val.replace(",", ".");
    if (cleanedValue === "" || /^\d*\.?\d{0,2}$/.test(cleanedValue)) {
      setImporto(cleanedValue);
    }
  };

  return (
    <Dialog
      header={transaction ? t("edit_transaction") : t("new_transaction")}
      visible={visible}
      className="dialog-custom create-transaction-dialog"
      style={{ width: "95vw", maxWidth: "45rem" }}
      onHide={onHide}
      footer={
        <div className="dialog-footer">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            className="action-button"
            label={transaction ? t("save_changes") : t("save")}
            onClick={handleSave}
            disabled={!importo || !contoId}
          />
        </div>
      }
      draggable={false}
      resizable={false}
    >
      <div className="transaction-form">
        <div className="form-row">
          <SelectButton
            value={tipo}
            options={tipoOptions}
            onChange={(e) => setTipo(e.value || "USCITA")}
            className="type-selector"
          />
        </div>

        <div className="form-row">
          <div className="field">
            <InputText
              value={importo}
              onChange={(e) => handleImportoChange(e.target.value)}
              label={t("amount")}
              icon="pi pi-euro"
              iconPos="right"
              keyfilter={/^\d*[.,]?\d{0,2}$/} // Filtro lato PrimeReact
              inputMode="decimal" // Forza tastiera numerica con punto/virgola su mobile
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <label className="field-label">{t("date")}</label>
            <Calendar
              value={data}
              onChange={(e) => setData(e.value as Date)}
              showIcon
              dateFormat="dd/mm/yy"
              showTime={false}
              hourFormat="24"
            />
          </div>
        </div>

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
              disabled={!categoriaId}
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
