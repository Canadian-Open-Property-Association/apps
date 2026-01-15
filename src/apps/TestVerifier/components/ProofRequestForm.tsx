/**
 * ProofRequestForm Component
 *
 * Shows template details and generates a proof request QR code.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestVerifierStore } from '../../../store/testVerifierStore';
import { CREDENTIAL_FORMAT_LABELS } from '../../../types/proofTemplate';

interface ProofRequestFormProps {
  socketSessionId: string | null;
}

export default function ProofRequestForm({ socketSessionId }: ProofRequestFormProps) {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const {
    templates,
    selectedTemplate,
    isLoading,
    error,
    selectTemplate,
    createProofRequest,
    clearCurrentProofRequest,
    clearError,
  } = useTestVerifierStore();

  const [isGenerating, setIsGenerating] = useState(false);

  // Load template on mount
  useEffect(() => {
    if (templateId) {
      selectTemplate(templateId);
    }
    return () => {
      clearCurrentProofRequest();
    };
  }, [templateId, selectTemplate, clearCurrentProofRequest]);

  // If template not found in local state, try to find it
  useEffect(() => {
    if (!selectedTemplate && templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        selectTemplate(template.id);
      }
    }
  }, [selectedTemplate, templateId, templates, selectTemplate]);

  const handleGenerateQR = async () => {
    if (!templateId || !socketSessionId) return;

    setIsGenerating(true);
    clearError();
    try {
      const proofRequest = await createProofRequest({
        templateId,
        socketSessionId,
      });
      // Navigate to the proof request display
      navigate(`/apps/test-verifier/request/${proofRequest.id}`);
    } catch {
      // Error is handled in store
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedTemplate) {
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

        <div className="flex items-center justify-center py-12">
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">Template not found</p>
              <button
                onClick={() => navigate('/apps/test-verifier')}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Return to Catalog
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
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
          <h1 className="text-xl font-semibold">{selectedTemplate.name}</h1>
          <p className="text-purple-100 text-sm mt-1">{selectedTemplate.description || 'No description'}</p>
        </div>

        {/* Template Details */}
        <div className="p-6 space-y-6">
          {/* Format and metadata */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
              {CREDENTIAL_FORMAT_LABELS[selectedTemplate.credentialFormat]}
            </span>
            <span className="text-sm text-gray-500">
              Version {selectedTemplate.version}
            </span>
            {selectedTemplate.metadata?.ecosystemTag && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                {selectedTemplate.metadata.ecosystemTag}
              </span>
            )}
          </div>

          {/* Requested Credentials */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Requested Credentials ({selectedTemplate.requestedCredentials.length})
            </h2>
            <div className="space-y-4">
              {selectedTemplate.requestedCredentials.map((cred) => (
                <div key={cred.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{cred.credentialName}</h3>
                    <span className="text-xs text-gray-400 font-mono">
                      {cred.catalogueCredentialId.substring(0, 8)}...
                    </span>
                  </div>

                  {/* Requested Attributes */}
                  {cred.requestedAttributes && cred.requestedAttributes.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Requested Attributes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cred.requestedAttributes.map((attr) => (
                          <span
                            key={attr.id}
                            className={`px-2 py-1 text-xs rounded ${
                              attr.required
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                            title={attr.required ? 'Required' : 'Optional'}
                          >
                            {attr.label || attr.attributeName}
                            {attr.selectiveDisclosure?.enabled && !attr.selectiveDisclosure?.revealValue && (
                              <span className="ml-1 text-purple-600" title="Prove without revealing">
                                (hidden)
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Predicates */}
                  {cred.predicates && cred.predicates.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Predicates
                      </h4>
                      <div className="space-y-1">
                        {cred.predicates.map((pred) => (
                          <div
                            key={pred.id}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <span className="w-4 h-4 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs">
                              P
                            </span>
                            <span>{pred.label || pred.attributeName}</span>
                            <span className="font-mono text-xs text-gray-500">
                              {pred.operator} {pred.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Socket status warning */}
          {!socketSessionId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Connecting to Orbit...</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Please wait for the socket connection to be established before generating a QR code.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={handleGenerateQR}
            disabled={isGenerating || !socketSessionId}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Generate Proof Request QR Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
