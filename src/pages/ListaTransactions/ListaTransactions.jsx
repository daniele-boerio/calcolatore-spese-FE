import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTransaction } from '../../features/transaction/transactionSlice';

function ListaTransactions() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.transaction);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTransaction());
    }
  }, [status, dispatch]);

  return (
    <div>
      <h1>Calcolatore Spese</h1>
      {status === 'loading' && <p>Caricamento in corso...</p>}
      <ul>
        {items.map((spesa) => (
          <li key={spesa.id}>{spesa.descrizione}: {spesa.importo}€</li>
        ))}
      </ul>
    </div>
  );
}

export default ListaTransactions;