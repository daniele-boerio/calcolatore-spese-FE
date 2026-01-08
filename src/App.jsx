import { useSelector } from 'react-redux';
import AuthPage from './pages/AuthPage/AuthPage';
import HomePage from './pages/HomePage/HomePage';
import './App.scss';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="App">
      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <HomePage />
      )}
    </div>
  );
}

export default App;