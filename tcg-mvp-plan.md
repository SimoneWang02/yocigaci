# TCG Ecommerce MVP - Piano per Claude Code

> Riferimento visivo: [jpycollectibles.com](https://jpycollectibles.com/)
> Stack: **React (Vite + TailwindCSS)** + **Laravel 11 (API REST)** + **Stripe** + **MySQL**
> Obiettivo MVP: ecommerce funzionante con catalogo, carrello, checkout, preordini e backoffice base.

---

## Contesto di dominio

Il negozio vende prodotti TCG (Trading Card Game) fisici:

- **Giochi supportati**: Pokémon, Magic: The Gathering, One Piece, Riftbound
- **Tipologie prodotto**: Booster Box, Display, Collezioni speciali, Accessori
- **Carte singole**: non vendute direttamente - link esterno a CardTrader (si apre in nuova tab)
- **Feature critica**: i preordini - prodotti annunciati non ancora disponibili, pagati in anticipo
- **Volumi**: 1–5 ordini/giorno, catalogo stimato 50–200 prodotti attivi

---

## FASE 1 - Backend Laravel

### 1.1 Setup iniziale

```bash
composer create-project laravel/laravel
composer require laravel/sanctum stripe/stripe-php
php artisan install:api
```

Configurare `.env`:

```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 1.2 Schema del database

Creare le migration nell'ordine seguente:

---

#### `games`

| campo          | tipo                 | note                                 |
| -------------- | -------------------- | ------------------------------------ |
| id             | bigint PK            |                                      |
| name           | string               | es. "Pokémon"                        |
| slug           | string unique        | es. "pokemon"                        |
| navbar_columns | tinyint default 1    | colonne del dropdown in navbar (1–4) |
| is_active      | boolean default true |                                      |
| sort_order     | integer default 0    | ordine in navbar                     |

---

#### `categories`

| campo      | tipo                 | note                |
| ---------- | -------------------- | ------------------- |
| id         | bigint PK            |                     |
| game_id    | FK games             |                     |
| name       | string               | es. "Booster Box"   |
| slug       | string unique        |                     |
| is_active  | boolean default true |                     |
| sort_order | integer default 0    | ordine nel dropdown |

---

#### `products`

| campo                 | tipo                  | note                          |
| --------------------- | --------------------- | ----------------------------- |
| id                    | bigint PK             |                               |
| game_id               | FK games              |                               |
| category_id           | FK categories         |                               |
| name                  | string                | es. "OP15 Display 24 Bustine" |
| slug                  | string unique         | per URL                       |
| description           | text nullable         |                               |
| price                 | decimal(10,2)         | prezzo di vendita             |
| stock                 | integer default 0     | 0 = esaurito                  |
| is_preorder           | boolean default false |                               |
| preorder_release_date | date nullable         | data uscita prevista          |
| preorder_note         | string nullable       | es. "Spedizione marzo 2025"   |
| is_active             | boolean default true  |                               |
| sort_order            | integer default 0     | ordine manuale                |
| timestamps            |                       |                               |

---

#### `product_images`

| campo      | tipo        | note                                       |
| ---------- | ----------- | ------------------------------------------ |
| id         | bigint PK   |                                            |
| product_id | FK products |                                            |
| path       | string      | path storage                               |
| sort_order | integer     | immagine principale = sort_order più basso |

---

#### `users`

Usare la migration default di Laravel + aggiungere:
| campo | tipo | note |
|---|---|---|
| phone | string nullable | |
| stripe_customer_id | string nullable | |

---

#### `addresses`

| campo         | tipo                | note |
| ------------- | ------------------- | ---- |
| id            | bigint PK           |      |
| user_id       | FK users            |      |
| full_name     | string              |      |
| address_line1 | string              |      |
| address_line2 | string nullable     |      |
| city          | string              |      |
| postal_code   | string              |      |
| province      | string              |      |
| country       | string default 'IT' |      |
| is_default    | boolean             |      |

---

#### `orders`

| campo                    | tipo               | note                   |
| ------------------------ | ------------------ | ---------------------- |
| id                       | bigint PK          |                        |
| order_number             | string unique      | es. "ORD-2025-0042"    |
| user_id                  | FK users nullable  | guest checkout         |
| status                   | enum               | vedi sotto             |
| type                     | enum               | `standard`, `preorder` |
| subtotal                 | decimal(10,2)      |                        |
| shipping_cost            | decimal(10,2)      |                        |
| total                    | decimal(10,2)      |                        |
| shipping_address         | json               | snapshot indirizzo     |
| notes                    | text nullable      | note cliente           |
| stripe_payment_intent_id | string nullable    |                        |
| stripe_payment_status    | string nullable    |                        |
| shipped_at               | timestamp nullable |                        |
| tracking_code            | string nullable    |                        |
| timestamps               |                    |                        |

**Status ordine:**

- `pending` - creato, pagamento non confermato
- `paid` - pagamento confermato
- `processing` - in preparazione
- `shipped` - spedito
- `delivered` - consegnato
- `cancelled` - annullato
- `refunded` - rimborsato

**Status extra per preordini:**

- `preorder_confirmed` - preordine confermato, in attesa merce
- `preorder_ready` - merce arrivata, pronto per la spedizione

---

#### `order_items`

| campo            | tipo          | note                                       |
| ---------------- | ------------- | ------------------------------------------ |
| id               | bigint PK     |                                            |
| order_id         | FK orders     |                                            |
| product_id       | FK products   |                                            |
| product_snapshot | json          | snapshot prodotto al momento dell'acquisto |
| quantity         | integer       |                                            |
| unit_price       | decimal(10,2) |                                            |
| total_price      | decimal(10,2) |                                            |

---

### 1.3 Models e relazioni

```php
// Product.php
class Product extends Model {
    protected $casts = [
        'is_preorder' => 'boolean',
        'is_active' => 'boolean',
        'preorder_release_date' => 'date',
    ];

    public function game(): BelongsTo { ... }
    public function category(): BelongsTo { ... }
    public function images(): HasMany { ... }
    public function primaryImage(): HasOne {
        return $this->hasOne(ProductImage::class)->orderBy('sort_order');
    }

    public function scopeActive($q) { return $q->where('is_active', true); }
    public function scopeInStock($q) { return $q->where('stock', '>', 0); }
    public function scopePreorders($q) { return $q->where('is_preorder', true); }
    public function scopeByGame($q, $gameSlug) {
        return $q->whereHas('game', fn($g) => $g->where('slug', $gameSlug));
    }
    public function scopeByCategory($q, $categorySlug) {
        return $q->whereHas('category', fn($c) => $c->where('slug', $categorySlug));
    }
}

// Game.php
class Game extends Model {
    public function categories(): HasMany { ... }
    public function products(): HasMany { ... }
}

// Category.php
class Category extends Model {
    public function game(): BelongsTo { ... }
    public function products(): HasMany { ... }
}

// Order.php
class Order extends Model {
    protected $casts = ['shipping_address' => 'array'];
    public function items(): HasMany { ... }
    public function user(): BelongsTo { ... }

    protected static function booted() {
        static::creating(function ($order) {
            $order->order_number = 'ORD-' . date('Y') . '-' . str_pad(
                Order::whereYear('created_at', date('Y'))->count() + 1, 4, '0', STR_PAD_LEFT
            );
        });
    }
}
```

---

### 1.4 API Routes

```php
// routes/api.php

// Pubbliche
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Checkout
Route::post('/checkout/create-intent', [CheckoutController::class, 'createIntent']);
Route::post('/checkout/confirm', [CheckoutController::class, 'confirm']);
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// Autenticate
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::apiResource('/addresses', AddressController::class);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
});

