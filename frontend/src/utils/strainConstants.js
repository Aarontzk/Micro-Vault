// Shared strain metadata used across list, filters, modals, and export.

// [dbField, filterParam, i18nKey]
export const POTENTIALS = [
  ['potential_nitrogen_fixer', 'nitrogen_fixer', 'nitrogen_fixer'],
  ['potential_phosphate_solubilizer', 'phosphate_solubilizer', 'phosphate_solubilizer'],
  ['potential_proteolytic', 'proteolytic', 'proteolytic'],
  ['potential_lipolytic', 'lipolytic', 'lipolytic'],
  ['potential_amylolytic', 'amylolytic', 'amylolytic'],
  ['potential_cellulolytic', 'cellulolytic', 'cellulolytic'],
  ['potential_antimicrobial', 'antimicrobial', 'antimicrobial'],
  ['potential_iaa_hormone', 'iaa_hormone', 'iaa_hormone'],
];

export const MICROORGANISM_TYPES = ['BAKTERI', 'YEAST', 'KAPANG', 'ACTINOMYCETES'];

export const BSL_LEVELS = [1, 2, 3, 4];

export const SORT_OPTIONS = [
  ['created_at', 'DESC', 'newest'],
  ['created_at', 'ASC', 'oldest'],
  ['strain_code', 'ASC', 'code'],
  ['genus_species', 'ASC', 'name'],
  ['microorganism_type', 'ASC', 'type'],
  ['biosafety_level', 'DESC', 'bsl'],
];

// BSL -> semantic chip class
export const bslChipClass = (level) =>
  level === 1 ? 'mv-chip mv-chip-success' :
  level === 2 ? 'mv-chip mv-chip-warning' :
  level === 3 ? 'mv-chip mv-chip-error' :
  'mv-chip bg-[#C0392B]/10 text-[#C0392B]';
