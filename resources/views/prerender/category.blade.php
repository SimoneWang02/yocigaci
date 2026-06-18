@php
    $base  = rtrim(config('app.url'), '/');
    $title = $category->name . ' ' . $game->name . ' a Carpi – Yocigaci';
    $description = "Acquista " . $category->name . " di " . $game->name . " a Carpi da Yocigaci. Ampia selezione di " . $category->name . " " . $game->name . " disponibili online e in negozio.";

    $jsonLdBreadcrumb = [
        '@context'        => 'https://schema.org',
        '@type'           => 'BreadcrumbList',
        'itemListElement' => [
            ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home',              'item' => $base . '/'],
            ['@type' => 'ListItem', 'position' => 2, 'name' => 'Catalogo',          'item' => $base . '/catalogo'],
            ['@type' => 'ListItem', 'position' => 3, 'name' => $game->name,         'item' => $base . '/catalogo/' . $game->slug],
            ['@type' => 'ListItem', 'position' => 4, 'name' => $category->name,     'item' => $base . '/catalogo/' . $game->slug . '/' . $category->slug],
        ],
    ];

    $jsonLdItemList = [
        '@context'        => 'https://schema.org',
        '@type'           => 'ItemList',
        'name'            => $category->name . ' ' . $game->name . ' – Yocigaci Carpi',
        'url'             => $base . '/catalogo/' . $game->slug . '/' . $category->slug,
        'itemListElement' => $products->map(fn ($p, $i) => [
            '@type'    => 'ListItem',
            'position' => $i + 1,
            'url'      => $base . '/prodotti/' . $p->slug,
            'name'     => $p->name,
        ])->values()->all(),
    ];
@endphp
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
    <link rel="canonical" href="{{ $base }}/catalogo/{{ $game->slug }}/{{ $category->slug }}">

    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $base }}/catalogo/{{ $game->slug }}/{{ $category->slug }}">
    <meta property="og:locale" content="it_IT">
    <meta property="og:site_name" content="Yocigaci">

    <script type="application/ld+json">{!! json_encode($jsonLdBreadcrumb, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
    <script type="application/ld+json">{!! json_encode($jsonLdItemList, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

    <link rel="icon" type="image/svg+xml" href="/images/square_logo.svg">
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #fff; color: #111; }
        .container { max-width: 960px; margin: 0 auto; padding: 2rem 1rem; }
        nav { font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem; }
        nav a { color: #4f46e5; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
        .desc { color: #374151; line-height: 1.6; margin: 0 0 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.25rem; }
        .card { border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; text-decoration: none; color: inherit; display: block; }
        .card:hover { border-color: #a5b4fc; }
        .card img { width: 100%; aspect-ratio: 3/4; object-fit: contain; background: #f9fafb; }
        .card-body { padding: 0.6rem 0.75rem 0.75rem; }
        .card-name { font-size: 0.8rem; font-weight: 600; line-height: 1.35; margin: 0 0 0.3rem; }
        .card-price { font-size: 0.875rem; font-weight: 700; color: #4338ca; }
        .empty { text-align: center; padding: 4rem 0; color: #9ca3af; }
    </style>
</head>
<body>
<div class="container">
    <nav>
        <a href="{{ $base }}/">Home</a> /
        <a href="{{ $base }}/catalogo">Catalogo</a> /
        <a href="{{ $base }}/catalogo/{{ $game->slug }}">{{ $game->name }}</a> /
        {{ $category->name }}
    </nav>

    <h1>{{ $category->name }} {{ $game->name }} a Carpi</h1>
    <p class="desc">{{ $description }}</p>

    @if($products->isEmpty())
    <p class="empty">Nessun prodotto disponibile al momento.</p>
    @else
    <div class="grid">
        @foreach($products as $product)
        <a href="{{ $base }}/prodotti/{{ $product->slug }}" class="card">
            @if($product->primaryImage)
            <img src="{{ $product->primaryImage->url }}" alt="{{ $product->name }}" loading="lazy">
            @endif
            <div class="card-body">
                <p class="card-name">{{ $product->name }}</p>
                <p class="card-price">€ {{ number_format((float) $product->price, 2, ',', '.') }}</p>
            </div>
        </a>
        @endforeach
    </div>
    @endif
</div>
</body>
</html>
