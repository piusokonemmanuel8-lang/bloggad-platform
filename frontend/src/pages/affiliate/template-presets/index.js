import createNeutralReviewTemplatePreset from './NeutralReviewTemplatePreset';
import createDxtTemplatePreset from './DxtTemplatePreset';
import SimplePostsTemplatePreset from './SimplePostsTemplatePreset';

const BLOG_TEMPLATE_PRESET_BUILDERS = [
  createNeutralReviewTemplatePreset,
  createDxtTemplatePreset,
];

const EXTRA_BLOG_TEMPLATE_PRESETS = [
  SimplePostsTemplatePreset,
];

export const BLOG_TEMPLATE_PRESETS = [
  ...BLOG_TEMPLATE_PRESET_BUILDERS.map((buildPreset) => buildPreset()),
  ...EXTRA_BLOG_TEMPLATE_PRESETS,
];

function normalizeTemplateValue(value = '') {
  return String(value || '').trim().toLowerCase();
}

export function resolveBlogTemplatePreset(template) {
  if (!template) return null;

  const codeKey = normalizeTemplateValue(template.template_code_key);
  const slug = normalizeTemplateValue(template.slug);
  const name = normalizeTemplateValue(template.name);

  return (
    BLOG_TEMPLATE_PRESETS.find((preset) => {
      const codeKeys = Array.isArray(preset.codeKeys) ? preset.codeKeys : [];
      const slugAliases = Array.isArray(preset.slugAliases) ? preset.slugAliases : [];
      const nameAliases = Array.isArray(preset.nameAliases) ? preset.nameAliases : [];

      const presetCode = normalizeTemplateValue(preset.code);
      const presetSlug = normalizeTemplateValue(preset.slug);
      const presetName = normalizeTemplateValue(preset.name);

      return (
        codeKeys.includes(codeKey) ||
        slugAliases.includes(slug) ||
        nameAliases.includes(name) ||
        presetCode === codeKey ||
        presetSlug === slug ||
        presetName === name
      );
    }) || null
  );
}