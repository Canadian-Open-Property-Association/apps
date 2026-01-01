/**
 * DevToolsApp - Developer Tools & API Documentation
 *
 * Provides API documentation, VDR conventions, and vocabulary reference
 * for developers integrating with the Cornerstone Network ecosystem.
 */

import { useState } from 'react';
import { useAppTracking } from '../../hooks/useAppTracking';
import ApiDocumentation from './components/ApiDocumentation';
import VdrConventions from './components/VdrConventions';
import VocabReference from './components/VocabReference';

type TabId = 'api' | 'vdr' | 'vocab';

interface Tab {
  id: TabId;
  label: string;
  icon: JSX.Element;
}

const tabs: Tab[] = [
  {
    id: 'api',
    label: 'API Reference',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'vdr',
    label: 'VDR Conventions',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'vocab',
    label: 'Vocabulary',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function DevToolsApp() {
  useAppTracking('dev-tools', 'Developer Tools');
  const [activeTab, setActiveTab] = useState<TabId>('api');

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'api' && <ApiDocumentation />}
        {activeTab === 'vdr' && <VdrConventions />}
        {activeTab === 'vocab' && <VocabReference />}
      </main>
    </div>
  );
}
