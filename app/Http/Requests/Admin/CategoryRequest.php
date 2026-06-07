<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;
        $isUpdate = $categoryId !== null;

        return [
            'game_id' => $isUpdate ? ['sometimes', 'exists:games,id'] : ['required', 'exists:games,id'],
            'name' => $isUpdate ? ['sometimes', 'string', 'max:255'] : ['required', 'string', 'max:255'],
            'slug' => $isUpdate
                ? ['sometimes', 'string', 'max:255', 'unique:categories,slug,' . $categoryId]
                : ['required', 'string', 'max:255', 'unique:categories,slug'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'nav_column' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
