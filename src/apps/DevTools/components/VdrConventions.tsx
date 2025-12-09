/**
 * VDR Conventions Component
 *
 * Documents the Verifiable Data Registry naming conventions and URL patterns.
 */

export default function VdrConventions() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">VDR Naming Conventions</h1>
        <p className="text-gray-600">
          The Verifiable Data Registry (VDR) uses consistent naming conventions
          for all artifacts. This ensures predictable URLs and easy discovery.
        </p>
      </div>

      {/* URL Base */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Base URLs</h2>
        <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <div className="space-y-1">
            <div>
              <span className="text-gray-400"># Production base URL</span>
            </div>
            <div>
              <span className="text-green-400">VDR_BASE</span>
              <span className="text-gray-400"> = </span>
              <span className="text-yellow-300">"https://openpropertyassociation.ca/credentials"</span>
            </div>
            <div className="mt-2">
              <span className="text-gray-400"># Artifact directories</span>
            </div>
            <div>
              <span className="text-green-400">SCHEMAS</span>
              <span className="text-gray-400"> = </span>
              <span className="text-yellow-300">"{'{VDR_BASE}'}/schemas"</span>
            </div>
            <div>
              <span className="text-green-400">CONTEXTS</span>
              <span className="text-gray-400"> = </span>
              <span className="text-yellow-300">"{'{VDR_BASE}'}/contexts"</span>
            </div>
            <div>
              <span className="text-green-400">VCT</span>
              <span className="text-gray-400"> = </span>
              <span className="text-yellow-300">"{'{VDR_BASE}'}/vct"</span>
            </div>
          </div>
        </div>
      </section>

      {/* Naming Pattern */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Artifact Naming Pattern</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <code className="text-blue-800 text-lg">
            {'{category}'}-{'{credential-name}'}.{'{artifact-type}'}.{'{extension}'}
          </code>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Components</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-purple-600">category</code>
                <span className="text-gray-600 ml-2">Domain category (property, identity, badge, financial)</span>
              </li>
              <li>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-purple-600">credential-name</code>
                <span className="text-gray-600 ml-2">Descriptive kebab-case name</span>
              </li>
              <li>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-purple-600">artifact-type</code>
                <span className="text-gray-600 ml-2">schema | context | vct</span>
              </li>
              <li>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-purple-600">extension</code>
                <span className="text-gray-600 ml-2">json | jsonld</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Categories</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <code className="text-gray-700">property</code>
                <span className="text-gray-500">- Real estate related</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <code className="text-gray-700">identity</code>
                <span className="text-gray-500">- Personal identification</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <code className="text-gray-700">badge</code>
                <span className="text-gray-500">- Achievement badges</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <code className="text-gray-700">financial</code>
                <span className="text-gray-500">- Financial credentials</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <code className="text-gray-700">professional</code>
                <span className="text-gray-500">- Professional certs</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Examples</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 border-b">Artifact</th>
                <th className="text-left px-4 py-2 border-b">Filename</th>
                <th className="text-left px-4 py-2 border-b">Full URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-2 text-gray-600">Home Credential Schema</td>
                <td className="px-4 py-2">
                  <code className="text-purple-600">property-home-credential.schema.json</code>
                </td>
                <td className="px-4 py-2">
                  <code className="text-xs text-gray-500">.../schemas/property-home-credential.schema.json</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-600">Home Credential Context</td>
                <td className="px-4 py-2">
                  <code className="text-purple-600">property-home-credential.context.jsonld</code>
                </td>
                <td className="px-4 py-2">
                  <code className="text-xs text-gray-500">.../contexts/property-home-credential.context.jsonld</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-600">Cornerstone ID Schema</td>
                <td className="px-4 py-2">
                  <code className="text-purple-600">identity-cornerstone-id.schema.json</code>
                </td>
                <td className="px-4 py-2">
                  <code className="text-xs text-gray-500">.../schemas/identity-cornerstone-id.schema.json</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-600">Equity Threshold Badge VCT</td>
                <td className="px-4 py-2">
                  <code className="text-purple-600">badge-equity-threshold.vct.json</code>
                </td>
                <td className="px-4 py-2">
                  <code className="text-xs text-gray-500">.../vct/badge-equity-threshold.vct.json</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* GitHub Structure */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">GitHub Repository Structure</h2>
        <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm">
          <pre className="whitespace-pre">{`credentials/
├── schemas/
│   ├── property-home-credential.schema.json
│   ├── identity-cornerstone-id.schema.json
│   └── badge-equity-threshold.schema.json
├── contexts/
│   ├── property-home-credential.context.jsonld
│   ├── identity-cornerstone-id.context.jsonld
│   └── badge-equity-threshold.context.jsonld
└── vct/
    ├── property-home-credential.vct.json
    └── badge-equity-threshold.vct.json`}</pre>
        </div>
      </section>

      {/* ID Conventions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Related ID Conventions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 border-b">Entity Type</th>
                <th className="text-left px-4 py-2 border-b">Pattern</th>
                <th className="text-left px-4 py-2 border-b">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-2 text-gray-600">Entity ID</td>
                <td className="px-4 py-2"><code>copa-{'{name}'}</code></td>
                <td className="px-4 py-2"><code className="text-purple-600">copa-landcor</code></td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-600">DataType ID</td>
                <td className="px-4 py-2"><code>{'{name}'}</code> (kebab-case)</td>
                <td className="px-4 py-2"><code className="text-purple-600">homeowner-details</code></td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-600">Property ID</td>
                <td className="px-4 py-2"><code>prop-{'{name}'}</code></td>
                <td className="px-4 py-2"><code className="text-purple-600">prop-homeowner_first_name</code></td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-600">Property Name</td>
                <td className="px-4 py-2"><code>{'{name}'}</code> (snake_case)</td>
                <td className="px-4 py-2"><code className="text-purple-600">homeowner_first_name</code></td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-600">Category ID</td>
                <td className="px-4 py-2"><code>{'{name}'}</code> (lowercase slug)</td>
                <td className="px-4 py-2"><code className="text-purple-600">property</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* JSON-LD @id Pattern */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">JSON-LD @id Pattern</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Property @id values use the <code className="bg-gray-100 px-1.5 py-0.5 rounded">copa:</code> prefix
            with the canonical snake_case property name.
          </p>
          <div className="bg-gray-800 text-gray-100 rounded p-3 font-mono text-sm">
            <pre>{`{
  "@context": {
    "copa": "https://openpropertyassociation.ca/vocab#",
    "homeowner_first_name": {
      "@id": "copa:homeowner_first_name",
      "@type": "xsd:string"
    }
  }
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
