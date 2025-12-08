import { useState } from 'react';
import { useEntityStore } from '../../../store/entityStore';
import type { EntityType } from '../../../types/entity';
import { ENTITY_TYPE_CONFIG } from '../../../types/entity';

interface EntityToolbarProps {
  onAddEntity: () => void;
  onExport: () => void;
  onSaveToRepo: () => void;
}

export default function EntityToolbar({ onAddEntity, onExport, onSaveToRepo }: EntityToolbarProps) {
  const { typeFilter, setTypeFilter, searchQuery, setSearchQuery, fetchFromGitHub } = useEntityStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const entityTypes: (EntityType | null)[] = [null, 'issuer', 'data-furnisher', 'network-partner', 'service-provider'];

  const handleSyncFromGitHub = async () => {
    setIsSyncing(true);
    try {
      await fetchFromGitHub();
    } catch (err) {
      console.error('Failed to sync from GitHub:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Type filter tabs */}
        <div className="flex items-center gap-1">
          {entityTypes.map((type) => (
            <button
              key={type || 'all'}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                typeFilter === type
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type ? ENTITY_TYPE_CONFIG[type].pluralLabel : 'All'}
            </button>
          ))}
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Sync from GitHub */}
          <button
            onClick={handleSyncFromGitHub}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Load entities from GitHub repository"
          >
            <svg
              className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isSyncing ? 'Syncing...' : 'Sync from GitHub'}
          </button>

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>

          {/* Save to Repo */}
          <button
            onClick={onSaveToRepo}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Save to Repo
          </button>

          {/* Add Entity */}
          <button
            onClick={onAddEntity}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Entity
          </button>
        </div>
      </div>
    </div>
  );
}
