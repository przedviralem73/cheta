# 📝 Инструкция по деплою на Render

## Шаг 1: Создай GitHub репозиторий

1. Зайди на [github.com/new](https://github.com/new)
2. Создай новый **публичный** репозиторий: `bot-lummic`
3. **НЕ** добавляй README, .gitignore (у нас уже есть)

## Шаг 2: Загрузи код на GitHub

Выполни в терминале:

```bash
cd /Users/daniilgolovac/front/bot-lummic

# Добавь свой GitHub репозиторий
git remote add origin https://github.com/YOUR_USERNAME/bot-lummic.git

# Отправь код
git push -u origin main
```

Замени `YOUR_USERNAME` на свой GitHub username!

## Шаг 3: Деплой на Render

1. **Зайди на** [render.com](https://render.com)
2. **Регистрация/Вход** через GitHub
3. Нажми **"New +"** → **"Blueprint"**
4. **Connect** свой репозиторий `bot-lummic`
5. Render найдёт файл `render.yaml` и автоматически создаст 2 сервиса

## Шаг 4: Дождись деплоя

Render автоматически:
- Создаст backend сервис (Node.js)
- Создаст frontend сервис (Static Site)
- Установит зависимости
- Соберёт проект

Это займёт **5-10 минут**.

## Шаг 5: Настрой переменные окружения

### Backend сервис:

1. Открой `bot-lummic-backend` в Render
2. Зайди в **Environment** вкладку
3. Проверь переменные:
   - `DATABASE_URL` = `file:./backend/prisma/dev.db`
   - `PORT` = `3000`
   - `NODE_ENV` = `production`

### Frontend сервис:

1. Открой `bot-lummic-frontend` в Render
2. Зайди в **Environment** вкладку
3. Добавь переменную:
   - `VITE_API_URL` = `https://bot-lummic-backend.onrender.com`
   
   ⚠️ Скопируй точный URL твоего backend из Render!

4. **Нажми "Manual Deploy" → "Clear build cache & deploy"**

## Шаг 6: Получи URL приложения

После успешного деплоя:

**Frontend URL:** `https://bot-lummic-frontend.onrender.com`

Это и есть ссылка на твой Telegram Web App!

## Шаг 7: Настрой Telegram бота

1. Открой [@BotFather](https://t.me/BotFather)
2. Отправь `/myapps`
3. Выбери своё приложение
4. **Edit Web App**
5. Вставь URL: `https://bot-lummic-frontend.onrender.com`

## ✅ Готово!

Теперь открой бота в Telegram и проверь!

---

## 🔧 Обновление приложения

После изменений в коде:

```bash
git add .
git commit -m "Описание изменений"
git push
```

Render автоматически задеплоит обновление!

---

## ⚠️ Важно

**Бесплатный план Render:**
- Сервисы засыпают после 15 минут неактивности
- Первый запрос после сна занимает 30-60 секунд
- Для production лучше использовать платный план ($7/мес)

**Если нужно быстрее:**
- Используй [Railway](https://railway.app) ($5 бесплатно каждый месяц)
- Или [Vercel](https://vercel.com) для frontend + отдельный хостинг для backend
