import { useState, useEffect, useMemo } from 'react';
import { useAdminStore } from '../../../store/adminStore';
import { AVAILABLE_APPS, ALWAYS_ENABLED_APPS, AppCategory } from '../../../types/tenantConfig';

const categoryLabels: Record<AppCategory, string> = {
  governance: 'Governance Apps',
  testing: 'Credential Exchange Apps',
  admin: 'Settings',
};

const categoryOrder: AppCategory[] = ['governance', 'testing', 'admin'];

export default function AppsConfigPanel() {
  const { tenantConfig, updateAppsConfig, isTenantConfigLoading, tenantConfigError } =
    useAdminStore();

  const [enabledApps, setEnabledApps] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize from tenant config
  useEffect(() => {
    if (tenantConfig?.apps?.enabledApps) {
      setEnabledApps(tenantConfig.apps.enabledApps);
      setHasChanges(false);
    }
  }, [tenantConfig]);

  const handleToggle = (appId: string) => {
    // Don't allow toggling always-enabled apps
    if (ALWAYS_ENABLED_APPS.includes(appId)) return;

    setEnabledApps((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId);
      } else {
        return [...prev, appId];
      }
    });
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    // Always include settings app
    const appsToSave = [...new Set([...enabledApps, ...ALWAYS_ENABLED_APPS])];
    const success = await updateAppsConfig({ enabledApps: appsToSave });
    if (success) {
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    if (tenantConfig?.apps?.enabledApps) {
      setEnabledApps(tenantConfig.apps.enabledApps);
      setHasChanges(false);
    }
  };

  const isAppEnabled = (appId: string) => {
    return enabledApps.includes(appId) || ALWAYS_ENABLED_APPS.includes(appId);
  };

  // Group apps by category and sort alphabetically
  const appsByCategory = useMemo(() => {
    const grouped: Record<AppCategory, Array<(typeof AVAILABLE_APPS)[number]>> = {
      governance: [],
      testing: [],
      admin: [],
    };
    AVAILABLE_APPS.forEach((app) => {
      grouped[app.category].push(app);
    });
    // Sort each category alphabetically by name
    Object.keys(grouped).forEach((category) => {
      grouped[category as AppCategory].sort((a, b) => a.name.localeCompare(b.name));
    });
    return grouped;
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Apps Configuration</h2>
        <p className="text-sm text-gray-500 mb-6">
          Select which apps are available in this ecosystem. Disabled apps will not appear in the
          app launcher.
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

        {/* App List grouped by category */}
        <div className="space-y-6 mb-8">
          {categoryOrder.map((category) => {
            const categoryApps = appsByCategory[category];
            // For admin category, show Settings app
            const isAdminCategory = category === 'admin';

            return (
              <div key={category}>
                {/* Category Header */}
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  {categoryLabels[category]}
                </h3>

                <div className="space-y-2">
                  {/* Configurable apps in this category */}
                  {categoryApps.map((app) => {
                    const isEnabled = isAppEnabled(app.id);
                    const isAlwaysEnabled = ALWAYS_ENABLED_APPS.includes(app.id);

                    return (
                      <label
                        key={app.id}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          isEnabled
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        } ${isAlwaysEnabled ? 'cursor-not-allowed opacity-75' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggle(app.id)}
                          disabled={isAlwaysEnabled}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{app.name}</span>
                            {isAlwaysEnabled && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                Always enabled
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{app.description}</p>
                        </div>
                      </label>
                    );
                  })}

                  {/* Settings app in admin category */}
                  {isAdminCategory && (
                    <label className="flex items-start gap-3 p-4 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed opacity-75">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">Settings</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                            Always enabled
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Platform configuration and administration
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info note */}
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-2">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-amber-800">
              The Settings app is always enabled for administrators. Changes to app availability
              take effect immediately after saving.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
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
