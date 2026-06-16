<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function messages(): array
    {
        return [
            'required'       => 'Il campo :attribute è obbligatorio.',
            'string'         => 'Il campo :attribute deve essere una stringa.',
            'numeric'        => 'Il campo :attribute deve essere un numero.',
            'integer'        => 'Il campo :attribute deve essere un numero intero.',
            'min'            => 'Il campo :attribute deve essere almeno :min.',
            'max'            => 'Il campo :attribute non può superare :max caratteri.',
            'unique'         => 'Esiste già un prodotto con questo :attribute.',
            'exists'         => 'Il valore selezionato per :attribute non è valido.',
            'boolean'        => 'Il campo :attribute deve essere vero o falso.',
            'date'           => 'Il campo :attribute deve essere una data valida.',
            'nullable'       => '',
            'required_if'    => 'Il campo :attribute è obbligatorio quando il prodotto è in preordine.',
        ];
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;
        $req = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'game_id' => [$req, 'exists:games,id'],
            'category_id' => [$req, 'exists:categories,id'],
            'language' => ['nullable', 'string', 'max:10'],
            'name' => [$req, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => [$req, 'numeric', 'min:0'],
            'stock' => [$req, 'integer', 'min:0'],
            'is_preorder' => ['boolean'],
            'is_limited' => ['boolean'],
            'preorder_release_date' => ['nullable', 'date', 'required_if:is_preorder,true'],
            'preorder_note' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
