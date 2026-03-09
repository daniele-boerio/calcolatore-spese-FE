import { useState, useEffect, useMemo, useRef } from "react";
import Stepper from "../../../stepper/stepper";
import InputText from "../../../input_text/input_text";
import Button from "../../../button/button";
import Dropdown from "../../../dropdown/dropdown";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import "./compensation.scss";
import {
  createTransaction,
  getTransactionsByCategory,
} from "../../../../features/transactions/api_calls";
import { Transaction } from "../../../../features/transactions/interfaces";
import { useI18n } from "../../../../i18n/use-i18n";
import { Calendar } from "primereact/calendar";
import { selectContiConti } from "../../../../features/conti/conto_slice";
import { selectCategoriaCategorie } from "../../../../features/categorie/categoria_slice";
import { selectTagTags } from "../../../../features/tags/tag_slice";

interface CompensationDialogProps {
  importo: string;
  setImporto: (val: string) => void;
  data: Date | null;
  setData: (val: Date | null) => void;
  contoId: string | null;
  setContoId: (val: string | null) => void;
  categoriaId: string | null;
  setCategoriaId: (val: string | null) => void;
  sottoCategoriaId: string | null;
  setSottoCategoriaId: (val: string | null) => void;
  tagId: string | null;
  setTagId: (val: string | null) => void;
  transactionId: string | null;
  setTransactionId: (val: string | null) => void;
  descrizione: string;
  setDescrizione: (val: string) => void;
  from_data: Date | null;
  setFromData: (val: Date | null) => void;
  to_data: Date | null;
  setToData: (val: Date | null) => void;
}

export default function Compensation({
  importo,
  setImporto,
  data,
  setData,
  contoId,
  setContoId,
  categoriaId,
  setCategoriaId,
  sottoCategoriaId,
  setSottoCategoriaId,
  tagId,
  setTagId,
  transactionId,
  setTransactionId,
  descrizione,
  setDescrizione,
  from_data,
  setFromData,
  to_data,
  setToData,
}: CompensationDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const stepperRef = useRef<any | null>(null);

  // Dati da store
  const conti = useAppSelector(selectContiConti);
  const categorie = useAppSelector(selectCategoriaCategorie);
  const tags = useAppSelector(selectTagTags);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const filteredSottoCategorie = useMemo(() => {
    const cat = categorie.find((c) => c.id === categoriaId);
    return cat?.sottocategorie || [];
  }, [categoriaId, categorie]);

  // Creiamo le etichette formattate: Data - Importo - Descrizione
  const transactionOptions = useMemo(() => {
    return transactions.map((tx) => {
      // Formattiamo la data (es. 15/04/2024)
      const formattedDate = new Date(tx.data).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Formattiamo l'importo in Euro (es. 150,00 €)
      const formattedAmount = Number(tx.importo).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });

      // Gestiamo l'eventuale assenza di descrizione
      const desc = tx.descrizione ? tx.descrizione : t("no_description");

      return {
        ...tx,
        displayLabel: `${formattedDate} - ${formattedAmount} - ${desc}`,
      };
    });
  }, [transactions, t]);

  const handleFetchTransactionsAndNext = async () => {
    try {
      const res = await dispatch(
        getTransactionsByCategory({
          categoria_id: categoriaId ?? undefined,
          sottocategoria_id: sottoCategoriaId ?? undefined,
          data_inizio: from_data
            ? `${from_data.getFullYear()}-${String(from_data.getMonth() + 1).padStart(2, "0")}-${String(from_data.getDate()).padStart(2, "0")}`
            : undefined,
          data_fine: to_data
            ? `${to_data.getFullYear()}-${String(to_data.getMonth() + 1).padStart(2, "0")}-${String(to_data.getDate()).padStart(2, "0")}`
            : undefined,
          tipo: "USCITA",
        }),
      ).unwrap();
      setTransactions(res || []);
    } catch (e) {
      setTransactions([]);
    } finally {
      stepperRef.current?.nextCallback();
    }
  };

  const handleImportoChange = (val: string) => {
    let cleanedValue = val.replace(",", ".");
    if (cleanedValue === "" || /^\d*\.?\d{0,2}$/.test(cleanedValue)) {
      setImporto(cleanedValue);
    }
  };

  return (
    <div className="compensation-form">
      {(() => {
        const panels = [
          {
            label: t("category_and_subcategory"),
            subLabel: "",
            content: (
              <>
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
                      editable
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
                      editable
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">{t("from_date")}</label>
                    <Calendar
                      value={from_data}
                      onChange={(e) => setFromData(e.value as Date)}
                      showIcon
                      dateFormat="dd/mm/yy"
                      showTime={false}
                      hourFormat="24"
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">{t("to_date")}</label>
                    <Calendar
                      value={to_data}
                      onChange={(e) => setToData(e.value as Date)}
                      showIcon
                      dateFormat="dd/mm/yy"
                      showTime={false}
                      hourFormat="24"
                    />
                  </div>
                </div>
                <div className="buttons next">
                  <Button
                    className="action-button"
                    label={t("next")}
                    onClick={handleFetchTransactionsAndNext}
                  />
                </div>
              </>
            ),
          },
          {
            label: t("transaction_details"),
            subLabel: "",
            content: (
              <>
                <div className="form-row">
                  <div className="field">
                    <Dropdown
                      key={transactions.length}
                      label={t("transactions")}
                      value={transactionId}
                      options={transactionOptions}
                      optionLabel="displayLabel"
                      optionValue="id"
                      onChange={(e) => setTransactionId(e.value)}
                      placeholder={t("transaction_placeholder")}
                    />
                  </div>
                </div>
                <div className="buttons">
                  <Button
                    className="reset-button"
                    label={t("previous")}
                    onClick={() => stepperRef.current?.prevCallback()}
                  />
                  <Button
                    className="action-button"
                    label={t("next")}
                    onClick={() => stepperRef.current?.nextCallback()}
                  />
                </div>
              </>
            ),
          },
          {
            label: t("basic_info"),
            subLabel: "",
            content: (
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
                      editable
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
                <div className="buttons previous">
                  <Button
                    className="reset-button"
                    label={t("previous")}
                    onClick={() => stepperRef.current?.prevCallback()}
                  />
                </div>
              </>
            ),
          },
        ];

        return (
          <Stepper ref={stepperRef} panels={panels} orientation="vertical" />
        );
      })()}
    </div>
  );
}
