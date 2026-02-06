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
import { useI18n } from "../../../i18n/use-i18n";

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

export default function UpdateCategoryDialog({
  visible,
  onHide,
  category,
  loading: externalLoading,
}: UpdateCategoryDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const [nome, setNome] = useState("");
  const [subs, setSubs] = useState<SubState[]>([]);
  const [subsToDelete, setSubsToDelete] = useState<string[]>([]);

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

    const promises: Promise<any>[] = [];

    if (nome.trim() !== category.nome) {
      promises.push(
        dispatch(
          updateCategoria({ id: category.id, nome: nome.trim() }),
        ).unwrap(),
      );
    }

    subsToDelete.forEach((subId) => {
      promises.push(
        dispatch(deleteSottoCategoria({ catId: category.id, subId })).unwrap(),
      );
    });

    subs.forEach((sub) => {
      if (sub.id) {
        const original = category.sottocategorie?.find((s) => s.id === sub.id);
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
  };

  return (
    <Dialog
      header={t("edit_category")}
      visible={visible}
      className="category-dialog"
      style={{ width: "90vw", maxWidth: "450px" }}
      onHide={onHide}
      footer={
        <div className="buttons-footer-dialog">
          <Button
            label={t("cancel")}
            className="reset-button"
            onClick={onHide}
          />
          <Button
            label={t("save_changes")}
            onClick={handleConfirm}
            loading={externalLoading}
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
            placeholder={t("category_placeholder")}
            autoFocus
          />
        </div>

        <div className="subcategories-section">
          <div className="section-header">
            <span>{t("subcategories_title")}</span>
          </div>

          <div className="subs-list">
            {subs.length === 0 && (
              <p className="empty-subs">{t("no_subcategories")}</p>
            )}

            {subs.map((sub, index) => (
              <div key={index} className="sub-input-group">
                <InputText
                  value={sub.nome}
                  onChange={(e) => handleSubChange(index, e.target.value)}
                  placeholder={t("subcategory_name_placeholder")}
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
              label={t("add_tag")}
              className="add-sub-btn p-button-text"
              onClick={handleAddSub}
              compact
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
