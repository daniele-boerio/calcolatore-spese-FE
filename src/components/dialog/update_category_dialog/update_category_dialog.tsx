import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import { Categoria } from "../../../features/categorie/interfaces";
import "./update_category_dialog.scss";
import { useAppDispatch } from "../../../store/store";
import {
  updateCategoria,
  updateSottoCategoria,
  createSottoCategorie,
  deleteSottoCategoria,
} from "../../../features/categorie/api_calls";

interface UpdateCategoryDialogProps {
  visible: boolean;
  onHide: () => void;
  category: Categoria;
  loading?: boolean;
}

interface SubState {
  id?: string;
  nome: string;
}

const UpdateCategoryDialog: React.FC<UpdateCategoryDialogProps> = ({
  visible,
  onHide,
  category,
  loading: externalLoading,
}) => {
  const dispatch = useAppDispatch();
  const [nome, setNome] = useState("");
  const [subs, setSubs] = useState<SubState[]>([]);
  const [subsToDelete, setSubsToDelete] = useState<string[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    if (visible && category) {
      setNome(category.nome);
      setSubs(
        category.sottocategorie?.map((s) => ({ id: s.id, nome: s.nome })) || [],
      );
      setSubsToDelete([]);
    }
  }, [visible, category]);

  const handleAddSub = () => setSubs([...subs, { nome: "" }]);

  const handleSubChange = (index: number, value: string) => {
    const newSubs = [...subs];
    newSubs[index].nome = value;
    setSubs(newSubs);
  };

  const handleRemoveSub = (index: number) => {
    const subToRemove = subs[index];
    if (subToRemove.id) {
      setSubsToDelete((prev) => [...prev, subToRemove.id!]);
    }
    setSubs(subs.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!nome.trim() || !category.id) return;

    setInternalLoading(true);
    const promises: Promise<any>[] = [];

    try {
      // 1. Update Categoria principale se il nome è cambiato
      if (nome.trim() !== category.nome) {
        promises.push(
          dispatch(
            updateCategoria({ id: category.id, nome: nome.trim() }),
          ).unwrap(),
        );
      }

      // 2. Eliminazione sottocategorie rimosse
      subsToDelete.forEach((subId) => {
        promises.push(
          dispatch(
            deleteSottoCategoria({ catId: category.id, subId }),
          ).unwrap(),
        );
      });

      // 3. Update sottocategorie esistenti modificate
      subs.forEach((sub) => {
        if (sub.id) {
          const original = category.sottocategorie?.find(
            (s) => s.id === sub.id,
          );
          if (
            original &&
            sub.nome.trim() !== original.nome &&
            sub.nome.trim() !== ""
          ) {
            promises.push(
              dispatch(
                updateSottoCategoria({ id: sub.id, nome: sub.nome.trim() }),
              ).unwrap(),
            );
          }
        }
      });

      // 4. Creazione nuove sottocategorie aggiunte (quelle senza ID)
      const newNames = subs
        .filter((s) => !s.id && s.nome.trim() !== "")
        .map((s) => s.nome.trim());

      if (newNames.length > 0) {
        promises.push(
          dispatch(
            createSottoCategorie({
              id: category.id,
              nomeList: newNames.map((n) => ({ nome: n })),
            }),
          ).unwrap(),
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      onHide();
    } catch (error) {
      console.error("Errore durante la modifica:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      header="Modifica Categoria"
      visible={visible}
      className="category-dialog"
      style={{ width: "90vw", maxWidth: "450px" }}
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
            label="Nome Categoria"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Es: Alimentari"
            autoFocus
          />
        </div>

        <div className="subcategories-section">
          <div className="section-header">
            <span>Sottocategorie (Tag)</span>
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
              label="Aggiungi Tag"
              className="add-sub-btn p-button-text"
              onClick={handleAddSub}
              compact
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default UpdateCategoryDialog;
