import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import type { Entity, DataProviderType } from '../../../types/entity';
import { DATA_PROVIDER_TYPE_CONFIG, ALL_DATA_PROVIDER_TYPES } from '../../../types/entity';
import { CANADIAN_REGIONS, getRegionName, normalizeRegions } from '../../../constants/regions';

// Canada TopoJSON URL (Natural Earth via unpkg)
const CANADA_TOPO_URL = 'https://cdn.jsdelivr.net/npm/canada-atlas@0.0.2/provinces-and-territories-10m.json';

// Province/territory center coordinates for markers
const PROVINCE_CENTERS: Record<string, [number, number]> = {
  'AB': [-114.5, 53.5],
  'BC': [-125.0, 54.0],
  'MB': [-98.0, 54.5],
  'NB': [-66.0, 46.5],
  'NL': [-57.0, 53.0],
  'NS': [-63.0, 45.0],
  'NT': [-120.0, 64.0],
  'NU': [-95.0, 70.0],
  'ON': [-85.0, 50.0],
  'PE': [-63.0, 46.3],
  'QC': [-72.0, 52.0],
  'SK': [-106.0, 54.0],
  'YT': [-135.0, 64.0],
};

// Map province names to codes (TopoJSON uses full names)
const PROVINCE_NAME_TO_CODE: Record<string, string> = {
  'Alberta': 'AB',
  'British Columbia': 'BC',
  'Manitoba': 'MB',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Nova Scotia': 'NS',
  'Northwest Territories': 'NT',
  'Nunavut': 'NU',
  'Ontario': 'ON',
  'Prince Edward Island': 'PE',
  'Quebec': 'QC',
  'Saskatchewan': 'SK',
  'Yukon': 'YT',
};

interface MapViewProps {
  entities: Entity[];
  onSelectEntity: (entityId: string) => void;
}

