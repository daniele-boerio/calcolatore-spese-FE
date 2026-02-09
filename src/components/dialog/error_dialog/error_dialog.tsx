import { Dialog } from "primereact/dialog";
import Button from "../../button/button";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { hideError } from "../../../features/error/error_slice";
import { useI18n } from "../../../i18n/use-i18n";

export default function ErrorDialog() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  // Grazie al setup di store.ts, lo stato 'error' è già tipizzato
  const { isOpen, message, title } = useAppSelector((state) => state.error);

  const onHide = () => {
    dispatch(hideError());
  };

  const footerContent = (
    <div>
      <Button
        label={t("close")}
        icon="pi pi-check"
        onClick={onHide}
        className="p-button-text"
      />
    </div>
  );

  return (
    <Dialog
      header={title || t("error")}
      visible={isOpen}
      style={{ width: "90vw", maxWidth: "28.125rem" }}
      onHide={onHide}
      footer={footerContent}
      draggable={false}
      resizable={false}
      closable={false}
    >
      <div>
        <span>{message}</span>
      </div>
    </Dialog>
  );
}
