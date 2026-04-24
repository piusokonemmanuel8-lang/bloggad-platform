import GenericPostTemplate from './GenericPostTemplate';
import NeutralReviewTemplate from './NeutralReviewTemplate';
import DxtTemplate from './DxtTemplate';
import SimplePostsTemplate from './SimplePostsTemplate';

function normalizeTemplateKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

export const POST_TEMPLATE_REGISTRY = {
  neutral_review_template_v1: NeutralReviewTemplate,
  dxt_template_v1: DxtTemplate,
  simple_posts_template_v1: SimplePostsTemplate,
  'simple-posts': SimplePostsTemplate,
};

export function resolvePostTemplateComponent(template) {
  const templateCodeKey = normalizeTemplateKey(template?.template_code_key);
  const templateSlug = normalizeTemplateKey(template?.slug);
  const templateName = normalizeTemplateKey(template?.name);

  if (POST_TEMPLATE_REGISTRY[templateCodeKey]) {
    return POST_TEMPLATE_REGISTRY[templateCodeKey];
  }

  if (
    ['neutral-review-template-v1', 'dummy-review-template-v1'].includes(templateSlug) ||
    ['neutral review template', 'dummy review template', 'blog review template'].includes(templateName)
  ) {
    return NeutralReviewTemplate;
  }

  if (templateSlug === 'dxt' || templateName === 'dxt') {
    return DxtTemplate;
  }

  if (
    templateSlug === 'simple-posts' ||
    templateName === 'simple posts' ||
    templateCodeKey === 'simple_posts_template_v1'
  ) {
    return SimplePostsTemplate;
  }

  return GenericPostTemplate;
}

export function getPostTemplateMeta(template) {
  const templateCodeKey = normalizeTemplateKey(template?.template_code_key);

  return {
    template_code_key: templateCodeKey,
    is_registered: !!POST_TEMPLATE_REGISTRY[templateCodeKey],
  };
}