// Admin
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('/games', Admin\GameController::class);
    Route::apiResource('/categories', Admin\CategoryController::class);
    Route::apiResource('/products', Admin\ProductController::class);
    Route::post('/products/{id}/images', [Admin\ProductController::class, 'uploadImage']);
    Route::patch('/products/{id}/images/reorder', [Admin\ProductController::class, 'reorderImages']);
    Route::get('/orders', [Admin\OrderController::class, 'index']);
    Route::patch('/orders/{id}/status', [Admin\OrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/tracking', [Admin\OrderController::class, 'addTracking']);
});
```

---

### 1.5 ProductController - logica di listing

```php
public function index(Request $request) {
    $query = Product::active()->with(['primaryImage', 'game', 'category']);

    // Filtri
    if ($request->game)     $query->byGame($request->game);
    if ($request->category) $query->byCategory($request->category);
    if ($request->preorder) $query->preorders();
    if ($request->search)   $query->where('name', 'like', "%{$request->search}%");

    // Ordinamento
    $sort = $request->sort ?? 'sort_order';
    $query->orderBy(match($sort) {
        'price_asc'  => 'price',
        'price_desc' => 'price',
        'newest'     => 'created_at',
        default      => 'sort_order',
    }, str_ends_with($sort, 'desc') ? 'desc' : 'asc');

    return ProductResource::collection($query->paginate(24));
}
```

---

### 1.6 Checkout flow con Stripe

```php
// CheckoutController.php

