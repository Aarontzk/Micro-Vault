import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { POTENTIALS, MICROORGANISM_TYPES, BSL_LEVELS } from '../utils/strainConstants';

// Module-level so it isn't recreated each render (keeps input focus stable).
function TextInput({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mv-label">{label}</label>
      <input type="text" className="mv-input" name={name} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

const EMPTY = {
  strain_code: '', microorganism_type: 'BAKTERI', genus_species: '', genus: '', species: '',
  sample_type: '', origin_location: '', isolation_date: '',
  characteristics_macroscopic: '', characteristics_microscopic: '', characteristics_biochemical: '',
  potential_nitrogen_fixer: false, potential_phosphate_solubilizer: false, potential_proteolytic: false,
  potential_lipolytic: false, potential_amylolytic: false, potential_cellulolytic: false,
  potential_antimicrobial: false, potential_iaa_hormone: false,
  storage_technique: '', culture_stock: '', storage_location: '', biosafety_level: 1,
};

function StrainFormModal({ strain, onClose, onSave }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (strain) {
      const merged = { ...EMPTY, ...strain };
      Object.keys(EMPTY).forEach((k) => {
        if (typeof EMPTY[k] === 'string' && merged[k] == null) merged[k] = '';
      });
      setFormData(merged);
    }
  }, [strain]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'biosafety_level') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.strain_code || !formData.microorganism_type) {
      setError(t('form.validationRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const clean = (v) => (typeof v === 'string' ? v.trim() || null : v);
      const cleanedData = {
        ...formData,
        biosafety_level: parseInt(formData.biosafety_level),
        genus_species: clean(formData.genus_species),
        genus: clean(formData.genus),
        species: clean(formData.species),
        sample_type: clean(formData.sample_type),
        origin_location: clean(formData.origin_location),
        isolation_date: formData.isolation_date || null,
        characteristics_macroscopic: clean(formData.characteristics_macroscopic),
        characteristics_microscopic: clean(formData.characteristics_microscopic),
        characteristics_biochemical: clean(formData.characteristics_biochemical),
        storage_technique: clean(formData.storage_technique),
        culture_stock: clean(formData.culture_stock),
        storage_location: clean(formData.storage_location),
      };
      await onSave(cleanedData);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e) => `${e.param}: ${e.msg}`).join(', '));
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(t('form.saveError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4" onClick={onClose}>
      <div className="relative top-6 mx-auto w-11/12 max-w-4xl bg-surface border border-edge rounded-xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-edge">
          <h3 className="text-2xl font-bold text-ink tracking-tighter">
            {strain ? t('form.editTitle') : t('form.addTitle')}
          </h3>
          <button onClick={onClose} type="button" className="text-neutral hover:text-ink text-2xl leading-none" aria-label={t('common.close')}>×</button>
        </div>

        {error && (
          <div className="mb-4 bg-error/10 border border-error/30 text-error px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
            {/* Basic */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mv-label">{t('fields.strainCode')} <span className="text-error">*</span></label>
                <input type="text" name="strain_code" value={formData.strain_code} onChange={handleChange} required
                  disabled={!!strain} placeholder={t('form.phStrain')}
                  className="mv-input disabled:bg-background disabled:text-neutral" />
              </div>
              <div>
                <label className="mv-label">{t('fields.type')} <span className="text-error">*</span></label>
                <select name="microorganism_type" value={formData.microorganism_type} onChange={handleChange} required className="mv-input">
                  {MICROORGANISM_TYPES.map((tp) => <option key={tp} value={tp}>{t(`types.${tp}`)}</option>)}
                </select>
              </div>
              <TextInput label={t('fields.genusSpecies')} name="genus_species" value={formData.genus_species} onChange={handleChange} placeholder={t('form.phGenus')} />
              <TextInput label={t('fields.sampleType')} name="sample_type" value={formData.sample_type} onChange={handleChange} placeholder={t('form.phSample')} />
              <div className="col-span-2">
                <TextInput label={t('fields.origin')} name="origin_location" value={formData.origin_location} onChange={handleChange} placeholder={t('form.phOrigin')} />
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <label className="mv-label">{t('fields.characteristics')} — {t('fields.macroscopic')}</label>
              <textarea name="characteristics_macroscopic" value={formData.characteristics_macroscopic} onChange={handleChange} rows="2" placeholder={t('form.phMacro')} className="mv-input" />
            </div>
            <div>
              <label className="mv-label">{t('fields.characteristics')} — {t('fields.microscopic')}</label>
              <textarea name="characteristics_microscopic" value={formData.characteristics_microscopic} onChange={handleChange} rows="2" placeholder={t('form.phMicro')} className="mv-input" />
            </div>
            <div>
              <label className="mv-label">{t('fields.characteristics')} — {t('fields.biochemical')}</label>
              <textarea name="characteristics_biochemical" value={formData.characteristics_biochemical} onChange={handleChange} rows="2" placeholder={t('form.phBiochem')} className="mv-input" />
            </div>

            {/* Potentials */}
            <div>
              <label className="mv-label">{t('fields.potentials')}</label>
              <div className="grid grid-cols-2 gap-3">
                {POTENTIALS.map(([field, , tkey]) => (
                  <label key={field} className="flex items-center cursor-pointer">
                    <input type="checkbox" name={field} checked={!!formData[field]} onChange={handleChange}
                      className="h-4 w-4 rounded border-edge accent-primary" />
                    <span className="ml-2 text-sm text-ink-secondary">{t(`potentials.${tkey}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div className="grid grid-cols-2 gap-4">
              <TextInput label={`${t('fields.storage')} — ${t('fields.technique')}`} name="storage_technique" value={formData.storage_technique} onChange={handleChange} placeholder={t('form.phTechnique')} />
              <TextInput label={`${t('fields.storage')} — ${t('fields.location')}`} name="storage_location" value={formData.storage_location} onChange={handleChange} placeholder={t('form.phLocation')} />
              <TextInput label={t('fields.stock')} name="culture_stock" value={formData.culture_stock} onChange={handleChange} placeholder={t('form.phStock')} />
              <div>
                <label className="mv-label">{t('fields.biosafety')}</label>
                <select name="biosafety_level" value={formData.biosafety_level} onChange={handleChange} className="mv-input">
                  {BSL_LEVELS.map((b) => <option key={b} value={b}>BSL-{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-edge">
            <button type="button" onClick={onClose} className="mv-btn-secondary mv-btn-md" disabled={loading}>{t('common.cancel')}</button>
            <button type="submit" disabled={loading} className="mv-btn-primary mv-btn-md">
              {loading ? t('common.saving') : t('form.saveStrain')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StrainFormModal;
