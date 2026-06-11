#!/bin/bash
set -e

SERVER="deploy@204.168.218.197"
APP_DIR="/var/www/yocigaci"

echo "==> Deploy yocigaci.com"

ssh "$SERVER" bash << 'REMOTE'
set -e
cd /var/www/yocigaci

echo "--> Pull"
git pull origin main

echo "--> Dipendenze PHP"
composer install --no-dev --optimize-autoloader

echo "--> Build frontend"
npm ci
npm run build

echo "--> Maintenance on"
php artisan down

echo "--> Migrazioni"
php artisan migrate --force

echo "--> Cache"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "--> Maintenance off"
php artisan up

echo "--> Permessi"
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

echo "--> Riavvio worker"
php artisan queue:restart
sudo supervisorctl restart yocigaci-worker:*

echo "==> Deploy completato"
REMOTE
