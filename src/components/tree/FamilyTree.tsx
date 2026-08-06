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
  ReactFlowProvider,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import { Person } from '@/types';
import { useAppStore } from '@/lib/store';
import PersonNode from './PersonNode';
import { ZoomIn, ZoomOut, Maximize, User, UserPlus } from 'lucide-react';

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
  onNodeClick?: (personId: number) => void;
  onAddChild?: (personId: number) => void;
}

function FamilyTreeInner({ persons, rootId, onNodeClick, onAddChild }: FamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { selectedPersonId, setSelectedPersonId } = useAppStore();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, personId: number, personName: string } | null>(null);

  // Initialize graph
  useEffect(() => {
    if (!persons.length) return;

    const initialNodes: Node[] = persons.map((person) => ({
      id: person.id.toString(),
      type: 'person',
      position: { x: 0, y: 0 }, // Will be set by dagre
      data: { 
        person,
        isSelected: person.id === selectedPersonId,
      },
    }));

    const initialEdges: Edge[] = [];
    persons.forEach((person) => {
      if (person.parent_id) {
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
  }, [persons, setNodes, setEdges, selectedPersonId]);

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
