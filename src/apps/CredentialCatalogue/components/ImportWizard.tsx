/**
 * Import Wizard Component
 *
 * Step-by-step wizard for adding credentials to the catalogue.
 * Supports both creating new credentials and importing existing ones.
 * Displayed as a modal overlay.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueStore } from '../../../store/catalogueStore';
import { useEntityStore } from '../../../store/entityStore';

type WizardMode = 'create' | 'import' | null;
type CredentialFormatOption = 'anoncreds' | 'w3c-json-ld' | 'w3c-sd-jwt' | 'iso-mdl';
type WizardStep =
  | 'initial-choice'    // Create New vs Import Existing
  | 'format-selection'  // Select credential format
  | 'coming-soon'       // Placeholder for Create New flow
  | 'schema'            // Import: Enter schema URL
  | 'creddef'           // Import: Enter cred def URL
  | 'details'           // Import: Add details
  | 'confirm';          // Import: Confirm import

interface ImportWizardProps {
  onClose: () => void;
  onComplete: (credentialId: string) => void;
}

export default function ImportWizard({ onClose, onComplete }: ImportWizardProps) {
  const {
    isLoading,
    error,
    errorDetails,
    parsedSchema,
    parsedCredDef,
    orbitStatus,
    ecosystemTags,
    parseSchemaUrl,
    parseCredDefUrl,
    importCredential,
    fetchOrbitStatus,
    fetchTags,
    clearParsedData,
    clearError,
  } = useCatalogueStore();

  const { entities, fetchEntities } = useEntityStore();

  // Wizard navigation state
  const [step, setStep] = useState<WizardStep>('initial-choice');
  const [wizardMode, setWizardMode] = useState<WizardMode>(null);
  const [selectedFormat, setSelectedFormat] = useState<CredentialFormatOption | null>(null);

  // Form state
  const [schemaUrl, setSchemaUrl] = useState('');
  const [credDefUrl, setCredDefUrl] = useState('');
  const [ecosystemTagId, setEcosystemTagId] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [registerWithOrbit, setRegisterWithOrbit] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [entitySearchQuery, setEntitySearchQuery] = useState('');
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchOrbitStatus();
    fetchTags();
    fetchEntities();
  }, [fetchOrbitStatus, fetchTags, fetchEntities]);

  // Filter entities based on search query
  const filteredEntities = useMemo(() => {
    if (!entitySearchQuery.trim()) return entities;
    const query = entitySearchQuery.toLowerCase();
    return entities.filter(
      (entity) =>
        entity.name.toLowerCase().includes(query) ||
        entity.entityTypes?.some((t) => t.toLowerCase().includes(query))
    );
  }, [entities, entitySearchQuery]);

  // Get selected entity name for display
  const selectedEntity = useMemo(() => {
    return entities.find((e) => e.id === selectedEntityId);
  }, [entities, selectedEntityId]);

  // Update issuerName when entity is selected
  useEffect(() => {
    if (selectedEntity) {
      setIssuerName(selectedEntity.name);
    }
  }, [selectedEntity]);

  // Helper function for format display names
  const getFormatDisplayName = (format: CredentialFormatOption | null): string => {
    switch (format) {
      case 'anoncreds':
        return 'AnonCreds';
      case 'w3c-json-ld':
        return 'W3C JSON-LD';
      case 'w3c-sd-jwt':
        return 'W3C SD-JWT';
      case 'iso-mdl':
        return 'ISO 18013-5 (mDL)';
      default:
        return '';
    }
  };

  // Progress steps for import flow (after format selection)
  const importSteps: WizardStep[] = ['format-selection', 'schema', 'creddef', 'details', 'confirm'];

  const getImportStepIndex = (): number => {
    return importSteps.indexOf(step);
  };

  const handleParseSchema = async () => {
    try {
      clearError();
      await parseSchemaUrl(schemaUrl);
      setStep('creddef');
    } catch {
      // Error is handled in store
    }
  };

  const handleParseCredDef = async () => {
    try {
      clearError();
      await parseCredDefUrl(credDefUrl);
      setStep('details');
    } catch {
      // Error is handled in store
    }
  };

  const handleImport = async () => {
    if (!parsedSchema || !parsedCredDef || !ecosystemTagId) return;

    try {
      clearError();
      const credential = await importCredential({
        schemaData: parsedSchema,
        credDefData: parsedCredDef,
        ecosystemTagId,
        issuerName: issuerName || undefined,
        issuerEntityId: selectedEntityId || undefined,
        schemaSourceUrl: schemaUrl,
        credDefSourceUrl: credDefUrl,
        registerWithOrbit,
      });
      onComplete(credential.id);
    } catch {
      // Error is handled in store
    }
  };

  const handleCancel = () => {
    clearParsedData();
    clearError();
    setWizardMode(null);
    setSelectedFormat(null);
    setStep('initial-choice');
    onClose();
  };

  const handleBack = () => {
    clearError();
    switch (step) {
      case 'format-selection':
        setStep('initial-choice');
        setWizardMode(null);
        setSelectedFormat(null);
        break;
      case 'coming-soon':
        setStep('format-selection');
        setSelectedFormat(null);
        break;
      case 'schema':
        setStep('format-selection');
        setSelectedFormat(null);
        break;
      case 'creddef':
        setStep('schema');
        break;
      case 'details':
        setStep('creddef');
        break;
      case 'confirm':
        setStep('details');
        break;
      default:
        break;
    }
  };

  const handleSelectEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
    setShowEntityDropdown(false);
    setEntitySearchQuery('');
  };

  const handleClearEntity = () => {
    setSelectedEntityId('');
    setIssuerName('');
    setEntitySearchQuery('');
  };

  // Get dynamic header content based on current state
  const getHeaderTitle = (): string => {
    if (step === 'initial-choice') return 'Add Credential';
    if (wizardMode === 'create') return 'Create New Credential';
    return 'Import Credential';
  };

  const getHeaderDescription = (): string => {
    if (step === 'initial-choice') return 'Add a credential to your catalogue';
    if (wizardMode === 'create') return 'Define a new credential schema and definition';
    return 'Import a credential from an Indy ledger using IndyScan URLs';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{getHeaderTitle()}</h1>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600">{getHeaderDescription()}</p>
          </div>

          {/* Progress Steps - Only show for import flow after format selection */}
          {wizardMode === 'import' && step !== 'initial-choice' && step !== 'format-selection' && (
            <div className="flex items-center gap-2 mb-8">
              {importSteps.slice(1).map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === s
                        ? 'bg-blue-600 text-white'
                        : getImportStepIndex() > i + 1
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {getImportStepIndex() > i + 1 ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 3 && <div className="w-12 h-0.5 bg-gray-200 ml-2" />}
                </div>
              ))}
            </div>
          )}

          {/* Error Display with Expandable Details */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg overflow-hidden">
              <div className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                  {errorDetails && (
                    <button
                      onClick={() => setShowErrorDetails(!showErrorDetails)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${showErrorDetails ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {showErrorDetails ? 'Hide' : 'Show'} technical details
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    clearError();
                    setShowErrorDetails(false);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Expandable Error Details */}
              {showErrorDetails && errorDetails && (
                <div className="border-t border-red-200 bg-red-100/50 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {errorDetails.statusCode && (
                      <div>
                        <span className="text-red-600 font-medium">Status Code:</span>
                        <span className="ml-2 text-red-800">{errorDetails.statusCode}</span>
                      </div>
                    )}
                    {errorDetails.timestamp && (
                      <div>
                        <span className="text-red-600 font-medium">Time:</span>
                        <span className="ml-2 text-red-800">
                          {new Date(errorDetails.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {errorDetails.requestUrl && (
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">Request URL:</span>
                      <code className="block mt-1 p-2 bg-white rounded border border-red-200 text-red-800 text-xs font-mono break-all">
                        {errorDetails.requestMethod} {errorDetails.requestUrl}
                      </code>
                    </div>
                  )}

                  {errorDetails.requestPayload && (
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">Request Payload:</span>
                      <pre className="mt-1 p-2 bg-white rounded border border-red-200 text-red-800 text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                        {JSON.stringify(errorDetails.requestPayload, null, 2)}
                      </pre>
                    </div>
                  )}

                  {errorDetails.responseBody && (
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">Response Body:</span>
                      <pre className="mt-1 p-2 bg-white rounded border border-red-200 text-red-800 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
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
            </div>
          )}

          {/* Step: Initial Choice */}
          {step === 'initial-choice' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                How would you like to add a credential?
              </h2>
              <p className="text-gray-600 mb-6">
                Choose whether to create a new credential definition or import an existing one from an external ledger.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create New Card */}
                <button
                  onClick={() => {
                    setWizardMode('create');
                    setStep('format-selection');
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New</h3>
                  <p className="text-sm text-gray-600">
                    Define and publish a new credential schema and definition
                  </p>
                </button>

                {/* Import Existing Card */}
                <button
                  onClick={() => {
                    setWizardMode('import');
                    setStep('format-selection');
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:bg-green-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Existing</h3>
                  <p className="text-sm text-gray-600">
                    Import a credential from an external Indy ledger for verification
                  </p>
                </button>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step: Format Selection */}
          {step === 'format-selection' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Select Credential Format
              </h2>
              <p className="text-gray-600 mb-6">
                {wizardMode === 'create'
                  ? 'Choose the credential format you want to create.'
                  : 'Choose the format of the credential you want to import.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AnonCreds */}
                <button
                  onClick={() => {
                    setSelectedFormat('anoncreds');
                    if (wizardMode === 'import') {
                      setStep('schema');
                    } else {
                      setStep('coming-soon');
                    }
                  }}
                  className="relative p-5 border-2 border-gray-200 rounded-xl text-left transition-all hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
                >
                  <h3 className="text-base font-semibold text-gray-900 mb-1">AnonCreds</h3>
                  <p className="text-sm text-gray-600">Hyperledger Indy anonymous credentials</p>
                </button>

                {/* W3C JSON-LD */}
                <button
                  onClick={() => {
                    if (wizardMode === 'create') {
                      setSelectedFormat('w3c-json-ld');
                      setStep('coming-soon');
                    }
                  }}
                  disabled={wizardMode === 'import'}
                  className={`relative p-5 border-2 rounded-xl text-left transition-all ${
                    wizardMode === 'import'
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  {wizardMode === 'import' && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">W3C JSON-LD</h3>
                  <p className="text-sm text-gray-600">W3C Verifiable Credentials with JSON-LD</p>
                </button>

                {/* W3C SD-JWT */}
                <button
                  onClick={() => {
                    if (wizardMode === 'create') {
                      setSelectedFormat('w3c-sd-jwt');
                      setStep('coming-soon');
                    }
                  }}
                  disabled={wizardMode === 'import'}
                  className={`relative p-5 border-2 rounded-xl text-left transition-all ${
                    wizardMode === 'import'
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  {wizardMode === 'import' && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">W3C SD-JWT</h3>
                  <p className="text-sm text-gray-600">W3C Verifiable Credentials with SD-JWT</p>
                </button>

                {/* ISO mDL */}
                <button
                  onClick={() => {
                    if (wizardMode === 'create') {
                      setSelectedFormat('iso-mdl');
                      setStep('coming-soon');
                    }
                  }}
                  disabled={wizardMode === 'import'}
                  className={`relative p-5 border-2 rounded-xl text-left transition-all ${
                    wizardMode === 'import'
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  {wizardMode === 'import' && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">ISO 18013-5 (mDL)</h3>
                  <p className="text-sm text-gray-600">Mobile Driver's License standard</p>
                </button>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step: Coming Soon Placeholder */}
          {step === 'coming-soon' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Create New {getFormatDisplayName(selectedFormat)} Credential
                </h2>
                <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full mb-4">
                  Coming Soon
                </div>
                <p className="text-gray-600 max-w-md mx-auto">
                  The ability to create new {getFormatDisplayName(selectedFormat)} credentials is currently under development.
                  Check back soon for updates.
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Back
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Step: Schema URL (Import Flow) */}
          {step === 'schema' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Enter Schema URL</h2>
              <p className="text-gray-600 mb-4">
                Paste the IndyScan URL for the schema you want to import.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IndyScan Schema URL
                </label>
                <input
                  type="url"
                  value={schemaUrl}
                  onChange={(e) => setSchemaUrl(e.target.value)}
                  placeholder="https://candyscan.idlab.org/tx/CANDY_DEV/domain/123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Example: https://candyscan.idlab.org/tx/CANDY_DEV/domain/123
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Back
                </button>
                <button
                  onClick={handleParseSchema}
                  disabled={!schemaUrl || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Parse Schema
                </button>
              </div>
            </div>
          )}

          {/* Step: Credential Definition URL (Import Flow) */}
          {step === 'creddef' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Enter Credential Definition URL</h2>

              {/* Parsed Schema Summary */}
              {parsedSchema && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Schema Parsed Successfully
                  </div>
                  <p className="text-sm text-green-600">
                    {parsedSchema.name} v{parsedSchema.version} ({parsedSchema.attributes.length} attributes)
                  </p>
                </div>
              )}

              <p className="text-gray-600 mb-4">
                Now paste the IndyScan URL for the credential definition.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IndyScan Credential Definition URL
                </label>
                <input
                  type="url"
                  value={credDefUrl}
                  onChange={(e) => setCredDefUrl(e.target.value)}
                  placeholder="https://candyscan.idlab.org/tx/CANDY_DEV/domain/456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Back
                </button>
                <button
                  onClick={handleParseCredDef}
                  disabled={!credDefUrl || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Parse Credential Definition
                </button>
              </div>
            </div>
          )}

          {/* Step: Details (Import Flow) */}
          {step === 'details' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Add Details</h2>

              {/* Parsed Summary */}
              {parsedSchema && parsedCredDef && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Schema & Credential Definition Parsed
                  </div>
                  <p className="text-sm text-green-600">
                    {parsedSchema.name} v{parsedSchema.version}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ecosystem Tag *
                  </label>
                  <select
                    value={ecosystemTagId}
                    onChange={(e) => setEcosystemTagId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select ecosystem...</option>
                    {ecosystemTags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issuer Entity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuer (optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select an entity from Entity Manager as the issuer
                  </p>

                  {selectedEntity ? (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{selectedEntity.name}</div>
                        {selectedEntity.entityTypes && selectedEntity.entityTypes.length > 0 && (
                          <div className="text-xs text-gray-500">{selectedEntity.entityTypes.join(', ')}</div>
                        )}
                      </div>
                      <button
                        onClick={handleClearEntity}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Clear selection"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={entitySearchQuery}
                        onChange={(e) => {
                          setEntitySearchQuery(e.target.value);
                          setShowEntityDropdown(true);
                        }}
                        onFocus={() => setShowEntityDropdown(true)}
                        placeholder="Search entities..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>

                      {/* Dropdown */}
                      {showEntityDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredEntities.length > 0 ? (
                            filteredEntities.map((entity) => (
                              <button
                                key={entity.id}
                                onClick={() => handleSelectEntity(entity.id)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{entity.name}</div>
                                {entity.entityTypes && entity.entityTypes.length > 0 && (
                                  <div className="text-xs text-gray-500">{entity.entityTypes.join(', ')}</div>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-center text-sm">
                              <p className="text-gray-500">
                                {entities.length === 0
                                  ? 'No entities in Entity Manager'
                                  : 'No matching entities found'}
                              </p>
                              <p className="mt-2 text-gray-400 text-xs">
                                Can't find the issuer?{' '}
                                <Link
                                  to="/apps/entity-manager"
                                  className="text-blue-600 hover:text-blue-700 underline"
                                  onClick={onClose}
                                >
                                  Add it in Entity Manager
                                </Link>
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => setShowEntityDropdown(false)}
                            className="w-full px-3 py-2 text-center text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-200"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Orbit Registration Toggle */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        type="checkbox"
                        id="registerWithOrbit"
                        checked={registerWithOrbit}
                        onChange={(e) => setRegisterWithOrbit(e.target.checked)}
                        disabled={!orbitStatus?.configured}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="registerWithOrbit"
                        className={`font-medium ${orbitStatus?.configured ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        Register with Orbit
                      </label>
                      <p className={`text-sm ${orbitStatus?.configured ? 'text-gray-600' : 'text-gray-400'}`}>
                        Store schema and credential definition in Orbit for use with verification workflows
                      </p>
                      {!orbitStatus?.configured && (
                        <p className="text-sm text-amber-600 mt-1">
                          Orbit Credential Management API not configured. Configure in Settings → Orbit.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!ecosystemTagId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Import
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirm (Import Flow) */}
          {step === 'confirm' && parsedSchema && parsedCredDef && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Confirm Import</h2>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Credential Details</h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-gray-500">Name</dt>
                    <dd className="text-gray-900">{parsedSchema.name}</dd>
                    <dt className="text-gray-500">Version</dt>
                    <dd className="text-gray-900">{parsedSchema.version}</dd>
                    <dt className="text-gray-500">Ledger</dt>
                    <dd className="text-gray-900">{parsedSchema.ledger}</dd>
                    <dt className="text-gray-500">Ecosystem</dt>
                    <dd className="text-gray-900">
                      {ecosystemTags.find((t) => t.id === ecosystemTagId)?.name}
                    </dd>
                    {issuerName && (
                      <>
                        <dt className="text-gray-500">Issuer</dt>
                        <dd className="text-gray-900">{issuerName}</dd>
                      </>
                    )}
                    <dt className="text-gray-500">Orbit Registration</dt>
                    <dd className="text-gray-900">
                      {registerWithOrbit ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </dd>
                  </dl>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Attributes ({parsedSchema.attributes.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedSchema.attributes.map((attr) => (
                      <span
                        key={attr}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Verification Only</p>
                      <p className="text-sm text-amber-700">
                        This credential can only be used for verification, not for issuance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Import Credential
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
