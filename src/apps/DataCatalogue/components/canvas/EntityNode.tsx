import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

export interface EntityNodeData {
  entityId: string;
  entityName: string;
  logoUri?: string;
  attributes: string[]; // Provider field names
}

function EntityNode({ data, selected }: NodeProps<EntityNodeData>) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 min-w-[200px] ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg border-b border-gray-200">
        <div className="flex items-center gap-2">
          {data.logoUri ? (
            <img
              src={data.logoUri}
              alt={data.entityName}
              className="w-6 h-6 rounded object-contain"
            />
          ) : (
            <div className="w-6 h-6 rounded bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
              {data.entityName.charAt(0)}
            </div>
          )}
          <span className="font-medium text-gray-800 text-sm truncate">
            {data.entityName}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">Data Provider</div>
      </div>

      {/* Attributes */}
      <div className="p-2 space-y-1">
        {data.attributes.length === 0 ? (
          <div className="text-xs text-gray-400 italic px-2 py-1">
            No attributes mapped
          </div>
        ) : (
          data.attributes.map((attr, index) => (
            <div
              key={`${data.entityId}-${attr}-${index}`}
              className="relative flex items-center"
            >
              <div className="flex-1 px-2 py-1 bg-gray-50 rounded text-xs font-mono text-gray-700 truncate">
                {attr}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={attr}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
                style={{ right: -6 }}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 bg-gray-50 rounded-b-lg border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">
          Drag from field to map
        </div>
      </div>
    </div>
  );
}

export default memo(EntityNode);
