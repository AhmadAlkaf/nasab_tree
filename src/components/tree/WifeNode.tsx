'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Wife } from '@/types';
import { Heart } from 'lucide-react';

type WifeNodeData = {
  wife: Wife;
};

function WifeNode({ data }: NodeProps<Node<WifeNodeData>>) {
  const { wife } = data;
  
  return (
    <>
      {/* Target handle for incoming edges (from husband) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: 'transparent', border: 'none' }}
      />
      
      <div className="tree-node wife">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div 
            style={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%',
              background: 'rgba(236,72,153,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--pink-400)',
              flexShrink: 0
            }}
          >
            <Heart size={12} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              {wife.name}
            </span>
            {(wife.birth_year || wife.death_year) && (
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                {wife.birth_year || '?'} - {wife.death_year || '?'}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(WifeNode);
