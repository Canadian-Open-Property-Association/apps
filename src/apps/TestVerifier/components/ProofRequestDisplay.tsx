/**
 * ProofRequestDisplay Component
 *
 * Displays the QR code for a proof request and shows real-time status updates.
 */

import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useTestVerifierStore } from '../../../store/testVerifierStore';
import { STATUS_COLORS, STATUS_LABELS, ProofRequestStatus } from '../../../types/verifier';

export default function ProofRequestDisplay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentProofRequest,
    isLoading,
    error,
    fetchProofRequest,
    refreshProofRequestStatus,
    clearError,
  } = useTestVerifierStore();

  const pollIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // Fetch proof request on mount
  useEffect(() => {
    if (id) {
      fetchProofRequest(id);
    }
  }, [id, fetchProofRequest]);

  // Poll for status updates
  useEffect(() => {
    if (!currentProofRequest) return;

    const shouldPoll = ['generated', 'scanned', 'request-sent', 'proof-received'].includes(
      currentProofRequest.status
    );

    if (shouldPoll && id) {
      pollIntervalRef.current = setInterval(() => {
        refreshProofRequestStatus(id).catch(() => {
          // Silently ignore polling errors
        });
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [currentProofRequest?.status, id, refreshProofRequestStatus]);

  const getStatusIcon = (status: ProofRequestStatus) => {
    switch (status) {
      case 'generated':
        return (
          <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'scanned':
      case 'request-sent':
      case 'proof-received':
        return (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'verified':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'expired':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading && !currentProofRequest) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!currentProofRequest) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/apps/test-verifier')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Templates
        </button>
        <div className="text-center py-12">
          <p className="text-gray-500">Proof request not found</p>
        </div>
      </div>
    );
  }

  const statusColors = STATUS_COLORS[currentProofRequest.status];
  const statusLabel = STATUS_LABELS[currentProofRequest.status];
  const isComplete = ['verified', 'failed', 'expired'].includes(currentProofRequest.status);

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/apps/test-verifier')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Templates
      </button>

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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <h1 className="text-xl font-semibold">Proof Request</h1>
          <p className="text-purple-100 text-sm mt-1">{currentProofRequest.templateName}</p>
        </div>

        {/* QR Code */}
        <div className="p-8 flex flex-col items-center">
          {currentProofRequest.status === 'generated' && currentProofRequest.shortUrl ? (
            <>
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-inner">
                <QRCodeSVG
                  value={currentProofRequest.shortUrl}
                  size={256}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="mt-4 text-gray-600 text-center">
                Scan this QR code with your digital wallet to present your credentials
              </p>
            </>
          ) : currentProofRequest.status === 'verified' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Verification Successful!</h2>
              <p className="text-gray-600 mt-2">The credentials have been verified.</p>
            </div>
          ) : currentProofRequest.status === 'failed' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600 mt-2">
                {currentProofRequest.errorMessage || 'The credentials could not be verified.'}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                {getStatusIcon(currentProofRequest.status)}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{statusLabel}</h2>
              <p className="text-gray-600 mt-2">Processing verification request...</p>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className={`px-6 py-4 border-t ${statusColors.bg} ${statusColors.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={statusColors.text}>
                {getStatusIcon(currentProofRequest.status)}
              </span>
              <span className={`font-medium ${statusColors.text}`}>{statusLabel}</span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(currentProofRequest.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            {isComplete && (
              <button
                onClick={() => navigate('/apps/test-verifier')}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                New Verification
              </button>
            )}
            {currentProofRequest.shortUrl && (
              <button
                onClick={() => navigator.clipboard.writeText(currentProofRequest.shortUrl)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy URL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification result */}
      {currentProofRequest.verificationResult && (
        <details className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <summary className="px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 font-medium text-gray-700">
            View Verification Result
          </summary>
          <div className="p-4 border-t">
            <pre className="text-xs font-mono bg-gray-50 p-3 rounded overflow-x-auto">
              {JSON.stringify(currentProofRequest.verificationResult, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {/* Request payload (debug) */}
      <details className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 font-medium text-gray-700">
          View Request Details
        </summary>
        <div className="p-4 border-t">
          <pre className="text-xs font-mono bg-gray-50 p-3 rounded overflow-x-auto">
            {currentProofRequest.requestPayload
              ? JSON.stringify(JSON.parse(currentProofRequest.requestPayload), null, 2)
              : 'No request payload'}
          </pre>
        </div>
      </details>
    </div>
  );
}
