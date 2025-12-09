import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, Connection } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { EntityNodeData } from '../components/canvas/EntityNode';
import type { VocabNodeData } from '../components/canvas/VocabNode';

interface Entity {
  id: string;
  name: string;
  logoUri?: string;
}

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

export function useCanvasSync(selectedDataTypeId: string | null) {
  const { dataTypes, addProviderMapping, removeProviderMapping } = useDataCatalogueStore();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Fetch entities on mount
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/entities`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch entities');
        const data = await response.json();
        // Filter to only data furnishers
        const furnishers = data.filter((e: { types?: string[] }) =>
          e.types?.includes('data-furnisher')
        );
        setEntities(furnishers);
      } catch (err) {
        console.error('Failed to load entities:', err);
      }
    };
    fetchEntities();
  }, []);

  // Get the selected data type
  const selectedDataType = useMemo(() => {
    if (!selectedDataTypeId) return null;
    return dataTypes.find(dt => dt.id === selectedDataTypeId) || null;
  }, [dataTypes, selectedDataTypeId]);

  // Build nodes and edges from data
  useEffect(() => {
    if (!selectedDataType || entities.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Collect all entities that have mappings to this data type's properties
    const entityMappings = new Map<string, Set<string>>(); // entityId -> set of providerFieldNames

    (selectedDataType.properties || []).forEach(prop => {
      prop.providerMappings?.forEach(mapping => {
        if (!entityMappings.has(mapping.entityId)) {
          entityMappings.set(mapping.entityId, new Set());
        }
        entityMappings.get(mapping.entityId)!.add(mapping.providerFieldName);
      });
    });

    // Create entity nodes (left side)
    const entityNodes: Node<EntityNodeData>[] = [];
    let entityY = 50;

    entityMappings.forEach((fieldNames, entityId) => {
      const entity = entities.find(e => e.id === entityId);
      if (!entity) return;

      entityNodes.push({
        id: `entity-${entityId}`,
        type: 'entityNode',
        position: { x: 50, y: entityY },
        data: {
          entityId,
          entityName: entity.name,
          logoUri: entity.logoUri,
          attributes: Array.from(fieldNames),
        },
      });

      entityY += 200 + fieldNames.size * 30;
    });

    // Also add entities without mappings (for user to create new connections)
    entities.forEach(entity => {
      if (!entityMappings.has(entity.id)) {
        entityNodes.push({
          id: `entity-${entity.id}`,
          type: 'entityNode',
          position: { x: 50, y: entityY },
          data: {
            entityId: entity.id,
            entityName: entity.name,
            logoUri: entity.logoUri,
            attributes: [],
          },
        });
        entityY += 150;
      }
    });

    // Create vocab node (right side)
    const vocabNode: Node<VocabNodeData> = {
      id: `vocab-${selectedDataType.id}`,
      type: 'vocabNode',
      position: { x: 450, y: 50 },
      data: {
        dataTypeId: selectedDataType.id,
        dataTypeName: selectedDataType.name,
        category: selectedDataType.category,
        properties: (selectedDataType.properties || []).map(p => ({
          id: p.id,
          name: p.name,
          displayName: p.displayName,
          valueType: p.valueType,
        })),
      },
    };

    // Create edges from provider mappings
    const newEdges: Edge[] = [];

    (selectedDataType.properties || []).forEach(prop => {
      prop.providerMappings?.forEach(mapping => {
        newEdges.push({
          id: `edge-${mapping.entityId}-${mapping.providerFieldName}-${prop.id}`,
          source: `entity-${mapping.entityId}`,
          sourceHandle: mapping.providerFieldName,
          target: `vocab-${selectedDataType.id}`,
          targetHandle: prop.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        });
      });
    });

    setNodes([...entityNodes, vocabNode]);
    setEdges(newEdges);
  }, [selectedDataType, entities]);

  // Handle node changes (position, selection)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Handle edge changes (selection, removal)
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // Check for removals and sync with store
      changes.forEach(change => {
        if (change.type === 'remove') {
          const edge = edges.find(e => e.id === change.id);
          if (edge && selectedDataType) {
            const targetPropertyId = edge.targetHandle;
            const sourceEntityId = edge.source.replace('entity-', '');
            if (targetPropertyId) {
              removeProviderMapping(selectedDataType.id, targetPropertyId, sourceEntityId);
            }
          }
        }
      });
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [edges, selectedDataType, removeProviderMapping]
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!selectedDataType || !connection.source || !connection.target ||
          !connection.sourceHandle || !connection.targetHandle) {
        return;
      }

      const entityId = connection.source.replace('entity-', '');
      const providerFieldName = connection.sourceHandle;
      const propertyId = connection.targetHandle;

      const entity = entities.find(e => e.id === entityId);
      if (!entity) return;

      try {
        // Add the mapping to the store/API
        await addProviderMapping(selectedDataType.id, propertyId, {
          entityId,
          entityName: entity.name,
          providerFieldName,
        });

        // The edges will be recreated from the updated data
      } catch (err) {
        console.error('Failed to create mapping:', err);
      }
    },
    [selectedDataType, entities, addProviderMapping]
  );

  // Delete selected edges
  const deleteSelectedEdges = useCallback(async () => {
    const selectedEdges = edges.filter(e => e.selected);

    for (const edge of selectedEdges) {
      if (selectedDataType && edge.targetHandle) {
        const entityId = edge.source.replace('entity-', '');
        await removeProviderMapping(selectedDataType.id, edge.targetHandle, entityId);
      }
    }
  }, [edges, selectedDataType, removeProviderMapping]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    deleteSelectedEdges,
    selectedDataType,
    entities,
  };
}
