import WriterTopicSelector from '../../components/writer/WriterTopicSelector';
import WriterPlacementSelector from '../../components/writer/WriterPlacementSelector';
import SimpleWriterWorkroom, {
  buildInitialSimpleWriterBlocks,
  getSimpleWriterPlainText,
} from '../../components/writer/SimpleWriterWorkroom';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Save,
  AlertCircle,
  Link as LinkIcon,
  LayoutTemplate,
  Package,
  FolderKanban,
  Image as ImageIcon,
  Type,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Upload,
  Loader2,
} from 'lucide-react';
import api from '../../api/axios';
import { resolveBlogTemplatePreset } from './template-presets';

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'published' || value === 'active') return 'affiliate-create-post-status active';
  if (value === 'draft' || value === 'pending') return 'affiliate-create-post-status draft';
  if (value === 'inactive') return 'affiliate-create-post-status inactive';

  return 'affiliate-create-post-status neutral';
}

function normalizeText(value) {
  return getSimpleWriterPlainText(value)
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(value) {
  const text = normalizeText(value);
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

function getFieldWordRuleLabel(rule) {
  if (!rule) return '';
  if (rule.mode === 'exact') return `${rule.exact_words} words exact`;
  return `min ${rule.min_words} words - suggested max ${rule.max_words}`;
}

function validateWordRule(value, rule) {
  if (!rule) {
    return { ok: true, count: countWords(value), message: '' };
  }

  const count = countWords(value);

  if (rule.mode === 'exact') {
    if (count !== Number(rule.exact_words || 0)) {
      return {
        ok: false,
        count,
        message: `${rule.label} must be exactly ${rule.exact_words} words`,
      };
    }

    return { ok: true, count: count, message: '' };
  }

  const minWords = Number(rule.min_words || 0);
  const maxWords = Number(rule.max_words || 0);

  if (count < minWords) {
    return {
      ok: false,
      count,
      message: `${rule.label} must be at least ${minWords} words`,
    };
  }

  return {
    ok: true,
    count,
    message:
      maxWords > 0 && count > maxWords
        ? `${rule.label} is above suggested max ${maxWords} words`
        : '',
  };
}

const SIMPLE_WRITER_TEMPLATE_KEY = 'simple_writer_template_v1';

function isSimpleWriterTemplate(template) {
  return String(template?.template_code_key || '').toLowerCase() === SIMPLE_WRITER_TEMPLATE_KEY;
}

function buildGenericDefaultFields() {
  return [
    {
      field_key: 'headline',
      field_type: 'text',
      field_value: '',
      sort_order: 1,
      meta: {
        label: 'Headline',
        section: 'Generic fields',
        helper_text: 'Generic text field.',
        required: true,
        word_rule: null,
        placeholder: 'Enter headline',
        locked: false,
      },
    },
    {
      field_key: 'subheadline',
      field_type: 'text',
      field_value: '',
      sort_order: 2,
      meta: {
        label: 'Subheadline',
        section: 'Generic fields',
        helper_text: 'Generic text field.',
        required: true,
        word_rule: null,
        placeholder: 'Enter subheadline',
        locked: false,
      },
    },
    {
      field_key: 'content_block_1',
      field_type: 'textarea',
      field_value: '',
      sort_order: 3,
      meta: {
        label: 'Content block 1',
        section: 'Generic fields',
        helper_text: 'Generic textarea field.',
        required: true,
        word_rule: null,
        placeholder: 'Enter content',
        locked: false,
      },
    },
    {
      field_key: 'content_block_2',
      field_type: 'textarea',
      field_value: '',
      sort_order: 4,
      meta: {
        label: 'Content block 2',
        section: 'Generic fields',
        helper_text: 'Generic textarea field.',
        required: true,
        word_rule: null,
        placeholder: 'Enter content',
        locked: false,
      },
    },
  ];
}

function buildGenericDefaultButtons() {
  return [
    {
      button_key: 'primary_cta',
      button_label: 'Buy Now',
      button_url: '',
      button_style: 'primary',
      open_in_new_tab: true,
      sort_order: 1,
      meta: {
        label: 'Primary CTA',
        helper_text: 'Generic CTA button.',
        required: true,
        locked: false,
      },
    },
    {
      button_key: 'secondary_cta',
      button_label: 'Learn More',
      button_url: '',
      button_style: 'secondary',
      open_in_new_tab: true,
      sort_order: 2,
      meta: {
        label: 'Secondary CTA',
        helper_text: 'Generic CTA button.',
        required: true,
        locked: false,
      },
    },
  ];
}

function UploadField({
  label,
  value,
  placeholder,
  uploading,
  onChange,
  onUpload,
  inputRef,
  previewHeight = 120,
}) {
  return (
    <div className="affiliate-create-post-upload-field">
      <label className="affiliate-create-post-label">{label}</label>

      <div className="affiliate-create-post-upload-row">
        <input
          className="affiliate-create-post-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        <button
          type="button"
          className="affiliate-create-post-upload-btn"
          disabled={uploading}
          onClick={() => inputRef?.current?.click()}
        >
          {uploading ? <Loader2 size={16} className="affiliate-create-post-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onUpload}
        />
      </div>

      {value ? (
        <div className="affiliate-create-post-inline-preview">
          <img
            src={value}
            alt="Preview"
            style={{ width: '100%', height: previewHeight, objectFit: 'cover', borderRadius: 14 }}
          />
        </div>
      ) : null}
    </div>
  );
}

function isLikelyUrlValue(value) {
  const text = String(value || '').trim();
  if (!text) return false;

  try {
    const normalized = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    const parsed = new URL(normalized);
    return !!parsed.hostname;
  } catch (error) {
    return false;
  }
}

function countRepeatedWords(value) {
  const words = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 0;

  const counts = new Map();
  words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));

  let repeated = 0;
  counts.forEach((count) => {
    if (count > 2) repeated += count - 2;
  });

  return repeated;
}

function countGenericHits(value) {
  const text = normalizeText(value).toLowerCase();

  const genericPhrases = [
    "in today's world",
    'when it comes to',
    'one of the best',
    'game changer',
    'unlock the power',
    'this product is designed to',
    'take your journey to the next level',
    'whether you are',
    'it is important to note',
    'helps support your overall wellness',
  ];

  return genericPhrases.reduce((total, phrase) => {
    return total + (text.includes(phrase) ? 1 : 0);
  }, 0);
}

function getSpecificitySignals(value, productTitle = '') {
  const text = normalizeText(value);
  let score = 0;

  if (!text) return 0;

  if (/\d/.test(text)) score += 1;
  if (/%|\$|\u2026|\u00A3|\u20AC/.test(text)) score += 1;
  if (/\bfor example\b|\bfor instance\b|\bsuch as\b|\bespecially\b/i.test(text)) score += 1;
  if (text.includes(':')) score += 1;

  const productWords = normalizeText(productTitle)
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

  productWords.forEach((word) => {
    if (text.toLowerCase().includes(word)) score += 1;
  });

  return score;
}

function getFieldScoreTone(score) {
  if (score >= 75) return 'good';
  if (score >= 60) return 'warn';
  return 'bad';
}

function buildServerFieldMap(qualityReview) {
  const map = {};
  if (!qualityReview) return map;

  const scores = Array.isArray(qualityReview.field_scores) ? qualityReview.field_scores : [];
  const warnings = Array.isArray(qualityReview.warnings) ? qualityReview.warnings : [];

  scores.forEach((item) => {
    map[item.field_key] = {
      ...(map[item.field_key] || {}),
      quality_score: Number(item.quality_score || 0),
      risk_score: Number(item.risk_score || 0),
      similarity_score: Number(item.similarity_score || 0),
      passed: !!item.passed,
      warning_code: item.warning_code || null,
      warning_message: item.warning_message || '',
    };
  });

  warnings.forEach((item) => {
    map[item.field_key] = {
      ...(map[item.field_key] || {}),
      warning_type: item.warning_type || null,
      warning_message: item.message || map[item.field_key]?.warning_message || '',
      warning_suggestion: item.suggestion || '',
      similarity_score: Number(item.similarity_score || map[item.field_key]?.similarity_score || 0),
    };
  });

  return map;
}

function getLocalFieldReview({ field, totalTextWords, productTitle }) {
  const fieldMeta = field.meta || {};
  const type = String(field.field_type || '').toLowerCase();
  const value = String(field.field_value || '');
  const trimmed = normalizeText(value);
  const wordCount = type === 'text' || type === 'textarea' ? countWords(value) : 0;
  const wordRule = fieldMeta.word_rule || null;
  const minCheck = validateWordRule(value, wordRule);
  const genericHits = type === 'text' || type === 'textarea' ? countGenericHits(value) : 0;
  const repeatedHits = type === 'text' || type === 'textarea' ? countRepeatedWords(value) : 0;
  const specificitySignals =
    type === 'text' || type === 'textarea' ? getSpecificitySignals(value, productTitle) : 0;

  if (type === 'image') {
    const hasImage = !!trimmed;
    return {
      score: hasImage ? 100 : 0,
      tone: hasImage ? 'good' : 'bad',
      message: hasImage ? 'Image slot filled.' : 'This image slot is required.',
      suggestion: hasImage ? '' : 'Upload an image or paste an image URL.',
      wordCount: 0,
      started: totalTextWords >= 100,
      passed: hasImage,
    };
  }

  if (!trimmed) {
    return {
      score: 0,
      tone: 'bad',
      message: `${fieldMeta.label || field.field_key} is empty.`,
      suggestion: 'Add content to continue.',
      wordCount,
      started: totalTextWords >= 100,
      passed: false,
    };
  }

  let score = 100;
  let message = 'Strong section.';
  let suggestion = '';
  let passed = true;

  if (wordRule && !minCheck.ok) {
    score -= 45;
    message = minCheck.message;
    suggestion = 'Add more words before saving.';
    passed = false;
  }

  if (genericHits > 0) {
    score -= genericHits * 10;
    if (passed) {
      message = 'This section sounds too generic.';
      suggestion = 'Add a real example or a clearer product-specific point.';
    }
  }

  if (repeatedHits > 0) {
    score -= Math.min(18, repeatedHits * 4);
    if (passed && !genericHits) {
      message = 'This section repeats wording too much.';
      suggestion = 'Vary sentence pattern and remove repeated phrases.';
    }
  }

  if (specificitySignals < 1 && wordCount >= 20) {
    score -= 12;
    if (passed && !genericHits && !repeatedHits) {
      message = 'This section needs more original detail.';
      suggestion = 'Add a concrete detail, number, example, or product reference.';
    }
  }

  if (wordRule?.mode === 'range' && wordRule.max_words && wordCount > Number(wordRule.max_words)) {
    if (passed && !genericHits && !repeatedHits) {
      message = `${fieldMeta.label || field.field_key} is above suggested max ${wordRule.max_words} words.`;
      suggestion = 'You can keep it, but shorter text may fit the template better.';
    }
  }

  if (totalTextWords < 100 && passed) {
    message = 'Live quality preview is warming up.';
    suggestion = 'Similarity review starts properly after the post reaches 100 total words.';
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    tone: getFieldScoreTone(score),
    message,
    suggestion,
    wordCount,
    started: totalTextWords >= 100,
    passed,
  };
}

export default function AffiliateCreatePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeRoot = location.pathname.startsWith('/writer') ? '/writer' : '/affiliate';

  const presetProductId = searchParams.get('product_id') || '';
  const presetTemplateId = searchParams.get('template_id') || '';

  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    content_type: presetProductId ? 'product_post' : 'article',
    product_id: presetProductId,
    category_id: '',
    topic_ids: [],
    page_ids: [],
    show_on_storefront: false,
    template_id: presetTemplateId,
    title: '',
    slug: '',
    excerpt: '',
    seo_title: '',
    seo_description: '',
    featured_image: '',
    status: 'draft',
    scheduled_at: '',
    template_fields: buildGenericDefaultFields(),
    cta_buttons: buildGenericDefaultButtons(),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const [fieldUploadingKey, setFieldUploadingKey] = useState('');
  const [qualityReview, setQualityReview] = useState(null);
  const [linkPermission, setLinkPermission] = useState({
    loaded: false,
    allow_external_links: false,
  });

  const featuredInputRef = useRef(null);
  const fieldUploadRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsRes, templatesRes, categoriesRes] = await Promise.all([
          api.get('/api/affiliate/products'),
          api.get('/api/affiliate/templates/blog'),
          api.get('/api/public/categories'),
        ]);

        setProducts(productsRes?.data?.products || []);
        setTemplates(templatesRes?.data?.templates || []);
        setCategories(categoriesRes?.data?.categories || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load post setup data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (presetTemplateId || presetProductId || form.template_id || !templates.length) return;

    const simpleWriterTemplate = templates.find((template) => isSimpleWriterTemplate(template));
    if (!simpleWriterTemplate?.id) return;

    setForm((prev) => ({
      ...prev,
      template_id: String(simpleWriterTemplate.id),
    }));
  }, [templates, presetTemplateId, presetProductId, form.template_id]);

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === String(form.product_id)),
    [products, form.product_id]
  );

  const selectedTemplate = useMemo(
    () => templates.find((item) => String(item.id) === String(form.template_id)),
    [templates, form.template_id]
  );

  const selectedCategory = useMemo(
    () => categories.find((item) => String(item.id) === String(form.category_id)),
    [categories, form.category_id]
  );

  const activePreset = useMemo(() => resolveBlogTemplatePreset(selectedTemplate), [selectedTemplate]);

  const groupedTemplateFields = useMemo(() => {
    return form.template_fields.reduce((acc, field, index) => {
      const section = field?.meta?.section || 'Template fields';
      if (!acc[section]) acc[section] = [];
      acc[section].push({ ...field, __index: index });
      return acc;
    }, {});
  }, [form.template_fields]);

  const totalTextWords = useMemo(() => {
    return form.template_fields.reduce((total, field) => {
      const type = String(field.field_type || '').toLowerCase();
      if (type !== 'text' && type !== 'textarea') return total;
      return total + countWords(field.field_value);
    }, 0);
  }, [form.template_fields]);

  const localFieldReviews = useMemo(() => {
    const map = {};
    form.template_fields.forEach((field) => {
      map[field.field_key] = getLocalFieldReview({
        field,
        totalTextWords,
        productTitle: selectedProduct?.title || form.title,
      });
    });
    return map;
  }, [form.template_fields, totalTextWords, selectedProduct, form.title]);

  const serverFieldMap = useMemo(() => buildServerFieldMap(qualityReview), [qualityReview]);

  const overallLocalScore = useMemo(() => {
    const scoreRows = Object.values(localFieldReviews);
    if (!scoreRows.length) return 0;
    return Math.round(
      scoreRows.reduce((sum, row) => sum + Number(row.score || 0), 0) / scoreRows.length
    );
  }, [localFieldReviews]);

  const passedLocalFields = useMemo(() => {
    return Object.values(localFieldReviews).filter((row) => row.passed).length;
  }, [localFieldReviews]);

  useEffect(() => {
    if (!selectedTemplate) return;

    const preset = resolveBlogTemplatePreset(selectedTemplate);
    const simpleWriter = isSimpleWriterTemplate(selectedTemplate);

    setForm((prev) => {
      if (simpleWriter) {
        return {
          ...prev,
          template_fields: buildInitialSimpleWriterBlocks(),
          cta_buttons: [],
        };
      }
      const shouldResetToPreset =
        !prev.template_fields.length ||
        prev.template_fields.every((item) =>
          ['headline', 'subheadline', 'content_block_1', 'content_block_2'].includes(item.field_key)
        );

      if (!preset && shouldResetToPreset) {
        return {
          ...prev,
          template_fields: buildGenericDefaultFields(),
          cta_buttons: buildGenericDefaultButtons(),
        };
      }

      if (!preset || !shouldResetToPreset) {
        return prev;
      }

      return {
        ...prev,
        template_fields: preset.fields.map((field) => ({
          field_key: field.field_key,
          field_type: field.field_type,
          field_value: field.field_value,
          sort_order: field.sort_order,
          meta: field.meta,
        })),
        cta_buttons: preset.ctaButtons.map((button) => ({
          button_key: button.button_key,
          button_label: button.button_label,
          button_url: button.button_url,
          button_style: button.button_style,
          open_in_new_tab: button.open_in_new_tab,
          sort_order: button.sort_order,
          meta: button.meta,
        })),
      };
    });
  }, [selectedTemplate]);

  useEffect(() => {
    setQualityReview(null);
  }, [selectedTemplate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setQualityReview(null);

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTemplateFieldChange = (index, key, value) => {
    setQualityReview(null);

    setForm((prev) => {
      const nextFields = [...prev.template_fields];
      nextFields[index] = {
        ...nextFields[index],
        [key]: value,
      };

      return {
        ...prev,
        template_fields: nextFields,
      };
    });
  };

  const handleCtaChange = (index, key, value) => {
    setQualityReview(null);

    setForm((prev) => {
      const nextButtons = [...prev.cta_buttons];
      nextButtons[index] = {
        ...nextButtons[index],
        [key]: value,
      };

      return {
        ...prev,
        cta_buttons: nextButtons,
      };
    });
  };

  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/api/uploads/template-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const uploadedUrl = data?.file?.url || '';
    if (!uploadedUrl) {
      throw new Error('Upload did not return image url');
    }

    return uploadedUrl;
  };

  const handleFeaturedImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeaturedUploading(true);
    setError('');
    setSuccess('');

    try {
      const uploadedUrl = await uploadImageFile(file);

      setForm((prev) => ({
        ...prev,
        featured_image: uploadedUrl,
      }));

      setSuccess('Featured image uploaded');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload featured image');
    } finally {
      setFeaturedUploading(false);
      event.target.value = '';
    }
  };

  const handleTemplateFieldImageUpload = async (index, fieldKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFieldUploadingKey(fieldKey);
    setError('');
    setSuccess('');

    try {
      const uploadedUrl = await uploadImageFile(file);
      handleTemplateFieldChange(index, 'field_value', uploadedUrl);
      setSuccess(`${fieldKey} uploaded`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload image');
    } finally {
      setFieldUploadingKey('');
      event.target.value = '';
    }
  };

  const validateBeforeSubmit = () => {
    if (form.content_type === 'product_post' && !form.product_id) {
      throw new Error('Product Post requires a product');
    }

    if (!form.template_id) {
      throw new Error('Template is required');
    }

    if (!form.title.trim()) {
      throw new Error('Post title is required');
    }

    for (const field of form.template_fields) {
      const meta = field.meta || {};
      const fieldLabel = meta.label || field.field_key || 'Field';
      const fieldValue = String(field.field_value || '');

      if (!String(field.field_key || '').trim()) {
        throw new Error('Every template field must have a field key');
      }

      if (meta.required && !fieldValue.trim()) {
        throw new Error(`${fieldLabel} is required`);
      }

      if (field.field_type === 'image' && meta.required && !fieldValue.trim()) {
        throw new Error(`${fieldLabel} image is required`);
      }

      if ((field.field_type === 'text' || field.field_type === 'textarea') && meta.word_rule) {
        const result = validateWordRule(fieldValue, meta.word_rule);

        if (!result.ok) {
          throw new Error(result.message);
        }
      }

      const looksLikeLinkField =
        String(field.field_type || '').toLowerCase().includes('url') ||
        String(field.field_type || '').toLowerCase().includes('link') ||
        String(field.field_key || '').toLowerCase().includes('url') ||
        String(field.field_key || '').toLowerCase().includes('link') ||
        String(field.field_key || '').toLowerCase().includes('cta');

      if (looksLikeLinkField && String(field.field_value || '').trim() && !isLikelyUrlValue(field.field_value)) {
        throw new Error(`${fieldLabel} must be a valid URL`);
      }
    }

    for (const button of form.cta_buttons) {
      const meta = button.meta || {};
      const buttonLabelMeta = meta.label || button.button_key || 'CTA button';

      if (meta.required && !String(button.button_label || '').trim()) {
        throw new Error(`${buttonLabelMeta} label is required`);
      }

      if (!String(button.button_url || '').trim()) {
        throw new Error(`${buttonLabelMeta} URL is required`);
      }

      if (!isLikelyUrlValue(button.button_url)) {
        throw new Error(`${buttonLabelMeta} URL must be valid`);
      }

      if (activePreset) {
        const expectedWordCount = countWords(button.button_label);
        if (button.button_key === 'hero_primary_cta' && expectedWordCount !== 4) {
          throw new Error('Hero primary CTA must be exactly 4 words');
        }
        if (
          ['hero_secondary_cta', 'how_it_works_cta', 'pricing_card_1_cta', 'pricing_card_2_cta', 'pricing_card_3_cta'].includes(
            button.button_key
          ) &&
          expectedWordCount !== 2
        ) {
          throw new Error(`${buttonLabelMeta} must be exactly 2 words`);
        }
        if (button.button_key === 'ingredients_cta' && expectedWordCount !== 3) {
          throw new Error('Ingredients CTA must be exactly 3 words');
        }
        if (button.button_key === 'special_offer_cta' && expectedWordCount !== 5) {
          throw new Error('Special offer CTA must be exactly 5 words');
        }
      }
    }
  };

  const applyServerResponseMeta = (data) => {
    if (data?.quality_review) {
      setQualityReview(data.quality_review);
    }

    if (data?.link_permissions) {
      setLinkPermission({
        loaded: true,
        allow_external_links: !!data.link_permissions.allow_external_links,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      validateBeforeSubmit();

      const payload = {
        content_type: form.content_type,
        product_id: form.product_id ? Number(form.product_id) : null,
        category_id: form.category_id || null,
        topic_ids: form.topic_ids,
      page_ids: form.page_ids || [],
      show_on_storefront: !!form.show_on_storefront,
        template_id: Number(form.template_id),
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        featured_image: form.featured_image,
        status: form.status,
        scheduled_at: form.scheduled_at || null,
        template_fields: form.template_fields.map((field, idx) => ({
          field_key: field.field_key,
          field_type: field.field_type,
          field_value: field.field_value,
          sort_order: idx + 1,
        })),
        cta_buttons: form.cta_buttons.map((button, idx) => ({
          button_key: button.button_key,
          button_label: button.button_label,
          button_url: button.button_url,
          button_style: button.button_style,
          open_in_new_tab: !!button.open_in_new_tab,
          sort_order: idx + 1,
        })),
      };

      const { data } = await api.post('/api/affiliate/posts', payload);
      applyServerResponseMeta(data);

      if (data?.ok && data?.post?.id) {
        setSuccess('Post created successfully. Redirecting...');
        setTimeout(() => {
          navigate(`${routeRoot}/posts/${data.post.id}/edit`);
        }, 700);
      }
    } catch (err) {
      const responseData = err?.response?.data;
      applyServerResponseMeta(responseData);
      setError(responseData?.message || err.message || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="affiliate-create-post-page">
        <style>{styles}</style>

        <div className="affiliate-create-post-loading-wrap">
          <div className="affiliate-create-post-loading-card">
            <div className="affiliate-create-post-spinner" />
            <p>Loading post setup...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-create-post-page">
      <style>{styles}</style>
      <section className="affiliate-create-post-command">
        <div className="affiliate-create-post-command-left">
          <strong>Create post</strong>
          <span className={getStatusClass(form.status)}>{form.status || 'draft'}</span>
        </div>

        <div className="affiliate-create-post-command-actions">
          <button
            className="affiliate-create-post-btn secondary"
            type="button"
            onClick={() => navigate(`${routeRoot}/posts`)}
          >
            Back to Posts
          </button>

          <button
            className="affiliate-create-post-btn primary"
            type="submit"
            form="affiliate-create-post-form"
            disabled={saving}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Create Post'}
          </button>
        </div>
      </section>

      <section className="affiliate-create-post-grid">
        <div className="affiliate-create-post-panel affiliate-create-post-panel-main">
          <div className="affiliate-create-post-panel-head">
            <div>
              <p className="affiliate-create-post-panel-kicker">Post details</p>
              <h2 className="affiliate-create-post-panel-title">Post setup</h2>
            </div>
          </div>

          <form id="affiliate-create-post-form" className="affiliate-create-post-form" onSubmit={handleSubmit}>
            <div className="affiliate-create-post-form-grid">
              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <FileText size={16} />
                  Content type
                </span>
                <select
                  className="affiliate-create-post-input"
                  name="content_type"
                  value={form.content_type}
                  onChange={handleChange}
                >
                  <option value="article">Article</option>
                  <option value="story">Story</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="course_lesson">Course Lesson</option>
                  <option value="review">Review</option>
                  <option value="news">News</option>
                  <option value="opinion">Opinion</option>
                  <option value="product_post">Product Post</option>
                </select>
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <Package size={16} />
                  Product (optional)
                </span>
                <select
                  className="affiliate-create-post-input"
                  name="product_id"
                  value={form.product_id}
                  onChange={handleChange}
                >
                  <option value="">No product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <FolderKanban size={16} />
                  Category
                </span>
                <select
                  className="affiliate-create-post-input"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <WriterTopicSelector
                value={form.topic_ids}
                primaryCategoryId={form.category_id}
                onChange={(topic_ids) =>
                  setForm((prev) => ({ ...prev, topic_ids }))
                }
                disabled={saving}
              />

            <WriterPlacementSelector
              pageIds={form.page_ids || []}
              showOnStorefront={!!form.show_on_storefront}
              contentType={form.content_type}
              onChange={({ page_ids, show_on_storefront }) =>
                setForm((prev) => ({ ...prev, page_ids, show_on_storefront }))
              }
            />

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <LayoutTemplate size={16} />
                  Template
                </span>
                <select
                  className="affiliate-create-post-input"
                  name="template_id"
                  value={form.template_id}
                  onChange={handleChange}
                >
                  <option value="">Select blog template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <Type size={16} />
                  Post title
                </span>
                <input
                  className="affiliate-create-post-input"
                  name="title"
                  placeholder="Post title"
                  value={form.title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <LinkIcon size={16} />
                  Slug
                </span>
                <input
                  className="affiliate-create-post-input"
                  name="slug"
                  placeholder="Custom slug"
                  value={form.slug}
                  onChange={handleChange}
                />
              </label>

              <UploadField
                label={
                  <span className="affiliate-create-post-label">
                    <ImageIcon size={16} />
                    Featured image
                  </span>
                }
                value={form.featured_image}
                placeholder="Upload image or paste image URL"
                uploading={featuredUploading}
                onChange={(e) => handleChange({ target: { name: 'featured_image', value: e.target.value } })}
                onUpload={handleFeaturedImageUpload}
                inputRef={featuredInputRef}
                previewHeight={130}
              />

              <label className="affiliate-create-post-field affiliate-create-post-field-full">
                <span className="affiliate-create-post-label">
                  <FileText size={16} />
                  Excerpt
                </span>
                <textarea
                  className="affiliate-create-post-input affiliate-create-post-textarea"
                  name="excerpt"
                  placeholder="Excerpt"
                  rows="3"
                  value={form.excerpt}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">SEO title</span>
                <input
                  className="affiliate-create-post-input"
                  name="seo_title"
                  placeholder="SEO title"
                  value={form.seo_title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">Status</span>
                <select
                  className="affiliate-create-post-input"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">Schedule release</span>
                <input
                  className="affiliate-create-post-input"
                  type="datetime-local"
                  name="scheduled_at"
                  value={form.scheduled_at}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field affiliate-create-post-field-full">
                <span className="affiliate-create-post-label">SEO description</span>
                <textarea
                  className="affiliate-create-post-input affiliate-create-post-textarea"
                  name="seo_description"
                  placeholder="SEO description"
                  rows="3"
                  value={form.seo_description}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="affiliate-create-post-block">
              <div className="affiliate-create-post-block-head">
                <div>
                  <p className="affiliate-create-post-panel-kicker">Template fields</p>
                  <h3 className="affiliate-create-post-block-title">
                    {activePreset ? 'Locked content blocks' : 'Content blocks'}
                  </h3>
                </div>

                {activePreset ? (
                  <div className="affiliate-create-post-lock-note">
                    <Lock size={15} />
                    <span>Structure locked</span>
                  </div>
                ) : null}
              </div>

              {activePreset ? (
                <div className="affiliate-create-post-preset-note">
                  <ShieldCheck size={16} />
                  <span>
                    All fields are compulsory. Replace every Lepresium value. Minimum words are enforced,
                    suggested maximum is shown only.
                  </span>
                </div>
              ) : null}

              {isSimpleWriterTemplate(selectedTemplate) ? (
                <SimpleWriterWorkroom
                  blocks={form.template_fields}
                  onChange={(nextBlocks) => {
                    setQualityReview(null);
                    setForm((prev) => ({ ...prev, template_fields: nextBlocks }));
                  }}
                  uploadImage={uploadImageFile}
                  disabled={saving}
                />
              ) : (
              <div className="affiliate-create-post-stack">
                {Object.entries(groupedTemplateFields).map(([section, fields]) => (
                  <div key={section} className="affiliate-create-post-section-group">
                    <div className="affiliate-create-post-section-title">{section}</div>

                    <div className="affiliate-create-post-stack">
                      {fields.map((field) => {
                        const fieldMeta = field.meta || {};
                        const wordRule = fieldMeta.word_rule;
                        const wordInfo =
                          field.field_type === 'text' || field.field_type === 'textarea'
                            ? validateWordRule(field.field_value, wordRule)
                            : null;

                        if (!fieldUploadRefs.current[field.field_key]) {
                          fieldUploadRefs.current[field.field_key] = { current: null };
                        }

                        return (
                          <div key={field.field_key} className="affiliate-create-post-card">
                            <div className="affiliate-create-post-card-top">
                              <div className="affiliate-create-post-chip">
                                {fieldMeta.label || field.field_key}
                              </div>

                              <div className={`affiliate-create-post-score-pill ${getFieldScoreTone(serverFieldMap[field.field_key]?.quality_score ?? localFieldReviews[field.field_key]?.score ?? 0)}`}>
                                Score {Math.round(serverFieldMap[field.field_key]?.quality_score ?? localFieldReviews[field.field_key]?.score ?? 0)}
                              </div>

                              {fieldMeta.locked ? (
                                <div className="affiliate-create-post-chip muted">
                                  <Lock size={13} />
                                  Locked slot
                                </div>
                              ) : null}
                            </div>

                            <div className="affiliate-create-post-form-grid single">
                              {field.field_type === 'image' ? (
                                <UploadField
                                  label={fieldMeta.label || field.field_key}
                                  value={field.field_value}
                                  placeholder={fieldMeta.placeholder || 'Upload image or paste image URL'}
                                  uploading={fieldUploadingKey === field.field_key}
                                  onChange={(e) =>
                                    handleTemplateFieldChange(field.__index, 'field_value', e.target.value)
                                  }
                                  onUpload={(e) =>
                                    handleTemplateFieldImageUpload(field.__index, field.field_key, e)
                                  }
                                  inputRef={fieldUploadRefs.current[field.field_key]}
                                  previewHeight={150}
                                />
                              ) : (
                                <label className="affiliate-create-post-field affiliate-create-post-field-full">
                                  <span className="affiliate-create-post-label">
                                    {fieldMeta.label || field.field_key}
                                  </span>

                                  {field.field_type === 'textarea' ? (
                                    <textarea
                                      className="affiliate-create-post-input affiliate-create-post-textarea"
                                      rows="4"
                                      placeholder={fieldMeta.placeholder || 'Enter value'}
                                      value={field.field_value}
                                      onChange={(e) =>
                                        handleTemplateFieldChange(field.__index, 'field_value', e.target.value)
                                      }
                                    />
                                  ) : (
                                    <input
                                      className="affiliate-create-post-input"
                                      placeholder={fieldMeta.placeholder || 'Enter value'}
                                      value={field.field_value}
                                      onChange={(e) =>
                                        handleTemplateFieldChange(field.__index, 'field_value', e.target.value)
                                      }
                                    />
                                  )}
                                </label>
                              )}
                            </div>

                            <div className="affiliate-create-post-review-box">
                              <div className="affiliate-create-post-review-top">
                                <div className={`affiliate-create-post-review-state ${getFieldScoreTone(serverFieldMap[field.field_key]?.quality_score ?? localFieldReviews[field.field_key]?.score ?? 0)}`}>
                                  {getFieldScoreTone(serverFieldMap[field.field_key]?.quality_score ?? localFieldReviews[field.field_key]?.score ?? 0) === 'good'
                                    ? 'Strong'
                                    : getFieldScoreTone(serverFieldMap[field.field_key]?.quality_score ?? localFieldReviews[field.field_key]?.score ?? 0) === 'warn'
                                    ? 'Needs polish'
                                    : 'Fix'}
                                </div>

                                <div className="affiliate-create-post-review-meta">
                                  {field.field_type === 'text' || field.field_type === 'textarea'
                                    ? `${localFieldReviews[field.field_key]?.wordCount || 0} words`
                                    : 'Image field'}
                                  {wordRule ? ` - ${getFieldWordRuleLabel(wordRule)}` : ''}
                                </div>
                              </div>

                              <div className="affiliate-create-post-review-message">
                                {serverFieldMap[field.field_key]?.warning_message || localFieldReviews[field.field_key]?.message || fieldMeta.helper_text || 'Required field'}
                              </div>

                              {(serverFieldMap[field.field_key]?.warning_suggestion || localFieldReviews[field.field_key]?.suggestion) ? (
                                <div className="affiliate-create-post-review-suggestion">
                                  {serverFieldMap[field.field_key]?.warning_suggestion || localFieldReviews[field.field_key]?.suggestion}
                                </div>
                              ) : null}

                              {serverFieldMap[field.field_key]?.similarity_score >= 1 ? (
                                <div className="affiliate-create-post-review-tag">
                                  Similarity check: {Math.round(serverFieldMap[field.field_key]?.similarity_score || 0)}%
                                </div>
                              ) : null}
                            </div>

                            <div className="affiliate-create-post-field-meta">
                              <div>
                                {fieldMeta.helper_text || 'Required field'}
                                {wordInfo?.message ? (
                                  <div className="affiliate-create-post-suggested-note">{wordInfo.message}</div>
                                ) : null}
                              </div>

                              {wordRule ? (
                                <div
                                  className={`affiliate-create-post-word-rule ${
                                    wordInfo?.ok ? 'valid' : 'invalid'
                                  }`}
                                >
                                  <span>{getFieldWordRuleLabel(wordRule)}</span>
                                  <strong>{wordInfo?.count || 0} words</strong>
                                </div>
                              ) : (
                                <div className="affiliate-create-post-required-tag">
                                  {fieldMeta.required ? 'Required' : 'Optional'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            <div
              className="affiliate-create-post-block"
              style={isSimpleWriterTemplate(selectedTemplate) ? { display: 'none' } : undefined}
            >
              <div className="affiliate-create-post-block-head">
                <div>
                  <p className="affiliate-create-post-panel-kicker">CTA buttons</p>
                  <h3 className="affiliate-create-post-block-title">
                    {activePreset ? 'Locked action buttons' : 'Action buttons'}
                  </h3>
                </div>

                {activePreset ? (
                  <div className="affiliate-create-post-lock-note">
                    <Lock size={15} />
                    <span>Button count locked</span>
                  </div>
                ) : null}
              </div>

              <div className="affiliate-create-post-stack">
                {form.cta_buttons.map((button, index) => (
                  <div key={button.button_key || index} className="affiliate-create-post-card">
                    <div className="affiliate-create-post-card-top">
                      <div className="affiliate-create-post-chip">
                        {button?.meta?.label || button.button_key}
                      </div>

                      {button?.meta?.locked ? (
                        <div className="affiliate-create-post-chip muted">
                          <Lock size={13} />
                          Locked slot
                        </div>
                      ) : null}
                    </div>

                    <div className="affiliate-create-post-form-grid">
                      <label className="affiliate-create-post-field">
                        <span className="affiliate-create-post-label">Button label</span>
                        <input
                          className="affiliate-create-post-input"
                          placeholder="Button label"
                          value={button.button_label}
                          onChange={(e) => handleCtaChange(index, 'button_label', e.target.value)}
                        />
                      </label>

                      <label className="affiliate-create-post-field">
                        <span className="affiliate-create-post-label">Button style</span>
                        <select
                          className="affiliate-create-post-input"
                          value={button.button_style}
                          onChange={(e) => handleCtaChange(index, 'button_style', e.target.value)}
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                        </select>
                      </label>

                      <label className="affiliate-create-post-field affiliate-create-post-field-full">
                        <span className="affiliate-create-post-label">Button URL</span>
                        <input
                          className="affiliate-create-post-input"
                          placeholder="Button URL"
                          value={button.button_url}
                          onChange={(e) => handleCtaChange(index, 'button_url', e.target.value)}
                        />
                      </label>

                      <label className="affiliate-create-post-check">
                        <input
                          type="checkbox"
                          checked={!!button.open_in_new_tab}
                          onChange={(e) =>
                            handleCtaChange(index, 'open_in_new_tab', e.target.checked)
                          }
                        />
                        <span>Open in new tab</span>
                      </label>
                    </div>

                    <div className="affiliate-create-post-field-meta">
                      <div>
                        {'External links are allowed. Bloggad checks and records outbound destinations when you save.'}
                      </div>
                      <div className="affiliate-create-post-required-tag">Required</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error ? (
              <div className="affiliate-create-post-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="affiliate-create-post-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}

            <div className="affiliate-create-post-actions">
              <button className="affiliate-create-post-btn primary" type="submit" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Create Post'}
              </button>

              <Link className="affiliate-create-post-btn secondary" to={`${routeRoot}/posts`}>
                View My Posts
              </Link>
            </div>
          </form>
        </div>

        <div className="affiliate-create-post-side-stack">
          <div className="affiliate-create-post-panel">
            <div className="affiliate-create-post-panel-head">
              <div>
                <p className="affiliate-create-post-panel-kicker">Summary</p>
                <h2 className="affiliate-create-post-panel-title">Post overview</h2>
              </div>
            </div>

            <div className="affiliate-create-post-summary">
              <div className="affiliate-create-post-summary-row">
                <span>Title</span>
                <strong>{form.title || '-'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Product</span>
                <strong>{selectedProduct?.title || '-'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Category</span>
                <strong>{selectedCategory?.name || '-'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Template</span>
                <strong>{selectedTemplate?.name || '-'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Mode</span>
                <strong>{isSimpleWriterTemplate(selectedTemplate) ? 'Simple Writer workroom' : activePreset ? 'Locked template editor' : 'Generic field editor'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Status</span>
                <strong>
                  <span className={getStatusClass(form.status)}>{form.status || '-'}</span>
                </strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Fields</span>
                <strong>{form.template_fields.length}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>CTA Buttons</span>
                <strong>{form.cta_buttons.length}</strong>
              </div>
            </div>
          </div>

          <div
            className="affiliate-create-post-panel"
            style={isSimpleWriterTemplate(selectedTemplate) ? { display: 'none' } : undefined}
          >
            <div className="affiliate-create-post-panel-head">
              <div>
                <p className="affiliate-create-post-panel-kicker">Live quality</p>
                <h2 className="affiliate-create-post-panel-title">Score board</h2>
              </div>
            </div>

            <div className="affiliate-create-post-quality-box">
              <div className="affiliate-create-post-quality-score">{overallLocalScore}</div>
              <div className="affiliate-create-post-quality-text">
                {passedLocalFields}/{form.template_fields.length} fields currently passing
              </div>
              <div className="affiliate-create-post-quality-meta">
                Total text words: {totalTextWords} - Similarity review starts fully from 100 words
              </div>
            </div>
          </div>

          <div className="affiliate-create-post-panel">
            <div className="affiliate-create-post-panel-head">
              <div>
                <p className="affiliate-create-post-panel-kicker">Link policy</p>
                <h2 className="affiliate-create-post-panel-title">Outbound links</h2>
              </div>
            </div>

            <div className="affiliate-create-post-summary">
              <div className="affiliate-create-post-plan-note">
                {'Free and paid Writers can use legitimate external links. Prohibited destinations may be blocked or reviewed.'}
              </div>
            </div>
          </div>

          {qualityReview ? (
            <div className="affiliate-create-post-panel">
              <div className="affiliate-create-post-panel-head">
                <div>
                  <p className="affiliate-create-post-panel-kicker">Latest server review</p>
                  <h2 className="affiliate-create-post-panel-title">Review result</h2>
                </div>
              </div>

              <div className="affiliate-create-post-summary">
                <div className="affiliate-create-post-summary-row">
                  <span>Review status</span>
                  <strong>{qualityReview.review_status || '-'}</strong>
                </div>
                <div className="affiliate-create-post-summary-row">
                  <span>Quality score</span>
                  <strong>{Math.round(qualityReview.quality_score || 0)}</strong>
                </div>
                <div className="affiliate-create-post-summary-row">
                  <span>Risk score</span>
                  <strong>{Math.round(qualityReview.risk_score || 0)}</strong>
                </div>
                <div className="affiliate-create-post-summary-row">
                  <span>Similarity score</span>
                  <strong>{Math.round(qualityReview.similarity_score || 0)}%</strong>
                </div>
                {qualityReview.blocked_reason ? (
                  <div className="affiliate-create-post-server-warning">{qualityReview.blocked_reason}</div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="affiliate-create-post-panel">
            <div className="affiliate-create-post-panel-head">
              <div>
                <p className="affiliate-create-post-panel-kicker">Preview</p>
                <h2 className="affiliate-create-post-panel-title">Featured image</h2>
              </div>
            </div>

            {form.featured_image ? (
              <img
                src={form.featured_image}
                alt={form.title || 'Post preview'}
                className="affiliate-create-post-preview-image"
              />
            ) : (
              <div className="affiliate-create-post-preview-empty">
                <ImageIcon size={26} />
                <span>No featured image</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-create-post-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .affiliate-create-post-page button,
  .affiliate-create-post-page input,
  .affiliate-create-post-page select,
  .affiliate-create-post-page textarea {
    font: inherit;
  }

  .affiliate-create-post-loading-wrap {
    min-height: 58vh;
    display: grid;
    place-items: center;
  }

  .affiliate-create-post-loading-card {
    min-width: 230px;
    padding: 22px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    text-align: center;
  }

  .affiliate-create-post-loading-card p {
    margin: 10px 0 0;
    color: #6b7280;
    font-size: 11px;
    font-weight: 600;
  }

  .affiliate-create-post-spinner,
  .affiliate-create-post-spin {
    animation: affiliateCreatePostSpin 0.8s linear infinite;
  }

  .affiliate-create-post-spinner {
    width: 32px;
    height: 32px;
    margin: 0 auto;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    border-radius: 999px;
  }

  @keyframes affiliateCreatePostSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-create-post-command {
    min-height: 60px;
    margin-bottom: 12px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .affiliate-create-post-command-left,
  .affiliate-create-post-command-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .affiliate-create-post-command-left {
    min-width: 0;
  }

  .affiliate-create-post-command-left > strong {
    font-size: 16px;
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .affiliate-create-post-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    gap: 12px;
    align-items: start;
  }

  .affiliate-create-post-side-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: sticky;
    top: 12px;
  }

  .affiliate-create-post-panel {
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: none;
  }

  .affiliate-create-post-panel-head,
  .affiliate-create-post-block-head {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .affiliate-create-post-panel-kicker {
    display: none;
  }

  .affiliate-create-post-panel-title,
  .affiliate-create-post-block-title {
    margin: 0;
    color: #111827;
    font-size: 13px;
    line-height: 1.25;
    font-weight: 600;
    letter-spacing: 0;
  }

  .affiliate-create-post-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-post-form-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
  }

  .affiliate-create-post-form-grid > :nth-child(1),
  .affiliate-create-post-form-grid > :nth-child(2),
  .affiliate-create-post-form-grid > :nth-child(3) {
    grid-column: span 2;
  }

  .affiliate-create-post-form-grid > :nth-child(4),
  .affiliate-create-post-form-grid > :nth-child(5),
  .affiliate-create-post-form-grid > :nth-child(6),
  .affiliate-create-post-form-grid > :nth-child(7) {
    grid-column: span 3;
  }

  .affiliate-create-post-form-grid > :nth-child(8),
  .affiliate-create-post-form-grid > :nth-child(12),
  .affiliate-create-post-form-grid > :nth-child(13) {
    grid-column: span 2;
  }

  .affiliate-create-post-form-grid > :nth-child(9),
  .affiliate-create-post-form-grid > :nth-child(10),
  .affiliate-create-post-form-grid > :nth-child(11),
  .affiliate-create-post-form-grid > :nth-child(14) {
    grid-column: span 3;
  }

  .affiliate-create-post-form-grid.single {
    grid-template-columns: 1fr;
  }

  .affiliate-create-post-form-grid.single > * {
    grid-column: auto;
  }

  .affiliate-create-post-field,
  .affiliate-create-post-upload-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .affiliate-create-post-field-full {
    grid-column: 1 / -1 !important;
  }

  .affiliate-create-post-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .affiliate-create-post-label svg {
    width: 13px;
    height: 13px;
    color: #6b7280;
  }

  .affiliate-create-post-input {
    width: 100%;
    min-height: 42px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: 0;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 500;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }

  .affiliate-create-post-input::placeholder {
    color: #6b7280;
    opacity: 1;
  }

  .affiliate-create-post-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .affiliate-create-post-textarea {
    min-height: 78px;
    padding: 10px 12px;
    resize: vertical;
  }

  .affiliate-create-post-upload-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: end;
  }

  .affiliate-create-post-upload-btn {
    min-height: 38px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid #111827;
    border-radius: 10px;
    background: #111827;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  .affiliate-create-post-upload-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .affiliate-create-post-inline-preview {
    width: 100%;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #f8fafc;
  }

  .affiliate-create-post-inline-preview img {
    border-radius: 9px !important;
  }

  .affiliate-create-post-block {
    width: 100%;
    min-width: 0;
    margin-top: 2px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid #dfe3e8;
    border-radius: 14px;
    background: #ffffff;
  }

  .affiliate-create-post-block + .affiliate-create-post-block {
    margin-top: 0;
  }

  .affiliate-create-post-block-head {
    width: 100%;
    margin-bottom: 0;
    padding-bottom: 2px;
  }

  .affiliate-create-post-block-title {
    font-size: 15px;
    line-height: 1.35;
    font-weight: 650;
  }

  .affiliate-create-post-stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-create-post-section-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-create-post-section-title {
    padding: 2px 0;
    color: #111827;
    font-size: 11px;
    line-height: 1.3;
    font-weight: 600;
  }

  .affiliate-create-post-card {
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
  }

  .affiliate-create-post-card-top {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .affiliate-create-post-chip,
  .affiliate-create-post-lock-note,
  .affiliate-create-post-score-pill,
  .affiliate-create-post-review-state,
  .affiliate-create-post-word-rule,
  .affiliate-create-post-required-tag,
  .affiliate-create-post-status {
    min-height: 25px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
  }

  .affiliate-create-post-score-pill {
    margin-left: auto;
  }

  .affiliate-create-post-status {
    text-transform: capitalize;
  }

  .affiliate-create-post-status.active,
  .affiliate-create-post-score-pill.good,
  .affiliate-create-post-review-state.good,
  .affiliate-create-post-word-rule.valid {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .affiliate-create-post-status.draft,
  .affiliate-create-post-status.neutral {
    border-color: #e5e7eb;
    background: #f8fafc;
    color: #6b7280;
  }

  .affiliate-create-post-status.inactive,
  .affiliate-create-post-score-pill.warn,
  .affiliate-create-post-review-state.warn,
  .affiliate-create-post-word-rule.invalid {
    border-color: #fed7aa;
    background: #fff7ed;
    color: #b54708;
  }

  .affiliate-create-post-score-pill.bad,
  .affiliate-create-post-review-state.bad {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b42318;
  }

  .affiliate-create-post-preset-note {
    margin-bottom: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    border: 1px solid #fde68a;
    border-radius: 10px;
    background: #fffbeb;
    color: #92400e;
    font-size: 10px;
    line-height: 1.5;
    font-weight: 600;
  }

  .affiliate-create-post-field-meta,
  .affiliate-create-post-review-top {
    margin-top: 9px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    color: #6b7280;
    font-size: 9px;
    line-height: 1.45;
  }

  .affiliate-create-post-review-box {
    margin-top: 9px;
    padding: 10px;
    display: grid;
    gap: 6px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #ffffff;
  }

  .affiliate-create-post-review-message {
    color: #111827;
    font-size: 10px;
    line-height: 1.45;
    font-weight: 600;
  }

  .affiliate-create-post-review-suggestion,
  .affiliate-create-post-review-meta,
  .affiliate-create-post-suggested-note {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.45;
  }

  .affiliate-create-post-review-tag {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    font-weight: 600;
  }

  .affiliate-create-post-check {
    min-height: 42px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
    color: #111827;
    font-size: 10px;
    font-weight: 600;
  }

  .affiliate-create-post-alert {
    padding: 11px 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    border-radius: 10px;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
  }

  .affiliate-create-post-alert.error {
    border: 1px solid #fed7aa;
    background: #fff7ed;
    color: #9a3412;
  }

  .affiliate-create-post-alert.success {
    border: 1px solid #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .affiliate-create-post-actions {
    padding-top: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .affiliate-create-post-btn {
    min-height: 38px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .affiliate-create-post-btn.primary {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }

  .affiliate-create-post-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .affiliate-create-post-summary {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .affiliate-create-post-summary-row {
    min-height: 32px;
    padding: 5px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .affiliate-create-post-summary-row span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 500;
  }

  .affiliate-create-post-summary-row strong {
    max-width: 62%;
    color: #111827;
    font-size: 10px;
    line-height: 1.35;
    font-weight: 600;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .affiliate-create-post-preview-image,
  .affiliate-create-post-preview-empty {
    width: 100%;
    height: 190px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f8fafc;
  }

  .affiliate-create-post-preview-image {
    display: block;
    object-fit: cover;
  }

  .affiliate-create-post-preview-empty {
    display: grid;
    place-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 10px;
    text-align: center;
  }

  .affiliate-create-post-quality-box {
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: #111827;
  }

  .affiliate-create-post-quality-score {
    margin-bottom: 7px;
    color: #111827;
    font-size: 34px;
    line-height: 1;
    font-weight: 700;
  }

  .affiliate-create-post-quality-text {
    margin-bottom: 4px;
    color: #111827;
    font-size: 10px;
    line-height: 1.4;
    font-weight: 600;
  }

  .affiliate-create-post-quality-meta,
  .affiliate-create-post-plan-note,
  .affiliate-create-post-server-warning {
    color: #6b7280;
    font-size: 9px;
    line-height: 1.5;
  }

  .affiliate-create-post-server-warning {
    color: #b42318;
    font-weight: 600;
  }

  .affiliate-create-post-block > div[style] {
    width: 100% !important;
    min-width: 0 !important;
    gap: 12px !important;
    align-items: stretch !important;
  }

  .affiliate-create-post-block > div[style] > * {
    min-width: 0 !important;
  }

  .affiliate-create-post-block button:not(.affiliate-create-post-upload-btn) {
    min-height: 32px !important;
    padding: 0 11px !important;
    border: 1px solid #dfe3e8 !important;
    border-radius: 9px !important;
    background: #f8fafc !important;
    color: #475467 !important;
    font-size: 11px !important;
    line-height: 1 !important;
    font-weight: 600 !important;
    box-shadow: none !important;
  }

  .affiliate-create-post-block button:not(.affiliate-create-post-upload-btn):hover {
    border-color: #c8cfd8 !important;
    background: #f3f4f6 !important;
    color: #111827 !important;
  }

  .affiliate-create-post-block input:not([type="file"]),
  .affiliate-create-post-block textarea {
    width: 100% !important;
    min-width: 0 !important;
    border: 1px solid #cfd5dd !important;
    border-radius: 10px !important;
    background: #ffffff !important;
    color: #111827 !important;
    font-size: 15px !important;
    line-height: 1.55 !important;
    font-weight: 400 !important;
    box-shadow: none !important;
  }

  .affiliate-create-post-block input:not([type="file"]) {
    min-height: 44px !important;
    padding: 0 12px !important;
  }

  .affiliate-create-post-block textarea {
    min-height: 132px !important;
    padding: 12px 13px !important;
    resize: vertical !important;
  }

  .affiliate-create-post-block input:not([type="file"])::placeholder,
  .affiliate-create-post-block textarea::placeholder {
    color: #98a2b3 !important;
    opacity: 1 !important;
  }

  .affiliate-create-post-block input:not([type="file"]):focus,
  .affiliate-create-post-block textarea:focus {
    border-color: #111827 !important;
    outline: 0 !important;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06) !important;
  }

  .affiliate-create-post-block input[type="file"] {
    width: 100% !important;
    min-height: 42px !important;
    padding: 5px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 10px !important;
    background: #ffffff !important;
    color: #475467 !important;
    font-size: 11px !important;
  }

  .affiliate-create-post-block input[type="file"]::file-selector-button {
    min-height: 30px;
    margin-right: 10px;
    padding: 0 11px;
    border: 0;
    border-radius: 7px;
    background: #111827;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  .affiliate-create-post-block label,
  .affiliate-create-post-block .affiliate-create-post-label {
    font-size: 10px !important;
    line-height: 1.3 !important;
  }

  .affiliate-create-post-block img {
    width: 100%;
    max-width: 100%;
    border-radius: 10px !important;
  }

  @media (max-width: 1100px) {
    .affiliate-create-post-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-create-post-side-stack {
      position: static;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .affiliate-create-post-command {
      min-height: 52px;
      margin-bottom: 10px;
      padding: 8px 12px;
      border-radius: 12px;
    }

    .affiliate-create-post-command-left > strong {
      font-size: 14px;
    }

    .affiliate-create-post-command-left .affiliate-create-post-status {
      display: none;
    }

    .affiliate-create-post-command-actions {
      gap: 6px;
    }

    .affiliate-create-post-command-actions .affiliate-create-post-btn {
      min-height: 36px;
      padding: 0 11px;
      font-size: 10px;
    }

    .affiliate-create-post-command-actions .affiliate-create-post-btn svg {
      display: none;
    }

    .affiliate-create-post-grid {
      gap: 10px;
    }

    .affiliate-create-post-panel {
      padding: 14px;
      border-radius: 14px;
    }

    .affiliate-create-post-form-grid {
      grid-template-columns: 1fr;
      gap: 9px;
    }

    .affiliate-create-post-form-grid > * {
      grid-column: auto !important;
    }

    .affiliate-create-post-label {
      font-size: 8px;
    }

    .affiliate-create-post-input {
      min-height: 40px;
      border-radius: 9px;
      font-size: 10px;
    }

    .affiliate-create-post-textarea {
      min-height: 72px;
    }

    .affiliate-create-post-upload-row {
      grid-template-columns: 1fr;
    }

    .affiliate-create-post-upload-btn {
      width: 100%;
      min-height: 36px;
      border-radius: 9px;
      font-size: 10px;
    }

    .affiliate-create-post-block {
      padding: 13px;
      gap: 10px;
    }

    .affiliate-create-post-block-title {
      font-size: 14px;
    }

    .affiliate-create-post-block input:not([type="file"]),
    .affiliate-create-post-block textarea {
      font-size: 14px !important;
    }

    .affiliate-create-post-block textarea {
      min-height: 120px !important;
    }

    .affiliate-create-post-block button:not(.affiliate-create-post-upload-btn) {
      min-height: 32px !important;
      font-size: 11px !important;
    }

    .affiliate-create-post-card {
      padding: 11px;
    }

    .affiliate-create-post-side-stack {
      display: flex;
    }

    .affiliate-create-post-summary-row {
      min-height: 30px;
    }

    .affiliate-create-post-preview-image,
    .affiliate-create-post-preview-empty {
      height: 170px;
    }

    .affiliate-create-post-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-create-post-actions .affiliate-create-post-btn {
      width: 100%;
      min-height: 36px;
    }

    .affiliate-create-post-panel-main .affiliate-create-post-panel-head {
      margin-bottom: 10px;
    }

    .affiliate-create-post-block-head {
      align-items: center;
      flex-direction: row;
    }
  }

  @media (max-width: 420px) {
    .affiliate-create-post-command {
      gap: 8px;
    }

    .affiliate-create-post-command-actions .affiliate-create-post-btn {
      padding: 0 9px;
    }

    .affiliate-create-post-panel {
      padding: 12px;
    }

    .affiliate-create-post-block {
      padding: 12px;
    }

    .affiliate-create-post-block textarea {
      min-height: 112px !important;
    }
  }
`;
