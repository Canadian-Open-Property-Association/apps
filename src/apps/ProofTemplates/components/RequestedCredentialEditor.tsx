/**
 * RequestedCredentialEditor Component
 *
 * Editor for configuring a requested credential within a proof template.
 * Allows selecting attributes to request and adding predicates.
 */

import { useState } from 'react';
import { useProofTemplateStore } from '../../../store/proofTemplateStore';
import {
  RequestedCredential,
  RequestedAttribute,
  Predicate,
  PredicateOperator,
  PredicateDataType,
  PREDICATE_OPERATOR_LABELS,
} from '../../../types/proofTemplate';

interface RequestedCredentialEditorProps {
  credential: RequestedCredential;
}

export default function RequestedCredentialEditor({ credential }: RequestedCredentialEditorProps) {
  const {
    addRequestedAttribute,
    updateRequestedAttribute,
    removeRequestedAttribute,
    toggleAllAttributes,
    addPredicate,
    updatePredicate,
    removePredicate,
  } = useProofTemplateStore();

  const [activeTab, setActiveTab] = useState<'attributes' | 'predicates'>('attributes');

  // Check which attributes are already selected
  const selectedAttributeNames = new Set(credential.requestedAttributes.map((a) => a.attributeName));
  const allAttributesSelected = credential.availableAttributes.every((name) =>
    selectedAttributeNames.has(name)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Credential Info Header */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-medium text-gray-900 mb-3">{credential.credentialName}</h3>

        {/* Restrictions (read-only) */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Schema ID:</span>
            <span className="ml-2 font-mono text-xs text-gray-700 break-all">
              {credential.restrictions.schemaId}
            </span>
          </div>
          {credential.restrictions.credentialDefinitionId && (
            <div>
              <span className="text-gray-500">Cred Def ID:</span>
              <span className="ml-2 font-mono text-xs text-gray-700 break-all">
                {credential.restrictions.credentialDefinitionId}
              </span>
            </div>
          )}
          {credential.restrictions.issuerDid && (
            <div>
              <span className="text-gray-500">Issuer DID:</span>
              <span className="ml-2 font-mono text-xs text-gray-700 break-all">
                {credential.restrictions.issuerDid}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('attributes')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'attributes'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Attributes ({credential.requestedAttributes.length})
        </button>
        <button
          onClick={() => setActiveTab('predicates')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'predicates'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Predicates ({credential.predicates.length})
        </button>
      </div>

      {/* Attributes Tab */}
      {activeTab === 'attributes' && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Requested Attributes</h4>
            <button
              onClick={() => toggleAllAttributes(credential.id, !allAttributesSelected)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {allAttributesSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Select which attributes to request from this credential. Selected attributes will be
            revealed to the verifier.
          </p>

          {/* Available Attributes */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {credential.availableAttributes.map((attrName) => {
              const isSelected = selectedAttributeNames.has(attrName);
              return (
                <label
                  key={attrName}
                  className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addRequestedAttribute(credential.id, attrName);
                      } else {
                        const attr = credential.requestedAttributes.find(
                          (a) => a.attributeName === attrName
                        );
                        if (attr) {
                          removeRequestedAttribute(credential.id, attr.id);
                        }
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">{attrName}</span>
                </label>
              );
            })}
          </div>

          {/* Selected Attributes Configuration */}
          {credential.requestedAttributes.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                Configure Selected Attributes
              </h5>
              <div className="space-y-3">
                {credential.requestedAttributes.map((attr) => (
                  <AttributeConfigRow
                    key={attr.id}
                    attribute={attr}
                    onUpdate={(updates) =>
                      updateRequestedAttribute(credential.id, attr.id, updates)
                    }
                    onRemove={() => removeRequestedAttribute(credential.id, attr.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Predicates Tab */}
      {activeTab === 'predicates' && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Predicates</h4>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Predicates allow proving conditions about attributes without revealing the actual value
            (e.g., "age &gt;= 18" proves someone is an adult without revealing their birth date).
          </p>

          {/* Add Predicate */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add predicate for attribute:
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addPredicate(credential.id, e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue=""
            >
              <option value="">Select attribute...</option>
              {credential.availableAttributes.map((attr) => (
                <option key={attr} value={attr}>
                  {attr}
                </option>
              ))}
            </select>
          </div>

          {/* Predicates List */}
          {credential.predicates.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <svg
                className="w-10 h-10 mx-auto text-gray-300 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">No predicates configured</p>
              <p className="text-xs mt-1">Select an attribute above to add a predicate</p>
            </div>
          ) : (
            <div className="space-y-3">
              {credential.predicates.map((pred) => (
                <PredicateConfigRow
                  key={pred.id}
                  predicate={pred}
                  onUpdate={(updates) => updatePredicate(credential.id, pred.id, updates)}
                  onRemove={() => removePredicate(credential.id, pred.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Attribute configuration row
interface AttributeConfigRowProps {
  attribute: RequestedAttribute;
  onUpdate: (updates: Partial<RequestedAttribute>) => void;
  onRemove: () => void;
}

function AttributeConfigRow({ attribute, onUpdate, onRemove }: AttributeConfigRowProps) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900">{attribute.attributeName}</span>
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Remove attribute"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Display Label</label>
          <input
            type="text"
            value={attribute.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder={attribute.attributeName}
            className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={attribute.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={attribute.selectiveDisclosure.revealValue}
              onChange={(e) =>
                onUpdate({
                  selectiveDisclosure: {
                    ...attribute.selectiveDisclosure,
                    revealValue: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Reveal value</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Predicate configuration row
interface PredicateConfigRowProps {
  predicate: Predicate;
  onUpdate: (updates: Partial<Predicate>) => void;
  onRemove: () => void;
}

function PredicateConfigRow({ predicate, onUpdate, onRemove }: PredicateConfigRowProps) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-gray-900">{predicate.attributeName}</span>
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Remove predicate"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Label</label>
          <input
            type="text"
            value={predicate.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="e.g., Age check"
            className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select
            value={predicate.predicateType}
            onChange={(e) => onUpdate({ predicateType: e.target.value as PredicateDataType })}
            className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            <option value="integer">Integer</option>
            <option value="date">Date</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Operator</label>
          <select
            value={predicate.operator}
            onChange={(e) => onUpdate({ operator: e.target.value as PredicateOperator })}
            className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            {(Object.keys(PREDICATE_OPERATOR_LABELS) as PredicateOperator[]).map((op) => (
              <option key={op} value={op}>
                {op} ({PREDICATE_OPERATOR_LABELS[op]})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Value</label>
          <input
            type={predicate.predicateType === 'date' ? 'date' : 'number'}
            value={predicate.value}
            onChange={(e) =>
              onUpdate({
                value: predicate.predicateType === 'integer' ? parseInt(e.target.value, 10) || 0 : e.target.value,
              })
            }
            placeholder={predicate.predicateType === 'integer' ? 'e.g., 18' : ''}
            className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={predicate.revealResult}
            onChange={(e) => onUpdate({ revealResult: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Reveal comparison result</span>
        </label>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Only the result (true/false) will be revealed, not the actual attribute value.
      </p>
    </div>
  );
}
