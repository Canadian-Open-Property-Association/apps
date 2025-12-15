// Canadian provinces and territories
export const CANADIAN_REGIONS = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
] as const;

export type RegionCode = typeof CANADIAN_REGIONS[number]['code'];

export const REGION_CODES = CANADIAN_REGIONS.map(r => r.code);

// Get region name by code
export function getRegionName(code: string): string {
  const region = CANADIAN_REGIONS.find(r => r.code === code.toUpperCase());
  return region?.name || code;
}

// Normalize region code to standard 2-letter format (e.g., "CA-BC" -> "BC", "ca-bc" -> "BC")
export function normalizeRegion(region: string): string {
  const upper = region.toUpperCase();
  if (upper.startsWith('CA-')) {
    return upper.slice(3);
  }
  return upper;
}

// Normalize all regions in an array to standard format
export function normalizeRegions(regions: string[] | undefined): string[] {
  if (!regions) return [];
  const normalized = new Set(regions.map(normalizeRegion));
  return Array.from(normalized).filter(r => REGION_CODES.includes(r as RegionCode));
}
