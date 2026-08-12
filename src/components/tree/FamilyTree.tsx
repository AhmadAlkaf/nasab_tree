'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  MiniMap,
  ReactFlowProvider,
  MarkerType,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import { Person } from '@/types';
import { useAppStore } from '@/lib/store';
import { getChildren } from '@/lib/api';
import PersonNode from './PersonNode';
import { UserPlus } from 'lucide-react';

const nodeTypes = {
  person: PersonNode,
};

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 120;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, edgesep: 40, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = { ...node };

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    newNode.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return newNode;
  });

  return { nodes: layoutedNodes, edges };
};

interface FamilyTreeProps {
  persons: Person[];
  rootId?: number; // If provided, focuses on this sub-tree
  expandAll?: boolean;
  onNodeClick?: (personId: number) => void;
  onAddChild?: (personId: number) => void;
}

function FamilyTreeInner({ persons, rootId, expandAll = false, onNodeClick, onAddChild }: FamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { selectedPersonId, setSelectedPersonId, addToast } = useAppStore();
  const { fitView } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, personId: number, personName: string } | null>(null);

  // Local state for loaded persons (starts with initial persons)
  const [loadedPersons, setLoadedPersons] = useState<Person[]>([]);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<number>>(new Set());
  const [isExpanding, setIsExpanding] = useState(false);

  // Sync loadedPersons when persons prop changes
  useEffect(() => {
    setLoadedPersons(persons);
    if (expandAll) {
      setExpandedNodeIds(new Set(persons.map(person => person.id)));
      return;
    }

    if (rootId !== undefined) {
      const hasRootChildren = persons.some(person => person.parent_id === rootId);
      setExpandedNodeIds(hasRootChildren ? new Set([rootId]) : new Set());
      return;
    }

    setExpandedNodeIds(new Set());
  }, [persons, expandAll, rootId]);

  // Compute visible persons based on expanded nodes
  const visiblePersons = useMemo(() => {
    if (!loadedPersons.length) return [];
    
    const visible: Person[] = [];
    const personMap = new Map<number, Person>();
    const childrenMap = new Map<number, Person[]>();
    const roots: Person[] = [];
    
    loadedPersons.forEach(p => {
      personMap.set(p.id, p);
      if (p.parent_id === null) {
        roots.push(p);
      } else {
        if (!childrenMap.has(p.parent_id)) {
          childrenMap.set(p.parent_id, []);
        }
        childrenMap.get(p.parent_id)!.push(p);
      }
    });
    
    // Fallback: If a person has a parent that is not in the loaded list, treat them as root
    loadedPersons.forEach(p => {
      if (p.parent_id !== null && !personMap.has(p.parent_id)) {
        roots.push(p);
      }
    });
    
    const traverse = (node: Person) => {
      visible.push(node);
      if (expandedNodeIds.has(node.id)) {
        const children = childrenMap.get(node.id) || [];
        children.forEach(traverse);
      }
    };
    
    const uniqueRoots = Array.from(new Set(roots));
    uniqueRoots.forEach(traverse);
    
    return visible;
  }, [loadedPersons, expandedNodeIds]);

  // Callback to toggle node expansion (loads children on-demand if needed)
  const handleToggleExpand = useCallback(async (personId: number) => {
    if (expandedNodeIds.has(personId)) {
      // Collapse
      setExpandedNodeIds((prev) => {
        const next = new Set(prev);
        next.delete(personId);
        return next;
      });
    } else {
      // Check if children are already loaded locally
      const hasChildrenLoaded = loadedPersons.some(p => p.parent_id === personId);
      
      if (hasChildrenLoaded) {
        setExpandedNodeIds((prev) => {
          const next = new Set(prev);
          next.add(personId);
          return next;
        });
      } else {
        // Fetch children from API
        setIsExpanding(true);
        const res = await getChildren(personId);
        setIsExpanding(false);
        
        if (res.success && res.data) {
          if (res.data.length === 0) {
            addToast({ type: 'info', message: 'لا يوجد أبناء مسجلين لهذا الشخص' });
            return;
          }
          
          setLoadedPersons((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newChildren = res.data!.filter(c => !existingIds.has(c.id));
            return [...prev, ...newChildren];
          });
          
          setExpandedNodeIds((prev) => {
            const next = new Set(prev);
            next.add(personId);
            return next;
          });
        } else {
          addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء تحميل الأبناء' });
        }
      }
    }
  }, [expandedNodeIds, loadedPersons, addToast]);

  // Initialize and update graph layout when visiblePersons change
  useEffect(() => {
    if (!visiblePersons.length) return;

    const initialNodes: Node[] = visiblePersons.map((person) => ({
      id: person.id.toString(),
      type: 'person',
      position: { x: 0, y: 0 }, // Will be set by dagre
      data: { 
        person,
        isSelected: person.id === selectedPersonId,
        isExpanded: expandedNodeIds.has(person.id),
        onToggleExpand: handleToggleExpand,
      },
    }));

    const initialEdges: Edge[] = [];
    visiblePersons.forEach((person) => {
      if (person.parent_id && visiblePersons.some(p => p.id === person.parent_id)) {
        // Edge from parent to child
        initialEdges.push({
          id: `e${person.parent_id}-${person.id}`,
          source: person.parent_id.toString(),
          target: person.id.toString(),
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'var(--text-muted)', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'var(--text-muted)',
          },
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB' // Top to Bottom
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Wait for React Flow to render the updated nodes, then frame the whole tree.
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 300 });
    });
  }, [visiblePersons, setNodes, setEdges, handleToggleExpand, expandedNodeIds, fitView]);

  // Update selection status when selectedPersonId changes without re-layouting
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: parseInt(node.id, 10) === selectedPersonId,
        },
      }))
    );
  }, [selectedPersonId, setNodes]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const personId = parseInt(node.id, 10);
    setSelectedPersonId(personId);
    if (onNodeClick) onNodeClick(personId);
  }, [onNodeClick, setSelectedPersonId]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        personId: parseInt(node.id, 10),
        personName: node.data.person ? (node.data.person as Person).name : '',
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
  }, [closeContextMenu]);

  return (
    <div className="tree-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="var(--border-strong)" gap={16} />
        <Controls />
        <MiniMap nodeColor="var(--gold-400)" />
      </ReactFlow>
      
      {contextMenu && onAddChild && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: 8,
            zIndex: 1000,
            minWidth: 150,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
            خيارات {contextMenu.personName}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--blue-400)' }}
            onClick={() => {
              onAddChild(contextMenu.personId);
              closeContextMenu();
            }}
          >
            <UserPlus size={16} />
            إضافة ابن
          </button>
        </div>
      )}
    </div>
  );
}

// Wrap with Provider to use React Flow hooks if needed later, and isolated state
export default function FamilyTree(props: FamilyTreeProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner {...props} />
    </ReactFlowProvider>
  );
}
