import { useEffect } from 'react';
import { SettingsSection } from '../../../types/orbitApis';
import { useAdminStore } from '../../../store/adminStore';

interface MenuItem {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}

// Ecosystem/Building icon
const EcosystemIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

// GitHub/Code icon
const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

// Apps/Grid icon
const AppsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

// Orbit/Settings icon
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// Logs icon
const LogIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

// Analytics icon
const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const menuItems: MenuItem[] = [
  { id: 'ecosystem', label: 'Ecosystem', icon: <EcosystemIcon /> },
  { id: 'github', label: 'GitHub & VDR', icon: <GitHubIcon /> },
  { id: 'apps', label: 'Apps', icon: <AppsIcon /> },
  { id: 'orbit', label: 'Orbit APIs', icon: <SettingsIcon /> },
  { id: 'logs', label: 'Access Logs', icon: <LogIcon /> },
  { id: 'analytics', label: 'Analytics', icon: <ChartIcon /> },
];

export default function SettingsSidebar() {
  const { selectedSection, setSelectedSection, tenantConfig, fetchTenantConfig } = useAdminStore();

  // Fetch tenant config on mount
  useEffect(() => {
    if (!tenantConfig) {
      fetchTenantConfig();
    }
  }, [tenantConfig, fetchTenantConfig]);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Settings</h2>
        <p className="text-sm text-gray-500">Platform configuration</p>
      </div>

      <nav className="px-2 pb-4">
        {menuItems.map((item) => {
          const isSelected = selectedSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span
                className={`flex-shrink-0 ${
                  isSelected ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Ecosystem name footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-600 truncate">
            {tenantConfig?.ecosystem?.name || 'Loading...'}
          </span>
        </div>
        {tenantConfig?.source && (
          <p className="text-xs text-gray-400 mt-1">
            Source: {tenantConfig.source === 'file' ? 'Saved config' : 'Defaults'}
          </p>
        )}
      </div>
    </div>
  );
}
