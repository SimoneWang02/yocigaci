<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;
        $req = $this->isMethod('POST') ? 'required' : 'sometimes|required';

        return [
            'game_id' => [$req, 'exists:games,id'],
            'category_id' => [$req, 'exists:categories,id'],
            'name' => [$req, 'string', 'max:255'],
            'slug' => [$req, 'string', 'max:255', 'unique:products,slug,' . $productId],
            'description' => ['nullable', 'string'],
            'price' => [$req, 'numeric', 'min:0'],
            'stock' => [$req, 'integer', 'min:0'],
            'is_preorder' => ['boolean'],
            'preorder_release_date' => ['nullable', 'date', 'required_if:is_preorder,true'],
            'preorder_note' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
