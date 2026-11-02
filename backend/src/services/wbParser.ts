import axios from 'axios';
import * as cheerio from 'cheerio';

interface WBProductData {
  title: string;
  imageUrl: string;
  price?: string;
}

export class WBParser {
  /**
   * Извлекает ID товара из ссылки Wildberries
   */
  static extractProductId(url: string): string | null {
    const patterns = [
      /\/catalog\/(\d+)\/detail/,
      /\/(\d+)$/,
      /product\/(\d+)/,
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
   * Парсит данные товара через API Wildberries
   */
  static async parseProduct(url: string): Promise<WBProductData | null> {
    try {
      console.log('Parsing WB URL:', url);
      
      const productId = this.extractProductId(url);
      if (!productId) {
        console.error('Could not extract product ID from URL:', url);
        return null;
      }

      console.log('Extracted product ID:', productId);

      // Метод 1: Новый публичный API WB
      try {
        const apiData = await this.parseViaPublicAPI(productId);
        if (apiData) {
          console.log('Success via public API');
          return apiData;
        }
      } catch (error) {
        console.log('Public API failed, trying basket API...');
      }

      // Метод 2: Basket API (старый метод)
      try {
        const basketData = await this.parseViaBasketAPI(productId);
        if (basketData) {
          console.log('Success via basket API');
          return basketData;
        }
      } catch (error) {
        console.log('Basket API failed, trying page parsing...');
      }

      // Метод 3: Парсинг страницы напрямую
      return await this.parseProductPage(url);

    } catch (error) {
      console.error('Error parsing WB product:', error);
      return null;
    }
  }

  /**
   * Метод 1: Новый публичный API WB
   */
  private static async parseViaPublicAPI(productId: string): Promise<WBProductData | null> {
    const vol = productId.slice(0, -5);
    const part = productId.slice(0, -3);
    
    const urls = [
      `https://card.wb.ru/cards/v1/detail?appType=1&curr=rub&dest=-1257786&spp=30&nm=${productId}`,
      `https://card.wb.ru/cards/detail?appType=1&curr=rub&dest=-1257786&spp=30&nm=${productId}`,
    ];

    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
            'Accept': 'application/json',
          },
          timeout: 10000,
        });

        if (response.data?.data?.products?.[0]) {
          const product = response.data.data.products[0];
          const price = product.salePriceU || product.priceU || product.extended?.basicPriceU;
          
          return {
            title: product.name || 'Товар с Wildberries',
            imageUrl: this.buildImageUrl(productId, vol, part),
            price: price ? `${Math.floor(price / 100)} ₽` : undefined,
          };
        }
      } catch (error) {
        console.log(`Failed URL: ${url}`, error.message);
      }
    }

    return null;
  }

  /**
   * Метод 2: Basket API (старый метод)
   */
  private static async parseViaBasketAPI(productId: string): Promise<WBProductData | null> {
    const vol = productId.slice(0, -5);
    const part = productId.slice(0, -3);
    
    const basketUrls = [
      `https://basket-01.wbbasket.ru/vol${vol}/part${part}/${productId}/info/ru/card.json`,
      `https://basket-02.wbbasket.ru/vol${vol}/part${part}/${productId}/info/ru/card.json`,
      `https://basket-03.wbbasket.ru/vol${vol}/part${part}/${productId}/info/ru/card.json`,
    ];

    for (const apiUrl of basketUrls) {
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        });

        if (response.data?.imt_name || response.data?.name) {
          const product = response.data;
          return {
            title: product.imt_name || product.name || 'Товар с Wildberries',
            imageUrl: this.buildImageUrl(productId, vol, part),
            price: product.salePriceU ? `${Math.floor(product.salePriceU / 100)} ₽` : undefined,
          };
        }
      } catch (error) {
        console.log(`Failed basket URL: ${apiUrl}`);
      }
    }

    return null;
  }

  /**
   * Строит URL изображения товара
   */
  private static buildImageUrl(productId: string, vol?: string, part?: string): string {
    if (!vol) vol = productId.slice(0, -5);
    if (!part) part = productId.slice(0, -3);
    
    const imageFormats = [
      `https://basket-01.wbbasket.ru/vol${vol}/part${part}/${productId}/images/big/1.webp`,
      `https://basket-01.wbbasket.ru/vol${vol}/part${part}/${productId}/images/big/1.jpg`,
      `https://images.wbstatic.net/big/new/${vol}0000/${productId}-1.jpg`,
    ];
    
    return imageFormats[0]; // Возвращаем первый, если не работает - браузер попробует fallback
  }

  /**
   * Метод 3: Парсит страницу товара напрямую
   */
  private static async parseProductPage(url: string): Promise<WBProductData | null> {
    try {
      console.log('Trying to parse page directly:', url);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.wildberries.ru/',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      
      // Пробуем разные селекторы для названия
      let title = '';
      
      // Селектор из скриншота: h2.productTitle--ktP8Z
      title = $('h2[class*="productTitle"]').text().trim();
      
      if (!title) {
        title = $('h1[class*="productTitle"]').text().trim();
      }
      
      if (!title) {
        title = $('h1[data-link="text{:product^goodsName}"]').text().trim();
      }
      
      if (!title) {
        title = $('h1').first().text().trim();
      }
      
      if (!title) {
        title = $('.product-page__title').text().trim();
      }
      
      if (!title) {
        const ogTitle = $('meta[property="og:title"]').attr('content');
        if (ogTitle) {
          // Убираем " / купить в интернет магазине Wildberries" из конца
          title = ogTitle.replace(/\s*\/\s*купить.*$/i, '').trim();
        }
      }
      
      // Если всё еще нет названия, ищем в JSON на странице
      if (!title) {
        const scriptTags = $('script[type="application/ld+json"]');
        scriptTags.each((_, elem) => {
          try {
            const json = JSON.parse($(elem).html() || '{}');
            if (json.name) {
              title = json.name;
              return false; // break
            }
          } catch (e) {
            // ignore
          }
        });
      }
      
      const imageUrl = $('meta[property="og:image"]').attr('content') ||
                       $('img.photo-zoom__preview').attr('src') || 
                       $('.carousel__item img').first().attr('src') ||
                       '';

      const price = $('.price-block__final-price').text().trim() ||
                    $('.price__lower-price').text().trim();

      console.log('Parsed from page:', { title, imageUrl, price });

      if (title && title !== 'Товар с Wildberries' && title.length > 3) {
        const productId = this.extractProductId(url);
        const vol = productId ? productId.slice(0, -5) : '';
        const part = productId ? productId.slice(0, -3) : '';
        
        return {
          title,
          imageUrl: productId ? this.buildImageUrl(productId, vol, part) : (imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl),
          price: price || undefined,
        };
      }

      return null;

    } catch (error: any) {
      console.error('Error parsing WB page:', error.message);
      return null;
    }
  }
}
