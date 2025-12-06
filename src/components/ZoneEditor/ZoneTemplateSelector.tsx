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
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
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
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-200 transition-colors disabled:text-gray-400 disabled:border-gray-200 disabled:hover:bg-transparent shrink-0"
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
