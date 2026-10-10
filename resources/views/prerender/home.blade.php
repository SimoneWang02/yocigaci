@php
    $base = rtrim(config('app.url'), '/');
    $gameNames = $games->pluck('name')->implode(', ');
    $title = 'Yocigaci – Negozio TCG a Carpi | Magic, Pokémon, One Piece';
    $description = "Yocigaci è il negozio di carte collezionabili a Carpi: Magic: The Gathering, Pokémon, One Piece, Dragon Ball e altri TCG. Acquista online o ritira in negozio a Carpi (MO).";

    $jsonLdBusiness = [
        '@context' => 'https://schema.org',
        '@type'    => 'LocalBusiness',
        'name'     => 'Yocigaci',
        'url'      => $base,
        'image'    => $base . '/images/square_logo.svg',
        'description' => $description,
        'address'  => [
            '@type'           => 'PostalAddress',
            'addressLocality' => 'Carpi',
            'addressRegion'   => 'MO',
            'addressCountry'  => 'IT',
        ],
        'priceRange' => '€€',
    ];

    $jsonLdWebsite = [
        '@context' => 'https://schema.org',
        '@type'    => 'WebSite',
        'name'     => 'Yocigaci',
        'url'      => $base,
        'potentialAction' => [
            '@type'       => 'SearchAction',
            'target'      => ['@type' => 'EntryPoint', 'urlTemplate' => $base . '/catalogo?search={search_term_string}'],
            'query-input' => 'required name=search_term_string',
        ],
    ];
@endphp
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
    <link rel="canonical" href="{{ $base }}/">

    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $base }}/">
    <meta property="og:locale" content="it_IT">
    <meta property="og:site_name" content="Yocigaci">
    <meta property="og:image" content="{{ $base }}/images/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">

    <script type="application/ld+json">{!! json_encode($jsonLdBusiness, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
    <script type="application/ld+json">{!! json_encode($jsonLdWebsite, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

    <link rel="icon" type="image/svg+xml" href="/images/square_logo.svg">
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #fff; color: #111; }
        .container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
        h1 { font-size: 2rem; font-weight: 800; margin: 0 0 0.75rem; }
        p { color: #374151; line-height: 1.6; margin: 0 0 1rem; }
        .games { display: flex; flex-wrap: wrap; gap: 1.25rem; margin-top: 2rem; }
        .game-card { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem 1.5rem; flex: 1; min-width: 200px; }
        .game-card h2 { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.6rem; }
        .game-card h2 a { color: #111; text-decoration: none; }
        .game-card h2 a:hover { color: #4f46e5; }
        .game-card a { display: block; color: #4f46e5; text-decoration: none; font-size: 0.875rem; margin: 0.2rem 0; }
        .game-card a:hover { text-decoration: underline; }
        .cta { display: inline-block; background: #4f46e5; color: #fff; font-weight: 600; padding: 0.65rem 1.5rem; border-radius: 0.5rem; text-decoration: none; margin-top: 0.5rem; font-size: 0.9rem; }
        .cta:hover { background: #4338ca; }
    </style>
</head>
<body>
<div class="container">
    <h1>Yocigaci – Negozio TCG a Carpi</h1>
    <p>{{ $description }}</p>
    <a href="{{ $base }}/catalogo" class="cta">Esplora il catalogo completo</a>

    @if($games->isNotEmpty())
    <div class="games">
        @foreach($games as $game)
        <div class="game-card">
            <h2><a href="{{ $base }}/catalogo/{{ $game->slug }}">{{ $game->name }}</a></h2>
            @foreach($game->categories as $cat)
            <a href="{{ $base }}/catalogo/{{ $game->slug }}/{{ $cat->slug }}">{{ $cat->name }}</a>
            @endforeach
        </div>
        @endforeach
    </div>
    @endif
</div>
</body>
</html>
