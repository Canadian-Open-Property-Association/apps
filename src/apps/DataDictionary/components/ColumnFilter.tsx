import { useState, useRef, useEffect, useMemo } from 'react';

interface ColumnFilterProps {
  label: string;
  values: string[];
  selectedValues: Set<string>;
  onSelectionChange: (values: Set<string>) => void;
  valueFormatter?: (value: string) => string;
  valueCounts?: Map<string, number>;
}

export default function ColumnFilter({
  label,
  values,
  selectedValues,
  onSelectionChange,
  valueFormatter,
  valueCounts,
}: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get unique values sorted alphabetically
  const uniqueValues = useMemo(() => {
    const unique = [...new Set(values)].sort((a, b) => {
      const aFormatted = valueFormatter ? valueFormatter(a) : a;
      const bFormatted = valueFormatter ? valueFormatter(b) : b;
      return aFormatted.localeCompare(bFormatted);
    });
    return unique;
  }, [values, valueFormatter]);

  // Filter values by search
  const filteredValues = useMemo(() => {
    if (!search) return uniqueValues;
    const searchLower = search.toLowerCase();
    return uniqueValues.filter(v => {
      const formatted = valueFormatter ? valueFormatter(v) : v;
      return formatted.toLowerCase().includes(searchLower);
    });
  }, [uniqueValues, search, valueFormatter]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle a single value
  const toggleValue = (value: string) => {
    const newSelection = new Set(selectedValues);
    if (newSelection.has(value)) {
      newSelection.delete(value);
    } else {
      newSelection.add(value);
    }
    onSelectionChange(newSelection);
  };

  // Select all visible values
  const selectAll = () => {
    const newSelection = new Set(selectedValues);
    filteredValues.forEach(v => newSelection.add(v));
    onSelectionChange(newSelection);
  };

  // Clear all selections
  const clearAll = () => {
    onSelectionChange(new Set());
  };

  // Check if filter is active (has any selections)
  const isFilterActive = selectedValues.size > 0;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-1.5 py-1 text-xs font-medium rounded transition-colors ${
          isFilterActive
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
        title={isFilterActive ? `${selectedValues.size} filter(s) active` : 'Filter'}
      >
        {label && <span>{label}</span>}
        {isFilterActive && (
          <span className="bg-blue-600 text-white text-[10px] px-1 rounded-full min-w-[16px] text-center">
            {selectedValues.size}
          </span>
        )}
        {/* Filter icon */}
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Quick actions */}
          <div className="px-2 py-1.5 border-b border-gray-100 flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-blue-600 hover:underline"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={clearAll}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>

          {/* Values list */}
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredValues.length === 0 ? (
              <div className="px-2 py-3 text-sm text-gray-500 text-center">
                No values found
              </div>
            ) : (
              filteredValues.map((value) => {
                const formatted = valueFormatter ? valueFormatter(value) : value;
                const count = valueCounts?.get(value);
                const isSelected = selectedValues.has(value);

                return (
                  <label
                    key={value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleValue(value)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {formatted}
                    </span>
                    {count !== undefined && (
                      <span className="text-xs text-gray-400">({count})</span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
