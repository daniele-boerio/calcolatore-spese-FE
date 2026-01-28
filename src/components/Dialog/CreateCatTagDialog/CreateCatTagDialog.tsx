import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { SelectButton } from "primereact/selectbutton";
import InputText from "../../InputText/InputText";
import Button from "../../Button/Button";
import "./CreateCatTagDialog.scss"; // Assicurati che lo stile sia coerente
import { useAppDispatch } from "../../../store/store";
import {
  createCategoria,
  createSottoCategorie,
} from "../../../features/categorie/apiCalls";
import { createTag } from "../../../features/tags/apiCalls";

interface CreateCatTagDialogProps {
  visible: boolean;
  onHide: () => void;
  loading?: boolean;
}

const CreateCatTagDialog: React.FC<CreateCatTagDialogProps> = ({
  visible,
  onHide,
  loading: externalLoading,
}) => {
  const dispatch = useAppDispatch();

  // Opzioni per il SelectButton
  const options = [
    { label: "Categoria", value: "CATEGORY" },
    { label: "Tag", value: "TAG" },
  ];

  const [type, setType] = useState("CATEGORY");
  const [nome, setNome] = useState("");
  const [subs, setSubs] = useState<{ nome: string }[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  // Reset dello stato alla chiusura/apertura
  useEffect(() => {
    if (!visible) {
      setNome("");
      setSubs([]);
      setType("CATEGORY");
    }
  }, [visible]);

  const handleAddSub = () => setSubs([...subs, { nome: "" }]);

  const handleSubChange = (index: number, value: string) => {
    const newSubs = [...subs];
    newSubs[index].nome = value;
    setSubs(newSubs);
  };

  const handleRemoveSub = (index: number) => {
    setSubs(subs.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!nome.trim()) return;
    setInternalLoading(true);

    try {
      if (type === "TAG") {
        // --- LOGICA CREAZIONE TAG ---
        await dispatch(createTag({ nome: nome.trim() })).unwrap();
      } else {
        // --- LOGICA CREAZIONE CATEGORIA + SOTTOCATEGORIE ---
        const newCat = await dispatch(
          createCategoria({ nome: nome.trim() }),
        ).unwrap();

        const newNames = subs
          .filter((s) => s.nome.trim() !== "")
          .map((s) => s.nome.trim());

        if (newNames.length > 0) {
          await dispatch(
            createSottoCategorie({
              id: newCat.id,
              nomeList: newNames.map((n) => ({ nome: n })),
            }),
          ).unwrap();
        }
      }
      onHide();
    } catch (error) {
      console.error("Errore durante la creazione:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      header="Crea Nuovo"
      visible={visible}
      className="category-dialog"
      style={{ width: "90vw", maxWidth: "450px" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button label="Annulla" className="reset-button" onClick={onHide} />
          <Button
            label="Crea"
            onClick={handleConfirm}
            loading={externalLoading || internalLoading}
            disabled={!nome.trim()}
          />
        </div>
      }
      draggable={false}
      resizable={false}
      closable={false}
    >
      <div className="category-settings-dialog-content">
        {/* Selettore Tipo */}
        <div className="selector-div">
          <SelectButton
            className="selector"
            value={type}
            options={options}
            onChange={(e) => setType(e.value || "CATEGORY")}
            unselectable={false}
          />
        </div>

        <div className="main-category-section">
          <InputText
            label={`Nome ${type === "CATEGORY" ? "Categoria" : "Tag"}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={type === "CATEGORY" ? "Es: Alimentari" : "Es: Urgente"}
            autoFocus
          />
        </div>

        {/* Mostra Sottocategorie solo se è selezionato CATEGORY */}
        {type === "CATEGORY" && (
          <div className="subcategories-section">
            <div className="section-header">
              <span>Sottocategorie (Tag interni)</span>
            </div>

            <div className="subs-list">
              {subs.length === 0 && (
                <p className="empty-subs">Nessuna sottocategoria aggiunta.</p>
              )}

              {subs.map((sub, index) => (
                <div key={index} className="sub-input-group">
                  <InputText
                    value={sub.nome}
                    onChange={(e) => handleSubChange(index, e.target.value)}
                    placeholder="Nome sottocategoria"
                  />
                  <Button
                    icon="pi pi-trash"
                    className="trasparent-danger-button"
                    onClick={() => handleRemoveSub(index)}
                    compact
                    rounded
                  />
                </div>
              ))}

              <Button
                icon="pi pi-plus"
                label="Aggiungi Sottocategoria"
                className="add-sub-btn p-button-text"
                onClick={handleAddSub}
                compact
              />
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default CreateCatTagDialog;
