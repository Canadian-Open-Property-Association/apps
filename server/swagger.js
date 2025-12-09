import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'COPA Developer Tools API',
      version: '1.0.0',
      description: 'API for managing data vocabulary, entities, and verifiable credentials',
      contact: {
        name: 'Canadian Open Property Association',
        url: 'https://openpropertyassociation.ca',
      },
    },
    servers: [
      {
        url: 'http://localhost:5174/api',
        description: 'Development server',
      },
      {
        url: 'https://apps.openpropertyassociation.ca/api',
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Data Catalogue', description: 'Data types and properties management' },
      { name: 'Entities', description: 'Entity/organization management' },
      { name: 'Authentication', description: 'GitHub OAuth authentication' },
    ],
    components: {
      schemas: {
        DataType: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'property-public-data' },
            name: { type: 'string', example: 'Property Public Data' },
            description: { type: 'string' },
            category: { type: 'string', example: 'property' },
            parentTypeId: { type: 'string', nullable: true },
            properties: {
              type: 'array',
              items: { $ref: '#/components/schemas/Property' },
            },
            sources: {
              type: 'array',
              items: { $ref: '#/components/schemas/DataSource' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'assessed_value' },
            displayName: { type: 'string', example: 'Assessed Value' },
            description: { type: 'string' },
            valueType: {
              type: 'string',
              enum: ['string', 'number', 'boolean', 'date', 'datetime', 'array', 'object', 'currency', 'url', 'email', 'phone'],
            },
            required: { type: 'boolean' },
            sampleValue: { type: 'string' },
            providerMappings: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProviderMapping' },
            },
          },
        },
        ProviderMapping: {
          type: 'object',
          properties: {
            entityId: { type: 'string', example: 'copa-landcor' },
            entityName: { type: 'string', example: 'Landcor Data Corporation' },
            providerFieldName: { type: 'string', example: 'assessed_val' },
            regionsCovered: {
              type: 'array',
              items: { type: 'string' },
              example: ['BC'],
            },
            notes: { type: 'string' },
            addedAt: { type: 'string', format: 'date-time' },
          },
        },
        DataSource: {
          type: 'object',
          properties: {
            entityId: { type: 'string' },
            entityName: { type: 'string' },
            regionsCovered: {
              type: 'array',
              items: { type: 'string' },
            },
            updateFrequency: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        Entity: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            types: {
              type: 'array',
              items: { type: 'string' },
              example: ['data-furnisher', 'issuer'],
            },
            description: { type: 'string' },
            logoUri: { type: 'string' },
            primaryColor: { type: 'string' },
            website: { type: 'string' },
            contactEmail: { type: 'string' },
            did: { type: 'string' },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            order: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie from GitHub OAuth login',
        },
      },
    },
    paths: {
      // Data Catalogue - Data Types
      '/catalogue/data-types': {
        get: {
          tags: ['Data Catalogue'],
          summary: 'List all data types',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search query (min 2 chars)' },
          ],
          responses: {
            200: {
              description: 'List of data types',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/DataType' } } } },
            },
          },
        },
        post: {
          tags: ['Data Catalogue'],
          summary: 'Create a new data type',
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DataType' } } },
          },
          responses: {
            201: { description: 'Data type created' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/catalogue/data-types/{id}': {
        get: {
          tags: ['Data Catalogue'],
          summary: 'Get a data type by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Data type details', content: { 'application/json': { schema: { $ref: '#/components/schemas/DataType' } } } },
            404: { description: 'Not found' },
          },
        },
        put: {
          tags: ['Data Catalogue'],
          summary: 'Update a data type',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/DataType' } } } },
          responses: { 200: { description: 'Updated' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
        },
        delete: {
          tags: ['Data Catalogue'],
          summary: 'Delete a data type',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
        },
      },
      '/catalogue/data-types/{dataTypeId}/properties': {
        post: {
          tags: ['Data Catalogue'],
          summary: 'Add a property to a data type',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'dataTypeId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Property' } } } },
          responses: { 201: { description: 'Property added' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/catalogue/data-types/{dataTypeId}/properties/{propertyId}': {
        put: {
          tags: ['Data Catalogue'],
          summary: 'Update a property',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'dataTypeId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'propertyId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Property' } } } },
          responses: { 200: { description: 'Updated' }, 401: { description: 'Unauthorized' } },
        },
        delete: {
          tags: ['Data Catalogue'],
          summary: 'Delete a property',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'dataTypeId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'propertyId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Deleted' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/catalogue/data-types/{dataTypeId}/properties/{propertyId}/mappings': {
        post: {
          tags: ['Data Catalogue'],
          summary: 'Add a provider mapping to a property',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'dataTypeId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'propertyId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ProviderMapping' } } } },
          responses: { 201: { description: 'Mapping added' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/catalogue/categories': {
        get: {
          tags: ['Data Catalogue'],
          summary: 'List all categories',
          responses: { 200: { description: 'List of categories', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } },
        },
        post: {
          tags: ['Data Catalogue'],
          summary: 'Create a category',
          security: [{ cookieAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          responses: { 201: { description: 'Category created' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/catalogue/search': {
        get: {
          tags: ['Data Catalogue'],
          summary: 'Search data types and properties',
          parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 } }],
          responses: { 200: { description: 'Search results' } },
        },
      },
      '/catalogue/export': {
        get: {
          tags: ['Data Catalogue'],
          summary: 'Export all catalogue data',
          responses: { 200: { description: 'Full catalogue export as JSON' } },
        },
      },
      '/catalogue/stats': {
        get: {
          tags: ['Data Catalogue'],
          summary: 'Get catalogue statistics',
          responses: { 200: { description: 'Statistics including counts of data types, properties, etc.' } },
        },
      },
      // Entities
      '/entities': {
        get: {
          tags: ['Entities'],
          summary: 'List all entities',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filter by entity type' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name' },
          ],
          responses: { 200: { description: 'List of entities', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Entity' } } } } } },
        },
        post: {
          tags: ['Entities'],
          summary: 'Create a new entity',
          security: [{ cookieAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Entity' } } } },
          responses: { 201: { description: 'Entity created' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/entities/{id}': {
        get: {
          tags: ['Entities'],
          summary: 'Get an entity by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Entity details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Entities'],
          summary: 'Update an entity',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Entity' } } } },
          responses: { 200: { description: 'Updated' }, 401: { description: 'Unauthorized' } },
        },
        delete: {
          tags: ['Entities'],
          summary: 'Delete an entity',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' }, 401: { description: 'Unauthorized' } },
        },
      },
      // Authentication
      '/auth/github': {
        get: {
          tags: ['Authentication'],
          summary: 'Initiate GitHub OAuth login',
          responses: { 302: { description: 'Redirects to GitHub' } },
        },
      },
      '/auth/github/callback': {
        get: {
          tags: ['Authentication'],
          summary: 'GitHub OAuth callback',
          responses: { 302: { description: 'Redirects to app after login' } },
        },
      },
      '/auth/user': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user info',
          responses: {
            200: { description: 'User info if logged in' },
            401: { description: 'Not logged in' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Log out',
          responses: { 200: { description: 'Logged out' } },
        },
      },
    },
  },
  apis: [], // We're defining paths inline above
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
