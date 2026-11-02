import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { wishlistAPI } from '../services/api';
import WishCard from '../components/WishCard';
import AddWishModal from '../components/AddWishModal';
import WebApp from '@twa-dev/sdk';

export default function Wishlist() {
  const { couple, wishes, setWishes } = useStore();
  const [activeTab, setActiveTab] = useState<'wanted' | 'bought'>('wanted');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'partner'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = WebApp.initDataUnsafe.user?.id;

  useEffect(() => {
    loadWishes();
  }, [couple, activeTab]);

  const loadWishes = async () => {
    if (!couple) return;

    setIsLoading(true);
    try {
      const response = await wishlistAPI.getAll(couple.id, activeTab);
      const loadedWishes = response.data.wishes;
      
      // Временная отладка
      console.log('Current user ID:', currentUserId);
      console.log('Loaded wishes:', loadedWishes.map((w: any) => ({ 
        title: w.title, 
        createdBy: w.createdBy, 
        createdByName: w.createdByName 
      })));
      
      setWishes(loadedWishes);
    } catch (error) {
      console.error('Error loading wishes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWishes = wishes
    .filter((wish) => wish.status === activeTab)
    .filter((wish) => {
      if (ownerFilter === 'all') return true;
      
      // Приводим оба значения к числу для надежного сравнения
      const wishCreatorId = Number(wish.createdBy);
      const userId = Number(currentUserId);
      
      if (ownerFilter === 'mine') return wishCreatorId === userId;
      if (ownerFilter === 'partner') return wishCreatorId !== userId;
      return true;
    });

  if (!couple) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-gray-700 z-10">
        <div className="px-4 py-3">
          <h1 className="text-2xl font-bold text-white mb-3">Вишлист</h1>
          
          {/* Status Tabs (Хочу / Куплено) */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('wanted')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors border ${
                activeTab === 'wanted'
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-gray-500 border-gray-700'
              }`}
            >
              Хочу
            </button>
            <button
              onClick={() => setActiveTab('bought')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors border ${
                activeTab === 'bought'
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-gray-500 border-gray-700'
              }`}
            >
              Куплено
            </button>
          </div>

          {/* Owner Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setOwnerFilter('all')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                ownerFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-black text-gray-600'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setOwnerFilter('mine')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                ownerFilter === 'mine'
                  ? 'bg-gray-800 text-white'
                  : 'bg-black text-gray-600'
              }`}
            >
              Мои
            </button>
            <button
              onClick={() => setOwnerFilter('partner')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                ownerFilter === 'partner'
                  ? 'bg-gray-800 text-white'
                  : 'bg-black text-gray-600'
              }`}
            >
              Половинки
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-20">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Загрузка...</p>
          </div>
        ) : filteredWishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              {activeTab === 'wanted' ? 'Пока нет желаний' : 'Пока ничего не куплено'}
            </p>
            {activeTab === 'wanted' && (
              <p className="text-gray-600 text-sm">
                Добавьте первое желание, нажав на кнопку ниже
              </p>
            )}
          </div>
        ) : (
          filteredWishes.map((wish) => <WishCard key={wish.id} wish={wish} />)
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-white text-black rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform z-20"
      >
        +
      </button>

      <AddWishModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
