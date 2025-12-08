import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get the data directory from environment or use default
const getDataDir = () => {
  const assetsPath = process.env.ASSETS_PATH || path.join(__dirname, '../../assets');
  const catalogueDir = path.join(assetsPath, 'catalogue');
  if (!fs.existsSync(catalogueDir)) {
    fs.mkdirSync(catalogueDir, { recursive: true });
  }
  return catalogueDir;
};

// Load seed data if catalogue is empty
const getSeedDataPath = () => path.join(__dirname, '../data/seed-furnishers.json');
const getSeedDataTypeConfigsPath = () => path.join(__dirname, '../data/seed-data-type-configs.json');

// Data file paths
const getFurnishersFile = () => path.join(getDataDir(), 'furnishers.json');
const getDataTypesFile = () => path.join(getDataDir(), 'data-types.json');
const getAttributesFile = () => path.join(getDataDir(), 'attributes.json');
const getDataTypeConfigsFile = () => path.join(getDataDir(), 'data-type-configs.json');
const getCategoriesFile = () => path.join(getDataDir(), 'categories.json');

// Initialize data files if they don't exist
const initializeData = () => {
  const furnishersFile = getFurnishersFile();
  const dataTypesFile = getDataTypesFile();
  const attributesFile = getAttributesFile();

  // Check if we need to initialize from seed data
  if (!fs.existsSync(furnishersFile)) {
    const seedPath = getSeedDataPath();
    if (fs.existsSync(seedPath)) {
      console.log('Initializing catalogue from seed data...');
      const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

      const furnishers = [];
      const dataTypes = [];
      const attributes = [];
      const now = new Date().toISOString();

      for (const f of seedData.furnishers) {
        // Create furnisher record
        furnishers.push({
          id: f.id,
          name: f.name,
          description: f.description || '',
          logoUri: f.logoUri || '',
          website: f.website || '',
          contactName: f.contactName || '',
          contactEmail: f.contactEmail || '',
          contactPhone: f.contactPhone || '',
          did: f.did || '',
          regionsCovered: f.regionsCovered || [],
          createdAt: now,
          updatedAt: now,
        });

        // Create data types and attributes
        for (const dt of f.dataTypes || []) {
          dataTypes.push({
            id: dt.id,
            furnisherId: f.id,
            name: dt.name,
            description: dt.description || '',
            createdAt: now,
            updatedAt: now,
          });

          for (const attr of dt.attributes || []) {
            attributes.push({
              id: `${dt.id}-${attr.name}`,
              dataTypeId: dt.id,
              name: attr.name,
              displayName: attr.displayName || attr.name,
              description: attr.description || '',
              dataType: attr.dataType || 'string',
              sampleValue: attr.sampleValue || '',
              regionsCovered: attr.regionsCovered || null,
              path: attr.path || '',
              metadata: attr.metadata || {},
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      }

      // Save all data
      fs.writeFileSync(furnishersFile, JSON.stringify({ furnishers }, null, 2));
      fs.writeFileSync(dataTypesFile, JSON.stringify({ dataTypes }, null, 2));
      fs.writeFileSync(attributesFile, JSON.stringify({ attributes }, null, 2));

      console.log(`Catalogue initialized with ${furnishers.length} furnishers, ${dataTypes.length} data types, ${attributes.length} attributes`);
    } else {
      // Create empty data files
      fs.writeFileSync(furnishersFile, JSON.stringify({ furnishers: [] }, null, 2));
      fs.writeFileSync(dataTypesFile, JSON.stringify({ dataTypes: [] }, null, 2));
      fs.writeFileSync(attributesFile, JSON.stringify({ attributes: [] }, null, 2));
    }
  }
};

// Load helpers
const loadFurnishers = () => {
  initializeData();
  const data = JSON.parse(fs.readFileSync(getFurnishersFile(), 'utf-8'));
  return data.furnishers || [];
};

const saveFurnishers = (furnishers) => {
  fs.writeFileSync(getFurnishersFile(), JSON.stringify({ furnishers }, null, 2));
};

const loadDataTypes = () => {
  initializeData();
  const data = JSON.parse(fs.readFileSync(getDataTypesFile(), 'utf-8'));
  return data.dataTypes || [];
};

const saveDataTypes = (dataTypes) => {
  fs.writeFileSync(getDataTypesFile(), JSON.stringify({ dataTypes }, null, 2));
};

const loadAttributes = () => {
  initializeData();
  const data = JSON.parse(fs.readFileSync(getAttributesFile(), 'utf-8'));
  return data.attributes || [];
};

const saveAttributes = (attributes) => {
  fs.writeFileSync(getAttributesFile(), JSON.stringify({ attributes }, null, 2));
};

// Data Type Configs (standardized data type definitions)
const initializeDataTypeConfigs = () => {
  const configsFile = getDataTypeConfigsFile();
  const categoriesFile = getCategoriesFile();

  if (!fs.existsSync(configsFile)) {
    const seedPath = getSeedDataTypeConfigsPath();
    if (fs.existsSync(seedPath)) {
      console.log('Initializing data type configs from seed data...');
      const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      fs.writeFileSync(configsFile, JSON.stringify({ dataTypeConfigs: seedData.dataTypeConfigs || [] }, null, 2));
      fs.writeFileSync(categoriesFile, JSON.stringify({ categories: seedData.categories || [] }, null, 2));
      console.log(`Data type configs initialized with ${seedData.dataTypeConfigs?.length || 0} configs`);
    } else {
      fs.writeFileSync(configsFile, JSON.stringify({ dataTypeConfigs: [] }, null, 2));
      fs.writeFileSync(categoriesFile, JSON.stringify({ categories: [] }, null, 2));
    }
  }
};

const loadDataTypeConfigs = () => {
  initializeDataTypeConfigs();
  const data = JSON.parse(fs.readFileSync(getDataTypeConfigsFile(), 'utf-8'));
  return data.dataTypeConfigs || [];
};

const saveDataTypeConfigs = (dataTypeConfigs) => {
  fs.writeFileSync(getDataTypeConfigsFile(), JSON.stringify({ dataTypeConfigs }, null, 2));
};

const loadCategories = () => {
  initializeDataTypeConfigs();
  const data = JSON.parse(fs.readFileSync(getCategoriesFile(), 'utf-8'));
  return data.categories || [];
};

const saveCategories = (categories) => {
  fs.writeFileSync(getCategoriesFile(), JSON.stringify({ categories }, null, 2));
};

// Middleware: Require authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user?.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// ============================================
// Furnishers API
// ============================================

// List all furnishers with stats
router.get('/furnishers', (req, res) => {
  try {
    const furnishers = loadFurnishers();
    const dataTypes = loadDataTypes();
    const attributes = loadAttributes();

    // Add stats to each furnisher
    const furnishersWithStats = furnishers.map(f => {
      const fDataTypes = dataTypes.filter(dt => dt.furnisherId === f.id);
      const fDataTypeIds = fDataTypes.map(dt => dt.id);
      const fAttributes = attributes.filter(a => fDataTypeIds.includes(a.dataTypeId));

      return {
        ...f,
        stats: {
          dataTypeCount: fDataTypes.length,
          attributeCount: fAttributes.length,
        },
      };
    });

    res.json(furnishersWithStats);
  } catch (error) {
    console.error('Error listing furnishers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single furnisher with all data types and attributes
router.get('/furnishers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const furnishers = loadFurnishers();
    const dataTypes = loadDataTypes();
    const attributes = loadAttributes();

    const furnisher = furnishers.find(f => f.id === id);
    if (!furnisher) {
      return res.status(404).json({ error: 'Furnisher not found' });
    }

    // Get data types for this furnisher
    const fDataTypes = dataTypes.filter(dt => dt.furnisherId === id);

    // Add attributes to each data type
    const dataTypesWithAttributes = fDataTypes.map(dt => ({
      ...dt,
      attributes: attributes.filter(a => a.dataTypeId === dt.id),
    }));

    res.json({
      ...furnisher,
      dataTypes: dataTypesWithAttributes,
    });
  } catch (error) {
    console.error('Error getting furnisher:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new furnisher
router.post('/furnishers', requireAuth, (req, res) => {
  try {
    const furnishers = loadFurnishers();
    const now = new Date().toISOString();

    const newFurnisher = {
      id: req.body.id || `furnisher-${Date.now()}`,
      name: req.body.name,
      description: req.body.description || '',
      logoUri: req.body.logoUri || '',
      website: req.body.website || '',
      contactName: req.body.contactName || '',
      contactEmail: req.body.contactEmail || '',
      contactPhone: req.body.contactPhone || '',
      did: req.body.did || '',
      regionsCovered: req.body.regionsCovered || [],
      createdAt: now,
      updatedAt: now,
      createdBy: {
        id: String(req.session.user.id),
        login: req.session.user.login,
        name: req.session.user.name || undefined,
      },
    };

    if (!newFurnisher.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check for duplicate ID
    if (furnishers.some(f => f.id === newFurnisher.id)) {
      return res.status(409).json({ error: 'Furnisher with this ID already exists' });
    }

    furnishers.push(newFurnisher);
    saveFurnishers(furnishers);

    res.json(newFurnisher);
  } catch (error) {
    console.error('Error creating furnisher:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a furnisher
router.put('/furnishers/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const furnishers = loadFurnishers();
    const index = furnishers.findIndex(f => f.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Furnisher not found' });
    }

    const updatedFurnisher = {
      ...furnishers[index],
      name: req.body.name ?? furnishers[index].name,
      description: req.body.description ?? furnishers[index].description,
      logoUri: req.body.logoUri ?? furnishers[index].logoUri,
      website: req.body.website ?? furnishers[index].website,
      contactName: req.body.contactName ?? furnishers[index].contactName,
      contactEmail: req.body.contactEmail ?? furnishers[index].contactEmail,
      contactPhone: req.body.contactPhone ?? furnishers[index].contactPhone,
      did: req.body.did ?? furnishers[index].did,
      regionsCovered: req.body.regionsCovered ?? furnishers[index].regionsCovered,
      updatedAt: new Date().toISOString(),
    };

    furnishers[index] = updatedFurnisher;
    saveFurnishers(furnishers);

    res.json(updatedFurnisher);
  } catch (error) {
    console.error('Error updating furnisher:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a furnisher (and all its data types and attributes)
router.delete('/furnishers/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const furnishers = loadFurnishers();
    const dataTypes = loadDataTypes();
    const attributes = loadAttributes();

    const index = furnishers.findIndex(f => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Furnisher not found' });
    }

    // Get data type IDs for this furnisher
    const dataTypeIds = dataTypes.filter(dt => dt.furnisherId === id).map(dt => dt.id);

    // Remove furnisher
    furnishers.splice(index, 1);
    saveFurnishers(furnishers);

    // Remove data types
    const remainingDataTypes = dataTypes.filter(dt => dt.furnisherId !== id);
    saveDataTypes(remainingDataTypes);

    // Remove attributes
    const remainingAttributes = attributes.filter(a => !dataTypeIds.includes(a.dataTypeId));
    saveAttributes(remainingAttributes);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting furnisher:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Data Types API
// ============================================

// List data types for a furnisher
router.get('/furnishers/:furnisherId/data-types', (req, res) => {
  try {
    const { furnisherId } = req.params;
    const dataTypes = loadDataTypes();
    const attributes = loadAttributes();

    const fDataTypes = dataTypes.filter(dt => dt.furnisherId === furnisherId);

    // Add attribute count to each data type
    const dataTypesWithCount = fDataTypes.map(dt => ({
      ...dt,
      attributeCount: attributes.filter(a => a.dataTypeId === dt.id).length,
    }));

    res.json(dataTypesWithCount);
  } catch (error) {
    console.error('Error listing data types:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a data type
router.post('/data-types', requireAuth, (req, res) => {
  try {
    const dataTypes = loadDataTypes();
    const now = new Date().toISOString();

    const newDataType = {
      id: req.body.id || `dt-${Date.now()}`,
      furnisherId: req.body.furnisherId,
      name: req.body.name,
      description: req.body.description || '',
      createdAt: now,
      updatedAt: now,
    };

    if (!newDataType.furnisherId || !newDataType.name) {
      return res.status(400).json({ error: 'furnisherId and name are required' });
    }

    // Check for duplicate ID
    if (dataTypes.some(dt => dt.id === newDataType.id)) {
      return res.status(409).json({ error: 'Data type with this ID already exists' });
    }

    dataTypes.push(newDataType);
    saveDataTypes(dataTypes);

    res.json(newDataType);
  } catch (error) {
    console.error('Error creating data type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a data type
router.put('/data-types/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const dataTypes = loadDataTypes();
    const index = dataTypes.findIndex(dt => dt.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Data type not found' });
    }

    const updatedDataType = {
      ...dataTypes[index],
      name: req.body.name ?? dataTypes[index].name,
      description: req.body.description ?? dataTypes[index].description,
      updatedAt: new Date().toISOString(),
    };

    dataTypes[index] = updatedDataType;
    saveDataTypes(dataTypes);

    res.json(updatedDataType);
  } catch (error) {
    console.error('Error updating data type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a data type (and all its attributes)
router.delete('/data-types/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const dataTypes = loadDataTypes();
    const attributes = loadAttributes();

    const index = dataTypes.findIndex(dt => dt.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Data type not found' });
    }

    // Remove data type
    dataTypes.splice(index, 1);
    saveDataTypes(dataTypes);

    // Remove attributes
    const remainingAttributes = attributes.filter(a => a.dataTypeId !== id);
    saveAttributes(remainingAttributes);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting data type:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Attributes API
// ============================================

// List attributes for a data type
router.get('/data-types/:dataTypeId/attributes', (req, res) => {
  try {
    const { dataTypeId } = req.params;
    const attributes = loadAttributes();
    const dtAttributes = attributes.filter(a => a.dataTypeId === dataTypeId);
    res.json(dtAttributes);
  } catch (error) {
    console.error('Error listing attributes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single attribute
router.get('/attributes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const attributes = loadAttributes();
    const attribute = attributes.find(a => a.id === id);

    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }

    res.json(attribute);
  } catch (error) {
    console.error('Error getting attribute:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create an attribute
router.post('/attributes', requireAuth, (req, res) => {
  try {
    const attributes = loadAttributes();
    const now = new Date().toISOString();

    const newAttribute = {
      id: req.body.id || `attr-${Date.now()}`,
      dataTypeId: req.body.dataTypeId,
      name: req.body.name,
      displayName: req.body.displayName || req.body.name,
      description: req.body.description || '',
      dataType: req.body.dataType || 'string',
      sampleValue: req.body.sampleValue || '',
      regionsCovered: req.body.regionsCovered || null,
      path: req.body.path || '',
      metadata: req.body.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    if (!newAttribute.dataTypeId || !newAttribute.name) {
      return res.status(400).json({ error: 'dataTypeId and name are required' });
    }

    // Check for duplicate ID
    if (attributes.some(a => a.id === newAttribute.id)) {
      return res.status(409).json({ error: 'Attribute with this ID already exists' });
    }

    attributes.push(newAttribute);
    saveAttributes(attributes);

    res.json(newAttribute);
  } catch (error) {
    console.error('Error creating attribute:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk create attributes
router.post('/attributes/bulk', requireAuth, (req, res) => {
  try {
    const { dataTypeId, attributes: newAttrs } = req.body;

    if (!dataTypeId || !Array.isArray(newAttrs) || newAttrs.length === 0) {
      return res.status(400).json({ error: 'dataTypeId and attributes array are required' });
    }

    const attributes = loadAttributes();
    const now = new Date().toISOString();
    const created = [];

    for (const attr of newAttrs) {
      const newAttribute = {
        id: attr.id || `attr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        dataTypeId,
        name: attr.name,
        displayName: attr.displayName || attr.name,
        description: attr.description || '',
        dataType: attr.dataType || 'string',
        sampleValue: attr.sampleValue || '',
        regionsCovered: attr.regionsCovered || null,
        path: attr.path || '',
        metadata: attr.metadata || {},
        createdAt: now,
        updatedAt: now,
      };

      if (!newAttribute.name) {
        continue; // Skip attributes without names
      }

      // Skip duplicates
      if (attributes.some(a => a.id === newAttribute.id)) {
        continue;
      }

      attributes.push(newAttribute);
      created.push(newAttribute);
    }

    saveAttributes(attributes);

    res.json({ created: created.length, attributes: created });
  } catch (error) {
    console.error('Error bulk creating attributes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an attribute
router.put('/attributes/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const attributes = loadAttributes();
    const index = attributes.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Attribute not found' });
    }

    const updatedAttribute = {
      ...attributes[index],
      name: req.body.name ?? attributes[index].name,
      displayName: req.body.displayName ?? attributes[index].displayName,
      description: req.body.description ?? attributes[index].description,
      dataType: req.body.dataType ?? attributes[index].dataType,
      sampleValue: req.body.sampleValue ?? attributes[index].sampleValue,
      regionsCovered: req.body.regionsCovered !== undefined ? req.body.regionsCovered : attributes[index].regionsCovered,
      path: req.body.path ?? attributes[index].path,
      metadata: req.body.metadata ?? attributes[index].metadata,
      updatedAt: new Date().toISOString(),
    };

    attributes[index] = updatedAttribute;
    saveAttributes(attributes);

    res.json(updatedAttribute);
  } catch (error) {
    console.error('Error updating attribute:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an attribute
router.delete('/attributes/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const attributes = loadAttributes();

    const index = attributes.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Attribute not found' });
    }

    attributes.splice(index, 1);
    saveAttributes(attributes);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting attribute:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Search API
// ============================================

// Search across all entities
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ furnishers: [], dataTypes: [], attributes: [] });
    }

    const query = q.toLowerCase();
    const furnishers = loadFurnishers();
    const dataTypes = loadDataTypes();
    const attributes = loadAttributes();

    const matchedFurnishers = furnishers.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.description?.toLowerCase().includes(query)
    );

    const matchedDataTypes = dataTypes.filter(dt =>
      dt.name.toLowerCase().includes(query) ||
      dt.description?.toLowerCase().includes(query)
    );

    const matchedAttributes = attributes.filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.displayName?.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query)
    ).map(a => {
      // Add furnisherId to attribute for navigation
      const dataType = dataTypes.find(dt => dt.id === a.dataTypeId);
      return {
        ...a,
        furnisherId: dataType?.furnisherId,
      };
    });

    res.json({
      furnishers: matchedFurnishers,
      dataTypes: matchedDataTypes,
      attributes: matchedAttributes,
    });
  } catch (error) {
    console.error('Error searching catalogue:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Data Type Configs API (Standardized Types)
// ============================================

// List all data type configs with categories
router.get('/data-type-configs', (req, res) => {
  try {
    const configs = loadDataTypeConfigs();
    const categories = loadCategories();
    res.json({ configs, categories });
  } catch (error) {
    console.error('Error loading data type configs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single data type config
router.get('/data-type-configs/:id', (req, res) => {
  try {
    const configs = loadDataTypeConfigs();
    const config = configs.find(c => c.id === req.params.id);
    if (!config) {
      return res.status(404).json({ error: 'Data type config not found' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error loading data type config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new data type config
router.post('/data-type-configs', requireAuth, (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const configs = loadDataTypeConfigs();

    // Check for duplicate name
    if (configs.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
      return res.status(400).json({ error: 'A data type config with this name already exists' });
    }

    const now = new Date().toISOString();
    const newConfig = {
      id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: name.trim(),
      description: description?.trim() || '',
      category: category || 'Other',
      createdAt: now,
      updatedAt: now,
    };

    // Ensure unique ID
    let uniqueId = newConfig.id;
    let counter = 1;
    while (configs.some(c => c.id === uniqueId)) {
      uniqueId = `${newConfig.id}-${counter}`;
      counter++;
    }
    newConfig.id = uniqueId;

    configs.push(newConfig);
    saveDataTypeConfigs(configs);

    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error creating data type config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a data type config
router.put('/data-type-configs/:id', requireAuth, (req, res) => {
  try {
    const { name, description, category } = req.body;
    const configs = loadDataTypeConfigs();
    const index = configs.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Data type config not found' });
    }

    // Check for duplicate name (excluding self)
    if (name && configs.some(c => c.id !== req.params.id && c.name.toLowerCase() === name.trim().toLowerCase())) {
      return res.status(400).json({ error: 'A data type config with this name already exists' });
    }

    configs[index] = {
      ...configs[index],
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(category && { category }),
      updatedAt: new Date().toISOString(),
    };

    saveDataTypeConfigs(configs);
    res.json(configs[index]);
  } catch (error) {
    console.error('Error updating data type config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a data type config
router.delete('/data-type-configs/:id', requireAuth, (req, res) => {
  try {
    const configs = loadDataTypeConfigs();
    const index = configs.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Data type config not found' });
    }

    // Check if any data types are using this config
    const dataTypes = loadDataTypes();
    const inUse = dataTypes.filter(dt => dt.configId === req.params.id);
    if (inUse.length > 0) {
      return res.status(400).json({
        error: `This data type config is in use by ${inUse.length} data type(s). Remove references first.`,
      });
    }

    configs.splice(index, 1);
    saveDataTypeConfigs(configs);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting data type config:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Categories API
// ============================================

// List all categories
router.get('/categories', (req, res) => {
  try {
    const categories = loadCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new category
router.post('/categories', requireAuth, (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const categories = loadCategories();

    if (categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
      return res.status(400).json({ error: 'This category already exists' });
    }

    const maxOrder = Math.max(0, ...categories.map(c => c.order || 0));
    const newCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: name.trim(),
      order: maxOrder + 1,
    };

    categories.push(newCategory);
    saveCategories(categories);

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Export API
// ============================================

// Export all data
router.get('/export', (req, res) => {
  try {
    const furnishers = loadFurnishers();
    const dataTypes = loadDataTypes();
    const attributes = loadAttributes();

    // Build hierarchical export structure
    const exportData = {
      exportedAt: new Date().toISOString(),
      furnishers: furnishers.map(f => {
        const fDataTypes = dataTypes.filter(dt => dt.furnisherId === f.id);
        return {
          ...f,
          dataTypes: fDataTypes.map(dt => ({
            ...dt,
            attributes: attributes.filter(a => a.dataTypeId === dt.id),
          })),
        };
      }),
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting catalogue:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Admin API (for seeding new data)
// ============================================

// Sync seed data - adds new furnishers from seed without removing existing ones
router.post('/admin/sync-seed', (req, res) => {
  try {
    const { adminSecret } = req.body;

    // Verify admin secret
    const expectedSecret = process.env.ADMIN_SECRET || 'copa-admin-2024';
    if (adminSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Invalid admin secret' });
    }

    const seedPath = getSeedDataPath();
    if (!fs.existsSync(seedPath)) {
      return res.status(404).json({ error: 'Seed data file not found' });
    }

    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    const existingFurnishers = loadFurnishers();
    const existingDataTypes = loadDataTypes();
    const existingAttributes = loadAttributes();
    const now = new Date().toISOString();

    const addedFurnishers = [];
    const addedDataTypes = [];
    const addedAttributes = [];

    for (const f of seedData.furnishers) {
      // Skip if furnisher already exists
      if (existingFurnishers.some(ef => ef.id === f.id)) {
        console.log(`Skipping existing furnisher: ${f.id}`);
        continue;
      }

      // Add new furnisher
      const newFurnisher = {
        id: f.id,
        name: f.name,
        description: f.description || '',
        logoUri: f.logoUri || '',
        website: f.website || '',
        contactName: f.contactName || '',
        contactEmail: f.contactEmail || '',
        contactPhone: f.contactPhone || '',
        did: f.did || '',
        regionsCovered: f.regionsCovered || [],
        createdAt: now,
        updatedAt: now,
      };
      existingFurnishers.push(newFurnisher);
      addedFurnishers.push(newFurnisher);

      // Add data types and attributes
      for (const dt of f.dataTypes || []) {
        if (existingDataTypes.some(edt => edt.id === dt.id)) {
          console.log(`Skipping existing data type: ${dt.id}`);
          continue;
        }

        const newDataType = {
          id: dt.id,
          furnisherId: f.id,
          name: dt.name,
          description: dt.description || '',
          createdAt: now,
          updatedAt: now,
        };
        existingDataTypes.push(newDataType);
        addedDataTypes.push(newDataType);

        for (const attr of dt.attributes || []) {
          const attrId = `${dt.id}-${attr.name}`;
          if (existingAttributes.some(ea => ea.id === attrId)) {
            continue;
          }

          const newAttribute = {
            id: attrId,
            dataTypeId: dt.id,
            name: attr.name,
            displayName: attr.displayName || attr.name,
            description: attr.description || '',
            dataType: attr.dataType || 'string',
            sampleValue: attr.sampleValue || '',
            regionsCovered: attr.regionsCovered || null,
            path: attr.path || '',
            metadata: attr.metadata || {},
            createdAt: now,
            updatedAt: now,
          };
          existingAttributes.push(newAttribute);
          addedAttributes.push(newAttribute);
        }
      }
    }

    // Save updated data
    saveFurnishers(existingFurnishers);
    saveDataTypes(existingDataTypes);
    saveAttributes(existingAttributes);

    console.log(`Sync complete: ${addedFurnishers.length} furnishers, ${addedDataTypes.length} data types, ${addedAttributes.length} attributes added`);

    res.json({
      success: true,
      added: {
        furnishers: addedFurnishers.length,
        dataTypes: addedDataTypes.length,
        attributes: addedAttributes.length,
      },
      details: {
        furnishers: addedFurnishers.map(f => f.id),
        dataTypes: addedDataTypes.map(dt => dt.id),
      },
    });
  } catch (error) {
    console.error('Error syncing seed data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
