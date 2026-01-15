/**
 * VerificationHistory Component
 *
 * Shows the history of proof verification requests.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestVerifierStore } from '../../../store/testVerifierStore';
import { CREDENTIAL_FORMAT_LABELS, CredentialFormat } from '../../../types/proofTemplate';
import { STATUS_COLORS, STATUS_LABELS } from '../../../types/verifier';
import { AppNavBar, NavDivider } from '../../../components/AppNavBar';

export default function VerificationHistory() {
  const navigate = useNavigate();
  const {
    proofRequests,
    isLoading,
    error,
    fetchProofRequests,
    clearError,
  } = useTestVerifierStore();

  // Fetch history on mount
  useEffect(() => {
    fetchProofRequests();
  }, [fetchProofRequests]);

  return (
    <>
      {/* Nav Bar */}
      <AppNavBar
        left={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/apps/test-verifier')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Templates
            </button>

            <NavDivider />

            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {proofRequests.length} request{proofRequests.length !== 1 ? 's' : ''}
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

        {/* Loading state */}
        {isLoading && proofRequests.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && proofRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No verification history</h3>
            <p className="text-gray-500 mb-4">
              Generate proof requests to see them here
            </p>
            <button
              onClick={() => navigate('/apps/test-verifier')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Proof Request
            </button>
          </div>
        )}

        {/* History table */}
        {proofRequests.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proofRequests.map((request) => {
                  const statusColors = STATUS_COLORS[request.status];
                  const statusLabel = STATUS_LABELS[request.status];

                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.templateName}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {request.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          {CREDENTIAL_FORMAT_LABELS[request.credentialFormat as CredentialFormat]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors.bg} ${statusColors.text}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.verifiedAt
                          ? new Date(request.verifiedAt).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/apps/test-verifier/request/${request.id}`)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
