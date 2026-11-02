import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { wishlistAPI } from '../services/api';
import { WBParserClient } from '../services/wbParserClient';

interface AddWishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddWishModal({ isOpen, onClose }: AddWishModalProps) {
  const { user, couple, addWish } = useStore();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFallbackIndex, setImageFallbackIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (url) {
      const productId = WBParserClient.extractProductId(url);
      if (productId) {
        const fallback = WBParserClient.createFallbackData(url);
        setImageUrl(fallback.imageUrl);
        setImageFallbackIndex(0);
        setImageLoading(true);
        setShowTitleInput(true);
      }
    } else {
      setShowTitleInput(false);
      setImageUrl('');
      setTitle('');
      setImageFallbackIndex(0);
      setImageLoading(false);
    }
  }, [url]);

  const handleImageError = () => {
    const productId = WBParserClient.extractProductId(url);
    if (productId) {
      const fallbacks = WBParserClient.getImageFallbacks(productId);
      const nextIndex = imageFallbackIndex + 1;
      
      if (nextIndex < fallbacks.length) {
        console.log(`Preview image failed, trying fallback ${nextIndex}:`, fallbacks[nextIndex]);
        setImageLoading(true);
        setImageUrl(fallbacks[nextIndex]);
        setImageFallbackIndex(nextIndex);
      } else {
        setImageLoading(false);
      }
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title || !user || !couple) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await wishlistAPI.addManual({
        title: title,
        imageUrl: imageUrl,
        link: url,
        coupleId: couple.id,
        userId: user.id,
        userName: user.firstName,
      });

      addWish(response.data.wish);
      handleClose();

    } catch (error: any) {
      console.error('Error adding wish:', error);
      setError('Ошибка при добавлении желания. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setTitle('');
    setImageUrl('');
    setImageFallbackIndex(0);
    setImageLoading(false);
    setShowTitleInput(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-gray-700 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Добавить желание</h2>
          <button 
            onClick={handleClose} 
            className="text-2xl text-gray-500 hover:text-white"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">
              Ссылка на товар Wildberries
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="https://www.wildberries.ru/catalog/..."
              className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-600"
              required
              disabled={isSubmitting}
            />
          </div>

          {showTitleInput && imageUrl && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-white">
                  Превью товара
                </label>
                <div className="relative w-full h-48 bg-black border border-gray-700 rounded-lg overflow-hidden">
                  {/* Skeleton loader */}
                  {imageLoading && (
                    <div className="absolute inset-0 bg-black animate-pulse flex items-center justify-center">
                      <div className="text-center">
                        <svg className="animate-spin h-10 w-10 text-gray-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xs text-gray-500">Загрузка изображения...</p>
                      </div>
                    </div>
                  )}
                  
                  <img
                    src={imageUrl}
                    alt="Превью товара"
                    className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {imageLoading ? 'Поиск изображения на серверах WB...' : 'Изображение загружено'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-white">
                  Название товара
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Смартфон iPhone 15 Pro 256GB"
                  className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-600"
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Скопируйте название с сайта WB
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {isSubmitting && (
            <div className="mb-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-sm text-gray-500 mt-2">Добавляю товар...</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !url || !title || imageLoading}
              className="flex-1 bg-white text-black py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Добавляю...' : 'Добавить'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-black border border-gray-700 text-gray-300 py-2 px-4 rounded-lg font-medium hover:text-white hover:border-gray-500 disabled:opacity-50"
            >
              Отмена
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
