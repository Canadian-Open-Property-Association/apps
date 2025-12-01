import { useVctStore } from '../../store/vctStore';
import { getLocaleName } from '../../types/vct';

interface CredentialPreviewProps {
  locale: string;
  mode: 'simple' | 'svg';
}

export default function CredentialPreview({ locale, mode }: CredentialPreviewProps) {
  const currentVct = useVctStore((state) => state.currentVct);
  const sampleData = useVctStore((state) => state.sampleData);

  // Try to find the requested locale, fallback to first available
  const display = currentVct.display.find((d) => d.locale === locale) || currentVct.display[0];
  const effectiveLocale = display?.locale || locale;

  if (!display) {
    return (
      <div className="p-8 text-center text-gray-500">
        No display configuration available
      </div>
    );
  }

  const renderSimpleCard = () => {
    const simple = display.rendering?.simple;
    if (!simple) {
      return (
        <div className="p-8 text-center text-gray-500">
          Simple rendering not configured
        </div>
      );
    }

    return (
      <div
        className="rounded-xl shadow-lg overflow-hidden flex flex-col"
        style={{
          backgroundColor: simple.background_color || '#1E3A5F',
          color: simple.text_color || '#FFFFFF',
          width: '320px',
          height: '200px',
          backgroundImage: simple.background_image?.uri
            ? `url(${simple.background_image.uri})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Card Header */}
        <div className="p-4 flex items-start justify-between flex-shrink-0">
          {simple.logo?.uri && (
            <img
              src={simple.logo.uri}
              alt={simple.logo.alt_text || 'Logo'}
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="text-right">
            <p className="text-xs opacity-75">Verifiable Credential</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-4 pb-2 flex-grow overflow-hidden">
          <h3 className="text-lg font-bold mb-1 truncate">
            {display.name || currentVct.name || 'Credential Name'}
          </h3>
          {display.description && (
            <p className="text-sm opacity-80 line-clamp-2">{display.description}</p>
          )}

          {/* Sample Data Fields */}
          {currentVct.claims.length > 0 && (
            <div className="space-y-1 mt-2 pt-2 border-t border-white/20">
              {currentVct.claims.slice(0, 3).map((claim, index) => {
                // Try to find the matching locale, fallback to first available
                const claimDisplay = claim.display.find((d) => d.locale === effectiveLocale) || claim.display[0];
                const pathString = claim.path.filter(Boolean).join('.');
                const value = sampleData[pathString];

                if (!claimDisplay?.label) return null;

                return (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="opacity-75 truncate mr-2">{claimDisplay.label}:</span>
                    <span className="font-medium truncate">{value || '-'}</span>
                  </div>
                );
              })}
              {currentVct.claims.length > 3 && (
                <p className="text-xs opacity-60 text-center">
                  +{currentVct.claims.length - 3} more fields
                </p>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div
          className="px-4 py-2 text-xs opacity-60 truncate flex-shrink-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
        >
          {currentVct.vct || 'Credential Type URI'}
        </div>
      </div>
    );
  };

  const renderSvgTemplate = () => {
    const svgTemplates = display.rendering?.svg_templates;
    if (!svgTemplates || svgTemplates.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p>SVG template not configured</p>
          <p className="text-sm mt-2">
            Add an SVG template URL in the Display tab
          </p>
        </div>
      );
    }

    // Show the first template for preview
    const template = svgTemplates[0];

    return (
      <div className="flex flex-col items-center">
        <img
          src={template.uri}
          alt="Credential SVG Template"
          className="max-w-full h-auto rounded-lg shadow-lg"
          style={{ maxWidth: '400px' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="p-8 text-center text-red-500 border border-red-300 rounded-lg">
                <p>Failed to load SVG template</p>
                <p class="text-sm mt-1">${template.uri}</p>
              </div>
            `;
          }}
        />
        {template.properties && (
          <div className="mt-2 flex gap-2 text-xs">
            {template.properties.orientation && (
              <span className="px-2 py-1 bg-gray-100 rounded">{template.properties.orientation}</span>
            )}
            {template.properties.color_scheme && (
              <span className="px-2 py-1 bg-gray-100 rounded">{template.properties.color_scheme}</span>
            )}
            {template.properties.contrast && (
              <span className="px-2 py-1 bg-gray-100 rounded">{template.properties.contrast}</span>
            )}
          </div>
        )}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Note: SVG placeholder replacement not yet implemented.
          <br />
          This shows the raw SVG template.
        </p>
        {svgTemplates.length > 1 && (
          <p className="mt-2 text-xs text-blue-600">
            +{svgTemplates.length - 1} more template(s) configured
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          {mode === 'simple' ? 'Simple Card Preview' : 'SVG Template Preview'}
        </h3>
        <p className="text-xs text-gray-500">
          {getLocaleName(effectiveLocale)}
          {effectiveLocale !== locale && (
            <span className="ml-1 text-amber-600">(fallback from {locale})</span>
          )}
        </p>
      </div>

      <div className="flex justify-center">
        {mode === 'simple' ? renderSimpleCard() : renderSvgTemplate()}
      </div>

      {/* Sample Data Summary */}
      {Object.keys(sampleData).length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Sample Data
          </h4>
          <div className="space-y-1">
            {Object.entries(sampleData).map(([path, value]) => (
              <div key={path} className="flex justify-between text-xs">
                <span className="text-gray-500 font-mono">{path}:</span>
                <span className="text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
