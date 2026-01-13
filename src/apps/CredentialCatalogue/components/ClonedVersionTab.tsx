/**
 * Cloned Version Tab
 *
 * Displays information about the cloned (issuable) version of a credential.
 * Shows the new schema and cred def IDs on the target ledger, Orbit IDs,
 * and provides links to Test Issuer and delete actions.
 */

import { useState } from 'react';
import type { CatalogueCredential, OrbitOperationLog } from '../../../types/catalogue';

interface ClonedVersionTabProps {
  credential: CatalogueCredential;
  onDeleteClone: () => Promise<void>;
  isDeleting: boolean;
}

// Format date for display
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Component to display a single Orbit operation log (matches CredentialDetail style)
interface OrbitLogEntryProps {
  title: string;
  log: OrbitOperationLog;
  isExpanded: boolean;
  onToggle: () => void;
}

function OrbitLogEntry({ title, log, isExpanded, onToggle }: OrbitLogEntryProps) {
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
          {log.timestamp && (
            <div className="text-xs">
              <span className={`${lightTextColor} font-medium`}>Timestamp:</span>
              <span className={`ml-2 ${textColor}`}>{formatDateTime(log.timestamp)}</span>
            </div>
          )}

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
              <pre className={`mt-1 p-2 bg-white rounded border ${borderColor} ${textColor} text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap`}>
                {JSON.stringify(log.requestPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Body */}
          {log.responseBody && (
            <div className="text-xs">
              <span className={`${lightTextColor} font-medium`}>Response Body:</span>
              <pre className={`mt-1 p-2 bg-white rounded border ${borderColor} ${textColor} text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap`}>
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

export default function ClonedVersionTab({
  credential,
  onDeleteClone,
  isDeleting,
}: ClonedVersionTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedLogSection, setExpandedLogSection] = useState<'schema' | 'creddef' | null>(null);

  const handleDelete = async () => {
    await onDeleteClone();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-4">
      {/* Clone Info Header */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800">Issuable Clone Created</h3>
            <p className="text-xs text-green-600 mt-1">
              This credential has been cloned for issuance on {credential.clonedLedger?.toUpperCase()}.
              You can now issue test credentials using this schema.
            </p>
            {credential.clonedAt && (
              <p className="text-xs text-green-500 mt-2">
                Created {formatDateTime(credential.clonedAt)}
                {credential.clonedBy && ` by ${credential.clonedBy}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Identifiers */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Cloned Ledger Identifiers</h3>
        <div className="space-y-3">
          {/* Target Ledger */}
          <div>
            <label className="text-xs text-gray-500">Target Ledger</label>
            <p className="text-sm font-medium text-gray-800 mt-1">
              {credential.clonedLedger?.toUpperCase() || 'BCOVRIN-TEST'}
            </p>
          </div>

          {/* Schema ID */}
          {credential.clonedSchemaId && (
            <div>
              <label className="text-xs text-gray-500">Schema ID</label>
              <p className="text-xs font-mono text-gray-800 mt-1 break-all bg-white p-2 rounded border border-gray-200">
                {credential.clonedSchemaId}
              </p>
            </div>
          )}

          {/* Cred Def ID */}
          {credential.clonedCredDefId && (
            <div>
              <label className="text-xs text-gray-500">Credential Definition ID</label>
              <p className="text-xs font-mono text-gray-800 mt-1 break-all bg-white p-2 rounded border border-gray-200">
                {credential.clonedCredDefId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Orbit Registration */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          Orbit Registration
        </h3>

        {/* Orbit IDs Summary */}
        {(credential.clonedOrbitSchemaId || credential.clonedOrbitCredDefId) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-blue-800 mb-2">Orbit IDs</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-600">Schema ID:</span>
                <code className="ml-1 bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">
                  {credential.clonedOrbitSchemaId || 'N/A'}
                </code>
              </div>
              <div>
                <span className="text-blue-600">Cred Def ID:</span>
                <code className="ml-1 bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">
                  {credential.clonedOrbitCredDefId || 'N/A'}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* API Operation Logs */}
        <div className="space-y-3">
          {/* Schema Creation Log */}
          {credential.clonedOrbitSchemaLog && (
            <OrbitLogEntry
              title="Schema Creation"
              log={credential.clonedOrbitSchemaLog}
              isExpanded={expandedLogSection === 'schema'}
              onToggle={() => setExpandedLogSection(expandedLogSection === 'schema' ? null : 'schema')}
            />
          )}

          {/* Cred Def Creation Log */}
          {credential.clonedOrbitCredDefLog && (
            <OrbitLogEntry
              title="Credential Definition Creation"
              log={credential.clonedOrbitCredDefLog}
              isExpanded={expandedLogSection === 'creddef'}
              onToggle={() => setExpandedLogSection(expandedLogSection === 'creddef' ? null : 'creddef')}
            />
          )}

          {/* No logs available message */}
          {!credential.clonedOrbitSchemaLog && !credential.clonedOrbitCredDefLog && (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
              <p>No API operation logs available for this clone.</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Open in Test Issuer */}
        <a
          href="/apps/test-issuer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Open in Test Issuer
        </a>

        {/* Delete Clone */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-red-600 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Cloned Version
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-3">
              Are you sure you want to delete this cloned version? The schema and credential
              definition will remain on the ledger, but you won't be able to issue credentials
              using this clone from the catalogue.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Clone'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note about permanence */}
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
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
          Note: Schemas and credential definitions published to a ledger exist permanently
          and cannot be deleted. Deleting the clone only removes it from this catalogue.
        </p>
      </div>
    </div>
  );
}
