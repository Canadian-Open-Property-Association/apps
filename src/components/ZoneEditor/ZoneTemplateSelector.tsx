import { useZoneTemplateStore } from '../../store/zoneTemplateStore';
import { COPA_STANDARD_TEMPLATE_ID } from '../../types/vct';

interface ZoneTemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelect: (templateId: string) => void;
  onManageClick?: () => void;
  disabled?: boolean;
}

export default function ZoneTemplateSelector({
  selectedTemplateId,
  onSelect,
  onManageClick,
  disabled = false,
}: ZoneTemplateSelectorProps) {
  const templates = useZoneTemplateStore((state) => state.templates);
  const builtInTemplates = templates.filter((t) => t.isBuiltIn);
  const userTemplates = templates.filter((t) => !t.isBuiltIn);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={selectedTemplateId || COPA_STANDARD_TEMPLATE_ID}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
        >
          {/* Built-in templates */}
          <optgroup label="Built-in Templates">
            {builtInTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
                {template.description ? ` - ${template.description}` : ''}
              </option>
            ))}
          </optgroup>

          {/* User templates */}
          {userTemplates.length > 0 && (
            <optgroup label="My Templates">
              {userTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {onManageClick && (
          <button
            type="button"
            onClick={onManageClick}
            disabled={disabled}
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            Manage
          </button>
        )}
      </div>

      {/* Template info */}
      {selectedTemplateId && (
        <TemplateInfo templateId={selectedTemplateId} />
      )}
    </div>
  );
}

function TemplateInfo({ templateId }: { templateId: string }) {
  const template = useZoneTemplateStore((state) =>
    state.templates.find((t) => t.id === templateId)
  );

  if (!template) return null;

  const frontZoneCount = template.front.zones.length;
  const backZoneCount = template.back.zones.length;

  return (
    <div className="text-xs text-gray-500 flex items-center gap-3">
      <span>
        Front: {frontZoneCount} zone{frontZoneCount !== 1 ? 's' : ''}
      </span>
      <span className="text-gray-300">|</span>
      <span>
        Back: {backZoneCount} zone{backZoneCount !== 1 ? 's' : ''}
      </span>
      {template.isBuiltIn && (
        <>
          <span className="text-gray-300">|</span>
          <span className="text-blue-500 font-medium">Built-in</span>
        </>
      )}
    </div>
  );
}
