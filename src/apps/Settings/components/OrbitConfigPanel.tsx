import { useState, useEffect } from 'react';
import { ORBIT_APIS, OrbitApiType, ORBIT_API_KEYS } from '../../../types/orbitApis';
import { useAdminStore } from '../../../store/adminStore';

export default function OrbitConfigPanel() {
  const {
    orbitConfig,
    isOrbitConfigLoading,
    orbitConfigError,
    fetchOrbitConfig,
    updateOrbitCredentials,
    updateApiConfig,
    resetOrbitConfig,
  } = useAdminStore();

  // Credentials state
  const [lobId, setLobId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Endpoints state - one baseUrl per API
  const [endpoints, setEndpoints] = useState<Record<OrbitApiType, string>>({
    lob: '',
    registerSocket: '',
    connection: '',
    holder: '',
    verifier: '',
    issuer: '',
    chat: '',
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasCredentialChanges, setHasCredentialChanges] = useState(false);
  const [hasEndpointChanges, setHasEndpointChanges] = useState(false);

  // Load config on mount
  useEffect(() => {
    fetchOrbitConfig();
  }, [fetchOrbitConfig]);

  // Update form when config loads
  useEffect(() => {
    if (orbitConfig) {
      setLobId(orbitConfig.lobId || '');
      setApiKey(''); // Never populate API key from stored config

      // Populate endpoints
      const newEndpoints: Record<OrbitApiType, string> = {
        lob: '',
        registerSocket: '',
        connection: '',
        holder: '',
        verifier: '',
        issuer: '',
        chat: '',
      };
      if (orbitConfig.apis) {
        for (const key of ORBIT_API_KEYS) {
          newEndpoints[key] = orbitConfig.apis[key]?.baseUrl || '';
        }
      }
      setEndpoints(newEndpoints);

      setHasCredentialChanges(false);
      setHasEndpointChanges(false);
    }
  }, [orbitConfig]);

  const handleLobIdChange = (value: string) => {
    setLobId(value);
    setHasCredentialChanges(true);
    setSuccessMessage(null);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setHasCredentialChanges(true);
    setSuccessMessage(null);
  };

  const handleEndpointChange = (apiType: OrbitApiType, value: string) => {
    setEndpoints((prev) => ({ ...prev, [apiType]: value }));
    setHasEndpointChanges(true);
    setSuccessMessage(null);
  };

  const handleSaveCredentials = async () => {
    setSuccessMessage(null);

    const success = await updateOrbitCredentials({
      lobId,
      apiKey: apiKey || undefined,
    });

    if (success) {
      setSuccessMessage('Credentials saved successfully');
      setApiKey('');
      setHasCredentialChanges(false);
    }
  };

  const handleSaveEndpoints = async () => {
    setSuccessMessage(null);

    // Save each endpoint that has changed
    let allSuccess = true;
    for (const apiType of ORBIT_API_KEYS) {
      const currentValue = orbitConfig?.apis?.[apiType]?.baseUrl || '';
      if (endpoints[apiType] !== currentValue) {
        const success = await updateApiConfig(apiType, endpoints[apiType]);
        if (!success) {
          allSuccess = false;
          break;
        }
      }
    }

    if (allSuccess) {
      setSuccessMessage('Endpoints saved successfully');
      setHasEndpointChanges(false);
    }
  };

  const handleReset = async () => {
    if (
      confirm(
        'Reset all Orbit configuration to environment variables? This will delete all saved settings.'
      )
    ) {
      await resetOrbitConfig();
      setSuccessMessage('Configuration reset to environment variables');
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Orbit Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure your Orbit LOB credentials and API endpoints
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              orbitConfig?.configured ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {orbitConfig?.configured ? 'Credentials Configured' : 'Not Configured'}
            </p>
            {orbitConfig?.source && (
              <p className="text-xs text-gray-500">
                Source: {orbitConfig.source === 'file' ? 'Saved configuration' : 'Environment variables'}
              </p>
            )}
          </div>
        </div>

        {orbitConfig?.configuredAt && (
          <p className="text-xs text-gray-400 mt-2">
            Last updated: {new Date(orbitConfig.configuredAt).toLocaleString()}
            {orbitConfig.configuredBy && ` by ${orbitConfig.configuredBy}`}
          </p>
        )}
      </div>

      {/* Error Message */}
      {orbitConfigError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{orbitConfigError}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Credentials Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Credentials</h3>
        <p className="text-sm text-gray-500 mb-4">
          Shared credentials used by all Orbit APIs
        </p>

        <div className="space-y-4">
          {/* LOB ID */}
          <div>
            <label htmlFor="lobId" className="block text-sm font-medium text-gray-700 mb-1">
              LOB ID
            </label>
            <input
              type="text"
              id="lobId"
              value={lobId}
              onChange={(e) => handleLobIdChange(e.target.value)}
              placeholder="Enter your LOB ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                id="apiKey"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={orbitConfig?.hasApiKey ? '••••••••••••••••' : 'Enter your API key'}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {orbitConfig?.hasApiKey
                ? 'API key is saved. Enter a new value to update it.'
                : 'Your API key for authenticating with Orbit APIs'}
            </p>
          </div>
        </div>

        {/* Credentials Actions */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleSaveCredentials}
            disabled={isOrbitConfigLoading || !lobId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isOrbitConfigLoading ? 'Saving...' : 'Save Credentials'}
          </button>

          {hasCredentialChanges && (
            <span className="text-sm text-amber-600">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Endpoints Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">API Endpoints</h3>
        <p className="text-sm text-gray-500 mb-4">
          Base URLs for each Orbit API service
        </p>

        <div className="space-y-4">
          {ORBIT_API_KEYS.map((apiType) => {
            const api = ORBIT_APIS[apiType];
            return (
              <div key={apiType}>
                <label
                  htmlFor={`endpoint-${apiType}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {api.label}
                </label>
                <input
                  type="url"
                  id={`endpoint-${apiType}`}
                  value={endpoints[apiType]}
                  onChange={(e) => handleEndpointChange(apiType, e.target.value)}
                  placeholder={`https://${apiType}.eapi.nborbit.ca/`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-0.5">{api.description}</p>
              </div>
            );
          })}
        </div>

        {/* Endpoints Actions */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleSaveEndpoints}
            disabled={isOrbitConfigLoading || !hasEndpointChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isOrbitConfigLoading ? 'Saving...' : 'Save Endpoints'}
          </button>

          {hasEndpointChanges && (
            <span className="text-sm text-amber-600">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Reset Section */}
      {orbitConfig?.source === 'file' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Reset Configuration</p>
              <p className="text-xs text-gray-500">
                Delete saved settings and revert to environment variables
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={isOrbitConfigLoading}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
