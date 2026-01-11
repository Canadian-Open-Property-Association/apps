/**
 * Orbit Credentials Panel
 *
 * Manages shared LOB ID and API Key used by all Orbit APIs.
 * Extracted from OrbitConfigPanel for the new secondary navigation layout.
 */

import { useState, useEffect } from 'react';
import { useAdminStore } from '../../../store/adminStore';

export default function CredentialsPanel() {
  const {
    orbitConfig,
    isOrbitConfigLoading,
    orbitConfigError,
    updateOrbitCredentials,
    resetOrbitConfig,
  } = useAdminStore();

  // Credentials state
  const [lobId, setLobId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyApiKey = async () => {
    if (apiKey) {
      try {
        await navigator.clipboard.writeText(apiKey);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Update form when config loads
  useEffect(() => {
    if (orbitConfig) {
      setLobId(orbitConfig.lobId || '');
      setApiKey(''); // Never populate API key from stored config
      setHasChanges(false);
    }
  }, [orbitConfig]);

  const handleLobIdChange = (value: string) => {
    setLobId(value);
    setHasChanges(true);
    setSuccessMessage(null);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setHasChanges(true);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setSuccessMessage(null);

    const success = await updateOrbitCredentials({
      lobId,
      apiKey: apiKey || undefined,
    });

    if (success) {
      setSuccessMessage('Credentials saved successfully');
      setApiKey('');
      setHasChanges(false);
    }
  };

  const handleReset = async () => {
    if (
      confirm(
        'Reset all Orbit configuration to environment variables? This will delete all saved settings including API endpoints.'
      )
    ) {
      await resetOrbitConfig();
      setSuccessMessage('Configuration reset to environment variables');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Orbit Credentials</h2>
        <p className="text-sm text-gray-500 mt-1">
          Shared credentials used by all Orbit APIs
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

      {/* Credentials Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
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
            <p className="text-xs text-gray-500 mt-1">
              Your Line of Business identifier for the Orbit platform
            </p>
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative flex">
              <input
                type={showApiKey ? 'text' : 'password'}
                id="apiKey"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={orbitConfig?.hasApiKey ? '••••••••••••••••' : 'Enter your API key'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm"
                title={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={handleCopyApiKey}
                disabled={!apiKey}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy to clipboard"
              >
                {copySuccess ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {orbitConfig?.hasApiKey
                ? 'API key is saved securely. Enter a new value to update it.'
                : 'Your API key for authenticating with Orbit APIs. Stored encrypted at rest.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={isOrbitConfigLoading || !lobId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isOrbitConfigLoading ? 'Saving...' : 'Save Credentials'}
          </button>

          {hasChanges && (
            <span className="text-sm text-amber-600">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
          <div>
            <p className="text-sm font-medium text-blue-900">Security Note</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Your API key is encrypted with AES-256-GCM before being stored.
              It is never displayed after saving - only used for API authentication.
            </p>
          </div>
        </div>
      </div>

      {/* Reset Section */}
      {orbitConfig?.source === 'file' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Reset All Configuration</p>
              <p className="text-xs text-gray-500">
                Delete all saved settings and revert to environment variables
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
