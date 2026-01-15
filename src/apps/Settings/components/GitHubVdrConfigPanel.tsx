import { useState, useEffect, useCallback } from 'react';
import { useAdminStore } from '../../../store/adminStore';
import type { GitHubConfig, VdrConfig, VdrPaths } from '../../../types/tenantConfig';

interface GitHubValidationResult {
  valid: boolean;
  owner: string;
  repo: string;
  organizationName: string;
  organizationAvatarUrl: string;
  isPrivate: boolean;
  defaultBranch: string;
  error?: string;
}

export default function GitHubVdrConfigPanel() {
  const {
    tenantConfig,
    updateGitHubConfig,
    updateVdrConfig,
    isTenantConfigLoading,
    tenantConfigError,
  } = useAdminStore();

  // Form state
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [token, setToken] = useState('');
  const [baseBranch, setBaseBranch] = useState('');
  const [paths, setPaths] = useState<VdrPaths>({
    vct: 'credentials/vct',
    schemas: 'credentials/schemas',
    contexts: 'credentials/contexts',
    entities: 'credentials/entities',
    badges: 'credentials/badges',
    proofTemplates: 'credentials/proof-templates',
  });

  // Validation state
  const [validationResult, setValidationResult] = useState<GitHubValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form data from tenant config
  useEffect(() => {
    if (tenantConfig) {
      if (tenantConfig.github) {
        setRepositoryUrl(tenantConfig.github.repositoryUrl || '');
        setToken(tenantConfig.github.token || '');
        setBaseBranch(tenantConfig.github.baseBranch || '');

        // If we have cached validation data, show it
        if (tenantConfig.github.organizationName) {
          setValidationResult({
            valid: true,
            owner: tenantConfig.github.owner || '',
            repo: tenantConfig.github.repo || '',
            organizationName: tenantConfig.github.organizationName,
            organizationAvatarUrl: tenantConfig.github.organizationAvatarUrl || '',
            isPrivate: tenantConfig.github.isPrivate || false,
            defaultBranch: tenantConfig.github.baseBranch || 'main',
          });
        }
      }
      if (tenantConfig.vdr?.paths) {
        setPaths(tenantConfig.vdr.paths);
      }
      setHasChanges(false);
    }
  }, [tenantConfig]);

  // Parse GitHub URL to extract owner/repo
  const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/,
        /^([^/]+)\/([^/]+)$/, // Simple owner/repo format
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Validate GitHub repository
  const validateRepository = useCallback(async () => {
    if (!repositoryUrl.trim()) {
      setValidationError('Please enter a repository URL');
      return;
    }

    const parsed = parseGitHubUrl(repositoryUrl);
    if (!parsed) {
      setValidationError('Invalid GitHub URL format. Use: https://github.com/owner/repo');
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      const response = await fetch('/api/admin/github/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl: repositoryUrl.trim(),
          token: token.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setValidationResult(result);
        setValidationError(null);
        // Auto-fill branch if empty
        if (!baseBranch && result.defaultBranch) {
          setBaseBranch(result.defaultBranch);
        }
      } else {
        setValidationError(result.error || 'Repository validation failed');
        setValidationResult(null);
      }
    } catch (err) {
      setValidationError('Failed to validate repository. Please check your connection.');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  }, [repositoryUrl, token, baseBranch]);

  const handleFieldChange = () => {
    setHasChanges(true);
    setSaveSuccess(false);
    // Clear validation when URL or token changes
    setValidationResult(null);
    setValidationError(null);
  };

  const handlePathChange = (field: keyof VdrPaths, value: string) => {
    setPaths((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    // Validate before saving if not already validated
    if (!validationResult) {
      await validateRepository();
      // Check if validation succeeded
      if (!validationResult) {
        return; // Don't save if validation failed
      }
    }

    const parsed = parseGitHubUrl(repositoryUrl);
    if (!parsed) {
      setValidationError('Invalid repository URL');
      return;
    }

    // Build GitHub config with all fields
    const githubConfig: GitHubConfig = {
      repositoryUrl: repositoryUrl.trim(),
      token: token.trim() || undefined,
      baseBranch: baseBranch.trim() || validationResult?.defaultBranch || 'main',
      // Derived fields from validation
      owner: validationResult?.owner || parsed.owner,
      repo: validationResult?.repo || parsed.repo,
      organizationName: validationResult?.organizationName,
      organizationAvatarUrl: validationResult?.organizationAvatarUrl,
      isPrivate: validationResult?.isPrivate,
    };

    // Build VDR config (without baseUrl)
    const vdrConfig: VdrConfig = { paths };

    // Save both configs
    const githubSuccess = await updateGitHubConfig(githubConfig);
    const vdrSuccess = await updateVdrConfig(vdrConfig);

    if (githubSuccess && vdrSuccess) {
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    if (tenantConfig) {
      if (tenantConfig.github) {
        setRepositoryUrl(tenantConfig.github.repositoryUrl || '');
        setToken(tenantConfig.github.token || '');
        setBaseBranch(tenantConfig.github.baseBranch || '');

        if (tenantConfig.github.organizationName) {
          setValidationResult({
            valid: true,
            owner: tenantConfig.github.owner || '',
            repo: tenantConfig.github.repo || '',
            organizationName: tenantConfig.github.organizationName,
            organizationAvatarUrl: tenantConfig.github.organizationAvatarUrl || '',
            isPrivate: tenantConfig.github.isPrivate || false,
            defaultBranch: tenantConfig.github.baseBranch || 'main',
          });
        } else {
          setValidationResult(null);
        }
      }
      if (tenantConfig.vdr?.paths) {
        setPaths(tenantConfig.vdr.paths);
      }
      setHasChanges(false);
      setValidationError(null);
    }
  };

  // Check if config needs migration (old format)
  const needsMigration = tenantConfig?.github &&
    !tenantConfig.github.repositoryUrl &&
    tenantConfig.github.owner &&
    tenantConfig.github.repo;

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">GitHub Repository</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure the GitHub repository where governance artifacts are published.
        </p>

        {/* Migration Notice */}
        {needsMigration && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Configuration Migration</p>
                <p className="text-sm text-amber-700">
                  Your configuration uses the old format. Please save to migrate to the new format.
                </p>
              </div>
            </div>
          </div>
        )}

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
            Repository Settings
          </h3>

          <div className="space-y-4">
            {/* Repository URL */}
            <div>
              <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Repository URL <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="repositoryUrl"
                  value={repositoryUrl}
                  onChange={(e) => {
                    setRepositoryUrl(e.target.value);
                    handleFieldChange();
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/organization/repository"
                />
                <button
                  type="button"
                  onClick={validateRepository}
                  disabled={isValidating || !repositoryUrl.trim()}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                    isValidating || !repositoryUrl.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the full GitHub repository URL
              </p>
            </div>

            {/* Validation Result / Error */}
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{validationError}</p>
                </div>
              </div>
            )}

            {validationResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  {validationResult.organizationAvatarUrl ? (
                    <img
                      src={validationResult.organizationAvatarUrl}
                      alt={validationResult.organizationName}
                      className="w-12 h-12 rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {validationResult.organizationName || validationResult.owner}
                      </span>
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      Repository: <span className="font-mono">{validationResult.repo}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        validationResult.isPrivate
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {validationResult.isPrivate ? 'Private' : 'Public'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Default branch: {validationResult.defaultBranch}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Token */}
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Token <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  id="token"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    handleFieldChange();
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ghp_xxxxxxxxxxxx"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showToken ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Required for private repositories. Create a token with 'repo' scope at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  github.com/settings/tokens
                </a>
              </p>
            </div>

            {/* Default Branch */}
            <div>
              <label htmlFor="baseBranch" className="block text-sm font-medium text-gray-700 mb-1">
                Default Branch
              </label>
              <input
                type="text"
                id="baseBranch"
                value={baseBranch}
                onChange={(e) => {
                  setBaseBranch(e.target.value);
                  handleFieldChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="main"
              />
              <p className="mt-1 text-xs text-gray-500">
                The default branch for pull requests. Leave empty to use the repository's default.
              </p>
            </div>
          </div>
        </div>

        {/* Folder Paths Section */}
        <div className="mb-8">
          <div className="border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Repository Folder Paths
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 mb-3">
                  Customize the folder paths where governance artifacts are stored in your repository.
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
                      value={paths[key as keyof VdrPaths]}
                      onChange={(e) => handlePathChange(key as keyof VdrPaths, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isTenantConfigLoading || isValidating}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              hasChanges && !isTenantConfigLoading && !isValidating
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isTenantConfigLoading ? 'Saving...' : isValidating ? 'Validating...' : 'Save Changes'}
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
