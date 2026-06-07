<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Yocigaci',
            'email' => 'admin@yocigaci.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $games = [
            [
                'name' => 'Pokémon',
                'slug' => 'pokemon',
                'sort_order' => 1,
                'categories' => [
                    ['name' => 'Booster Box', 'slug' => 'pokemon-booster-box'],
                    ['name' => 'Display', 'slug' => 'pokemon-display'],
                    ['name' => 'Collezione Speciale', 'slug' => 'pokemon-collezione'],
                    ['name' => 'Accessori', 'slug' => 'pokemon-accessori'],
                ],
            ],
            [
                'name' => 'One Piece',
                'slug' => 'one-piece',
                'sort_order' => 2,
                'categories' => [
                    ['name' => 'Booster Box', 'slug' => 'one-piece-booster-box'],
                    ['name' => 'Display', 'slug' => 'one-piece-display'],
                    ['name' => 'Collezione Speciale', 'slug' => 'one-piece-collezione'],
                ],
            ],
            [
                'name' => 'Magic: The Gathering',
                'slug' => 'magic',
                'sort_order' => 3,
                'categories' => [
                    ['name' => 'Booster Box', 'slug' => 'magic-booster-box'],
                    ['name' => 'Display', 'slug' => 'magic-display'],
                    ['name' => 'Prerelease Kit', 'slug' => 'magic-prerelease'],
                ],
            ],
            [
                'name' => 'Riftbound',
                'slug' => 'riftbound',
                'sort_order' => 4,
                'categories' => [
                    ['name' => 'Booster Box', 'slug' => 'riftbound-booster-box'],
                    ['name' => 'Starter Set', 'slug' => 'riftbound-starter'],
                ],
            ],
        ];

        $this->call(PageSeeder::class);

        foreach ($games as $gameData) {
            $categories = $gameData['categories'];
            unset($gameData['categories']);
            $game = Game::create($gameData);

            foreach ($categories as $i => $cat) {
                $game->categories()->create(array_merge($cat, ['sort_order' => $i]));
            }
        }
    }
}
