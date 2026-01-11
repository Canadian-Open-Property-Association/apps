import { useState, useEffect } from 'react';
import { useAdminStore } from '../../../store/adminStore';
import type { EcosystemConfig } from '../../../types/tenantConfig';

export default function EcosystemConfigPanel() {
  const { tenantConfig, updateEcosystemConfig, isTenantConfigLoading, tenantConfigError } =
    useAdminStore();

  const [formData, setFormData] = useState<EcosystemConfig>({
    name: '',
    tagline: '',
    logoUrl: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form data from tenant config
  useEffect(() => {
    if (tenantConfig?.ecosystem) {
      setFormData(tenantConfig.ecosystem);
      setHasChanges(false);
    }
  }, [tenantConfig]);

  const handleChange = (field: keyof EcosystemConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    const success = await updateEcosystemConfig(formData);
    if (success) {
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    if (tenantConfig?.ecosystem) {
      setFormData(tenantConfig.ecosystem);
      setHasChanges(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ecosystem Configuration</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure your ecosystem's identity and branding. These settings appear throughout the
          platform.
        </p>

        {tenantConfigError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {tenantConfigError}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Configuration saved successfully.
          </div>
        )}

        <div className="space-y-6">
          {/* Ecosystem Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ecosystem Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Cornerstone Network"
            />
            <p className="mt-1 text-xs text-gray-500">
              The name of your ecosystem. Displayed in the header and login page.
            </p>
          </div>

          {/* Tagline */}
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <textarea
              id="tagline"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., A digital trust toolkit for the Cornerstone Network ecosystem"
            />
            <p className="mt-1 text-xs text-gray-500">
              A short description of your ecosystem. Shown on the login and app selection pages.
            </p>
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="text"
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="/logo.png or https://..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Path to your logo image. Use a relative path (e.g., /logo.png) or full URL.
            </p>

            {/* Logo Preview */}
            {formData.logoUrl && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isTenantConfigLoading}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              hasChanges && !isTenantConfigLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isTenantConfigLoading ? 'Saving...' : 'Save Changes'}
          </button>

          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100"
            >
              Reset
            </button>
          )}
        </div>

        {/* Config source info */}
        {tenantConfig?.configuredAt && (
          <p className="mt-4 text-xs text-gray-400">
            Last updated: {new Date(tenantConfig.configuredAt).toLocaleString()}
            {tenantConfig.configuredBy && ` by ${tenantConfig.configuredBy}`}
          </p>
        )}
      </div>
    </div>
  );
}
