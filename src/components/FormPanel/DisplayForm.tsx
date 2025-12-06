import { useState } from 'react';
import { useVctStore } from '../../store/vctStore';
import { AVAILABLE_LOCALES, getLocaleName } from '../../types/vct';
import CardElementsForm from './CardElementsForm';

export default function DisplayForm() {
  const currentVct = useVctStore((state) => state.currentVct);
  const updateDisplay = useVctStore((state) => state.updateDisplay);
  const addDisplay = useVctStore((state) => state.addDisplay);
  const removeDisplay = useVctStore((state) => state.removeDisplay);
  const [activeTab, setActiveTab] = useState(0);

  const display = currentVct.display[activeTab];

  // Get locales that haven't been added yet
  const availableLocales = AVAILABLE_LOCALES.filter(
    (locale) => !currentVct.display.some((d) => d.locale === locale.code)
  );

  const handleAddLocale = (localeCode: string) => {
    addDisplay(localeCode);
    // Switch to the new tab
    setActiveTab(currentVct.display.length);
  };

  const handleRemoveLocale = (index: number) => {
    if (currentVct.display.length <= 1) {
      alert('You must have at least one display language.');
      return;
    }
    removeDisplay(index);
    if (activeTab >= index && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Display Configuration
        </h3>
        {availableLocales.length > 0 && (
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddLocale(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              defaultValue=""
            >
              <option value="" disabled>
                + Add Language
              </option>
              {availableLocales.map((locale) => (
                <option key={locale.code} value={locale.code}>
                  {locale.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Language Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {currentVct.display.map((d, index) => (
          <div key={d.locale} className="flex items-center">
            <button
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === index
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {getLocaleName(d.locale)}
            </button>
            {currentVct.display.length > 1 && (
              <button
                onClick={() => handleRemoveLocale(index)}
                className="ml-1 mr-2 text-gray-400 hover:text-red-500 text-xs"
                title="Remove this language"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>

      {display && (
        <div className="space-y-4 pt-4">
          {/* Localized Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={display.name}
              onChange={(e) => updateDisplay(activeTab, { name: e.target.value })}
              placeholder="Credential Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Localized Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Description
            </label>
            <textarea
              value={display.description || ''}
              onChange={(e) => updateDisplay(activeTab, { description: e.target.value })}
              placeholder="Description..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Card Elements Configuration */}
          <CardElementsForm displayIndex={activeTab} />
        </div>
      )}
    </div>
  );
}
