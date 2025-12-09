import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

export interface VocabNodeData {
  dataTypeId: string;
  dataTypeName: string;
  category: string;
  properties: Array<{
    id: string;
    name: string;
    displayName: string;
    valueType: string;
  }>;
}

function VocabNode({ data, selected }: NodeProps<VocabNodeData>) {
  const categoryColors: Record<string, string> = {
    property: 'from-green-50 to-green-100 border-green-200',
    identity: 'from-purple-50 to-purple-100 border-purple-200',
    financial: 'from-amber-50 to-amber-100 border-amber-200',
    other: 'from-gray-50 to-gray-100 border-gray-200',
  };

  const headerColor = categoryColors[data.category] || categoryColors.other;

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 min-w-[220px] max-w-[280px] ${
        selected ? 'border-green-500' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className={`px-3 py-2 bg-gradient-to-r ${headerColor} rounded-t-lg border-b border-gray-200`}>
        <div className="font-medium text-gray-800 text-sm truncate">
          {data.dataTypeName}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 capitalize">{data.category}</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500">{data.properties.length} properties</span>
        </div>
      </div>

      {/* Properties */}
      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
        {data.properties.length === 0 ? (
          <div className="text-xs text-gray-400 italic px-2 py-1">
            No properties defined
          </div>
        ) : (
          data.properties.map((prop) => (
            <div
              key={prop.id}
              className="relative flex items-center"
            >
              <Handle
                type="target"
                position={Position.Left}
                id={prop.id}
                className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
                style={{ left: -6 }}
              />
              <div className="flex-1 px-2 py-1 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <div className="text-xs font-mono text-gray-700 truncate">
                  {prop.name}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {prop.displayName}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-gray-50 rounded-b-lg border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">
          Vocabulary Properties
        </div>
      </div>
    </div>
  );
}

export default memo(VocabNode);
