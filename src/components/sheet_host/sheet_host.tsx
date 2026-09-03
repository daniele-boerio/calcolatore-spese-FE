import { lazy, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { closeSheet, selectActiveSheet } from "../../features/ui/ui_slice";

// Pesa quanto tutto il form di inserimento: resta fuori dal bundle iniziale.
const TransactionDialog = lazy(
  () => import("../dialog/transaction_dialog/transaction_dialog"),
);

/**
 * Punto unico di montaggio degli sheet globali. Il FAB della tab bar è
 * raggiungibile da ogni schermata, quindi il form di nuova transazione non può
 * più vivere dentro una pagina.
 */
export default function SheetHost() {
  const sheet = useAppSelector(selectActiveSheet);
  const dispatch = useAppDispatch();

  if (!sheet) return null;

  const hide = () => dispatch(closeSheet());

  switch (sheet.name) {
    case "newTransaction":
      return (
        <Suspense fallback={null}>
          <TransactionDialog visible onHide={hide} />
        </Suspense>
      );
    default:
      return null;
  }
}
