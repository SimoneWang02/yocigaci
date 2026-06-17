<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
                ? ['sometimes', 'string', 'max:255', Rule::unique('categories', 'slug')->where('game_id', $this->route('category')->game_id)->ignore($categoryId)]
                : ['required', 'string', 'max:255', Rule::unique('categories', 'slug')->where('game_id', $this->input('game_id'))],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'nav_column' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