public function createIntent(Request $request) {
    // Validare i prodotti e le quantità
    $items = $this->validateCartItems($request->items);

    // Calcolare totale
    $subtotal = collect($items)->sum(fn($i) => $i['price'] * $i['quantity']);
    $shipping = $subtotal >= 60 ? 0 : 5.90; // spedizione gratuita sopra 60€
    $total = $subtotal + $shipping;

    // Creare PaymentIntent su Stripe
    $intent = \Stripe\PaymentIntent::create([
        'amount'   => (int)($total * 100), // in centesimi
        'currency' => 'eur',
        'metadata' => ['cart' => json_encode($items)],
    ]);

    return response()->json([
        'client_secret' => $intent->client_secret,
        'subtotal' => $subtotal,
        'shipping' => $shipping,
        'total'    => $total,
    ]);
}

public function confirm(Request $request) {
    // Verificare il PaymentIntent con Stripe
    // Creare l'ordine nel DB
    // Decrementare lo stock
    // Inviare email di conferma
    // Restituire order_number
}
```

**Webhook Stripe** - gestire almeno questi eventi:

- `payment_intent.succeeded` -> aggiornare ordine a `paid`
- `payment_intent.payment_failed` -> aggiornare ordine a `pending` + notifica
- `charge.refunded` -> aggiornare ordine a `refunded`

---

### 1.7 Gestione immagini

Usare Laravel Storage con disco `public`. Per il MVP, lo storage locale va bene. In produzione, migrare su S3 o simile cambiando solo la config del disco.

```php
// Upload immagine prodotto (admin)
public function uploadImage(Request $request, Product $product) {
    $path = $request->file('image')->store('products', 'public');
    $product->images()->create([
        'path' => $path,
        'is_primary' => $product->images()->count() === 0,
    ]);
    return response()->json(['url' => Storage::url($path)]);
}
```

---

## FASE 2 - Frontend React

### 2.1 Setup

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install tailwindcss @tailwindcss/vite
npm install axios react-router-dom @stripe/react-stripe-js @stripe/stripe-js
npm install zustand                  # state management carrello + auth
npm install react-query              # data fetching e cache
npm install react-hook-form zod      # form validation
```

### 2.2 Struttura cartelle

```
src/
├── api/              # funzioni axios per ogni endpoint
│   ├── products.js
│   ├── orders.js
│   ├── auth.js
│   └── checkout.js
├── components/
│   ├── ui/           # componenti base (Button, Badge, Input, Modal...)
│   ├── product/      # ProductCard, ProductGrid, ProductFilters
│   ├── cart/         # CartDrawer, CartItem, CartSummary
│   ├── checkout/     # CheckoutForm, AddressForm, PaymentForm
│   └── layout/       # Header, Footer, Nav
├── pages/
│   ├── Home.jsx
│   ├── Catalog.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── OrderConfirmation.jsx
│   ├── account/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Orders.jsx
│   │   └── OrderDetail.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       ├── Products.jsx
│       ├── ProductForm.jsx
│       └── Orders.jsx
├── store/
│   ├── cartStore.js   # zustand: items, addItem, removeItem, clear
│   └── authStore.js   # zustand: user, token, login, logout
└── hooks/
    ├── useProducts.js
    ├── useCart.js
    └── useAuth.js
```

---

### 2.3 Routing

