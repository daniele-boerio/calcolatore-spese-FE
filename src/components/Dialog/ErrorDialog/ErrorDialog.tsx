import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { hideError } from "../../../features/error/errorSlice";

export const ErrorDialog: React.FC = () => {
  const dispatch = useAppDispatch();

  // Grazie al setup di store.ts, lo stato 'error' è già tipizzato
  const { isOpen, message, title } = useAppSelector((state) => state.error);

  const onHide = () => {
    dispatch(hideError());
  };

  const footerContent = (
    <div>
      <Button
        label="Chiudi"
        icon="pi pi-check"
        onClick={onHide}
        autoFocus
        className="p-button-text"
      />
    </div>
  );

  return (
    <Dialog
      header={title || "Errore"} // Fallback se il titolo è vuoto
      visible={isOpen}
      style={{ width: "90vw", maxWidth: "450px" }}
      onHide={onHide}
      footer={footerContent}
      draggable={false}
      resizable={false}
    >
      <div className="flex align-items-center" style={{ gap: "1rem" }}>
        <i
          className="pi pi-exclamation-triangle"
          style={{ fontSize: "2.5rem", color: "var(--red-500)" }}
        ></i>
        <span style={{ lineHeight: "1.5" }}>{message}</span>
      </div>
    </Dialog>
  );
};
