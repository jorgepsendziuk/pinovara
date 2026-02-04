import { useState } from 'react';
import api from '../../services/api';

export default function SyncODKFamilias() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const response = await api.post('/supervisao-ocupacional/familias/sync', {
        instanceIds: [] // Sincronizar todos
      });
      
      if (response.data.success) {
        setMessage('Sincronização iniciada com sucesso!');
      }
    } catch (err: any) {
      setMessage(`Erro: ${err.response?.data?.error || 'Erro ao sincronizar'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Sincronizar Famílias do ODK</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-4 text-gray-600">
          Sincronize os cadastros de famílias coletados via aplicativo ODK Collect.
        </p>

        <button
          onClick={handleSync}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sincronizando...' : 'Sincronizar do ODK'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