```jsx
// App.jsx
<Routes>
    {/* Pubbliche */}
    <Route path="/" element={<Home />} />
    <Route path="/catalogo" element={<Catalog />} />
    <Route path="/prodotti/:slug" element={<ProductDetail />} />
    <Route path="/carrello" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route
        path="/ordine-confermato/:orderNumber"
        element={<OrderConfirmation />}
    />

    {/* Auth */}
    <Route path="/login" element={<Login />} />
    <Route path="/registrati" element={<Register />} />

    {/* Area cliente (protetta) */}
    <Route
        path="/account"
        element={
            <ProtectedRoute>
                <AccountLayout />
            </ProtectedRoute>
        }
    >
        <Route path="ordini" element={<Orders />} />
        <Route path="ordini/:orderNumber" element={<OrderDetail />} />
    </Route>

    {/* Admin (protetta + ruolo admin) */}
    <Route
        path="/admin"
        element={
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        }
    >
        <Route path="giochi" element={<AdminGames />} />
        <Route path="categorie" element={<AdminCategories />} />
        <Route path="prodotti" element={<AdminProducts />} />
        <Route path="prodotti/nuovo" element={<ProductForm />} />
        <Route path="prodotti/:id/modifica" element={<ProductForm />} />
        <Route path="ordini" element={<AdminOrders />} />
    </Route>
</Routes>
```

> **Carte singole**: nel menu di navigazione inserire una voce "Carte Singole" come link esterno a CardTrader (`target="_blank" rel="noopener noreferrer"`). Nessuna route interna.

---

### 2.4 Carrello - Zustand store

```js
// store/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existing = items.find((i) => i.id === product.id);
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.id === product.id
                                ? { ...i, quantity: i.quantity + quantity }
                                : i,
                        ),
                    });
                } else {
                    set({ items: [...items, { ...product, quantity }] });
                }
            },

            removeItem: (productId) =>
                set({ items: get().items.filter((i) => i.id !== productId) }),

            updateQuantity: (productId, quantity) =>
                set({
                    items: get().items.map((i) =>
                        i.id === productId ? { ...i, quantity } : i,
                    ),
                }),

            clear: () => set({ items: [] }),

            get total() {
                return get().items.reduce(
                    (sum, i) => sum + i.price * i.quantity,
                    0,
                );
            },
            get count() {
                return get().items.reduce((sum, i) => sum + i.quantity, 0);
            },
        }),
        { name: "cart-storage" }, // persiste in localStorage
    ),
);
```

---

### 2.5 Componenti chiave da implementare

#### `ProductCard`

- Immagine con hover (seconda immagine se disponibile, come jpycollectibles)
- Badge "Preordine" se `is_preorder: true` (colore distinto, es. arancione)
- Badge "Esaurito" se `stock === 0`
- Prezzo + prezzo barrato se `compare_price` presente
- Bottone "Aggiungi al carrello" / "Preordina" / "Esaurito"
- Data uscita prevista se preordine

#### `ProductFilters` (sidebar o top bar)

- Filtro per gioco: Pokémon | MTG | One Piece | Riftbound
- Filtro per categoria: Booster Box | Display | Collezione | Accessorio
- Toggle "Solo preordini"
- Ordinamento: Rilevanza | Prezzo su | Prezzo giu | Più recenti
- I filtri attivi vanno nei query params URL (per condivisibilità del link)

#### `CartDrawer`

- Slide-over laterale (non pagina separata)
- Lista prodotti con quantità modificabile
- Subtotale e messaggio spedizione gratuita ("Aggiungi X€ per spedizione gratuita")
- CTA checkout

#### `CheckoutForm`

- Step 1: indirizzo di spedizione (con autocompile se loggato)
- Step 2: riepilogo + pagamento (Stripe Elements)
- Nota per i preordini: banner visibile "Questo ordine contiene preordini - spedizione prevista [data]"

---

### 2.6 Pagina Home - sezioni

Ispirata a jpycollectibles, nell'ordine:

1. **Hero slider** - banner promozionali (editabile dal backoffice)
2. **Ultime uscite** - grid orizzontale scrollabile, prodotti con `sort_order` più alto
3. **Preordini aperti** - sezione dedicata, card con countdown alla release date
4. **Per gioco** - sezione Pokémon / One Piece / MTG / Riftbound con link alla collection
5. **Carte singole** - banner/sezione con CTA "Trova le tue carte su CardTrader ->" (link esterno, `target="_blank"`)

---

## FASE 3 - Backoffice Admin

### Pagina Giochi (`/admin/giochi`)

- Tabella: nome, slug, colonne navbar, stato, ordine
- Azioni: modifica, riordina (drag), attiva/disattiva
- Bottone "Nuovo gioco"

### Pagina Categorie (`/admin/categorie`)

- Tabella: nome, gioco di appartenenza, stato, ordine
- Filtro per gioco
- Azioni: modifica, riordina, attiva/disattiva
- Bottone "Nuova categoria"

### Pagina Prodotti (`/admin/prodotti`)

