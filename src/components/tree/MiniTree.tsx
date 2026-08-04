'use client';

import { Person } from '@/types';
import { User } from 'lucide-react';

interface MiniTreeProps {
  person: Person;
  parent?: Person | null;
  grandparent?: Person | null;
}

export default function MiniTree({ person, parent, grandparent }: MiniTreeProps) {
  const renderNode = (p: Person, isHighlight: boolean = false) => {
    const isMale = p.gender === 'M';
    return (
      <div className={`mini-tree-node ${isHighlight ? 'highlight' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <div style={{ 
            color: isHighlight ? 'var(--gold-400)' : (isMale ? 'var(--blue-400)' : 'var(--pink-400)'),
            display: 'flex'
          }}>
            <User size={16} />
          </div>
          <span>{p.name}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="mini-tree">
      {grandparent && (
        <>
          {renderNode(grandparent)}
          <div className="mini-tree-connector" />
        </>
      )}
      
      {parent && (
        <>
          {renderNode(parent)}
          <div className="mini-tree-connector" />
        </>
      )}
      
      {renderNode(person, true)}
    </div>
  );
}
