import { useState, useEffect } from 'react';
import { useAdminStore } from '../../../store/adminStore';
import type { GitHubConfig, VdrConfig } from '../../../types/tenantConfig';

export default function GitHubVdrConfigPanel() {
  const {
    tenantConfig,
    updateGitHubConfig,
    updateVdrConfig,
    isTenantConfigLoading,
    tenantConfigError,
  } = useAdminStore();

  const [githubData, setGithubData] = useState<GitHubConfig>({
    owner: '',
    repo: '',
    baseBranch: 'main',
  });

  const [vdrData, setVdrData] = useState<VdrConfig>({
    baseUrl: '',
    paths: {
      vct: 'credentials/vct',
      schemas: 'credentials/schemas',
      contexts: 'credentials/contexts',
      entities: 'credentials/entities',
      badges: 'credentials/badges',
      proofTemplates: 'credentials/proof-templates',
    },
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form data from tenant config
  useEffect(() => {
    if (tenantConfig) {
      if (tenantConfig.github) {
        setGithubData(tenantConfig.github);
      }
      if (tenantConfig.vdr) {
        setVdrData(tenantConfig.vdr);
      }
      setHasChanges(false);
    }
  }, [tenantConfig]);

  const handleGitHubChange = (field: keyof GitHubConfig, value: string) => {
    setGithubData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleVdrChange = (field: 'baseUrl', value: string) => {
    setVdrData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handlePathChange = (field: keyof VdrConfig['paths'], value: string) => {
    setVdrData((prev) => ({
      ...prev,
      paths: { ...prev.paths, [field]: value },
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    // Save both configs
    const githubSuccess = await updateGitHubConfig(githubData);
    const vdrSuccess = await updateVdrConfig(vdrData);

    if (githubSuccess && vdrSuccess) {
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    if (tenantConfig) {
      if (tenantConfig.github) {
        setGithubData(tenantConfig.github);
      }
      if (tenantConfig.vdr) {
        setVdrData(tenantConfig.vdr);
      }
      setHasChanges(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">GitHub & VDR Configuration</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure the GitHub repository and Verifiable Data Registry (VDR) settings for publishing
          credentials.
        </p>

        {tenantConfigError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {tenantConfigError}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Configuration saved successfully.
          </div>
        )}

        {/* GitHub Repository Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub Repository
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                  Owner / Organization
                </label>
                <input
                  type="text"
                  id="owner"
                  value={githubData.owner}
                  onChange={(e) => handleGitHubChange('owner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., my-organization"
                />
              </div>

              <div>
                <label htmlFor="repo" className="block text-sm font-medium text-gray-700 mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  id="repo"
                  value={githubData.repo}
                  onChange={(e) => handleGitHubChange('repo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., governance"
                />
              </div>
            </div>

            <div>
              <label htmlFor="baseBranch" className="block text-sm font-medium text-gray-700 mb-1">
                Base Branch
              </label>
              <input
                type="text"
                id="baseBranch"
                value={githubData.baseBranch || ''}
                onChange={(e) => handleGitHubChange('baseBranch', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="main"
              />
              <p className="mt-1 text-xs text-gray-500">
                The default branch for pull requests (usually "main").
              </p>
            </div>
          </div>
        </div>

        {/* VDR Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            Verifiable Data Registry (VDR)
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
                VDR Base URL
              </label>
              <input
                type="text"
                id="baseUrl"
                value={vdrData.baseUrl}
                onChange={(e) => handleVdrChange('baseUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                The base URL where credentials will be published (e.g., your GitHub Pages domain).
              </p>
            </div>

            {/* Advanced Paths Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Folder Paths (Advanced)</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showAdvanced && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500 mb-3">
                    Customize the folder paths where different credential types are stored in your
                    repository.
                  </p>

                  {[
                    { key: 'vct', label: 'VCT (Credential Types)' },
                    { key: 'schemas', label: 'JSON Schemas' },
                    { key: 'contexts', label: 'JSON-LD Contexts' },
                    { key: 'entities', label: 'Entities' },
                    { key: 'badges', label: 'Badges' },
                    { key: 'proofTemplates', label: 'Proof Templates' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label
                        htmlFor={`path-${key}`}
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        type="text"
                        id={`path-${key}`}
                        value={vdrData.paths[key as keyof typeof vdrData.paths]}
                        onChange={(e) =>
                          handlePathChange(key as keyof typeof vdrData.paths, e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isTenantConfigLoading}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              hasChanges && !isTenantConfigLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isTenantConfigLoading ? 'Saving...' : 'Save Changes'}
          </button>

          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100"
            >
              Reset
            </button>
          )}
        </div>

        {/* Config source info */}
        {tenantConfig?.configuredAt && (
          <p className="mt-4 text-xs text-gray-400">
            Last updated: {new Date(tenantConfig.configuredAt).toLocaleString()}
            {tenantConfig.configuredBy && ` by ${tenantConfig.configuredBy}`}
          </p>
        )}
      </div>
    </div>
  );
}
