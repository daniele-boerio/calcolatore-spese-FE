import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import { Categoria } from "../../../features/categorie/interfaces";
import "./category_dialog.scss"; // Unifica i due file SCSS in uno
import { useAppDispatch } from "../../../store/store";
import {
  createCategoria,
  updateCategoria,
  updateSottoCategoria,
  createSottoCategorie,
  deleteSottoCategoria,
} from "../../../features/categorie/api_calls";
import { useI18n } from "../../../i18n/use-i18n";

interface CategoryDialogProps {
  visible: boolean;
  onHide: () => void;
  category?: Categoria | null; // Se presente, siamo in UPDATE
  loading?: boolean;
}

interface SubState {
  id?: string;
  nome: string;
}

export default function CategoryDialog({
  visible,
  onHide,
  category,
  loading: externalLoading,
}: CategoryDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const [nome, setNome] = useState("");
  const [subs, setSubs] = useState<SubState[]>([]);
  const [subsToDelete, setSubsToDelete] = useState<string[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  // Sincronizzazione dati: popola se EDIT, resetta se CREATE
  useEffect(() => {
    if (visible) {
      if (category) {
        setNome(category.nome);
        setSubs(
          category.sottocategorie?.map((s) => ({ id: s.id, nome: s.nome })) ||
            [],
        );
        setSubsToDelete([]);
      } else {
        setNome("");
        setSubs([]);
        setSubsToDelete([]);
      }
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
    if (!nome.trim()) return;
    setInternalLoading(true);

    try {
      let currentCatId = category?.id;

      // 1. GESTIONE CATEGORIA PADRE
      if (!currentCatId) {
        // Creazione nuova categoria
        const newCat = await dispatch(
          createCategoria({ nome: nome.trim() }),
        ).unwrap();
        currentCatId = newCat.id;
      } else if (nome.trim() !== category?.nome) {
        // Aggiornamento nome categoria esistente
        await dispatch(
          updateCategoria({ id: currentCatId, nome: nome.trim() }),
        ).unwrap();
      }

      // 2. GESTIONE SOTTOCATEGORIE (Solo se abbiamo un ID categoria)
      const promises: Promise<any>[] = [];

      // Eliminazione
      subsToDelete.forEach((subId) => {
        promises.push(
          dispatch(
            deleteSottoCategoria({ catId: currentCatId!, subId }),
          ).unwrap(),
        );
      });

      // Aggiornamento esistenti
      subs.forEach((sub) => {
        if (sub.id) {
          const original = category?.sottocategorie?.find(
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

      // Creazione nuove
      const newNames = subs
        .filter((s) => !s.id && s.nome.trim() !== "")
        .map((s) => ({ nome: s.nome.trim() }));

      if (newNames.length > 0) {
        promises.push(
          dispatch(
            createSottoCategorie({ id: currentCatId!, nomeList: newNames }),
          ).unwrap(),
        );
      }

      if (promises.length > 0) await Promise.all(promises);

      onHide();
    } catch (error) {
      console.error("Error saving category/subs:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      header={
        category ? t("edit_category") : `${t("create_new_f")} ${t("category")}`
      }
      visible={visible}
      className="dialog-custom category-dialog"
      style={{ width: "95vw", maxWidth: "40rem" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            className="action-button"
            label={category ? t("save_changes") : t("save")}
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
            label={t("category_name")}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={t("ex_grocery")}
            autoFocus
          />
        </div>

        <div className="subcategories-section">
          <div className="section-header">
            <span>{t("sub_categories")}</span>
          </div>

          <div className="subs-list">
            {subs.length === 0 && (
              <p className="empty-subs">{t("no_sub_categories")}</p>
            )}

            {subs.map((sub, index) => (
              <div key={index} className="sub-input-group">
                <InputText
                  value={sub.nome}
                  onChange={(e) => handleSubChange(index, e.target.value)}
                  placeholder={t("name_sub_categories")}
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
              className="action-button icon-button"
              onClick={handleAddSub}
              compact
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
