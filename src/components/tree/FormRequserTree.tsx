'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  ReactFlowProvider,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { FormRequser, TypeFormLabels, GenderLabels } from '@/types';
import { User } from 'lucide-react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, edgesep: 30, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function FormRequserNode({ data }: { data: { form: FormRequser } }) {
  const { form } = data;
  const isMale = form.gender === 'M';
  const iconColor = isMale ? 'var(--blue-400)' : 'var(--pink-400)';

  return (
    <div className={`tree-node ${isMale ? 'male' : 'female'}`}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: isMale ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: iconColor,
          }}
        >
          <User size={14} />
        </div>
      </div>
      <div className="tree-node-name" style={{ fontSize: 12 }}>
        {form.name}
      </div>
      <div className="tree-node-badge" style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
        <span className={`badge ${isMale ? 'blue' : 'pink'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
          {GenderLabels[form.gender]}
        </span>
        <span className="badge muted" style={{ fontSize: 9, padding: '2px 6px' }}>
          {TypeFormLabels[form.type_form]}
        </span>
      </div>
      {(form.birth_year || form.death_year) && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>
          {form.birth_year || '?'} - {form.death_year || '?'}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  formRequser: FormRequserNode,
};

interface FormRequserTreeProps {
  formRequsers: FormRequser[];
}

function FormRequserTreeInner({ formRequsers }: FormRequserTreeProps) {
  const { nodes, edges } = useMemo(() => {
    if (!formRequsers.length) return { nodes: [], edges: [] };

    const formMap = new Map<number, FormRequser>();
    formRequsers.forEach(f => formMap.set(f.id, f));

    const initialNodes: Node[] = formRequsers.map((form) => ({
      id: form.id.toString(),
      type: 'formRequser',
      position: { x: 0, y: 0 },
      data: { form },
    }));

    const initialEdges: Edge[] = [];
    formRequsers.forEach((form) => {
      if (form.parent_id !== null && formMap.has(form.parent_id)) {
        initialEdges.push({
          id: `e${form.parent_id}-${form.id}`,
          source: form.parent_id.toString(),
          target: form.id.toString(),
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

    return getLayoutedElements(initialNodes, initialEdges, 'TB');
  }, [formRequsers]);

  if (!formRequsers.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        لا توجد بيانات لعرضها
      </div>
    );
  }

  return (
    <div style={{ height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="var(--border-strong)" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function FormRequserTree(props: FormRequserTreeProps) {
  return (
    <ReactFlowProvider>
      <FormRequserTreeInner {...props} />
    </ReactFlowProvider>
  );
}
