# ENERGOAUTONOMY

Інтернет-магазин енергообладнання (16 000+ товарів).

Каталог · кошик · Нова Пошта · Monobank / LiqPay / IBAN QR · післяплата.

Телефон: **+380 97 599 29 69**

## Deploy на Vercel

1. Import цей репозиторій на [vercel.com/new](https://vercel.com/new)
2. Framework: Other
3. Додайте Environment Variables (див. `.env.example`)
4. Deploy

## Ключі

| Змінна | Де взяти |
|--------|----------|
| `NOVA_POSHTA_API_KEY` | [my.novaposhta.ua](https://my.novaposhta.ua) → API |
| `MONO_TOKEN` | [web.monobank.ua](https://web.monobank.ua) |
| `SELLER_IBAN` / `SELLER_EDRPOU` / `SELLER_NAME` | Ваші реквізити |
| `PUBLIC_BASE_URL` | URL після деплою |

Без ключів працюють каталог і **післяплата**.
