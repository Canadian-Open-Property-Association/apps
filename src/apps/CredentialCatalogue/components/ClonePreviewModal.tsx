/**
 * Clone Preview Modal
 *
 * Preview dialog that shows what will be created when cloning
 * a credential for issuance. Allows user to confirm before proceeding.
 */

import { useState } from 'react';
import type { CatalogueCredential, ImportErrorDetails, OrbitOperationLog } from '../../../types/catalogue';

// Helper to format date/time
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Component to display a single Orbit operation log (similar to CredentialDetail)
interface CloneLogEntryProps {
  title: string;
  log: OrbitOperationLog;
  isExpanded: boolean;
  onToggle: () => void;
}

function CloneLogEntry({ title, log, isExpanded, onToggle }: CloneLogEntryProps) {
  const bgColor = log.success ? 'bg-green-50' : 'bg-red-50';
  const borderColor = log.success ? 'border-green-200' : 'border-red-200';
  const iconColor = log.success ? 'text-green-600' : 'text-red-600';
  const textColor = log.success ? 'text-green-800' : 'text-red-800';
  const lightTextColor = log.success ? 'text-green-700' : 'text-red-700';
  const expandedBg = log.success ? 'bg-green-100/50' : 'bg-red-100/50';

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-opacity-80 transition-colors"
      >
        <div className="flex items-center gap-2">
          {log.success ? (
            <svg className={`w-4 h-4 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className={`w-4 h-4 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className={`text-sm font-medium ${textColor}`}>{title}</span>
          <span className={`text-xs ${lightTextColor}`}>
            {log.success ? 'Success' : 'Failed'}
            {log.statusCode && ` (${log.statusCode})`}
          </span>
        </div>
        <svg
          className={`w-4 h-4 ${lightTextColor} transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className={`border-t ${borderColor} ${expandedBg} p-3 space-y-3`}>
          {/* Timestamp */}
          <div className="text-xs">
            <span className={`${lightTextColor} font-medium`}>Timestamp:</span>
            <span className={`ml-2 ${textColor}`}>{formatDateTime(log.timestamp)}</span>
          </div>

          {/* Status Code */}
          {log.statusCode && (
            <div className="text-xs">
              <span className={`${lightTextColor} font-medium`}>Status Code:</span>
              <span className={`ml-2 ${textColor}`}>{log.statusCode}</span>
            </div>
          )}

          {/* Error Message */}
          {log.errorMessage && (
            <div className="text-xs">
              <span className={`${lightTextColor} font-medium`}>Error:</span>
              <span className={`ml-2 ${textColor}`}>{log.errorMessage}</span>
            </div>
          )}

          {/* Request URL */}
          {log.requestUrl && (
            <div className="text-xs">
              <span className={`${lightTextColor} font-medium`}>Request URL:</span>
              <code className={`block mt-1 p-2 bg-white rounded border ${borderColor} ${textColor} text-xs font-mono break-all`}>
                POST {log.requestUrl}
              </code>
            </div>
          )}

          {/* Request Payload */}
          {log.requestPayload && Object.keys(log.requestPayload).length > 0 && (
            <div className="text-xs">
              <span className={`${lightTextColor} font-medium`}>Request Payload:</span>
              <pre className={`mt-1 p-2 bg-white rounded border ${borderColor} ${textColor} text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap`}>
                {JSON.stringify(log.requestPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Body */}
          {log.responseBody && (
            <div className="text-xs">
              <span className={`${lightTextColor} font-medium`}>Response Body:</span>
              <pre className={`mt-1 p-2 bg-white rounded border ${borderColor} ${textColor} text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap`}>
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(log.responseBody), null, 2);
                  } catch {
                    return log.responseBody;
                  }
                })()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface CloneOptions {
  schemaName: string;
  schemaVersion: string;
  credDefTag: string;
  supportRevocation: boolean;
}

interface ClonePreviewModalProps {
  credential: CatalogueCredential;
  onClose: () => void;
  onConfirm: (options: CloneOptions) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  errorDetails?: ImportErrorDetails | null;
}

export default function ClonePreviewModal({
  credential,
  onClose,
  onConfirm,
  isLoading,
  error,
  errorDetails,
}: ClonePreviewModalProps) {
  // Allow customizing schema name and version to avoid conflicts
  const [schemaName, setSchemaName] = useState(credential.name);
  const [schemaVersion, setSchemaVersion] = useState(credential.version);
  const [credDefTag, setCredDefTag] = useState('default');
  const [supportRevocation, setSupportRevocation] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [expandedSchemaLog, setExpandedSchemaLog] = useState(false);
  const [expandedCredDefLog, setExpandedCredDefLog] = useState(true); // Auto-expand the failed one

  const handleConfirm = async () => {
    await onConfirm({ schemaName, schemaVersion, credDefTag, supportRevocation });
  };

  // Check if name or version has been customized
  const isCustomized = schemaName !== credential.name || schemaVersion !== credential.version;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Clone for Issuance</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            This will create a new schema and credential definition on your agent's ledger
            (BCOVRIN-TEST) that you can use to issue test credentials.
          </p>

          {/* Source Schema Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Source Schema
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Name</span>
                <span className="text-sm font-medium text-gray-900">{credential.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Version</span>
                <span className="text-sm font-medium text-gray-900">{credential.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Attributes</span>
                <span className="text-sm font-medium text-gray-900">
                  {credential.attributes.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Source Ledger</span>
                <span className="text-sm font-medium text-gray-900">{credential.ledger}</span>
              </div>
            </div>
          </div>

          {/* What Will Be Created */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
              Will Create
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Target Ledger</span>
                <span className="text-sm font-medium text-blue-900">BCOVRIN-TEST</span>
              </div>

              {/* Schema Name - Editable */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Schema Name</span>
                <input
                  type="text"
                  value={schemaName}
                  onChange={(e) => setSchemaName(e.target.value)}
                  className="w-48 px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={credential.name}
                  disabled={isLoading}
                />
              </div>

              {/* Schema Version - Editable */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Schema Version</span>
                <input
                  type="text"
                  value={schemaVersion}
                  onChange={(e) => setSchemaVersion(e.target.value)}
                  className="w-32 px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={credential.version}
                  disabled={isLoading}
                />
              </div>

              {/* Cred Def Tag - Editable */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Cred Def Tag</span>
                <input
                  type="text"
                  value={credDefTag}
                  onChange={(e) => setCredDefTag(e.target.value)}
                  className="w-32 px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="default"
                  disabled={isLoading}
                />
              </div>

              {/* Support Revocation - Checkbox */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-blue-600">Support Revocation</span>
                  <span className="text-xs text-blue-500">Enable credential revocation</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportRevocation}
                    onChange={(e) => setSupportRevocation(e.target.checked)}
                    disabled={isLoading}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Show notice if customized */}
              {isCustomized && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Note:</strong> You've customized the schema name/version. The cloned
                  credential will use these new values instead of the original.
                </div>
              )}
            </div>
          </div>

          {/* Attributes Preview */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Attributes to Clone ({credential.attributes.length})
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {credential.attributes.map((attr) => (
                <span
                  key={attr}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {attr}
                </span>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Clone Failed</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>

                  {/* Show Details Toggle - when we have individual logs */}
                  {errorDetails && (errorDetails.schemaLog || errorDetails.credDefLog) && (
                    <button
                      onClick={() => setShowErrorDetails(!showErrorDetails)}
                      className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
                    >
                      {showErrorDetails ? 'Hide API Details' : 'Show API Details'}
                    </button>
                  )}

                  {/* Detailed Error Logs - Collapsible entries for each operation */}
                  {showErrorDetails && errorDetails && (errorDetails.schemaLog || errorDetails.credDefLog) && (
                    <div className="mt-3 space-y-2">
                      {/* Schema Log */}
                      {errorDetails.schemaLog && (
                        <CloneLogEntry
                          title="Schema Registration"
                          log={errorDetails.schemaLog}
                          isExpanded={expandedSchemaLog}
                          onToggle={() => setExpandedSchemaLog(!expandedSchemaLog)}
                        />
                      )}

                      {/* Cred Def Log */}
                      {errorDetails.credDefLog && (
                        <CloneLogEntry
                          title="Credential Definition"
                          log={errorDetails.credDefLog}
                          isExpanded={expandedCredDefLog}
                          onToggle={() => setExpandedCredDefLog(!expandedCredDefLog)}
                        />
                      )}
                    </div>
                  )}

                  {/* Fallback: Show legacy orbitLog if no individual logs */}
                  {showErrorDetails && errorDetails && !errorDetails.schemaLog && !errorDetails.credDefLog && errorDetails.orbitLog && (
                    <div className="mt-3 space-y-2">
                      <CloneLogEntry
                        title="Orbit API Call"
                        log={errorDetails.orbitLog}
                        isExpanded={expandedCredDefLog}
                        onToggle={() => setExpandedCredDefLog(!expandedCredDefLog)}
                      />
                    </div>
                  )}

                  {/* Fallback: Show frontend request details if no Orbit logs at all */}
                  {errorDetails && !errorDetails.schemaLog && !errorDetails.credDefLog && !errorDetails.orbitLog && (
                    <>
                      <button
                        onClick={() => setShowErrorDetails(!showErrorDetails)}
                        className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
                      >
                        {showErrorDetails ? 'Hide Details' : 'Show Details'}
                      </button>
                      {showErrorDetails && (
                        <div className="mt-3 bg-white/50 rounded border border-red-200 p-3 text-xs font-mono space-y-2">
                          <div>
                            <span className="text-gray-500">Timestamp:</span>{' '}
                            <span className="text-gray-700">{errorDetails.timestamp}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Request URL:</span>{' '}
                            <span className="text-gray-700 break-all">{errorDetails.requestUrl}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Method:</span>{' '}
                            <span className="text-gray-700">{errorDetails.requestMethod}</span>
                          </div>
                          {errorDetails.statusCode && (
                            <div>
                              <span className="text-gray-500">Status Code:</span>{' '}
                              <span className="text-gray-700">{errorDetails.statusCode}</span>
                            </div>
                          )}
                          {errorDetails.requestPayload && (
                            <div>
                              <span className="text-gray-500 block mb-1">Request Payload:</span>
                              <pre className="text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto text-[10px]">
                                {JSON.stringify(errorDetails.requestPayload, null, 2)}
                              </pre>
                            </div>
                          )}
                          {errorDetails.responseBody && (
                            <div>
                              <span className="text-gray-500 block mb-1">Response Body:</span>
                              <pre className="text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto text-[10px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                                {(() => {
                                  try {
                                    return JSON.stringify(JSON.parse(errorDetails.responseBody), null, 2);
                                  } catch {
                                    return errorDetails.responseBody;
                                  }
                                })()}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>
              The cloned credential will be registered with Orbit and can be used in the Test
              Issuer app to issue credentials. Once created, schema and credential definitions
              exist permanently on the ledger.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !credDefTag.trim() || !schemaName.trim() || !schemaVersion.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Create Clone
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
