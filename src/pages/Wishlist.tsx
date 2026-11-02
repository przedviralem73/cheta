import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { wishlistAPI } from '../services/api';
import WishCard from '../components/WishCard';
import AddWishModal from '../components/AddWishModal';

export default function Wishlist() {
  const { couple, wishes, setWishes } = useStore();
  const [activeTab, setActiveTab] = useState<'wanted' | 'bought'>('wanted');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWishes();
  }, [couple, activeTab]);

  const loadWishes = async () => {
    if (!couple) return;

    setIsLoading(true);
    try {
      const response = await wishlistAPI.getAll(couple.id, activeTab);
      setWishes(response.data.wishes);
    } catch (error) {
      console.error('Error loading wishes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWishes = wishes.filter((wish) => wish.status === activeTab);

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
          
          {/* Tabs */}
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