- Tabella con: immagine, nome, gioco, prezzo, stock, stato (attivo/preordine/esaurito)
- Filtri rapidi per gioco e stato
- Azioni: modifica, disattiva, elimina
- Bottone "Nuovo prodotto"

### Form Prodotto (`/admin/prodotti/nuovo` e `/modifica`)

- Campi: nome, slug (auto-generato dal nome)
- Select gioco (caricato da `/admin/games`) -> al cambio, ricarica le categorie disponibili
- Select categoria (filtrata per gioco selezionato)
- Prezzi: prezzo vendita
- Stock: quantità numerica
- Preordine: toggle + data uscita + nota testuale
- Immagini: upload multiplo drag&drop, riordinamento, la prima in ordine è quella principale
- Descrizione: textarea
- Attivo: toggle visibilità

### Pagina Ordini (`/admin/ordini`)

- Tabella: numero ordine, cliente, data, totale, stato, tipo (standard/preordine)
- Filtri per stato e tipo
- Click su riga -> dettaglio ordine
- Dettaglio ordine: prodotti, indirizzo, storico stati, form per cambio stato + tracking

---

## FASE 4 - Email transazionali

Usare **Laravel Mailable** con template Blade. Per il MVP, Mailtrap in sviluppo, Resend o Mailgun in produzione.

Email da implementare:

- `OrderConfirmed` - conferma ordine standard
- `PreorderConfirmed` - conferma preordine con data prevista
- `OrderShipped` - ordine spedito con codice tracking
- `PreorderReady` - preordine pronto, verrà spedito a breve

---

## FASE 5 - Deploy MVP

### Backend (Laravel)

