import { useSelector } from 'react-redux';
import AuthPage from './pages/AuthPage/AuthPage';
import ListaTransactions from './pages/ListaTransactions/ListaTransactions'; // Sposta qui il tuo vecchio codice di App.jsx
import './App.scss';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="App">
      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <ListaTransactions />
      )}
    </div>
  );
}

export default App;