/**
 * PresentationPreview Component
 *
 * Displays the DIF Presentation Exchange JSON output
 * that will be published to the VDR.
 *
 * Uses the shared JsonViewer component for consistent dark theme styling.
 */

import { JsonViewer } from '../../../components/shared';
import { PresentationDefinition } from '../../../types/proofTemplate';

interface PresentationPreviewProps {
  definition: PresentationDefinition | null;
}

export default function PresentationPreview({ definition }: PresentationPreviewProps) {
  if (!definition) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-200">Presentation Exchange Preview</h3>
          <p className="text-xs text-gray-500 mt-0.5">DIF PE v2.0 format</p>
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

  return (
    <JsonViewer
      json={definition}
      title="Presentation Exchange Preview"
      subtitle="DIF PE v2.0 format"
      filename="presentation-definition"
      showDownload={true}
      stats={[
        { label: 'Input descriptors', value: definition.input_descriptors?.length || 0 },
        { label: 'Size', value: `${JSON.stringify(definition).length} bytes` },
      ]}
    />
  );
}
