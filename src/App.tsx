import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useStore } from './store/useStore';
import { coupleAPI } from './services/api';

// Pages
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Wishlist from './pages/Wishlist';
import Ideas from './pages/Ideas';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';

function App() {
  const { user, couple, setUser, setCouple } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Инициализация Telegram WebApp
    WebApp.ready();
    WebApp.expand();

    // Схема: черный, белый, серый
    document.documentElement.style.setProperty('--tg-theme-bg-color', '#000000');
    document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-hint-color', '#808080');
    document.documentElement.style.setProperty('--tg-theme-link-color', '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-button-color', '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', '#000000');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#000000');

    // Получаем данные пользователя из Telegram
    const initData = WebApp.initDataUnsafe;
    
    if (initData.user) {
      const telegramUser = {
        id: initData.user.id,
        firstName: initData.user.first_name,
        username: initData.user.username,
      };
      setUser(telegramUser);
      
      // Проверяем, есть ли у пользователя пара
      loadCouple(telegramUser.id);
    } else {
      // Для локальной разработки
      const mockUser = {
        id: Math.floor(Math.random() * 1000000),
        firstName: 'Тестовый пользователь',
      };
      setUser(mockUser);
      setIsLoading(false);
    }
  }, []);

  const loadCouple = async (userId: number) => {
    try {
      const response = await coupleAPI.getMe(userId);
      setCouple(response.data.couple);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error loading couple:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!couple ? (
          <>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Wishlist />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
