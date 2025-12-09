import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ConnectionLineType,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvasSync } from '../../hooks/useCanvasSync';
import EntityNode from './EntityNode';
import VocabNode from './VocabNode';

const nodeTypes: NodeTypes = {
  entityNode: EntityNode,
  vocabNode: VocabNode,
};

interface MappingCanvasProps {
  selectedDataTypeId: string | null;
  onBackToList: () => void;
}

export default function MappingCanvas({ selectedDataTypeId, onBackToList }: MappingCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    deleteSelectedEdges,
    selectedDataType,
  } = useCanvasSync(selectedDataTypeId);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        deleteSelectedEdges();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedEdges]);

  const handleAutoLayout = useCallback(() => {
    // TODO: Implement auto-layout using dagre or similar
    console.log('Auto layout not yet implemented');
  }, []);

  if (!selectedDataTypeId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto\" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">Select a Data Type</p>
          <p className="text-gray-400 text-sm mt-1">
            Choose a data type from the list to view its mapping canvas
          </p>
          <button
            onClick={onBackToList}
            className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            &larr; Back to List View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'entityNode') return '#3b82f6';
            if (node.type === 'vocabNode') return '#22c55e';
            return '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Top Panel */}
        <Panel position="top-left" className="flex items-center gap-4">
          <button
            onClick={onBackToList}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow hover:bg-gray-50 border border-gray-200"
          >
            &larr; List View
          </button>
          {selectedDataType && (
            <div className="px-3 py-1.5 bg-white rounded-lg shadow border border-gray-200">
              <span className="text-sm font-medium text-gray-800">
                {selectedDataType.name}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({selectedDataType.properties.length} properties)
              </span>
            </div>
          )}
        </Panel>

        {/* Instructions Panel */}
        <Panel position="bottom-left" className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">How to Use</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Drag from entity field (right dot) to vocabulary property (left dot)</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Click a connection line to select it</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Press Delete to remove selected connections</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Drag nodes to reposition them</span>
            </li>
          </ul>
        </Panel>

        {/* Actions Panel */}
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={handleAutoLayout}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow hover:bg-gray-50 border border-gray-200"
            title="Auto-arrange nodes"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-right" className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-gray-600">Data Provider (Entity)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-600">Vocabulary Property</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-gray-600">Field Mapping</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
