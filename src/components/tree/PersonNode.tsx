'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Person, TypePersonLabels, GenderLabels } from '@/types';
import { User, Crown, Edit } from 'lucide-react';

type PersonNodeData = {
  person: Person;
  isSelected?: boolean;
  onEdit?: (personId: number) => void;
};

// Simple helper to calculate era (century) based on birth year
const getEra = (year?: number | null) => {
  if (!year) return null;
  const century = Math.ceil(year / 100);
  return `القرن ${century} هـ`; // Assuming Hijri, can be customized
};

function PersonNode({ data }: NodeProps<Node<PersonNodeData>>) {
  const { person, isSelected, onEdit } = data;
  
  const isMale = person.gender === 'M';
  const colorClass = isMale ? 'male' : 'female';
  const iconColor = isMale ? 'var(--blue-400)' : 'var(--pink-400)';
  const era = getEra(person.birth_year);
  
  return (
    <>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: 'var(--text-muted)', width: 8, height: 8, border: 'none' }}
      />
      
      <div className={`tree-node ${colorClass} ${isSelected ? 'selected' : ''}`} style={{ position: 'relative' }}>
        {/* Quick Edit Button */}
        {onEdit && (
          <button 
            className="node-edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(person.id);
            }}
            title="تعديل سريع"
          >
            <Edit size={12} />
          </button>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div 
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%',
              background: isMale ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
            }}
          >
            {person.title ? <Crown size={16} /> : <User size={16} />}
          </div>
        </div>
        
        <div className="tree-node-name">
          {person.name}
        </div>
        
        {(person.kunya || person.title) && (
          <div className="tree-node-meta">
            {person.title} {person.kunya}
          </div>
        )}
        
        <div className="tree-node-badge" style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className={`badge ${isMale ? 'blue' : 'pink'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
            {TypePersonLabels[person.type_person]}
          </span>
          {era && (
            <span className="badge muted" style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(212,168,83,0.1)', color: 'var(--gold-400)' }}>
              {era}
            </span>
          )}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: 'var(--text-muted)', width: 8, height: 8, border: 'none' }}
      />
    </>
  );
}

export default memo(PersonNode);
