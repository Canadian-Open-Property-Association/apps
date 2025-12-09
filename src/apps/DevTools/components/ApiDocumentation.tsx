/**
 * API Documentation Component
 *
 * Displays comprehensive API endpoint documentation organized by category.
 */

import { useState } from 'react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; description: string; required?: boolean }[];
  body?: { name: string; type: string; description: string; required?: boolean }[];
  response?: string;
}

interface ApiSection {
  title: string;
  description: string;
  baseUrl: string;
  endpoints: Endpoint[];
}

const apiSections: ApiSection[] = [
  {
    title: 'Data Catalogue V2 API',
    description: 'Vocabulary-first API for managing DataTypes, Properties, and Sources. DataTypes represent vocabulary domains, Properties are vocabulary attributes.',
    baseUrl: '/api/catalogue/v2',
    endpoints: [
      {
        method: 'GET',
        path: '/data-types',
        description: 'List all DataTypes (vocabulary terms). Optionally filter by category or search query.',
        auth: false,
        params: [
          { name: 'category', type: 'string', description: 'Filter by category slug (e.g., "property", "identity")' },
          { name: 'search', type: 'string', description: 'Search query (min 2 chars)' },
        ],
        response: 'DataType[]',
      },
      {
        method: 'GET',
        path: '/data-types/:id',
        description: 'Get a single DataType with all properties and sources.',
        auth: false,
        params: [{ name: 'id', type: 'string', description: 'DataType ID (kebab-case)', required: true }],
        response: 'DataType',
      },
      {
        method: 'POST',
        path: '/data-types',
        description: 'Create a new DataType.',
        auth: true,
        body: [
          { name: 'name', type: 'string', description: 'Display name', required: true },
          { name: 'description', type: 'string', description: 'Description' },
          { name: 'category', type: 'string', description: 'Category slug' },
          { name: 'properties', type: 'Property[]', description: 'Initial properties' },
        ],
        response: 'DataType',
      },
      {
        method: 'PUT',
        path: '/data-types/:id',
        description: 'Update a DataType.',
        auth: true,
        body: [
          { name: 'name', type: 'string', description: 'Display name' },
          { name: 'description', type: 'string', description: 'Description' },
          { name: 'category', type: 'string', description: 'Category slug' },
          { name: 'properties', type: 'Property[]', description: 'Properties array' },
          { name: 'sources', type: 'DataSource[]', description: 'Sources array' },
        ],
        response: 'DataType',
      },
      {
        method: 'DELETE',
        path: '/data-types/:id',
        description: 'Delete a DataType.',
        auth: true,
        response: '{ success: true }',
      },
      {
        method: 'GET',
        path: '/categories',
        description: 'List all vocabulary categories.',
        auth: false,
        response: 'DataTypeCategory[]',
      },
      {
        method: 'POST',
        path: '/categories',
        description: 'Create a new category.',
        auth: true,
        body: [
          { name: 'name', type: 'string', description: 'Category name', required: true },
          { name: 'description', type: 'string', description: 'Description' },
        ],
        response: 'DataTypeCategory',
      },
      {
        method: 'GET',
        path: '/search',
        description: 'Search across DataTypes and properties.',
        auth: false,
        params: [{ name: 'q', type: 'string', description: 'Search query (min 2 chars)', required: true }],
        response: '{ dataTypes: DataType[] }',
      },
      {
        method: 'GET',
        path: '/stats',
        description: 'Get catalogue statistics.',
        auth: false,
        response: '{ totalDataTypes, totalProperties, totalSources, categoryCounts }',
      },
      {
        method: 'GET',
        path: '/export',
        description: 'Export all V2 catalogue data.',
        auth: false,
        response: '{ exportedAt, categories, dataTypes }',
      },
    ],
  },
  {
    title: 'Entity Manager API',
    description: 'Manage data provider entities (organizations that furnish data).',
    baseUrl: '/api/entities',
    endpoints: [
      {
        method: 'GET',
        path: '/',
        description: 'List all entities.',
        auth: false,
        response: 'Entity[]',
      },
      {
        method: 'GET',
        path: '/:id',
        description: 'Get a single entity.',
        auth: false,
        params: [{ name: 'id', type: 'string', description: 'Entity ID (e.g., "copa-landcor")', required: true }],
        response: 'Entity',
      },
      {
        method: 'POST',
        path: '/',
        description: 'Create a new entity.',
        auth: true,
        body: [
          { name: 'id', type: 'string', description: 'Entity ID (copa-{name})', required: true },
          { name: 'name', type: 'string', description: 'Display name', required: true },
          { name: 'description', type: 'string', description: 'Description' },
          { name: 'did', type: 'string', description: 'DID identifier' },
          { name: 'regionsCovered', type: 'string[]', description: 'Regions covered' },
        ],
        response: 'Entity',
      },
      {
        method: 'PUT',
        path: '/:id',
        description: 'Update an entity.',
        auth: true,
        response: 'Entity',
      },
      {
        method: 'DELETE',
        path: '/:id',
        description: 'Delete an entity.',
        auth: true,
        response: '{ success: true }',
      },
    ],
  },
  {
    title: 'GitHub Integration API',
    description: 'Create PRs to save schemas, contexts, and VCT files to the VDR repository.',
    baseUrl: '/api/github',
    endpoints: [
      {
        method: 'POST',
        path: '/schema',
        description: 'Create a PR to save a JSON Schema or JSON-LD Context.',
        auth: true,
        body: [
          { name: 'filename', type: 'string', description: 'Filename without extension', required: true },
          { name: 'content', type: 'string', description: 'JSON content', required: true },
          { name: 'title', type: 'string', description: 'PR title', required: true },
          { name: 'description', type: 'string', description: 'PR description' },
          { name: 'isJsonLd', type: 'boolean', description: 'True for JSON-LD context' },
        ],
        response: '{ prUrl, prNumber, uri }',
      },
      {
        method: 'POST',
        path: '/vct',
        description: 'Create a PR to save a VCT file.',
        auth: true,
        body: [
          { name: 'filename', type: 'string', description: 'Filename without extension', required: true },
          { name: 'content', type: 'string', description: 'JSON content', required: true },
          { name: 'title', type: 'string', description: 'PR title', required: true },
          { name: 'description', type: 'string', description: 'PR description' },
        ],
        response: '{ prUrl, prNumber, uri }',
      },
    ],
  },
  {
    title: 'Authentication API',
    description: 'GitHub OAuth authentication endpoints.',
    baseUrl: '/api/auth',
    endpoints: [
      {
        method: 'GET',
        path: '/github',
        description: 'Initiate GitHub OAuth flow.',
        auth: false,
        response: 'Redirect to GitHub',
      },
      {
        method: 'GET',
        path: '/github/callback',
        description: 'OAuth callback handler.',
        auth: false,
        response: 'Redirect to /apps',
      },
      {
        method: 'GET',
        path: '/me',
        description: 'Get current authenticated user.',
        auth: false,
        response: '{ user: User | null }',
      },
      {
        method: 'POST',
        path: '/logout',
        description: 'Log out current user.',
        auth: false,
        response: '{ success: true }',
      },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function ApiDocumentation() {
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  const toggleEndpoint = (key: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedEndpoints(newExpanded);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">API Reference</h1>
        <p className="text-gray-600">
          Complete API documentation for the COPA Credential Design Tools platform.
          All endpoints use JSON for request/response bodies.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Base URL:</strong>{' '}
            <code className="bg-blue-100 px-2 py-0.5 rounded">
              {window.location.origin}
            </code>
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Authentication uses session cookies from GitHub OAuth.
            Endpoints marked with a lock icon require authentication.
          </p>
        </div>
      </div>

      {apiSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
              Base: {section.baseUrl}
            </code>
          </div>

          <div className="space-y-2">
            {section.endpoints.map((endpoint, endpointIndex) => {
              const key = `${sectionIndex}-${endpointIndex}`;
              const isExpanded = expandedEndpoints.has(key);
              const fullPath = `${section.baseUrl}${endpoint.path}`;

              return (
                <div
                  key={key}
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                >
                  <button
                    onClick={() => toggleEndpoint(key)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded ${methodColors[endpoint.method]}`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-700 flex-1 text-left">
                      {fullPath}
                    </code>
                    {endpoint.auth && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 py-3">{endpoint.description}</p>

                      {endpoint.params && endpoint.params.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Query Parameters
                          </h4>
                          <div className="bg-gray-50 rounded p-3 space-y-2">
                            {endpoint.params.map((param, i) => (
                              <div key={i} className="text-sm">
                                <code className="text-purple-600">{param.name}</code>
                                <span className="text-gray-400 mx-1">:</span>
                                <span className="text-gray-600">{param.type}</span>
                                {param.required && (
                                  <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                                <p className="text-gray-500 text-xs mt-0.5">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {endpoint.body && endpoint.body.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Request Body
                          </h4>
                          <div className="bg-gray-50 rounded p-3 space-y-2">
                            {endpoint.body.map((field, i) => (
                              <div key={i} className="text-sm">
                                <code className="text-purple-600">{field.name}</code>
                                <span className="text-gray-400 mx-1">:</span>
                                <span className="text-gray-600">{field.type}</span>
                                {field.required && (
                                  <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                                <p className="text-gray-500 text-xs mt-0.5">{field.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {endpoint.response && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Response
                          </h4>
                          <code className="text-sm bg-gray-50 px-3 py-2 rounded block text-green-600">
                            {endpoint.response}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
