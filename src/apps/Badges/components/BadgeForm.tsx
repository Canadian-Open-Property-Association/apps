import { useState } from 'react';
import { useBadgeStore } from '../../../store/badgeStore';
import { useBadgesSettingsStore } from '../../../store/badgesSettingsStore';
import { generateBadgeId } from '../../../types/badge';
import RuleBuilder from './RuleBuilder';
import EvidenceBuilder from './EvidenceBuilder';

type Tab = 'basic' | 'rules' | 'evidence';

export default function BadgeForm() {
  const {
    currentBadge,
    updateCurrentBadge,
    isDirty,
  } = useBadgeStore();

  const { settings } = useBadgesSettingsStore();

  const [activeTab, setActiveTab] = useState<Tab>('basic');

  if (!currentBadge) return null;

  const categories = settings?.categories || [];
  const proofMethods = settings?.proofMethods || [];

  const handleNameChange = (name: string) => {
    updateCurrentBadge('name', name);
    // Auto-generate ID from name if ID is empty or was auto-generated
    if (!currentBadge.id || currentBadge.id.startsWith('badge-')) {
      updateCurrentBadge('id', generateBadgeId(name));
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'basic',
      label: 'Basic Info',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'rules',
      label: 'Eligibility Rules',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'evidence',
      label: 'Evidence',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentBadge.name || 'New Badge'}
          </h2>
          {isDirty && (
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
              Unsaved
            </span>
          )}
          {currentBadge.status === 'published' && (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
              Published
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 -mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-50 text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {activeTab === 'basic' && (
          <div className="max-w-2xl space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentBadge.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Equity > $1M"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentBadge.id}
                onChange={(e) => updateCurrentBadge('id', e.target.value)}
                placeholder="e.g., equity-1m"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier used in URLs and exports
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={currentBadge.description}
                onChange={(e) => updateCurrentBadge('description', e.target.value)}
                placeholder="Describe what this badge represents..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={currentBadge.categoryId}
                onChange={(e) => updateCurrentBadge('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Schema ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schema ID
              </label>
              <input
                type="text"
                value={currentBadge.schemaId}
                onChange={(e) => updateCurrentBadge('schemaId', e.target.value)}
                placeholder="e.g., equity-threshold"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Groups related badges together (e.g., all equity threshold badges)
              </p>
            </div>

            {/* Proof Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proof Method
              </label>
              <select
                value={currentBadge.proofMethod}
                onChange={(e) =>
                  updateCurrentBadge('proofMethod', e.target.value as typeof currentBadge.proofMethod)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {proofMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {proofMethods.find((m) => m.id === currentBadge.proofMethod)?.description}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rules' && <RuleBuilder />}

        {activeTab === 'evidence' && <EvidenceBuilder />}
      </div>
    </div>
  );
}
