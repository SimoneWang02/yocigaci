@php
    $base  = rtrim(config('app.url'), '/');
    $title = $page->title . ' – Yocigaci';
    $descText = mb_substr(strip_tags($page->content ?? ''), 0, 150);
    $description = $descText ?: $page->title . ' – Yocigaci, negozio TCG a Carpi.';

    $jsonLdBreadcrumb = [
        '@context'        => 'https://schema.org',
        '@type'           => 'BreadcrumbList',
        'itemListElement' => [
            ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home',       'item' => $base . '/'],
            ['@type' => 'ListItem', 'position' => 2, 'name' => $page->title, 'item' => $base . '/p/' . $page->slug],
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
    <link rel="canonical" href="{{ $base }}/p/{{ $page->slug }}">

    <meta property="og:type" content="article">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $base }}/p/{{ $page->slug }}">
    <meta property="og:locale" content="it_IT">
    <meta property="og:site_name" content="Yocigaci">

    <script type="application/ld+json">{!! json_encode($jsonLdBreadcrumb, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

    <link rel="icon" type="image/svg+xml" href="/images/square_logo.svg">
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #fff; color: #111; }
        .container { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
        nav { font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem; }
        nav a { color: #4f46e5; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 1.5rem; }
        .content { color: #374151; line-height: 1.7; font-size: 0.95rem; }
    </style>
</head>
<body>
<div class="container">
    <nav><a href="{{ $base }}/">Home</a> / {{ $page->title }}</nav>
    <h1>{{ $page->title }}</h1>
    <div class="content">{!! $page->content !!}</div>
</div>
</body>
</html>
