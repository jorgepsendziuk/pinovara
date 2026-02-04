import { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`tabs-container ${className}`} style={{ 
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <div 
        className="tabs-header" 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '24px',
          gap: '4px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'auto'
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #056839' : '2px solid transparent',
              color: activeTab === tab.id ? '#056839' : '#64748b',
              fontWeight: activeTab === tab.id ? '600' : '500',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              marginBottom: '-2px',
              flexShrink: 0,
              minWidth: 'fit-content'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#334155';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="tabs-content" style={{ 
        minHeight: '200px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        {activeTabContent}
      </div>
    </div>
  );
}
