import { useState, useEffect } from 'react';
import { useEntityStore } from '../../../store/entityStore';
import type { Entity, EntityType, EntityStatus } from '../../../types/entity';
import { ENTITY_TYPE_CONFIG, ENTITY_STATUS_CONFIG } from '../../../types/entity';

interface EntityFormProps {
  entityId: string | null;
  onClose: () => void;
}

type FormData = Omit<Entity, 'createdAt' | 'updatedAt' | 'createdBy'>;

const defaultFormData: FormData = {
  id: '',
  name: '',
  type: 'issuer',
  description: '',
  logoUri: '',
  primaryColor: '',
  website: '',
  contactEmail: '',
  did: '',
  credentialTypes: [],
  regionsCovered: [],
  status: 'active',
};

export default function EntityForm({ entityId, onClose }: EntityFormProps) {
  const { entities, createEntity, updateEntity } = useEntityStore();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [credentialTypesInput, setCredentialTypesInput] = useState('');
  const [regionsInput, setRegionsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!entityId;

  useEffect(() => {
    if (entityId) {
      const entity = entities.find((e) => e.id === entityId);
      if (entity) {
        setFormData({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          description: entity.description || '',
          logoUri: entity.logoUri || '',
          primaryColor: entity.primaryColor || '',
          website: entity.website || '',
          contactEmail: entity.contactEmail || '',
          did: entity.did || '',
          credentialTypes: entity.credentialTypes || [],
          regionsCovered: entity.regionsCovered || [],
          status: entity.status,
        });
        setCredentialTypesInput((entity.credentialTypes || []).join(', '));
        setRegionsInput((entity.regionsCovered || []).join(', '));
      }
    }
  }, [entityId, entities]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate ID from name for new entities
    if (name === 'name' && !isEditing) {
      const id = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData((prev) => ({ ...prev, id }));
    }
  };

  const handleCredentialTypesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentialTypesInput(e.target.value);
    const types = e.target.value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);
    setFormData((prev) => ({ ...prev, credentialTypes: types }));
  };

  const handleRegionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegionsInput(e.target.value);
    const regions = e.target.value
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r);
    setFormData((prev) => ({ ...prev, regionsCovered: regions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      if (isEditing) {
        await updateEntity(entityId, formData);
      } else {
        await createEntity(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Entity' : 'Add New Entity'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Basic Info Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Organization name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="entity-id"
                  disabled={isEditing}
                />
              </div>
            </div>

            {/* Type and Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Object.keys(ENTITY_TYPE_CONFIG) as EntityType[]).map((type) => (
                    <option key={type} value={type}>
                      {ENTITY_TYPE_CONFIG[type].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Object.keys(ENTITY_STATUS_CONFIG) as EntityStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {ENTITY_STATUS_CONFIG[status].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the entity"
              />
            </div>

            {/* Visual Identity Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URI
                </label>
                <input
                  type="text"
                  name="logoUri"
                  value={formData.logoUri}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="entities/logos/entity-name.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor || '#1a365d'}
                    onChange={handleChange}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="#1a365d"
                  />
                </div>
              </div>
            </div>

            {/* Contact Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            {/* Technical Identity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DID (Decentralized Identifier)
              </label>
              <input
                type="text"
                name="did"
                value={formData.did}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="did:web:example.com"
              />
            </div>

            {/* Credential Types (for issuers) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential Types
              </label>
              <input
                type="text"
                value={credentialTypesInput}
                onChange={handleCredentialTypesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="cornerstone-id, home-credential, paac (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list of credential types this entity can issue
              </p>
            </div>

            {/* Regions Covered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regions Covered
              </label>
              <input
                type="text"
                value={regionsInput}
                onChange={handleRegionsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="CA, CA-BC, CA-ON (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list of region codes
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Entity' : 'Create Entity'}
          </button>
        </div>
      </div>
    </div>
  );
}