export default function MapView({ entities, onSelectEntity }: MapViewProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDataTypes, setSelectedDataTypes] = useState<DataProviderType[]>([]);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  // Filter entities by selected data provider types
  const filteredEntities = useMemo(() => {
    if (selectedDataTypes.length === 0) return entities;
    return entities.filter(e =>
      e.dataProviderTypes?.some(t => selectedDataTypes.includes(t))
    );
  }, [entities, selectedDataTypes]);

  // Count furnishers per province
  const provinceCount = useMemo(() => {
    const counts: Record<string, number> = {};
    CANADIAN_REGIONS.forEach(r => counts[r.code] = 0);

    filteredEntities.forEach(entity => {
      const regions = normalizeRegions(entity.regionsCovered);
      regions.forEach(region => {
        counts[region] = (counts[region] || 0) + 1;
      });
    });

    return counts;
  }, [filteredEntities]);

  // Get furnishers for selected province
  const provinceFurnishers = useMemo(() => {
    if (!selectedProvince) return filteredEntities;
    return filteredEntities.filter(e =>
      normalizeRegions(e.regionsCovered).includes(selectedProvince)
    );
  }, [filteredEntities, selectedProvince]);

  // Get max count for color scaling
  const maxCount = useMemo(() => {
    return Math.max(1, ...Object.values(provinceCount));
  }, [provinceCount]);

  // Get color based on count
  const getProvinceColor = (code: string) => {
    const count = provinceCount[code] || 0;
    if (count === 0) return '#f3f4f6'; // gray-100
    const intensity = Math.min(count / maxCount, 1);
    // Gradient from light green to dark green
    const lightness = 90 - (intensity * 50);
    return `hsl(142, 70%, ${lightness}%)`;
  };

  // Toggle data type filter
  const toggleDataType = (type: DataProviderType) => {
    setSelectedDataTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="h-full flex">
      {/* Map Panel */}
      <div className="flex-1 flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by data type:</span>
            {ALL_DATA_PROVIDER_TYPES.map(type => (
              <button
                key={type}
                onClick={() => toggleDataType(type)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedDataTypes.includes(type)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {DATA_PROVIDER_TYPE_CONFIG[type].label}
              </button>
            ))}
            {selectedDataTypes.length > 0 && (
              <button
                onClick={() => setSelectedDataTypes([])}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [-96, 60],
              scale: 500,
            }}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup center={[-96, 60]} zoom={1}>
              <Geographies geography={CANADA_TOPO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const provinceName = (geo.properties.name || geo.properties.NAME) as string;
                    const code = PROVINCE_NAME_TO_CODE[provinceName];
                    const isSelected = selectedProvince === code;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => setSelectedProvince(isSelected ? null : code)}
                        style={{
                          default: {
                            fill: isSelected ? '#3b82f6' : getProvinceColor(code),
                            stroke: '#ffffff',
                            strokeWidth: 0.5,
                            outline: 'none',
                            cursor: 'pointer',
                          },
                          hover: {
                            fill: isSelected ? '#2563eb' : '#93c5fd',
                            stroke: '#ffffff',
                            strokeWidth: 0.5,
                            outline: 'none',
                            cursor: 'pointer',
                          },
                          pressed: {
                            fill: '#3b82f6',
                            stroke: '#ffffff',
                            strokeWidth: 0.5,
                            outline: 'none',
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Furnisher Markers */}
              {filteredEntities.map(entity => {
                const regions = normalizeRegions(entity.regionsCovered);
                if (regions.length === 0) return null;

                // Place marker in first covered region
                const primaryRegion = regions[0];
                const coords = PROVINCE_CENTERS[primaryRegion];
                if (!coords) return null;

                const isExpanded = expandedEntity === entity.id;
                const isHovered = hoveredEntity === entity.id;

                return (
                  <Marker
                    key={entity.id}
                    coordinates={coords}
                    onClick={(e) => {
                      e.stopPropagation?.();
                      setExpandedEntity(isExpanded ? null : entity.id);
                    }}
                  >
                    {/* Dot */}
                    <circle
                      r={isExpanded ? 6 : 4}
                      fill={isExpanded ? '#3b82f6' : '#059669'}
                      stroke="#ffffff"
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredEntity(entity.id)}
                      onMouseLeave={() => setHoveredEntity(null)}
                    />

                    {/* Hover tooltip */}
                    {isHovered && !isExpanded && (
                      <g transform="translate(10, -10)">
                        <rect
                          x={0}
                          y={-12}
                          width={entity.name.length * 6 + 16}
                          height={24}
                          rx={4}
                          fill="white"
                          stroke="#e5e7eb"
                        />
                        <text
                          x={8}
                          y={4}
                          fontSize={10}
                          fill="#374151"
                        >
                          {entity.name}
                        </text>
                      </g>
                    )}
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Expanded Entity Bubble */}
          {expandedEntity && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs z-10">
              {(() => {
                const entity = entities.find(e => e.id === expandedEntity);
                if (!entity) return null;
                return (
                  <>
                    <div className="flex items-start gap-3 mb-3">
                      {entity.logoUri && (
                        <img
                          src={entity.logoUri.startsWith('/') ? entity.logoUri : `/assets/${entity.logoUri}`}
                          alt=""
                          className="w-10 h-10 object-contain rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{entity.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entity.dataProviderTypes?.map(type => (
                            <span
                              key={type}
                              className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded"
                            >
                              {DATA_PROVIDER_TYPE_CONFIG[type]?.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedEntity(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      Covers: {normalizeRegions(entity.regionsCovered).join(', ') || 'No regions'}
                    </div>
                    <button
                      onClick={() => onSelectEntity(entity.id)}
                      className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      View Profile
                    </button>
                  </>
                );
              })()}
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
            <div className="text-xs font-medium text-gray-700 mb-2">Coverage Intensity</div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ background: 'hsl(142, 70%, 90%)' }} />
              <div className="w-4 h-4 rounded" style={{ background: 'hsl(142, 70%, 70%)' }} />
              <div className="w-4 h-4 rounded" style={{ background: 'hsl(142, 70%, 50%)' }} />
              <div className="w-4 h-4 rounded" style={{ background: 'hsl(142, 70%, 40%)' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Furnisher List */}
      <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">
            {selectedProvince
              ? `Furnishers in ${getRegionName(selectedProvince)}`
              : 'All Furnishers'
            }
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {provinceFurnishers.length} furnisher{provinceFurnishers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {provinceFurnishers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No furnishers found
              {selectedProvince && (
                <button
                  onClick={() => setSelectedProvince(null)}
                  className="block mx-auto mt-2 text-blue-600 hover:text-blue-700"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {provinceFurnishers.map(entity => (
                <button
                  key={entity.id}
                  onClick={() => onSelectEntity(entity.id)}
                  className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {entity.logoUri ? (
                      <img
                        src={entity.logoUri.startsWith('/') ? entity.logoUri : `/assets/${entity.logoUri}`}
                        alt=""
                        className="w-8 h-8 object-contain rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                        {entity.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{entity.name}</div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {entity.dataProviderTypes?.slice(0, 2).map(type => (
                          <span
                            key={type}
                            className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded"
                          >
                            {DATA_PROVIDER_TYPE_CONFIG[type]?.label}
                          </span>
                        ))}
                        {(entity.dataProviderTypes?.length || 0) > 2 && (
                          <span className="text-xs text-gray-400">
                            +{(entity.dataProviderTypes?.length || 0) - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
