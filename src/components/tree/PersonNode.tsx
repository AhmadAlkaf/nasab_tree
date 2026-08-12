'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Person, TypePersonLabels, GenderLabels } from '@/types';
import { User, Crown, Edit } from 'lucide-react';

type PersonNodeData = {
  person: Person;
  isSelected?: boolean;
  isExpanded?: boolean;
  onEdit?: (personId: number) => void;
  onToggleExpand?: (personId: number) => void;
};

// Simple helper to calculate era (century) based on birth year
const getEra = (year?: number | null) => {
  if (!year) return null;
  const century = Math.ceil(year / 100);
  return `القرن ${century} هـ`; // Assuming Hijri, can be customized
};

function PersonNode({ data }: NodeProps<Node<PersonNodeData>>) {
  const { person, isSelected, onEdit, isExpanded, onToggleExpand } = data;
  
  const isMale = person.gender === 'M';
  const colorClass = isMale ? 'male' : 'female';
  const iconColor = isMale ? 'var(--blue-400)' : 'var(--pink-400)';
  const era = getEra(person.birth_year);
  const hasChildren = !!person.has_children || person.rght > person.lft + 1;
  
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
          {person.level !== undefined && person.level !== null && (
            <span className="badge muted" style={{ fontSize: 9, padding: '2px 6px' }}>
              الطبقة {person.level}
            </span>
          )}
        </div>

        {/* Toggle Expand/Collapse Button */}
        {hasChildren && onToggleExpand && (
          <button
            className={`node-expand-btn ${isExpanded ? 'expanded' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(person.id);
            }}
            style={{
              position: 'absolute',
              bottom: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 10,
              fontSize: 16,
              lineHeight: 1,
            }}
            title={isExpanded ? 'طي الفروع' : 'عرض الأبناء'}
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>

      {/* Show source handle only if node has children and is expanded */}
      {hasChildren && isExpanded && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          style={{ 
            background: 'var(--text-muted)', 
            width: 8, 
            height: 8, 
            border: 'none',
            bottom: -18 // Shift down below the expand button
          }}
        />
      )}
    </>
  );
}

export default memo(PersonNode);
