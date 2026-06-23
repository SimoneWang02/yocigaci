import IT from 'country-flag-icons/react/3x2/IT';
import GB from 'country-flag-icons/react/3x2/GB';
import JP from 'country-flag-icons/react/3x2/JP';
import FR from 'country-flag-icons/react/3x2/FR';
import DE from 'country-flag-icons/react/3x2/DE';
import ES from 'country-flag-icons/react/3x2/ES';
import KR from 'country-flag-icons/react/3x2/KR';
import CN from 'country-flag-icons/react/3x2/CN';
import PT from 'country-flag-icons/react/3x2/PT';

export const LANGUAGES = [
    { code: 'ENG', label: 'English',    Flag: GB },
    { code: 'ITA', label: 'Italiano',   Flag: IT },
    { code: 'JPN', label: 'Japanese',   Flag: JP },
    { code: 'FRA', label: 'Français',   Flag: FR },
    { code: 'DEU', label: 'Deutsch',    Flag: DE },
    { code: 'ESP', label: 'Español',    Flag: ES },
    { code: 'KOR', label: '한국어',      Flag: KR },
    { code: 'CHN', label: '中文',        Flag: CN },
    { code: 'POR', label: 'Português',  Flag: PT },
];

const FLAG_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));

export function LanguageBadge({ code }) {
    const entry = FLAG_MAP[code];
    if (!entry) return null;
    const { Flag, label } = entry;
    return (
        <span
            title={label}
            className="inline-flex items-center flex-shrink-0 ring-1 ring-black/10"
            style={{ width: 20, height: 14 }}
        >
            <Flag className="w-full h-full" />
        </span>
    );
}
