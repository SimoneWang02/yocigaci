@php
    $base = rtrim(config('app.url'), '/');
    $price = number_format((float) $product->price, 2, '.', '');
    $priceFormatted = '€ ' . number_format((float) $product->price, 2, ',', '.');
    $primaryImageUrl = $product->primaryImage?->url ?? $product->images->first()?->url;
    $allImages = $product->images->pluck('url')->filter()->values()->all();

    $availability = $product->is_preorder
        ? 'https://schema.org/PreOrder'
        : ($product->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock');

    $metaDescription = $product->description
        ? mb_substr($product->description, 0, 155)
        : "Acquista {$product->name} su Yocigaci, negozio TCG a Carpi. {$priceFormatted}.";

    $jsonLdProduct = array_filter([
        '@context' => 'https://schema.org',
        '@type' => 'Product',
        'name' => $product->name,
        'description' => $product->description ?: $metaDescription,
        'image' => $allImages ?: ($primaryImageUrl ? [$primaryImageUrl] : null),
        'brand' => $product->game ? ['@type' => 'Brand', 'name' => $product->game->name] : null,
        'category' => $product->category?->name,
        'offers' => [
            '@type' => 'Offer',
            'url' => $base . '/prodotti/' . $product->slug,
            'priceCurrency' => 'EUR',
            'price' => $price,
            'availability' => $availability,
            'itemCondition' => 'https://schema.org/NewCondition',
            'seller' => ['@type' => 'Organization', 'name' => 'Yocigaci'],
        ],
    ]);

    $breadcrumbItems = [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $base . '/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Catalogo', 'item' => $base . '/catalogo'],
    ];
    if ($product->game) {
        $breadcrumbItems[] = ['@type' => 'ListItem', 'position' => 3, 'name' => $product->game->name, 'item' => $base . '/catalogo/' . $product->game->slug];
    }
    $breadcrumbItems[] = ['@type' => 'ListItem', 'position' => count($breadcrumbItems) + 1, 'name' => $product->name];

    $jsonLdBreadcrumb = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => $breadcrumbItems,
    ];
@endphp
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $product->name }} - Yocigaci</title>
    <meta name="description" content="{{ $metaDescription }}">
    <link rel="canonical" href="{{ $base }}/prodotti/{{ $product->slug }}">

    <meta property="og:type" content="product">
    <meta property="og:title" content="{{ $product->name }} - Yocigaci">
    <meta property="og:description" content="{{ $metaDescription }}">
    <meta property="og:url" content="{{ $base }}/prodotti/{{ $product->slug }}">
    @if($primaryImageUrl)
    <meta property="og:image" content="{{ $primaryImageUrl }}">
    @endif

    <script type="application/ld+json">{!! json_encode($jsonLdProduct, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
    <script type="application/ld+json">{!! json_encode($jsonLdBreadcrumb, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

    <link rel="icon" type="image/svg+xml" href="/images/square_logo.svg">
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #fff; color: #111; }
        .container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
        nav { font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem; }
        nav a { color: #4f46e5; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        .product { display: flex; gap: 2.5rem; flex-wrap: wrap; }
        .product-image { flex: 0 0 320px; }
        .product-image img { width: 100%; height: auto; border-radius: 0.75rem; object-fit: contain; }
        .product-info { flex: 1; min-width: 260px; }
        h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
        .price { font-size: 2rem; font-weight: 800; color: #4338ca; margin: 0.5rem 0 0.25rem; }
        .vat { font-size: 0.75rem; color: #9ca3af; margin-bottom: 1rem; }
        .badge { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; margin-right: 0.25rem; margin-bottom: 0.5rem; }
        .badge-preorder { background: #fef3c7; color: #92400e; }
        .badge-limited { background: #ede9fe; color: #5b21b6; }
        .badge-soldout { background: #fee2e2; color: #991b1b; }
        .badge-game { background: #e0e7ff; color: #3730a3; }
        .stock { color: #16a34a; font-size: 0.875rem; margin-bottom: 1rem; }
        .preorder-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; color: #92400e; font-size: 0.875rem; }
        .description { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; font-size: 0.9rem; color: #374151; line-height: 1.6; white-space: pre-line; }
        .cta { display: inline-block; background: #4f46e5; color: #fff; font-weight: 600; padding: 0.75rem 1.75rem; border-radius: 0.5rem; text-decoration: none; margin-top: 1rem; }
        .cta:hover { background: #4338ca; }
    </style>
</head>
<body>
<div class="container">
    <nav>
        <a href="{{ $base }}/">Home</a> /
        <a href="{{ $base }}/catalogo">Catalogo</a>
        @if($product->game)
        / <a href="{{ $base }}/catalogo/{{ $product->game->slug }}">{{ $product->game->name }}</a>
        @endif
        / {{ $product->name }}
    </nav>

    <div class="product">
        @if($primaryImageUrl)
        <div class="product-image">
            <img src="{{ $primaryImageUrl }}" alt="{{ $product->name }}">
        </div>
        @endif

        <div class="product-info">
            <div>
                @if($product->is_preorder)
                    <span class="badge badge-preorder">Preordine</span>
                @endif
                @if($product->is_limited)
                    <span class="badge badge-limited">Limitato</span>
                @endif
                @if($product->stock === 0)
                    <span class="badge badge-soldout">Esaurito</span>
                @endif
                @if($product->game)
                    <span class="badge badge-game">{{ $product->game->name }}</span>
                @endif
                @if($product->category)
                    <span class="badge badge-game">{{ $product->category->name }}</span>
                @endif
            </div>

            <h1>{{ $product->name }}</h1>

            <p class="price">{{ $priceFormatted }}</p>
            <p class="vat">IVA inclusa</p>

            @if($product->is_preorder && $product->preorder_release_date)
            <div class="preorder-box">
                <strong>Uscita prevista:</strong>
                {{ \Carbon\Carbon::parse($product->preorder_release_date)->translatedFormat('j F Y') }}
                @if($product->preorder_note)
                <br>{{ $product->preorder_note }}
                @endif
            </div>
            @endif

            @if($product->stock > 0)
            <p class="stock">&#10003; {{ $product->stock }} {{ $product->stock === 1 ? 'Disponibile' : 'Disponibili' }}</p>
            @endif

            <a href="{{ $base }}/prodotti/{{ $product->slug }}" class="cta">
                {{ $product->is_preorder ? 'Preordina ora' : 'Acquista ora' }}
            </a>

            @if($product->description)
            <div class="description">{{ $product->description }}</div>
            @endif
        </div>
    </div>
</div>
</body>
</html>
