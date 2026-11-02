import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { coupleAPI } from '../services/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setCouple } = useStore();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await coupleAPI.create(user.id, user.firstName);
      setCouple(response.data.couple);
      navigate('/');
    } catch (error) {
      console.error('Error creating couple:', error);
      alert('Ошибка при создании пары');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode) return;

    setIsLoading(true);
    try {
      const response = await coupleAPI.join(inviteCode.toUpperCase(), user.id, user.firstName);
      setCouple(response.data.couple);
      navigate('/');
    } catch (error: any) {
      console.error('Error joining couple:', error);
      const errorMsg = error.response?.data?.error || 'Ошибка при присоединении';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {mode === 'choose' && (
          <div className="text-center">
            <span className="text-6xl mb-6 block">💑</span>
            <h1 className="text-3xl font-bold mb-2 text-white">чёта.</h1>
            

            <div className="space-y-3">
              <button
                onClick={() => setMode('create')}
                className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Создать пару
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full bg-black border border-gray-700 text-gray-300 py-3 px-6 rounded-lg font-medium hover:text-white hover:border-gray-500 transition-colors"
              >
                Присоединиться к паре
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-black border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Создать пару</h2>
            <p className="text-gray-500 mb-6">
              Вы получите уникальный инвайт-код, который нужно будет передать партнеру
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCreate}
                disabled={isLoading}
                className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Создаю...' : 'Создать'}
              </button>
              <button
                onClick={() => setMode('choose')}
                className="w-full bg-black border border-gray-700 text-gray-300 py-3 px-6 rounded-lg font-medium hover:text-white hover:border-gray-500"
              >
                Назад
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="bg-black border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Присоединиться к паре</h2>
            <p className="text-gray-500 mb-6">
              Введите инвайт-код, который вам передал партнер
            </p>

            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg text-center text-2xl font-mono tracking-wider focus:ring-2 focus:ring-white focus:border-transparent uppercase placeholder-gray-600"
                required
              />

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || inviteCode.length < 6}
                  className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Присоединяюсь...' : 'Присоединиться'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('choose')}
                  className="w-full bg-black border border-gray-700 text-gray-300 py-3 px-6 rounded-lg font-medium hover:text-white hover:border-gray-500"
                >
                  Назад
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
