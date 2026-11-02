# 💑 Bot Lummic - Telegram Web App для пар

Совместный вишлист для пар с парсингом товаров Wildberries.

## 🚀 Деплой на Render

### 1. Создай GitHub репозиторий

```bash
# Создай новый репозиторий на github.com
# Затем выполни:
git remote add origin https://github.com/YOUR_USERNAME/bot-lummic.git
git branch -M main
git push -u origin main
```

### 2. Деплой на Render

1. Зайди на [render.com](https://render.com) и зарегистрируйся
2. Нажми **"New" → "Blueprint"**
3. Подключи свой GitHub репозиторий
4. Render автоматически найдёт `render.yaml` и создаст 2 сервиса:
   - **bot-lummic-backend** (Node.js API)
   - **bot-lummic-frontend** (Static Site)

### 3. Настрой переменные окружения

После создания сервисов:

**Backend:**
- `DATABASE_URL` → `file:./backend/prisma/dev.db`
- `PORT` → `3000`
- `NODE_ENV` → `production`

**Frontend:**
- `VITE_API_URL` → `https://bot-lummic-backend.onrender.com` (URL твоего backend)

### 4. Обнови BotFather

После деплоя получишь URL вида:
- Frontend: `https://bot-lummic-frontend.onrender.com`

Укажи этот URL в BotFather для своего Telegram бота.

## 🛠️ Локальная разработка

```bash
# Установка зависимостей
npm install

# Генерация Prisma Client
npx prisma generate --schema=./backend/prisma/schema.prisma

# Применить миграции
npx prisma db push --schema=./backend/prisma/schema.prisma

# Запуск dev сервера (frontend + backend)
npm run dev
```

## 📦 Технологии

- **Frontend:** React + Vite + TypeScript + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite + Prisma
- **Deployment:** Render
