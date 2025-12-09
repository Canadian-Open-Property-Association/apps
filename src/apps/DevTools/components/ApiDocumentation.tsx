/**
 * API Documentation Component
 *
 * Embeds Swagger UI directly in the page for interactive API documentation.
 * Fetches the OpenAPI spec from /api/docs.json.
 */

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocumentation() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">API Reference</h1>
        <p className="text-gray-600">
          Interactive API documentation for the COPA Developer Tools platform.
          Use "Try it out" to test endpoints directly.
        </p>
      </div>

      {/* Embedded Swagger UI */}
      <div className="swagger-container bg-white rounded-lg border border-gray-200 overflow-hidden">
        <SwaggerUI
          url="/api/docs.json"
          docExpansion="list"
          defaultModelsExpandDepth={1}
          persistAuthorization={true}
          tryItOutEnabled={true}
        />
      </div>
    </div>
  );
}
