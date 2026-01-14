import { useHarmonizationStore } from '../../../store/harmonizationStore';
import { AppNavBar, SettingsButton, NavDivider } from '../../../components/AppNavBar';

export default function HarmonizationToolbar() {
  const { mappings, setViewMode } = useHarmonizationStore();

  return (
    <AppNavBar
      left={
        <div className="flex items-center gap-3">
          {/* Stats badge */}
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {mappings.length} mapping{mappings.length !== 1 ? 's' : ''}
          </span>

          <NavDivider />

          {/* View All Mappings button */}
          <button
            onClick={() => setViewMode('all-mappings')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View All Mappings
          </button>
        </div>
      }
      settings={<SettingsButton disabled />}
    />
  );
}
