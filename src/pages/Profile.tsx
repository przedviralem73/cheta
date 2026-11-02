import { useStore } from '../store/useStore';
import { useState } from 'react';
import WebApp from '@twa-dev/sdk';

export default function Profile() {
  const { user, couple } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!couple) return;
    
    try {
      await navigator.clipboard.writeText(couple.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Генерация цвета аватарки по имени
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-orange-500',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Получение инициалов
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Компонент аватарки с фото или инициалами
  const Avatar = ({ name, photoUrl, size = 'md' }: { name: string; photoUrl?: string; size?: 'sm' | 'md' | 'lg' }) => {
    const [imageError, setImageError] = useState(false);
    
    const sizeClasses = {
      sm: 'w-12 h-12 text-lg',
      md: 'w-16 h-16 text-xl',
      lg: 'w-20 h-20 text-2xl',
    };

    // Если есть фото и оно не упало - показываем фото
    if (photoUrl && !imageError) {
      return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-lg border-4 border-white bg-gray-800`}>
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    // Fallback - инициалы с градиентом
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center shadow-lg border-4 border-white`}>
        <span className="text-white font-bold">{getInitials(name)}</span>
      </div>
    );
  };

  // Получаем фото текущего пользователя из Telegram
  const currentUserPhoto = WebApp.initDataUnsafe?.user?.photo_url;

  return (
    <div className="min-h-screen bg-black p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6 text-white">Профиль</h1>

      {/* Карточка пользователя */}
      <div className="bg-black border border-gray-700 rounded-lg p-6 mb-4">
        <div className="flex items-center gap-4">
          <Avatar 
            name={user?.firstName || 'User'} 
            photoUrl={currentUserPhoto}
            size="md" 
          />
          <div className="flex-1">
            <h2 className="font-semibold text-xl text-white mb-1">{user?.firstName}</h2>
            {user?.username && (
              <p className="text-sm text-gray-500">@{user.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Пара */}
      {couple && (
        <div className="bg-black border border-gray-700 rounded-lg p-6 mb-4">
          <h2 className="font-semibold text-lg text-white mb-4">Ваша пара</h2>
          
          {/* Аватарки пары */}
          <div className="flex items-center justify-center mb-6 relative">
            {/* Первый пользователь */}
            <div className="relative z-10">
              <Avatar 
                name={couple.user1Name} 
                photoUrl={String(couple.user1Id) === String(user?.id) ? currentUserPhoto : undefined}
                size="lg" 
              />
              <p className="text-xs text-center text-white mt-2 font-medium max-w-[80px] truncate">{couple.user1Name}</p>
            </div>

            {/* Сердечко между */}
            <div className="mx-6 text-4xl animate-pulse">❤️</div>

            {/* Второй пользователь */}
            {couple.user2Id && couple.user2Name ? (
              <div className="relative z-10">
                <Avatar 
                  name={couple.user2Name}
                  photoUrl={String(couple.user2Id) === String(user?.id) ? currentUserPhoto : undefined}
                  size="lg" 
                />
                <p className="text-xs text-center text-white mt-2 font-medium max-w-[80px] truncate">{couple.user2Name}</p>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-900 border-4 border-white border-dashed flex items-center justify-center shadow-lg">
                  <span className="text-gray-600 text-3xl">?</span>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">Ждём<br/>партнёра</p>
              </div>
            )}
          </div>

          {/* Инвайт код */}
          <div className="bg-black border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2 text-center">Инвайт-код:</p>
            <button
              onClick={handleCopyCode}
              className="w-full bg-black border-2 border-gray-700 rounded-lg py-3 px-4 hover:bg-gray-900 hover:border-gray-600 transition-all relative group"
            >
              <span className="font-mono text-3xl tracking-widest text-white font-bold">
                {couple.inviteCode}
              </span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-95 rounded-lg pointer-events-none">
                <span className="text-sm text-white font-medium">
                  {copied ? 'Скопировано!' : 'Нажми чтобы скопировать'}
                </span>
              </div>
            </button>
          </div>

          {!couple.user2Id && (
            <div className="mt-4 bg-black border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 text-center">
                Поделитесь инвайт-кодом с партнером, чтобы он мог присоединиться к вашему вишлисту
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
