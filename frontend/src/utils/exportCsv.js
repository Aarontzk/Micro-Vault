import { POTENTIALS } from './strainConstants';

const COLUMNS = [
  ['strain_code', 'Isolate Code'],
  ['microorganism_type', 'Type'],
  ['genus_species', 'Genus/Species'],
  ['sample_type', 'Sample Type'],
  ['origin_location', 'Origin'],
  ['biosafety_level', 'BSL'],
  ['characteristics_macroscopic', 'Macroscopic'],
  ['characteristics_microscopic', 'Microscopic'],
  ['characteristics_biochemical', 'Biochemical'],
  ['storage_technique', 'Storage Technique'],
  ['storage_location', 'Storage Location'],
  ['culture_stock', 'Culture Stock'],
];

const escape = (val) => {
  const s = val == null ? '' : String(val);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Build a CSV string from an array of strain rows.
export function strainsToCsv(strains) {
  const header = [
    ...COLUMNS.map(([, label]) => label),
    ...POTENTIALS.map(([, , key]) => key),
  ];
  const rows = strains.map((s) => [
    ...COLUMNS.map(([field]) => escape(s[field])),
    ...POTENTIALS.map(([field]) => (s[field] ? 'yes' : '')),
  ]);
  return [header.map(escape).join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Trigger a browser download of the CSV.
export function downloadCsv(strains, filename = 'culture-collection.csv') {
  const csv = '﻿' + strainsToCsv(strains); // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
