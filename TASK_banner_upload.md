# Task: Fix upload banner > 8MB

## Problema
L'upload di un banner da 9MB falliva con errore `{"message": "The POST data is too large."}`.

## Causa
Tre limiti in conflitto:

| Limite | Valore originale | Valore corretto |
|--------|-----------------|-----------------|
| PHP `upload_max_filesize` (in `/etc/php/8.1/cli/php.ini`) | 2M | **20M** |
| PHP `post_max_size` (in `/etc/php/8.1/cli/php.ini`) | 8M | **25M** |
| Validazione Laravel in `CarouselBannerController::store()` | `max:5120` (5MB) | **`max:20480` (20MB)** |

## Cosa è già stato fatto

- [x] `app/Http/Controllers/Admin/CarouselBannerController.php` riga 22: cambiato `max:5120` → `max:20480`

## Cosa manca (richiede sudo)

Eseguire nel terminale:

```bash
sudo sed -i 's/^upload_max_filesize = .*/upload_max_filesize = 20M/' /etc/php/8.1/cli/php.ini && \
sudo sed -i 's/^post_max_size = .*/post_max_size = 25M/' /etc/php/8.1/cli/php.ini
```

Poi riavviare il server:

```bash
php artisan serve
```

## Verifica

Dopo il riavvio, controllare che i valori siano corretti:

```bash
php -i | grep -E "upload_max_filesize|post_max_size"
# Atteso: upload_max_filesize => 20M, post_max_size => 25M
```

Poi ritentare l'upload del banner da 9MB dal pannello admin.
