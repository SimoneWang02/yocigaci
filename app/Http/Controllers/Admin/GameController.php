<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GameRequest;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GameController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return GameResource::collection(Game::orderBy('sort_order')->with('categories')->get());
    }

    public function store(GameRequest $request): GameResource
    {
        return new GameResource(Game::create($request->validated()));
    }

    public function show(Game $game): GameResource
    {
        return new GameResource($game->load('categories'));
    }

    public function update(GameRequest $request, Game $game): GameResource
    {
        $game->update($request->validated());

        return new GameResource($game);
    }

    public function destroy(Game $game): JsonResponse
    {
        $game->delete();

        return response()->json(['message' => 'Gioco eliminato.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        foreach ($request->ids as $index => $id) {
            Game::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Ordine aggiornato.']);
    }
}
