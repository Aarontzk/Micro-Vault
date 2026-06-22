import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { POTENTIALS, bslChipClass } from '../utils/strainConstants';

function StrainDetailModal({ strain, onClose }) {
  const { t } = useLanguage();
  if (!strain) return null;

  const active = POTENTIALS.filter(([key]) => strain[key]);

  const Field = ({ label, children }) => (
    <div>
      <p className="text-[11px] font-medium text-neutral uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{children}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4" onClick={onClose}>
      <div className="relative top-10 mx-auto w-11/12 max-w-4xl bg-surface border border-edge rounded-xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-edge">
          <h3 className="text-2xl font-bold text-ink tracking-tighter">{strain.strain_code}</h3>
          <button onClick={onClose} className="text-neutral hover:text-ink text-2xl leading-none" aria-label={t('common.close')}>×</button>
        </div>

        {/* Content */}
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('fields.type')}>{t(`types.${strain.microorganism_type}`)}</Field>
            <div>
              <p className="text-[11px] font-medium text-neutral uppercase tracking-wide">{t('fields.biosafety')}</p>
              <p className="mt-1"><span className={bslChipClass(strain.biosafety_level)}>BSL-{strain.biosafety_level}</span></p>
            </div>
            <Field label={t('fields.genusSpecies')}>{strain.genus_species || t('common.none')}</Field>
            <Field label={t('fields.sampleType')}>{strain.sample_type || t('common.none')}</Field>
          </div>

          {strain.origin_location && <Field label={t('fields.origin')}>{strain.origin_location}</Field>}

          {(strain.characteristics_macroscopic || strain.characteristics_microscopic || strain.characteristics_biochemical) && (
            <div>
              <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-2">{t('fields.characteristics')}</p>
              {[['characteristics_macroscopic', 'macroscopic'], ['characteristics_microscopic', 'microscopic'], ['characteristics_biochemical', 'biochemical']]
                .filter(([f]) => strain[f]).map(([f, key]) => (
                  <div key={f} className="mb-2 p-3 bg-background border border-edge rounded-lg">
                    <p className="text-[11px] font-semibold text-ink-secondary uppercase mb-1">{t(`fields.${key}`)}</p>
                    <p className="text-sm text-ink">{strain[f]}</p>
                  </div>
                ))}
            </div>
          )}

          <div>
            <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-2">{t('fields.potentials')}</p>
            <div className="flex flex-wrap gap-2">
              {active.length > 0
                ? active.map(([key, , tkey]) => <span key={key} className="mv-chip">{t(`potentials.${tkey}`)}</span>)
                : <span className="text-sm text-neutral">{t('fields.noPotentials')}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {strain.storage_technique && <Field label={`${t('fields.storage')} — ${t('fields.technique')}`}>{strain.storage_technique}</Field>}
            {strain.storage_location && <Field label={`${t('fields.storage')} — ${t('fields.location')}`}>{strain.storage_location}</Field>}
            {strain.culture_stock && <Field label={t('fields.stock')}>{strain.culture_stock}</Field>}
            {strain.genbank_accession && <Field label={t('detail.genbank')}>{strain.genbank_accession}</Field>}
            <Field label={t('detail.sequenced')}>{strain.genome_sequenced ? t('detail.yes') : t('detail.no')}</Field>
          </div>

          <div className="pt-4 border-t border-edge grid grid-cols-2 gap-4 text-xs text-neutral">
            <div>
              <p>{t('detail.createdBy')}: {strain.created_by_name || t('detail.unknown')}</p>
              <p>{t('detail.createdAt')}: {new Date(strain.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p>{t('detail.updatedAt')}: {new Date(strain.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="mv-btn-secondary mv-btn-md">{t('common.close')}</button>
        </div>
      </div>
    </div>
  );
}

export default StrainDetailModal;
