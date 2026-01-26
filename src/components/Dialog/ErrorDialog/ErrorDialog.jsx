// components/ErrorDialog.tsx
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../store/store";
import { hideError } from "../store/errorSlice";

export function ErrorDialog() {
  const dispatch = useAppDispatch();
  const { isOpen, message, title } = useAppSelector((state) => state.error);

  return (
    <Dialog
      header={title}
      visible={isOpen}
      onHide={() => dispatch(hideError())}
      footer={<Button label="Chiudi" onClick={() => dispatch(hideError())} />}
    >
      <div className="flex align-items-center">
        <i
          className="pi pi-exclamation-triangle mr-3"
          style={{ fontSize: "2rem", color: "red" }}
        ></i>
        <span>{message}</span>
      </div>
    </Dialog>
  );
}
