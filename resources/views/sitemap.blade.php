<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
@foreach($entries as $entry)
    <url>
        <loc>{{ $entry['loc'] }}</loc>
        @isset($entry['lastmod'])
        <lastmod>{{ $entry['lastmod'] }}</lastmod>
        @endisset
        @isset($entry['changefreq'])
        <changefreq>{{ $entry['changefreq'] }}</changefreq>
        @endisset
        @isset($entry['priority'])
        <priority>{{ $entry['priority'] }}</priority>
        @endisset
    </url>
@endforeach
</urlset>
