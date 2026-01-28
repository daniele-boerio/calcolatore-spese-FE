import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { SelectButton } from "primereact/selectbutton";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import InputText from "../../InputText/InputText"; // Tuo componente custom
import Button from "../../Button/Button"; // Tuo componente custom
import Dropdown from "../../Dropdown/Dropdown";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import "./CreateTransactionDialog.scss";
import { createTransaction } from "../../../features/transactions/apiCalls";
import {
  CreateTransactionParams,
  tipoTransaction,
} from "../../../features/transactions/interfaces";

interface CreateTransactionDialogProps {
  visible: boolean;
  onHide: () => void;
}

const CreateTransactionDialog: React.FC<CreateTransactionDialogProps> = ({
  visible,
  onHide,
}) => {
  const dispatch = useAppDispatch();

  // Dati dallo store per le dropdown
  const conti = useAppSelector((state) => state.conto.conti);
  const categorie = useAppSelector((state) => state.categoria.categorie);
  const tags = useAppSelector((state) => state.tag.tags);
  const tutteLeTransazioni = useAppSelector(
    (state) => state.transaction.transactions,
  );

  // Stato Form
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
    { label: "Entrata", value: "ENTRATA" },
    { label: "Uscita", value: "USCITA" },
    { label: "Rimborso", value: "RIMBORSO" },
  ];

  // Reset dello stato alla chiusura
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

  // Filtro dinamico per le Sottocategorie basato sulla categoria scelta
  const filteredSottoCategorie = useMemo(() => {
    const cat = categorie.find((c) => c.id === categoriaId);
    return cat?.sottocategorie || [];
  }, [categoriaId, categorie]);

  // Filtro per Transazioni "Padre" (solo per RIMBORSO)
  const transazioniFiltrate = useMemo(() => {
    if (tipo !== "RIMBORSO") return [];
    return tutteLeTransazioni.filter((t) => {
      return (
        t.categoria_id === categoriaId &&
        (!sottoCategoriaId || t.sottocategoria_id === sottoCategoriaId) &&
        (!tagId || t.tag_id === tagId)
      );
    });
  }, [tipo, categoriaId, sottoCategoriaId, tagId, tutteLeTransazioni]);

  // Auto-popolamento dati se viene selezionata una transazione padre nel rimborso
  const handleParentChange = (e: { value: string }) => {
    setParentTransactionId(e.value);
    const parent = tutteLeTransazioni.find((t) => t.id === e.value);
    if (parent) {
      setImporto(parent.importo);
      setDescrizione(`Rimborso: ${parent.descrizione}`);
      setContoId(parent.conto_id);
    }
  };

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
      header="Nuova Transazione"
      visible={visible}
      style={{ width: "95vw", maxWidth: "500px" }}
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Annulla" className="reset-button" onClick={onHide} />
          <Button
            label="Salva"
            onClick={handleSave}
            disabled={!importo || !contoId}
          />
        </div>
      }
      draggable={false}
      resizable={false}
      closable={false}
    >
      <div className="transaction-form">
        <SelectButton
          value={tipo}
          options={tipoOptions}
          onChange={(e) => setTipo(e.value || "USCITA")}
          className="type-selector mb-4"
        />

        <div className="form-grid">
          {/* Categoria, Sottocategoria e Tag sono necessari per filtrare i rimborsi */}
          <div className="field">
            <Dropdown
              label="Categoria"
              value={categoriaId}
              options={categorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setCategoriaId(e.value)}
              placeholder="Seleziona Categoria"
              className="w-full"
            />
          </div>

          <div className="field">
            <Dropdown
              label="Sottocategoria"
              value={sottoCategoriaId}
              options={filteredSottoCategorie}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setSottoCategoriaId(e.value)}
              placeholder="Seleziona Sottocategoria"
              className="w-full"
              disabled={!categoriaId}
            />
          </div>

          <div className="field">
            <Dropdown
              label="Tag"
              value={tagId}
              options={tags}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setTagId(e.value)}
              placeholder="Seleziona Tag"
              className="w-full"
            />
          </div>

          {/* SEZIONE RIMBORSO: Elenco transazioni collegabili */}
          {tipo === "RIMBORSO" && (
            <div className="field highlight-field">
              {/*<Dropdown
                label="Transazione da rimborsare"
                value={parentTransactionId}
                options={transazioniFiltrate}
                // optionLabel deve essere una stringa, usiamo 'descrizione' come fallback
                optionLabel="descrizione"
                optionValue="id"
                onChange={handleParentChange}
                placeholder="Seleziona transazione originale"
                className="w-full"
                // Questo definisce come appare l'elemento nella lista
                itemTemplate={(option) => (
                  <span>
                    {option.descrizione} ({option.importo}€)
                  </span>
                )}
                // Questo definisce come appare l'elemento quando è selezionato
                valueTemplate={(option: any, props) => {
                  if (!option) return props.placeholder;
                  return (
                    <span>
                      {option.descrizione} ({option.importo}€)
                    </span>
                  );
                }}
              />*/}
            </div>
          )}

          <div className="field">
            <label>Importo</label>
            <InputNumber
              value={importo}
              onValueChange={(e) => setImporto(e.value ?? null)}
              mode="currency"
              currency="EUR"
              locale="it-IT"
              className="w-full"
            />
          </div>

          <div className="field">
            <Dropdown
              label="Conto"
              value={contoId}
              options={conti}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setContoId(e.value)}
              placeholder="Seleziona Conto"
              className="w-full"
            />
          </div>

          <div className="field">
            <label>Data</label>
            <Calendar
              value={data}
              onChange={(e) => setData(e.value as Date)}
              showIcon
              dateFormat="dd/mm/yy"
              className="w-full"
            />
          </div>

          <div className="field full-width">
            <InputText
              label="Descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder="Es: Spesa mensile"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateTransactionDialog;
