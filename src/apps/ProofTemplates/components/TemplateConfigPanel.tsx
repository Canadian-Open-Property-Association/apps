/**
 * Template Config Panel
 *
 * Two-pane layout for configuring a proof template:
 * - Left pane: Template metadata, credential format, and requested credentials list
 * - Right pane: Selected credential attribute/predicate editor
 */

import { useState } from 'react';
import { useProofTemplateStore } from '../../../store/proofTemplateStore';
import {
  CredentialFormat,
  CREDENTIAL_FORMAT_LABELS,
} from '../../../types/proofTemplate';
import CredentialPicker from './CredentialPicker';
import RequestedCredentialEditor from './RequestedCredentialEditor';

export default function TemplateConfigPanel() {
  const {
    currentTemplate,
    selectedCredentialId,
    filteredCatalogueCredentials,
    isLoading,
    error,
    updateTemplateName,
    updateTemplateDescription,
    updateTemplateVersion,
    updateTemplateMetadata,
    updateCredentialFormat,
    addRequestedCredential,
    removeRequestedCredential,
    selectCredential,
    clearError,
    templateTypes,
  } = useProofTemplateStore();

  const [showCredentialPicker, setShowCredentialPicker] = useState(false);

  const selectedRequestedCredential = currentTemplate?.requestedCredentials.find(
    (c) => c.id === selectedCredentialId
  );

  // Loading state
  if (isLoading && !currentTemplate) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading template...</p>
        </div>
      </div>
    );
  }

  // No template selected
  if (!currentTemplate) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700">Select a Template</p>
          <p className="text-sm text-gray-500 mt-1">Choose a template from the sidebar to edit</p>
        </div>
      </div>
    );
  }

  const handleFormatChange = (format: CredentialFormat) => {
    if (currentTemplate.requestedCredentials.length > 0) {
      if (!confirm('Changing format will clear all requested credentials. Continue?')) {
        return;
      }
    }
    updateCredentialFormat(format);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between">
          <span className="text-red-800 text-sm">{error}</span>
          <button onClick={clearError} className="text-red-600 hover:text-red-800">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Two-pane layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane - Template metadata and credentials list */}
        <div className="w-80 flex-shrink-0 bg-white border-r flex flex-col overflow-hidden">
          {/* Template metadata */}
          <div className="p-4 border-b space-y-3">
            {/* Template name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Template Name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentTemplate.name}
                  onChange={(e) => updateTemplateName(e.target.value)}
                  className="flex-1 text-sm font-medium text-gray-900 border border-gray-200 rounded px-2 py-1.5 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Template name..."
                />
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                  currentTemplate.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentTemplate.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea
                value={currentTemplate.description}
                onChange={(e) => updateTemplateDescription(e.target.value)}
                placeholder="What does this template verify?"
                rows={2}
                className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Credential Format (locked after credentials added) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Credential Format
                {currentTemplate.requestedCredentials.length > 0 && (
                  <span className="ml-1 text-gray-400">(locked)</span>
                )}
              </label>
              <select
                value={currentTemplate.credentialFormat}
                onChange={(e) => handleFormatChange(e.target.value as CredentialFormat)}
                disabled={currentTemplate.requestedCredentials.length > 0}
                className={`w-full text-sm px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  currentTemplate.requestedCredentials.length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                {(Object.keys(CREDENTIAL_FORMAT_LABELS) as CredentialFormat[]).map((format) => (
                  <option key={format} value={format}>
                    {CREDENTIAL_FORMAT_LABELS[format]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                One format per template (Orbit compound proof requirement)
              </p>
            </div>

            {/* Category and Version */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select
                  value={currentTemplate.metadata.category}
                  onChange={(e) => updateTemplateMetadata({ category: e.target.value })}
                  className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {templateTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-500 mb-1">Version</label>
                <input
                  type="text"
                  value={currentTemplate.version}
                  onChange={(e) => updateTemplateVersion(e.target.value)}
                  className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Requested Credentials list */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 border-b bg-gray-50 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-sm font-medium text-gray-700">
                Requested Credentials ({currentTemplate.requestedCredentials.length})
              </h3>
              <button
                onClick={() => setShowCredentialPicker(true)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                title="Add credential from catalogue"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {currentTemplate.requestedCredentials.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-sm">No credentials yet</p>
                <button
                  onClick={() => setShowCredentialPicker(true)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Add from Credential Catalogue
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {currentTemplate.requestedCredentials.map((cred, index) => (
                  <div
                    key={cred.id}
                    onClick={() => selectCredential(cred.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedCredentialId === cred.id
                        ? 'bg-blue-50 border-l-2 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {cred.credentialName || `Credential ${index + 1}`}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {cred.requestedAttributes.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {cred.requestedAttributes.length} attr
                            </span>
                          )}
                          {cred.predicates.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                              {cred.predicates.length} predicate{cred.predicates.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRequestedCredential(cred.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove credential"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right pane - Credential editor */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {selectedRequestedCredential ? (
            <RequestedCredentialEditor credential={selectedRequestedCredential} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p>Select a credential to configure</p>
                <p className="text-sm mt-1">or add a credential from the catalogue</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credential Picker Modal */}
      {showCredentialPicker && (
        <CredentialPicker
          credentials={filteredCatalogueCredentials}
          existingCredentialIds={currentTemplate.requestedCredentials.map((c) => c.catalogueCredentialId)}
          onSelect={(credential) => {
            addRequestedCredential(credential);
            setShowCredentialPicker(false);
          }}
          onClose={() => setShowCredentialPicker(false)}
        />
      )}
    </div>
  );
}
