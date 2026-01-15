/**
 * PresentationPreview Component
 *
 * Displays the proof template JSON output in a custom format
 * designed for consumption by third-party verifier applications.
 *
 * Uses the shared JsonViewer component for consistent dark theme styling.
 */

import { JsonViewer } from '../../../components/shared';
import { ProofTemplate, CREDENTIAL_FORMAT_LABELS } from '../../../types/proofTemplate';

interface PresentationPreviewProps {
  template: ProofTemplate | null;
}

export default function PresentationPreview({ template }: PresentationPreviewProps) {
  if (!template) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-200">Proof Template Preview</h3>
          <p className="text-xs text-gray-500 mt-0.5">Custom JSON format</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto text-gray-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <p className="text-sm text-gray-400">No template loaded</p>
          </div>
        </div>
      </div>
    );
  }

  // Build the template JSON for display
  const templateJson = {
    id: template.id,
    name: template.name,
    description: template.description,
    version: template.version,
    credentialFormat: template.credentialFormat,
    requestedCredentials: template.requestedCredentials.map((cred) => ({
      id: cred.id,
      catalogueCredentialId: cred.catalogueCredentialId,
      credentialName: cred.credentialName,
      restrictions: cred.restrictions,
      requestedAttributes: cred.requestedAttributes.map((attr) => ({
        attributeName: attr.attributeName,
        label: attr.label,
        required: attr.required,
        selectiveDisclosure: attr.selectiveDisclosure,
        ...(attr.constraints && { constraints: attr.constraints }),
      })),
      predicates: cred.predicates.map((pred) => ({
        attributeName: pred.attributeName,
        label: pred.label,
        predicateType: pred.predicateType,
        operator: pred.operator,
        value: pred.value,
        revealResult: pred.revealResult,
      })),
    })),
    metadata: template.metadata,
    status: template.status,
    publishedToVerifier: template.publishedToVerifier,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };

  // Calculate stats
  const totalAttributes = template.requestedCredentials.reduce(
    (sum, cred) => sum + cred.requestedAttributes.length,
    0
  );
  const totalPredicates = template.requestedCredentials.reduce(
    (sum, cred) => sum + cred.predicates.length,
    0
  );

  return (
    <JsonViewer
      json={templateJson}
      title="Proof Template Preview"
      subtitle={`${CREDENTIAL_FORMAT_LABELS[template.credentialFormat]} format`}
      filename={`proof-template-${template.name.toLowerCase().replace(/\s+/g, '-')}`}
      showDownload={true}
      stats={[
        { label: 'Credentials', value: template.requestedCredentials.length },
        { label: 'Attributes', value: totalAttributes },
        { label: 'Predicates', value: totalPredicates },
        { label: 'Size', value: `${JSON.stringify(templateJson).length} bytes` },
      ]}
    />
  );
}