- VPS Ubuntu 22.04 (es. Hetzner CX21, ~5€/mese)
- Nginx + PHP 8.3 + MySQL 8
- SSL con Certbot (Let's Encrypt)
- Stripe webhook endpoint configurato

### Frontend (React)

- Build statica (`npm run build`)
- Servita da Nginx sullo stesso VPS, o Cloudflare Pages (gratuito)

### Comandi deploy base

```bash
# Backend
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache

# Stripe webhook (registrare endpoint)
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

---

## Checklist MVP - cosa è incluso / escluso

### Incluso nel MVP

- Catalogo prodotti con filtri per gioco/categoria
- Scheda prodotto con immagini e varianti
- Carrello persistente (localStorage)
- Checkout con Stripe (carta di credito)
- Preordini con badge e note sulla data
- Registrazione e login utente
- Storico ordini area cliente
- Backoffice: CRUD prodotti + gestione ordini
- Email transazionali base
- Spedizione gratuita sopra soglia configurabile

### Escluso dal MVP (future iterazioni)

- Integrazione Cardmarket / eBay
- Wishlist
- Coupon e codici sconto
- Recensioni prodotti
- Multi-lingua
- App mobile
- Analytics avanzata
- Pagamento in rate (Klarna, ecc.)

---

## Stima ore MVP

| Modulo                           | Attività                                                                                               | Ore     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ | ------- |
| **Backend - Setup**              | Progetto Laravel, Sanctum, .env, CORS, middleware ruoli                                                | 6       |
| **Backend - DB**                 | 8 migration (games, categories, products, product_images, users, addresses, orders, order_items)       | 6       |
| **Backend - Catalogo**           | Model + relazioni + scope, GameController, CategoryController, ProductController (listing + dettaglio) | 12      |
| **Backend - Immagini**           | Upload, reorder, delete immagini prodotto; storage link                                                | 6       |
| **Backend - Auth**               | Register, login, logout, me; Form Requests validazione                                                 | 6       |
| **Backend - Indirizzi**          | CRUD indirizzi utente                                                                                  | 4       |
| **Backend - Checkout**           | createIntent, confirm, decremento stock                                                                | 10      |
| **Backend - Webhook Stripe**     | payment_intent.succeeded/failed, charge.refunded                                                       | 6       |
| **Backend - Ordini utente**      | Lista ordini, dettaglio ordine per l'utente                                                            | 4       |
| **Backend - Admin prodotti**     | CRUD prodotti + upload immagini + reorder                                                              | 10      |
| **Backend - Admin giochi/cat.**  | CRUD games + categories, reorder sort_order                                                            | 6       |
| **Backend - Admin ordini**       | Lista ordini, cambio stato, aggiunta tracking                                                          | 6       |
| **Backend - Email**              | 4 Mailable (OrderConfirmed, PreorderConfirmed, OrderShipped, PreorderReady) + template Blade           | 8       |
| **Backend - Resources**          | Laravel Resources per tutti i response (Product, Order, Game, Category…)                               | 5       |
| **Subtotale backend**            |                                                                                                        | **95**  |
|                                  |                                                                                                        |         |
| **Frontend - Setup**             | Vite + Tailwind + React Router + Zustand + React Query + Axios + Stripe.js                             | 4       |
| **Frontend - Layout**            | Header (navbar dinamica da API), Footer, CartDrawer                                                    | 10      |
| **Frontend - Home**              | Hero slider, ultime uscite, sezione preordini, sezioni per gioco, banner CardTrader                    | 12      |
| **Frontend - Catalogo**          | Grid prodotti, filtri (gioco/categoria/preordine), ordinamento, URL params, paginazione                | 12      |
| **Frontend - Scheda prodotto**   | Galleria immagini, info prodotto, badge preordine/esaurito, CTA                                        | 8       |
| **Frontend - Carrello**          | Zustand store + persist, CartDrawer, aggiorna quantità, rimuovi                                        | 6       |
| **Frontend - Checkout**          | Form indirizzo, Stripe Elements, riepilogo ordine, banner preordine, submit                            | 14      |
| **Frontend - Conferma ordine**   | Pagina post-pagamento con numero ordine e riepilogo                                                    | 3       |
| **Frontend - Auth**              | Login, Register, ProtectedRoute, AdminRoute                                                            | 6       |
| **Frontend - Area cliente**      | Lista ordini, dettaglio ordine con stato e tracking                                                    | 6       |
| **Frontend - Admin giochi/cat.** | Tabelle CRUD + form giochi, tabella CRUD + form categorie                                              | 8       |
| **Frontend - Admin prodotti**    | Tabella prodotti, form prodotto (select gioco->categoria dinamica, upload immagini drag&drop, reorder)  | 16      |
| **Frontend - Admin ordini**      | Tabella ordini con filtri, dettaglio ordine, cambio stato, tracking                                    | 8       |
| **Subtotale frontend**           |                                                                                                        | **113** |
|                                  |                                                                                                        |         |
| **Deploy**                       | VPS setup (Nginx, PHP, MySQL, SSL), CI base, .env produzione, Stripe webhook registrazione             | 10      |
| **Testing & bug fix**            | Test funzionali end-to-end (catalogo -> checkout -> webhook -> email), fix pre-consegna                   | 16      |
| **Buffer (15%)**                 | Scope creep, richieste aggiuntive, imprevisti                                                          | 35      |
| **Subtotale altro**              |                                                                                                        | **61**  |
|                                  |                                                                                                        |         |
| **Totale**                       |                                                                                                        | **269** |

> Range realistico: **240–300 ore** a seconda della complessità delle richieste in corso d'opera.

---

## Note per Claude Code

- Usare **Laravel Resources** per tutte le risposte API (mai esporre direttamente i model)
- Usare **Form Requests** per tutta la validazione backend
- Il carrello vive **solo nel frontend** (localStorage via Zustand) - il backend non ha una tabella `carts`
- Lo **stock viene decrementato** solo al `payment_intent.succeeded` webhook di Stripe, non al `createIntent`
- Il campo `product_snapshot` in `order_items` salva nome, prezzo e immagine al momento dell'acquisto - se il prodotto viene modificato o eliminato, l'ordine storico resta corretto
- Tutta l'autenticazione usa **Laravel Sanctum** con token (non sessioni, perché frontend e backend sono separati)
- I **preordini si pagano subito** al checkout - non c'è pagamento differito nel MVP
- La **navbar è generata dinamicamente** da `/api/games?with=categories` - non è hardcoded nel frontend. Al cambio di un gioco o categoria dal backoffice, la navbar si aggiorna senza deploy
- L'**immagine principale** di un prodotto è sempre quella con `sort_order` più basso nella tabella `product_images`
- Il **ruolo admin** è gestito con un campo `role` stringa su `users` (`"admin"` / `"customer"`). Creare un middleware `CheckRole` che verifica `auth()->user()->role === 'admin'`
- La select **categoria nel form prodotto** dipende dal gioco selezionato: al cambio del gioco, fare una chiamata a `/api/admin/categories?game_id=X` per ricaricare le opzioni
