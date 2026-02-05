import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import InputText from "../../input_text/input_text";
import Button from "../../button/button";
import "./update_tag_dialog.scss";
import { useAppDispatch } from "../../../store/store";
import { updateTag } from "../../../features/tags/api_calls";
import { Tag } from "../../../features/tags/interfaces";
import { useI18n } from "../../../i18n/use-i18n";

interface UpdateTagDialogProps {
  visible: boolean;
  onHide: () => void;
  tag: Tag;
  loading?: boolean;
}

export default function UpdateTagDialog({
  visible,
  onHide,
  tag,
  loading: externalLoading,
}: UpdateTagDialogProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const [nome, setNome] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    if (visible && tag) {
      setNome(tag.nome);
    }
  }, [visible, tag]);

  const handleConfirm = async () => {
    if (!nome.trim() || !tag.id) return;

    if (nome.trim() === tag.nome) {
      onHide();
      return;
    }

    setInternalLoading(true);
    try {
      await dispatch(updateTag({ id: tag.id, nome: nome.trim() })).unwrap();
      onHide();
    } catch (error) {
      // L'errore viene ora gestito centralmente dal middleware/GlobalErrorDialog
      console.error("Error updating tag:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      header={t("edit_tag")}
      visible={visible}
      className="tag-dialog"
      style={{ width: "90vw", maxWidth: "400px" }}
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
            loading={externalLoading || internalLoading}
            disabled={!nome.trim()}
          />
        </div>
      }
      draggable={false}
      resizable={false}
      closable={false}
    >
      <div className="tag-settings-dialog-content">
        <div className="main-tag-section">
          <InputText
            label={t("tag_name")}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={t("tag_placeholder")}
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
}
