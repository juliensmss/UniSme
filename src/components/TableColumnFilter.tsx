import React, { useState, useRef, useEffect } from 'react';
import { Filter, ArrowUp, ArrowDown, X, Check } from 'lucide-react';

export interface ColumnFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface TableColumnFilterProps {
  title: string;
  columnKey: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  options?: ColumnFilterOption[];
  hasSearch?: boolean;
  searchPlaceholder?: string;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (direction: 'asc' | 'desc' | null) => void;
  align?: 'left' | 'center' | 'right';
  theme?: 'sky' | 'dark' | 'slate';
  className?: string;
  dropdownWidth?: string;
}

export const TableColumnFilter: React.FC<TableColumnFilterProps> = ({
  title,
  columnKey,
  filterValue,
  onFilterChange,
  options,
  hasSearch = true,
  searchPlaceholder = 'Filtrer...',
  sortDirection,
  onSort,
  align = 'left',
  theme = 'slate',
  className = '',
  dropdownWidth = 'w-64'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(filterValue);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync local search when external filterValue changes
  useEffect(() => {
    setLocalSearch(filterValue);
  }, [filterValue]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isFiltered = Boolean(filterValue && filterValue !== 'Tous' && filterValue !== 'Toutes' && filterValue.trim() !== '');

  // Theme styling for the trigger button
  const getButtonStyles = () => {
    if (isFiltered) {
      return 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300 shadow-sm';
    }

    if (theme === 'sky') {
      return 'text-sky-100 hover:text-white hover:bg-sky-500/60';
    }
    if (theme === 'dark') {
      return 'text-slate-300 hover:text-white hover:bg-slate-700';
    }
    return 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/80';
  };

  const handleSelectOption = (val: string) => {
    onFilterChange(val);
    setLocalSearch(val === 'Tous' || val === 'Toutes' ? '' : val);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    onFilterChange(val);
  };

  const handleClear = () => {
    setLocalSearch('');
    onFilterChange('');
    if (onSort) onSort(null);
  };

  const alignClass =
    align === 'center' ? 'justify-center text-center' :
    align === 'right' ? 'justify-end text-right' :
    'justify-between text-left';

  return (
    <div className={`relative inline-flex items-center gap-1.5 w-full ${alignClass} ${className}`}>
      <span className="font-semibold truncate" title={title}>
        {title}
      </span>

      <div className="relative shrink-0 flex items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`p-1 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] ${getButtonStyles()}`}
          title={isFiltered ? `Filtre actif : "${filterValue}" (cliquer pour modifier)` : `Filtrer la colonne : ${title}`}
          aria-expanded={isOpen}
          aria-label={`Filtrer par ${title}`}
        >
          <Filter className={`w-3.5 h-3.5 ${isFiltered ? 'fill-current' : ''}`} />
          {isFiltered && (
            <span className="max-w-[70px] truncate text-[10px] uppercase font-mono px-1 rounded bg-amber-500 text-slate-950">
              {filterValue}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-full mt-1.5 ${align === 'right' ? 'right-0' : 'left-0'} z-50 ${dropdownWidth} bg-white rounded-lg shadow-2xl border border-slate-200 p-3 text-slate-800 text-xs text-left normal-case font-normal animate-in fade-in duration-150`}
            style={{ minWidth: '220px' }}
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="font-bold text-slate-900 truncate pr-2 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate">Filtre : {title}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tri (si activé) */}
            {onSort && (
              <div className="mb-2 pb-2 border-b border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Trier la colonne :
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSort('asc')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] border ${
                      sortDirection === 'asc'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>A ➔ Z</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSort('desc')}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] border ${
                      sortDirection === 'desc'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <ArrowDown className="w-3 h-3" />
                    <span>Z ➔ A</span>
                  </button>
                </div>
              </div>
            )}

            {/* Champ de recherche texte */}
            {hasSearch && (
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Rechercher dans cette colonne :
                </span>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder={searchPlaceholder}
                    value={localSearch}
                    onChange={handleSearchChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 pr-6"
                  />
                  {localSearch && (
                    <button
                      type="button"
                      onClick={() => handleSelectOption('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options à choix prédéfinis */}
            {options && options.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Valeurs disponibles :
                </span>
                <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                  <button
                    type="button"
                    onClick={() => handleSelectOption('Tous')}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                      !isFiltered
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>Tous</span>
                    {!isFiltered && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {options.map((opt) => {
                    const isSelected = filterValue === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOption(opt.value)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-2">{opt.label}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {typeof opt.count === 'number' && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {opt.count}
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions de bas de popover */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {isFiltered ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-medium hover:underline"
                >
                  Effacer le filtre
                </button>
              ) : (
                <span className="text-[10px] text-slate-400">Aucun filtre actif</span>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-[11px]"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
