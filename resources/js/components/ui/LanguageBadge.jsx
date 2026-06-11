import IT from 'country-flag-icons/react/3x2/IT';
import GB from 'country-flag-icons/react/3x2/GB';
import JP from 'country-flag-icons/react/3x2/JP';
import FR from 'country-flag-icons/react/3x2/FR';
import DE from 'country-flag-icons/react/3x2/DE';
import ES from 'country-flag-icons/react/3x2/ES';
import KR from 'country-flag-icons/react/3x2/KR';
import CN from 'country-flag-icons/react/3x2/CN';
import PT from 'country-flag-icons/react/3x2/PT';

const FLAG_MAP = {
    ITA: { Flag: IT, label: 'Italiano' },
    ENG: { Flag: GB, label: 'English' },
    JAP: { Flag: JP, label: 'Japanese' },
    FRA: { Flag: FR, label: 'Français' },
    DEU: { Flag: DE, label: 'Deutsch' },
    ESP: { Flag: ES, label: 'Español' },
    KOR: { Flag: KR, label: '한국어' },
    CHN: { Flag: CN, label: '中文' },
    POR: { Flag: PT, label: 'Português' },
};

export function parseProductName(name) {
    const match = name?.match(/^(.*?)\s*\[([A-Z]{2,4})\]\s*$/);
    if (!match) return { cleanName: name ?? '', langCode: null };
    return { cleanName: match[1].trim(), langCode: match[2] };
}

export function LanguageBadge({ code }) {
    const entry = FLAG_MAP[code];
    if (!entry) return null;
    const { Flag, label } = entry;
    return (
        <span
            title={label}
            className="inline-flex items-center flex-shrink-0 rounded-sm overflow-hidden shadow-sm ring-1 ring-black/10"
            style={{ width: 20, height: 14 }}
        >
            <Flag className="w-full h-full" />
        </span>
    );
}
