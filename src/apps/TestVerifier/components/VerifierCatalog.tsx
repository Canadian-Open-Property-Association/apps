/**
 * VerifierCatalog Component
 *
 * Dashboard showing published proof templates available for verification.
 * Users can select a template to generate a proof request QR code.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestVerifierStore } from '../../../store/testVerifierStore';
import { CREDENTIAL_FORMAT_LABELS, CredentialFormat } from '../../../types/proofTemplate';
import { AppNavBar, NavDivider } from '../../../components/AppNavBar';

interface VerifierCatalogProps {
  socketSessionId: string | null;
}

export default function VerifierCatalog({ socketSessionId: _socketSessionId }: VerifierCatalogProps) {
  const navigate = useNavigate();
  const {
    templates,
    orbitConfig,
    isLoading,
    error,
    fetchPublishedTemplates,
    checkOrbitConnection,
    clearError,
  } = useTestVerifierStore();

  const [filterFormat, setFilterFormat] = useState<string>('all');

  // Fetch templates and check Orbit connection on mount
  useEffect(() => {
    fetchPublishedTemplates();
    checkOrbitConnection();
  }, [fetchPublishedTemplates, checkOrbitConnection]);

  // Filter templates by format
  const filteredTemplates =
    filterFormat === 'all'
      ? templates
      : templates.filter((t) => t.credentialFormat === filterFormat);

  // Get unique formats from templates
  const availableFormats = Array.from(new Set(templates.map((t) => t.credentialFormat)));

  // Show Orbit connection status banner if not connected
  if (!isLoading && orbitConfig && !orbitConfig.connected) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 text-yellow-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-yellow-800">Orbit LOB Not Configured</h2>
              <p className="text-yellow-700 mt-2">
                Test Verifier requires Orbit LOB to be configured for proof verification.
                Please configure the following environment variables:
              </p>
              <ul className="mt-3 text-yellow-700 list-disc list-inside space-y-1">
                <li><code className="bg-yellow-100 px-1 rounded">ORBIT_BASE_URL</code> - Orbit API base URL</li>
                <li><code className="bg-yellow-100 px-1 rounded">ORBIT_TENANT_ID</code> - Your Orbit tenant ID</li>
                <li><code className="bg-yellow-100 px-1 rounded">ORBIT_LOB_ID</code> - Your Orbit LOB ID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Nav Bar */}
      <AppNavBar
        left={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/apps/test-verifier/history')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Verification History
            </button>

            <NavDivider />

            {/* Orbit connection status */}
            {orbitConfig?.connected && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Orbit Connected
              </span>
            )}

            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {templates.length} template{templates.length !== 1 ? 's' : ''} available
            </span>
          </div>
        }
      />

      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Format filter */}
        {templates.length > 0 && availableFormats.length > 1 && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <select
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Formats</option>
              {availableFormats.map((format) => (
                <option key={format} value={format}>
                  {CREDENTIAL_FORMAT_LABELS[format as CredentialFormat]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Loading state */}
        {isLoading && templates.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && templates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No proof templates available</h3>
            <p className="text-gray-500 mb-4">
              Publish templates from the Proof Template Builder to use them here
            </p>
            <button
              onClick={() => navigate('/apps/proof-templates')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Go to Proof Templates
            </button>
          </div>
        )}

        {/* Templates grid */}
        {filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{template.description}</p>
                    )}
                  </div>
                </div>

                {/* Format badge and stats */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    {CREDENTIAL_FORMAT_LABELS[template.credentialFormat]}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    {template.requestedCredentials.length} credential{template.requestedCredentials.length !== 1 ? 's' : ''}
                  </span>
                  {template.requestedCredentials.reduce((sum, c) => sum + (c.predicates?.length || 0), 0) > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded">
                      Has predicates
                    </span>
                  )}
                </div>

                {/* Requested credentials list */}
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  {template.requestedCredentials.slice(0, 3).map((cred) => (
                    <div key={cred.id} className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="truncate">{cred.credentialName}</span>
                    </div>
                  ))}
                  {template.requestedCredentials.length > 3 && (
                    <div className="text-gray-400">
                      +{template.requestedCredentials.length - 3} more
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t pt-3">
                  <button
                    onClick={() => navigate(`/apps/test-verifier/verify/${template.id}`)}
                    className="flex-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Generate QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
