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
import { ZoomIn, ZoomOut, Maximize, User } from 'lucide-react';

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
}

function FamilyTreeInner({ persons, rootId, onNodeClick }: FamilyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { selectedPersonId, setSelectedPersonId } = useAppStore();

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

  return (
    <div className="tree-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="var(--border-strong)" gap={16} />
      </ReactFlow>
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
