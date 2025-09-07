import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import api from './services/api';
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>PINOVARA</h1>
          <p>Sistema em desenvolvimento</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Home() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiMessage, setApiMessage] = useState<string>('');

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await api.get('/');
      setApiStatus('success');
      setApiMessage(response.data.message);
    } catch (error) {
      setApiStatus('error');
      setApiMessage('Erro ao conectar com a API');
      console.error('Erro na conexão:', error);
    }
  };

  return (
    <div className="home">
      <h2>Bem-vindo ao PINOVARA</h2>
      <p>Sistema completo back-end + front-end</p>
      <div className="status">
        <p>🔧 Back-end: {apiStatus === 'success' ? '✅ Conectado' : apiStatus === 'error' ? '❌ Erro' : '⏳ Testando...'}</p>
        <p>🎨 Front-end: ✅ Funcionando</p>
        <p>🗄️ Database: PostgreSQL configurado</p>
        {apiMessage && <p className="api-message">{apiMessage}</p>}
      </div>
    </div>
  )
}

export default App
