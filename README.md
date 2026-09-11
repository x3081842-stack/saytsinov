# Sevgi sayti

React + Vite asosida tayyorlangan interaktiv romantik sahifa.

## Ishga tushirish

Node.js 18 yoki undan yangi versiya kerak.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Telegram sozlamalari

`.env.example` faylidan nusxa olib `.env.local` yarating va qiymatlarni kiriting:

```bash
VITE_TELEGRAM_BOT_TOKEN=bot_token
VITE_TELEGRAM_CHAT_ID=chat_id
VITE_ADMIN_PASSWORD=admin_parol
```

`.env.local` GitHubga yuborilmaydi. Vite `VITE_` o‘zgaruvchilarni brauzer bundle’iga qo‘shadi, shuning uchun Telegram bot tokeni frontendda to‘liq maxfiy bo‘lmaydi. Haqiqiy production xavfsizligi uchun Telegram yuborishni backend/serverless function orqali bajarish kerak.

## GitHubga yuklash

`node_modules/` va `dist/` yuklanmaydi. GitHubga quyidagilar yetarli:

- `src/`
- `public/`
- `index.html`
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `.env.example`

GitHub Actions, Vercel yoki Netlify kabi hostinglar `package.json` asosida dependency’larni o‘rnatib, `npm run build`ni ishga tushiradi. GitHub Pages ishlatilsa, repository secrets/environment variables ichida Telegram qiymatlarini sozlash kerak.