<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return AddressResource::collection(
            $request->user()->addresses()->orderByDesc('is_default')->get()
        );
    }

    public function store(AddressRequest $request): AddressResource
    {
        $user = $request->user();

        if ($request->boolean('is_default')) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($request->validated());

        return new AddressResource($address);
    }

    public function show(Request $request, Address $address): AddressResource
    {
        $this->authorizeAddress($request, $address);

        return new AddressResource($address);
    }

    public function update(AddressRequest $request, Address $address): AddressResource
    {
        $this->authorizeAddress($request, $address);

        if ($request->boolean('is_default')) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address->update($request->validated());

        return new AddressResource($address);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);
        $address->delete();

        return response()->json(['message' => 'Indirizzo eliminato.']);
    }

    private function authorizeAddress(Request $request, Address $address): void
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
