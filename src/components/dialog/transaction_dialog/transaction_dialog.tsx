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
import Compensation from "./compensation/compensation";
import { selectContiConti } from "../../../features/conti/conto_slice";
import { selectCategoriaCategorie } from "../../../features/categorie/categoria_slice";
import { selectTagTags } from "../../../features/tags/tag_slice";
import { createTag } from "../../../features/tags/api_calls";
import {
  createCategoria,
  createSottoCategorie,
} from "../../../features/categorie/api_calls";

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
  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const tags = useAppSelector(selectTagTags);

  // Stati del form
  const [tipo, setTipo] = useState<tipoTransaction>("USCITA");
  const [importo, setImporto] = useState<string>("");
  const [data, setData] = useState<Date | null>(new Date());
  const [descrizione, setDescrizione] = useState("");
  const [contoId, setContoId] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [sottoCategoriaId, setSottoCategoriaId] = useState<string | null>(null);
  const [newSubCategoryName, setNewSubCategoryName] = useState<string>("");
  const [tagId, setTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState<string>("");
  const [from_data, setFromData] = useState<Date | null>(null);
  const [to_data, setToData] = useState<Date | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

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
        setTransactionId(transaction.parent_transaction_id);
      } else {
        // Modalità CREATE (Reset)
        setTipo("USCITA");
        setImporto("");
        setData(new Date());
        setDescrizione("");
        setCategoriaId(null);
        setSottoCategoriaId(null);
        setTagId(null);
        setFromData(null);
        setToData(null);
        setTransactionId(null);
        setNewCategoryName("");
        setNewSubCategoryName("");
        setNewTagName("");

        const defaultConto = conti.find((c) => c.default === true);
        setContoId(defaultConto ? defaultConto.id : null);
      }
    }
  }, [visible, transaction, conti]);

  const handleSave = async () => {
    const formattedDate = data
      ? `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`
      : "";

    const numericImporto = parseFloat(importo || "");

    // Prepariamo delle variabili temporanee per gli ID che invieremo
    let finalTagId = tagId === "NEW_TAG" ? newTagName : tagId;
    let finalCategoriaId =
      categoriaId === "NEW_CATEGORY" ? newCategoryName : categoriaId;
    let finalSottoCategoriaId =
      sottoCategoriaId === "NEW_SUBCATEGORY"
        ? newSubCategoryName
        : sottoCategoriaId;

    // --- 1. CONTROLLO E CREAZIONE TAG ---
    if (finalTagId) {
      // Cerchiamo se il valore corrisponde a un ID o a un nome esistente (case-insensitive)
      const tagExists = tags.find(
        (t) =>
          String(t.id) === String(finalTagId) ||
          t.nome.toLowerCase() === String(finalTagId).toLowerCase(),
      );

      if (tagExists) {
        finalTagId = tagExists.id;
      } else {
        // Il tag non esiste, lo creiamo!
        const newTag = await dispatch(
          createTag({ nome: String(finalTagId) }),
        ).unwrap();
        finalTagId = newTag.id;
      }
    }

    // --- 2. CONTROLLO E CREAZIONE CATEGORIA ---
    if (finalCategoriaId) {
      const catExists = categorie.find(
        (c) =>
          String(c.id) === String(finalCategoriaId) ||
          c.nome.toLowerCase() === String(finalCategoriaId).toLowerCase(),
      );

      if (catExists) {
        finalCategoriaId = catExists.id;
      } else {
        // La categoria non esiste, la creiamo in base al "tipo" attuale
        const newCat = await dispatch(
          createCategoria({
            nome: String(finalCategoriaId),
            solo_entrata: tipo === "ENTRATA" || tipo === "RIMBORSO",
            solo_uscita: tipo === "USCITA" || tipo === "RIMBORSO",
          }),
        ).unwrap();
        finalCategoriaId = newCat.id;
      }
    }

    // --- 3. CONTROLLO E CREAZIONE SOTTOCATEGORIA ---
    if (finalSottoCategoriaId && finalCategoriaId) {
      // Cerchiamo la madre (appena creata o esistente) per vedere le sue sub
      const parentCat = categorie.find(
        (c) => String(c.id) === String(finalCategoriaId),
      );
      const subExists = parentCat?.sottocategorie?.find(
        (s) =>
          String(s.id) === String(finalSottoCategoriaId) ||
          s.nome.toLowerCase() === String(finalSottoCategoriaId).toLowerCase(),
      );

      if (subExists) {
        finalSottoCategoriaId = subExists.id;
      } else {
        // La sottocategoria non esiste, la creiamo (usando la tua API che accetta una lista)
        const createdSubs = await dispatch(
          createSottoCategorie({
            id: finalCategoriaId as string, // ID della madre appena risolto
            subList: [
              {
                nome: String(finalSottoCategoriaId),
                solo_entrata: tipo === "ENTRATA" || tipo === "RIMBORSO",
                solo_uscita: tipo === "USCITA" || tipo === "RIMBORSO",
              },
            ],
          }),
        ).unwrap();

        // Prendiamo l'ID della prima (e unica) sottocategoria creata
        finalSottoCategoriaId = createdSubs[0].id;
      }
    }

    // --- 4. PREPARAZIONE DEL PAYLOAD FINALE ---
    const payload: any = {
      importo: isNaN(numericImporto) ? 0 : numericImporto,
      tipo,
      data: formattedDate,
      descrizione: descrizione,
      conto_id: contoId,
      categoria_id: finalCategoriaId,
      sottocategoria_id: finalSottoCategoriaId,
      tag_id: finalTagId,
      parent_transaction_id: transactionId,
    };

    // --- 5. SALVATAGGIO TRANSAZIONE ---
    if (transaction?.id) {
      await dispatch(updateTransaction({ id: transaction.id, ...payload }));
    } else {
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

  const categorieFiltrate = useMemo(() => {
    if (!categorie) return [];

    return categorie.filter((cat) => {
      if (tipo === "ENTRATA") {
        return cat.solo_entrata === true;
      }
      if (tipo === "USCITA") {
        return cat.solo_uscita === true;
      }
      return true; // Caso di fallback se tipo non è ancora definito
    });
  }, [categorie, tipo]);

  const categorieOptions = useMemo(() => {
    return [
      ...categorieFiltrate,
      {
        id: "NEW_CATEGORY",
        nome: `+ ${t("add_new_category")}`,
      },
    ];
  }, [categorieFiltrate, t]);

  const filteredSottoCategorie = useMemo(() => {
    // 1. Trova la categoria selezionata
    const cat = categorie.find((c) => c.id === categoriaId);

    if (!cat || !cat.sottocategorie) return [];

    // 2. Ritorna solo le sottocategorie che corrispondono al "tipo" attuale
    return cat.sottocategorie.filter((sub) => {
      if (tipo === "ENTRATA") {
        return sub.solo_entrata === true;
      }
      if (tipo === "USCITA") {
        return sub.solo_uscita === true;
      }
      return true; // Fallback
    });
  }, [categoriaId, categorie, tipo]); // Aggiunto 'tipo' alle dipendenze

  const sottocategorieOptions = useMemo(() => {
    return [
      ...filteredSottoCategorie,
      {
        id: "NEW_SUBCATEGORY",
        nome: `+ ${t("add_new_subcategory")}`,
      },
    ];
  }, [filteredSottoCategorie, t]);

  const tagOptions = useMemo(() => {
    return [
      ...tags,
      {
        id: "NEW_TAG",
        nome: `+ ${t("add_new_tag")}`,
      },
    ];
  }, [tags, t]);

  return (
    <Dialog
      id="transaction-dialog"
      header={transaction ? t("edit_transaction") : t("new_transaction")}
      visible={visible}
      className="dialog-custom create-transaction-dialog"
      style={{ width: "95vw", maxWidth: "45rem" }}
      onHide={onHide}
      blockScroll={true}
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
            disabled={
              tipo === "RIMBORSO"
                ? !(importo && contoId && data && transactionId)
                : !(importo && contoId && data)
            }
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

        {tipo === "RIMBORSO" ? (
          <Compensation
            importo={importo}
            setImporto={setImporto}
            data={data}
            setData={setData}
            descrizione={descrizione}
            setDescrizione={setDescrizione}
            contoId={contoId}
            setContoId={setContoId}
            categoriaId={categoriaId}
            setCategoriaId={setCategoriaId}
            sottoCategoriaId={sottoCategoriaId}
            setSottoCategoriaId={setSottoCategoriaId}
            tagId={tagId}
            setTagId={setTagId}
            newTagName={newTagName}
            setNewTagName={setNewTagName}
            from_data={from_data}
            setFromData={setFromData}
            to_data={to_data}
            setToData={setToData}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
          />
        ) : (
          <>
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
                  showButtonBar
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
                  options={tagOptions}
                  optionLabel="nome"
                  optionValue="id"
                  onChange={(e) => setTagId(e.value)}
                  placeholder={t("tag_placeholder")}
                />
              </div>
            </div>
            {tagId === "NEW_TAG" && (
              <div className="form-row">
                <div className="field" style={{ width: "100%" }}>
                  <InputText
                    label={t("new_tag_name")}
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder={t("ex_corsica")}
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="field">
                <Dropdown
                  label={t("category")}
                  value={categoriaId}
                  options={categorieOptions}
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
                  options={sottocategorieOptions}
                  optionLabel="nome"
                  optionValue="id"
                  onChange={(e) => setSottoCategoriaId(e.value)}
                  placeholder={t("sub_category_placeholder")}
                  disabled={!categoriaId}
                />
              </div>
            </div>
            {categoriaId === "NEW_CATEGORY" && (
              <div className="form-row">
                <div className="field" style={{ width: "100%" }}>
                  <InputText
                    label={t("new_category_name")}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t("ex_subscriptions")}
                  />
                </div>
              </div>
            )}

            {sottoCategoriaId === "NEW_SUBCATEGORY" && (
              <div className="form-row">
                <div className="field" style={{ width: "100%" }}>
                  <InputText
                    label={t("new_subcategory_name")}
                    value={newSubCategoryName}
                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                    placeholder={t("ex_netflix")}
                  />
                </div>
              </div>
            )}

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
          </>
        )}
      </div>
    </Dialog>
  );
}
