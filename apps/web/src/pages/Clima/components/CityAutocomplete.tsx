import { useCallback, useEffect, useRef, useState } from 'react';
import { climaService } from '../../../services/clima.service';
import type { CityResult } from '../../../types';

interface Props {
  initialValue: string;
  loading: boolean;
  onSelect: (city: CityResult) => void;
  onSubmitRaw: (query: string) => void;
}

export function CityAutocomplete({ initialValue, loading, onSelect, onSubmitRaw }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    try {
      const results = await climaService.searchCities(q);
      setSuggestions(results);
      setOpen(results.length > 0);
      setHighlighted(-1);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  }

  function handleSelect(city: CityResult) {
    setQuery(city.name);
    setSuggestions([]);
    setOpen(false);
    setHighlighted(-1);
    onSelect(city);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => (open ? Math.min(h + 1, suggestions.length - 1) : h));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlighted >= 0) {
        handleSelect(suggestions[highlighted]);
      } else if (query.trim()) {
        setOpen(false);
        onSubmitRaw(query.trim());
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlighted(-1);
    }
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
          <IconMapPin />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar cidade... (ex: Porto Alegre)"
          autoComplete="off"
          disabled={loading}
          className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow disabled:opacity-60"
        />
        {searching && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            <IconSpinner />
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-card-hover z-50 overflow-hidden animate-fade-in">
          {suggestions.map((city, i) => (
            <button
              key={`${city.name}-${city.lat}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(city); }}
              onMouseEnter={() => setHighlighted(i)}
              className={[
                'w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors',
                highlighted === i
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className={highlighted === i ? 'text-primary-500' : 'text-gray-400'}>
                <IconMapPin />
              </span>
              <span>
                <span className="font-medium">{city.name}</span>
                {city.state && (
                  <span className="ml-1.5 text-xs text-gray-400">
                    {city.state}{city.country ? `, ${city.country}` : ''}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-primary-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
