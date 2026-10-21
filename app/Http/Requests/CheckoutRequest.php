<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'delivery_method' => ['required', 'in:shipping,pickup'],
            'shipping_method_id' => ['required_if:delivery_method,shipping', 'nullable', 'integer', 'exists:shipping_methods,id'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.full_name' => ['required', 'string'],
            'shipping_address.phone' => ['required', 'string', 'max:20'],
            // I campi indirizzo servono solo per la spedizione: per il ritiro in negozio
            // chiediamo solo nominativo e telefono.
            'shipping_address.address_line1' => ['required_if:delivery_method,shipping', 'nullable', 'string'],
            'shipping_address.address_line2' => ['nullable', 'string'],
            'shipping_address.city' => ['required_if:delivery_method,shipping', 'nullable', 'string'],
            'shipping_address.postal_code' => ['required_if:delivery_method,shipping', 'nullable', 'string'],
            'shipping_address.province' => ['required_if:delivery_method,shipping', 'nullable', 'string'],
            'shipping_address.country' => ['required_if:delivery_method,shipping', 'nullable', 'string'],
            'notes'        => ['nullable', 'string'],
            'coupon_code'  => ['nullable', 'string', 'max:50'],
            // Sessione Stripe precedente dello stesso browser, da annullare per liberarne lo stock.
            'previous_session_id' => ['nullable', 'string', 'max:255'],
        ];
    }
}
