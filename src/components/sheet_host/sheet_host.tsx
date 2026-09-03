import { lazy, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { closeSheet, selectActiveSheet } from "../../features/ui/ui_slice";
import { selectTransactionTransactions } from "../../features/transactions/transaction_slice";

// Pesa quanto tutto il form di inserimento: resta fuori dal bundle iniziale.
const TransactionDialog = lazy(
  () => import("../dialog/transaction_dialog/transaction_dialog"),
);
const TransactionDetailSheet = lazy(
  () => import("../dialog/transaction_detail_sheet/transaction_detail_sheet"),
);
const FiltersSheet = lazy(() => import("../dialog/filters_sheet/filters_sheet"));

/**
 * Punto unico di montaggio degli sheet globali. Il FAB della tab bar è
 * raggiungibile da ogni schermata, quindi il form di nuova transazione non può
 * più vivere dentro una pagina.
 */
export default function SheetHost() {
  const sheet = useAppSelector(selectActiveSheet);
  const transactions = useAppSelector(selectTransactionTransactions);
  const dispatch = useAppDispatch();

  if (!sheet) return null;

  const hide = () => dispatch(closeSheet());

  // Gli sheet ricevono il movimento, non il suo id: così restano componenti di
  // presentazione e la ricerca sta qui, dove la lista è già in memoria.
  const find = (id: string) =>
    transactions.find((transaction) => String(transaction.id) === String(id));

  switch (sheet.name) {
    case "newTransaction":
      return (
        <Suspense fallback={null}>
          <TransactionDialog
            visible
            onHide={hide}
            transaction={
              sheet.transactionId ? find(sheet.transactionId) : undefined
            }
          />
        </Suspense>
      );

    case "transactionDetail": {
      const transaction = find(sheet.transactionId);

      // La riga può essere sparita sotto allo sheet (eliminata altrove, o
      // filtrata via da un refetch): senza dato non c'è dettaglio da mostrare.
      if (!transaction) return null;

      return (
        <Suspense fallback={null}>
          <TransactionDetailSheet
            visible
            onHide={hide}
            transaction={transaction}
          />
        </Suspense>
      );
    }

    case "filters":
      return (
        <Suspense fallback={null}>
          <FiltersSheet visible onHide={hide} />
        </Suspense>
      );

    default:
      return null;
  }
}
