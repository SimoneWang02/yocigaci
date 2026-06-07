<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $gameId = $this->route('game')?->id;
        $nameRules = $this->isMethod('POST')
            ? ['required', 'string', 'max:255']
            : ['sometimes', 'required', 'string', 'max:255'];
        $slugRules = $this->isMethod('POST')
            ? ['required', 'string', 'max:255', 'unique:games,slug']
            : ['sometimes', 'required', 'string', 'max:255', 'unique:games,slug,' . $gameId];

        return [
            'name' => $nameRules,
            'slug' => $slugRules,
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
