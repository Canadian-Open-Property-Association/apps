import { useState, useEffect, useRef } from 'react';
import { useAppTracking } from '../../hooks/useAppTracking';
import { ASSET_TYPE_CONFIG, AssetType } from '../../types/asset';
import { AppNavBar, SaveButton, UnsavedIndicator, SettingsButton } from '../../components/AppNavBar';

// Asset interface for the library
interface LibraryAsset {
  id: string;
  name: string;
  filename: string;
  originalName: string;
  uri: string;
  type?: AssetType;
  entityId?: string;
  mimetype: string;
  size: number;
  hash?: string;
  isPublished?: boolean;
  publishedUri?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Entity reference for linking
interface EntityRef {
  id: string;
  name: string;
  types: string[];
}

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

export default function AssetManagerApp() {
  useAppTracking('asset-manager', 'Asset Manager');

  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [entities, setEntities] = useState<EntityRef[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get selected asset
  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;

  // Load data on mount
  useEffect(() => {
    fetchAssets();
    fetchEntities();
  }, []);

  // Fetch all assets
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/assets`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch assets');
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch entities for dropdown
  const fetchEntities = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/github/entities`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEntities(data);
      }
    } catch (err) {
      console.error('Error fetching entities:', err);
    }
  };

  // Filter assets
  const filteredAssets = filterType === 'all'
    ? assets
    : assets.filter((a) => a.type === filterType);

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

        const res = await fetch(`${API_BASE}/api/assets`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }
      }
      await fetchAssets();
      setSuccessMessage(`Uploaded ${files.length} file(s)`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Update asset metadata
  const updateAssetField = (field: keyof LibraryAsset, value: any) => {
    if (!selectedAssetId) return;
    setAssets((prev) =>
      prev.map((a) => (a.id === selectedAssetId ? { ...a, [field]: value } : a))
    );
    setHasChanges(true);
  };

  // Save all changes to server
  const saveChanges = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setError(null);

    try {
      // Save each modified asset
      for (const asset of assets) {
        await fetch(`${API_BASE}/api/assets/${asset.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: asset.name,
            type: asset.type,
            entityId: asset.entityId,
          }),
        });
      }
      setHasChanges(false);
      setSuccessMessage('Changes saved');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Delete asset
  const deleteAsset = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/assets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete');
      if (selectedAssetId === id) setSelectedAssetId(null);
      await fetchAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <AppNavBar
        left={
          <div className="flex items-center gap-3">
            <SaveButton onClick={saveChanges} disabled={!hasChanges || saving} />
            <UnsavedIndicator show={hasChanges} />
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {assets.length} asset{assets.length !== 1 ? 's' : ''}
            </span>
          </div>
        }
        settings={<SettingsButton disabled />}
      />

      {/* Messages */}
      {error && (
        <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mx-6 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Asset List */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* List Header */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            {/* Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
              onChange={handleUpload}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Assets
                </>
              )}
            </button>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AssetType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Types ({assets.length})</option>
              <option value="entity-logo">Entity Logos ({assets.filter((a) => a.type === 'entity-logo').length})</option>
              <option value="credential-background">Backgrounds ({assets.filter((a) => a.type === 'credential-background').length})</option>
              <option value="credential-icon">Icons ({assets.filter((a) => a.type === 'credential-icon').length})</option>
            </select>
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center text-gray-500 py-8 px-4">
                <p>No assets found</p>
                <p className="text-xs mt-1">Upload images to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedAssetId === asset.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={asset.uri}
                        alt={asset.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{asset.name || 'Untitled'}</p>
                      <p className="text-xs text-gray-500">
                        {asset.type ? ASSET_TYPE_CONFIG[asset.type]?.label : 'Untagged'}
                      </p>
                    </div>
                    {/* Status */}
                    {asset.isPublished && (
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Published" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Edit Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedAsset ? (
            <div className="max-w-2xl space-y-6">
              {/* Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-6">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      src={selectedAsset.uri}
                      alt={selectedAsset.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-500">Filename: <span className="text-gray-700">{selectedAsset.filename}</span></p>
                    <p className="text-sm text-gray-500">Size: <span className="text-gray-700">{formatFileSize(selectedAsset.size)}</span></p>
                    <p className="text-sm text-gray-500">Format: <span className="text-gray-700">{selectedAsset.mimetype}</span></p>
                    {selectedAsset.hash && (
                      <p className="text-sm text-gray-500">Hash: <span className="text-gray-700 font-mono text-xs">{selectedAsset.hash.substring(0, 16)}...</span></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata Form */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h3 className="font-medium text-gray-800">Asset Metadata</h3>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedAsset.name || ''}
                    onChange={(e) => updateAssetField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Asset name"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                  <select
                    value={selectedAsset.type || ''}
                    onChange={(e) => updateAssetField('type', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select type --</option>
                    <option value="entity-logo">Entity Logo</option>
                    <option value="credential-background">Credential Background</option>
                    <option value="credential-icon">Credential Icon</option>
                  </select>
                  {selectedAsset.type && (
                    <p className="text-xs text-gray-500 mt-1">{ASSET_TYPE_CONFIG[selectedAsset.type]?.description}</p>
                  )}
                </div>

                {/* Entity (for logos) */}
                {selectedAsset.type === 'entity-logo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Linked Entity</label>
                    <select
                      value={selectedAsset.entityId || ''}
                      onChange={(e) => updateAssetField('entityId', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Select entity --</option>
                      {entities.map((entity) => (
                        <option key={entity.id} value={entity.id}>{entity.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => deleteAsset(selectedAsset.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete Asset
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {selectedAsset.isPublished ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Published
                    </span>
                  ) : (
                    <span className="text-amber-600">Not published</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Select an asset</p>
                <p className="text-sm mt-1">Choose an asset from the list to edit its metadata</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
