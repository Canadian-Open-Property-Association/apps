import { useState } from 'react';
import { useBadgeStore } from '../../../store/badgeStore';
import BadgeSettings from './BadgeSettings';
import PublishBadgeModal from './PublishBadgeModal';
import {
  AppNavBar,
  SaveButton,
  UnsavedIndicator,
  PanelToggles,
  PanelToggle,
  CreatePrButton,
  SettingsButton
} from '../../../components/AppNavBar';

interface BadgesToolbarProps {
  showFormPanel: boolean;
  setShowFormPanel: (show: boolean) => void;
  showJsonPanel: boolean;
  setShowJsonPanel: (show: boolean) => void;
  showPreviewPanel: boolean;
  setShowPreviewPanel: (show: boolean) => void;
}

export default function BadgesToolbar({
  showFormPanel,
  setShowFormPanel,
  showJsonPanel,
  setShowJsonPanel,
  showPreviewPanel,
  setShowPreviewPanel,
}: BadgesToolbarProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLocalLibrary, setShowLocalLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [badgeName, setBadgeName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const {
    currentBadge,
    badges,
    isDirty,
    newBadge,
    saveBadge,
    selectBadge,
    deleteBadge,
  } = useBadgeStore();

  const handleSave = async () => {
    if (!currentBadge) return;

    if (currentBadge.id && badges.some((b) => b.id === currentBadge.id)) {
      // Already saved, update
      await saveBadge();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } else {
      // First save, show dialog
      setBadgeName(currentBadge.name);
      setShowSaveDialog(true);
    }
  };

  const handleSaveConfirm = async () => {
    if (badgeName.trim()) {
      await saveBadge();
      setShowSaveDialog(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };

  const handleNew = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to create a new badge?')) {
        newBadge();
      }
    } else {
      newBadge();
    }
  };

  const handleLoadBadge = (id: string) => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Load this badge anyway?')) {
        selectBadge(id);
        setShowLocalLibrary(false);
      }
    } else {
      selectBadge(id);
      setShowLocalLibrary(false);
    }
  };

  return (
    <>
      <AppNavBar
        left={
          <>
            <button
              onClick={handleNew}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            <SaveButton onClick={handleSave} disabled={!currentBadge} showSuccess={showSaveSuccess} />
            <button
              onClick={() => setShowLocalLibrary(true)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Open
            </button>
            <UnsavedIndicator show={isDirty} />
          </>
        }
        panels={
          <PanelToggles>
            <PanelToggle
              label="Form"
              isVisible={showFormPanel}
              onClick={() => setShowFormPanel(!showFormPanel)}
            />
            <PanelToggle
              label="JSON"
              isVisible={showJsonPanel}
              onClick={() => setShowJsonPanel(!showJsonPanel)}
            />
            <PanelToggle
              label="Preview"
              isVisible={showPreviewPanel}
              onClick={() => setShowPreviewPanel(!showPreviewPanel)}
            />
          </PanelToggles>
        }
        prButton={<CreatePrButton onClick={() => setShowPublishModal(true)} disabled={!currentBadge} />}
        settings={<SettingsButton onClick={() => setShowSettings(true)} />}
      />

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Badge</h3>
            <input
              type="text"
              value={badgeName}
              onChange={(e) => setBadgeName(e.target.value)}
              placeholder="Badge name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge Library Dialog */}
      {showLocalLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Badge Library</h3>
                <button
                  onClick={() => setShowLocalLibrary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Your saved badge definitions</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {badges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <p className="mb-2">No saved badges yet</p>
                  <p className="text-sm">Create a badge and click Save to add it to your library.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleLoadBadge(badge.id)}
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{badge.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            badge.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {badge.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {badge.eligibilityRules.length} rule{badge.eligibilityRules.length !== 1 ? 's' : ''} • Updated: {new Date(badge.updatedAt || badge.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {deleteConfirm === badge.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              deleteBadge(badge.id);
                              setDeleteConfirm(null);
                            }}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(badge.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete badge"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowLocalLibrary(false)}
                className="w-full px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && <BadgeSettings onClose={() => setShowSettings(false)} />}

      {/* Publish Modal */}
      {showPublishModal && currentBadge && (
        <PublishBadgeModal
          badgeId={currentBadge.id}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </>
  );
}
