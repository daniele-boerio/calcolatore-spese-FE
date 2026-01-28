import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import InputText from "../../InputText/InputText";
import Button from "../../Button/Button";
import "./UpdateTagDialog.scss";
import { useAppDispatch } from "../../../store/store";
import { updateTag } from "../../../features/tags/apiCalls"; // Assicurati che l'API sia corretta
import { Tag } from "../../../features/tags/interfaces";

interface UpdateTagDialogProps {
  visible: boolean;
  onHide: () => void;
  tag: Tag; // Rinominato da category a tag per chiarezza
  loading?: boolean;
}

const UpdateTagDialog: React.FC<UpdateTagDialogProps> = ({
  visible,
  onHide,
  tag,
  loading: externalLoading,
}) => {
  const dispatch = useAppDispatch();
  const [nome, setNome] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);

  // Sincronizza lo stato locale con il tag passato quando la dialog si apre
  useEffect(() => {
    if (visible && tag) {
      setNome(tag.nome);
    }
  }, [visible, tag]);

  const handleConfirm = async () => {
    if (!nome.trim() || !tag.id) return;

    // Evita la chiamata se il nome non è cambiato
    if (nome.trim() === tag.nome) {
      onHide();
      return;
    }

    setInternalLoading(true);
    try {
      await dispatch(updateTag({ id: tag.id, nome: nome.trim() })).unwrap();

      onHide();
    } catch (error) {
      console.error("Errore durante la modifica del tag:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      header="Modifica Tag"
      visible={visible}
      className="category-dialog"
      style={{ width: "90vw", maxWidth: "400px" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button label="Annulla" className="reset-button" onClick={onHide} />
          <Button
            label="Salva Modifiche"
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
        <div className="main-category-section">
          <InputText
            label="Nome Tag"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Es: Urgente, Lavoro..."
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
};

export default UpdateTagDialog;
