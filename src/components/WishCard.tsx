import { useState } from 'react';
import { useStore } from '../store/useStore';
import { wishlistAPI } from '../services/api';
import { WBParserClient } from '../services/wbParserClient';

interface WishCardProps {
  wish: {
    id: string;
    title: string;
    imageUrl: string;
    link: string;
    price?: string;
    status: 'wanted' | 'bought';
    createdBy: number;
    createdByName: string;
    boughtBy?: number;
    boughtByName?: string;
  };
}

export default function WishCard({ wish }: WishCardProps) {
  const { user, updateWish, removeWish } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(wish.imageUrl);
  const [imageFallbackIndex, setImageFallbackIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const handleToggleBought = async () => {
    if (!user) return;

    try {
      if (wish.status === 'wanted') {
        const response = await wishlistAPI.markBought(wish.id, user.id, user.firstName);
        updateWish(wish.id, response.data.wish);
      } else {
        const response = await wishlistAPI.markWanted(wish.id);
        updateWish(wish.id, response.data.wish);
      }
    } catch (error) {
      console.error('Error toggling wish status:', error);
      alert('Ошибка при изменении статуса');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить это желание?')) return;

    setIsDeleting(true);
    try {
      await wishlistAPI.delete(wish.id);
      removeWish(wish.id);
    } catch (error) {
      console.error('Error deleting wish:', error);
      alert('Ошибка при удалении');
      setIsDeleting(false);
    }
  };

  const handleImageError = () => {
    const productId = WBParserClient.extractProductId(wish.link);
    if (productId) {
      const fallbacks = WBParserClient.getImageFallbacks(productId);
      const nextIndex = imageFallbackIndex + 1;
      
      if (nextIndex < fallbacks.length) {
        setImageLoading(true);
        setCurrentImageUrl(fallbacks[nextIndex]);
        setImageFallbackIndex(nextIndex);
      } else {
        setImageLoading(false);
        setCurrentImageUrl('https://via.placeholder.com/400x300/000000/808080?text=Изображение+не+загрузилось');
      }
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={`bg-black rounded-lg overflow-hidden border border-gray-700 ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="relative">
        {/* Skeleton loader */}
        {imageLoading && (
          <div className="absolute inset-0 bg-black animate-pulse flex items-center justify-center">
            <div className="text-gray-500">
              <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        )}
        
        <img
          src={currentImageUrl}
          alt={wish.title}
          className={`w-full h-48 object-cover bg-black ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        
        {wish.status === 'bought' && (
          <div className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-full text-sm font-medium z-10">
            ✓ Куплено
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white">{wish.title}</h3>

        {wish.price && (
          <p className="text-white font-bold text-xl mb-2">{wish.price}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            Добавил(а): <span className="text-white font-medium">{wish.createdByName}</span>
          </span>
        </div>

        {wish.status === 'bought' && wish.boughtByName && (
          <div className="text-sm text-gray-500 mb-3">
            Купил(а): <span className="text-white">{wish.boughtByName}</span>
          </div>
        )}

        <div className="flex gap-2">
          <a
            href={wish.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white text-black py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
          >
            Открыть
          </a>

          <button
            onClick={handleToggleBought}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors border ${
              wish.status === 'wanted'
                ? 'bg-black text-white hover:bg-gray-900 border-gray-700'
                : 'bg-white text-black hover:bg-gray-200 border-white'
            }`}
          >
            {wish.status === 'wanted' ? 'Куплено' : 'Вернуть'}
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 border border-gray-700"
          >
            X
          </button>
        </div>
      </div>
    </div>
  );
}
