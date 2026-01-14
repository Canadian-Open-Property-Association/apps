import { useState } from 'react';
import { useDictionaryStore } from '../../../store/dictionaryStore';
import {
  AppNavBar,
  CreatePrButton,
  SettingsButton,
  NavDivider
} from '../../../components/AppNavBar';

interface DictionaryToolbarProps {
  onAddVocabType: () => void;
  onSaveToRepo: () => void;
}

// Available data dictionaries (expandable in future)
const DATA_DICTIONARIES = [
  { id: 'reso-2.0', name: 'RESO Data Dictionary 2.0', description: 'Real Estate Standards Organization' },
];

export default function DictionaryToolbar({ onAddVocabType, onSaveToRepo }: DictionaryToolbarProps) {
  const { vocabTypes } = useDictionaryStore();
  const [selectedDictionary, setSelectedDictionary] = useState('reso-2.0');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentDictionary = DATA_DICTIONARIES.find(d => d.id === selectedDictionary);

  return (
    <>
      <AppNavBar
        left={
          <div className="flex items-center gap-3">
            {/* Dictionary Selector */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-left bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">{currentDictionary?.name}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {vocabTypes.length} types
            </span>

            <NavDivider />

            {/* Add Vocab Type */}
            <button
              onClick={onAddVocabType}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vocab Type
            </button>
          </div>
        }
        prButton={<CreatePrButton onClick={onSaveToRepo} />}
        settings={<SettingsButton disabled />}
      />

      {/* Dropdown Menu (needs to be outside AppNavBar for z-index) */}
      {isDropdownOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
          <div className="absolute top-12 left-4 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              {DATA_DICTIONARIES.map(dict => (
                <button
                  key={dict.id}
                  onClick={() => {
                    setSelectedDictionary(dict.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedDictionary === dict.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{dict.name}</span>
                    {selectedDictionary === dict.id && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{dict.description}</p>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 p-2">
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-400 rounded-md cursor-not-allowed"
                disabled
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Data Dictionary
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">Coming soon</span>
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
