/**
 * Клиентский парсер Wildberries
 */

interface WBProductData {
  title: string;
  imageUrl: string;
  price?: string;
}

export class WBParserClient {
  /**
   * Извлекает ID товара из ссылки
   */
  static extractProductId(url: string): string | null {
    const patterns = [
      /\/catalog\/(\d+)\/detail/,
      /\/(\d+)$/,
      /product\/(\d+)/,
      /\/(\d+)\?/,
      /\/(\d+)\//,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Быстро проверяет какой basket сервер работает
   */
  static async findWorkingBasket(productId: string): Promise<string | null> {
    const vol = productId.slice(0, -5);
    const part = productId.slice(0, -3);
    
    // Самые популярные basket серверы (проверяем параллельно)
    const popularBaskets = [1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    
    const promises = popularBaskets.map(async (basket) => {
      const basketStr = basket.toString().padStart(2, '0');
      const url = `https://basket-${basketStr}.wbbasket.ru/vol${vol}/part${part}/${productId}/images/big/1.webp`;
      
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(2000) // 2 секунды таймаут
        });
        
        if (response.ok) {
          console.log(`✅ Found working basket: ${basketStr}`);
          return url;
        }
      } catch (error) {
        // Игнорируем ошибки
      }
      
      return null;
    });

    const results = await Promise.all(promises);
    const workingUrl = results.find(url => url !== null);
    
    return workingUrl || null;
  }

  /**
   * Строит URL изображения (оптимизированный список)
   */
  static buildImageUrls(productId: string): string[] {
    const vol = productId.slice(0, -5);
    const part = productId.slice(0, -3);
    
    // Приоритетный список basket серверов (самые популярные сначала)
    const priorityBaskets = [1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 6, 7, 8, 9, 19, 20];
    
    const urls = priorityBaskets.map(basket => {
      const basketStr = basket.toString().padStart(2, '0');
      return `https://basket-${basketStr}.wbbasket.ru/vol${vol}/part${part}/${productId}/images/big/1.webp`;
    });
    
    // Добавляем остальные basket серверы (21-99)
    for (let i = 21; i <= 99; i++) {
      const basketStr = i.toString().padStart(2, '0');
      urls.push(`https://basket-${basketStr}.wbbasket.ru/vol${vol}/part${part}/${productId}/images/big/1.webp`);
    }
    
    // Добавляем альтернативные CDN в конец
    urls.push(`https://images.wbstatic.net/big/new/${vol}0000/${productId}-1.jpg`);
    urls.push(`https://basket-01.wb.ru/vol${vol}/part${part}/${productId}/images/big/1.jpg`);
    
    console.log(`📦 Generated ${urls.length} image URL variants (priority baskets first)`);
    
    return urls;
  }

  /**
   * Парсит название товара из HTML через CORS proxy
   */
  static async parseTitleFromHTML(url: string): Promise<string | null> {
    // Удалено - не используется
    return null;
  }

  /**
   * Парсит товар
   */
  static async parseProduct(url: string): Promise<WBProductData | null> {
    // Удалено - не используется
    return null;
  }

  /**
   * Создает fallback данные с быстрым поиском картинки
   */
  static async createFallbackDataFast(url: string): Promise<WBProductData> {
    const productId = this.extractProductId(url);
    
    if (!productId) {
      return {
        title: '',
        imageUrl: '',
        price: undefined,
      };
    }
    
    // Быстро ищем рабочий basket
    const workingUrl = await this.findWorkingBasket(productId);
    
    if (workingUrl) {
      return {
        title: '',
        imageUrl: workingUrl,
        price: undefined,
      };
    }
    
    // Fallback на первый URL
    const imageUrls = this.buildImageUrls(productId);
    
    return {
      title: '',
      imageUrl: imageUrls[0],
      price: undefined,
    };
  }

  /**
   * Создает fallback данные
   */
  static createFallbackData(url: string): WBProductData {
    const productId = this.extractProductId(url);
    
    if (!productId) {
      return {
        title: '',
        imageUrl: '',
        price: undefined,
      };
    }
    
    const imageUrls = this.buildImageUrls(productId);
    
    return {
      title: '',
      imageUrl: imageUrls[0],
      price: undefined,
    };
  }

  /**
   * Получает все варианты URL для fallback в img.onerror
   */
  static getImageFallbacks(productId: string): string[] {
    return this.buildImageUrls(productId);
  }
}
