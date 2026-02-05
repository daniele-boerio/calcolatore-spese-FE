import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { SelectButton } from "primereact/selectbutton";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import "./create_cat_tag_dialog.scss"; // Assicurati che lo stile sia coerente
import { useAppDispatch } from "../../../store/store";
import {
  createCategoria,
  createSottoCategorie,
} from "../../../features/categorie/api_calls";
import { createTag } from "../../../features/tags/api_calls";
import { useI18n } from "../../../i18n/use-i18n";

interface CreateCatTagDialogProps {
  visible: boolean;
  onHide: () => void;
  loading?: boolean;
}

export default function CreateCatTagDialog({
  visible,
  onHide,
  loading: externalLoading,
}: CreateCatTagDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Opzioni per il SelectButton
  const options = [
    { label: t("category"), value: "CATEGORY" },
    { label: t("tag"), value: "TAG" },
  ];

  const [type, setType] = useState("CATEGORY");
  const [nome, setNome] = useState("");
  const [subs, setSubs] = useState<{ nome: string }[]>([]);

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

    if (type === "TAG") {
      await dispatch(createTag({ nome: nome.trim() })).unwrap();
    } else {
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
  };

  return (
    <Dialog
      header={t("create_new")}
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
            label={t("save")}
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
            label={`${t("name")} ${type === "CATEGORY" ? t("category") : t("tag")}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={type === "CATEGORY" ? t("ex_grocery") : t("ex_urgent")}
            autoFocus
          />
        </div>

        {/* Mostra Sottocategorie solo se è selezionato CATEGORY */}
        {type === "CATEGORY" && (
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
}
