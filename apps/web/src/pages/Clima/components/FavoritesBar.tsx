interface Props {
  favorites: string[];
  currentCity: string;
  isFavorite: boolean;
  onSelect: (city: string) => void;
  onToggleFavorite: () => void;
}

export function FavoritesBar({ favorites, currentCity, isFavorite, onSelect, onToggleFavorite }: Props) {
  const hasFavorites = favorites.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={onToggleFavorite}
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200',
          isFavorite
            ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700',
        ].join(' ')}
      >
        <IconStar filled={isFavorite} />
        {isFavorite ? 'Favorito' : 'Favoritar'}
      </button>

      {hasFavorites && (
        <>
          <span className="text-gray-300 text-xs">|</span>
          {favorites.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onSelect(city)}
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200',
                city === currentCity
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200 hover:text-primary-600',
              ].join(' ')}
            >
              {city}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function IconStar({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
