/**
 * CredentialPicker Component
 *
 * Modal for selecting credentials from the Credential Catalogue.
 * Filters are based on the current template's credential format.
 */

import { useState, useMemo } from 'react';
import type { CatalogueCredential } from '../../../types/catalogue';

interface CredentialPickerProps {
  credentials: CatalogueCredential[];
  existingCredentialIds: string[];
  onSelect: (credential: CatalogueCredential) => void;
  onClose: () => void;
}

export default function CredentialPicker({
  credentials,
  existingCredentialIds,
  onSelect,
  onClose,
}: CredentialPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter credentials based on search query and exclude already selected ones
  const filteredCredentials = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return credentials.filter((cred) => {
      // Exclude already selected credentials
      if (existingCredentialIds.includes(cred.id)) {
        return false;
      }
      // Search filter
      if (query) {
        return (
          cred.name.toLowerCase().includes(query) ||
          cred.ecosystemTag?.toLowerCase().includes(query) ||
          cred.issuerName?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [credentials, existingCredentialIds, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Select Credential</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Choose a credential from your Credential Catalogue
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search credentials..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Credentials list */}
        <div className="flex-1 overflow-y-auto">
          {credentials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="font-medium">No credentials found</p>
              <p className="text-sm mt-1">
                Import credentials in the Credential Catalogue first
              </p>
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">No matching credentials</p>
              <p className="text-sm mt-1">
                {existingCredentialIds.length > 0
                  ? 'All matching credentials are already added to this template'
                  : 'Try a different search term'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCredentials.map((credential) => (
                <button
                  key={credential.id}
                  onClick={() => onSelect(credential)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {credential.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          v{credential.version}
                        </span>
                      </div>

                      {credential.issuerName && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          Issuer: {credential.issuerName}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {credential.ecosystemTag && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                            {credential.ecosystemTag}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {credential.attributes.length} attributes
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {filteredCredentials.length} credential{filteredCredentials.length !== 1 ? 's' : ''} available
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
