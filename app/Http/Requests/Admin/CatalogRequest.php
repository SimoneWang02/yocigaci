<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $titleRules = $this->isMethod('POST')
            ? ['required', 'string', 'max:255']
            : ['sometimes', 'required', 'string', 'max:255'];

        return [
            'title' => $titleRules,
            'is_active' => ['boolean'],
            'product_ids' => ['array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ];
    }
}
