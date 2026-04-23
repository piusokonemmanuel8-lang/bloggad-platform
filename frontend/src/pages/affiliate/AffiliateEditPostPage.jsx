import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Save,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  LayoutTemplate,
  Package,
  FolderKanban,
  Image as ImageIcon,
  ArrowLeft,
  Type,
  Lock,
  ShieldCheck,
  Upload,
  Loader2,
} from 'lucide-react';
import api from '../../api/axios';
import { resolveBlogTemplatePreset } from './template-presets';

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'published' || value === 'active') return 'affiliate-edit-post-status active';
  if (value === 'draft' || value === 'pending') return 'affiliate-edit-post-status draft';
  if (value === 'inactive') return 'affiliate-edit-post-status inactive';

  return 'affiliate-edit-post-status neutral';
}

function normalizeText(value) {
  return String(value || '')
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
  return `min ${rule.min_words} words · suggested max ${rule.max_words}`;
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

    return { ok: true, count, message: '' };
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

function mergePresetFields(presetFields, currentFields) {
  const currentMap = new Map(
    (currentFields || []).map((field) => [String(field.field_key || '').trim(), field])
  );

  return presetFields.map((presetField) => {
    const existing = currentMap.get(String(presetField.field_key || '').trim());

    return {
      field_key: presetField.field_key,
      field_type: presetField.field_type,
      field_value:
        existing && existing.field_value !== undefined && existing.field_value !== null
          ? existing.field_value
          : presetField.field_value,
      sort_order: presetField.sort_order,
      meta: presetField.meta,
    };
  });
}

function mergePresetButtons(presetButtons, currentButtons) {
  const currentMap = new Map(
    (currentButtons || []).map((button) => [String(button.button_key || '').trim(), button])
  );

  return presetButtons.map((presetButton) => {
    const existing = currentMap.get(String(presetButton.button_key || '').trim());

    return {
      button_key: presetButton.button_key,
      button_label:
        existing && existing.button_label !== undefined && existing.button_label !== null
          ? existing.button_label
          : presetButton.button_label,
      button_url:
        existing && existing.button_url !== undefined && existing.button_url !== null
          ? existing.button_url
          : presetButton.button_url,
      button_style:
        existing && existing.button_style !== undefined && existing.button_style !== null
          ? existing.button_style
          : presetButton.button_style,
      open_in_new_tab:
        existing && existing.open_in_new_tab !== undefined
          ? !!existing.open_in_new_tab
          : presetButton.open_in_new_tab,
      sort_order: presetButton.sort_order,
      meta: presetButton.meta,
    };
  });
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
    <div className="affiliate-edit-post-upload-field">
      <label className="affiliate-edit-post-label">{label}</label>

      <div className="affiliate-edit-post-upload-row">
        <input
          className="affiliate-edit-post-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        <button
          type="button"
          className="affiliate-edit-post-upload-btn"
          disabled={uploading}
          onClick={() => inputRef?.current?.click()}
        >
          {uploading ? <Loader2 size={16} className="affiliate-edit-post-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onUpload} />
      </div>

      {value ? (
        <div className="affiliate-edit-post-inline-preview">
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
  if (/%|\$|₦|£|€/.test(text)) score += 1;
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

export default function AffiliateEditPostPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    product_id: '',
    category_id: '',
    template_id: '',
    title: '',
    slug: '',
    excerpt: '',
    seo_title: '',
    seo_description: '',
    featured_image: '',
    status: 'draft',
    template_fields: [],
    cta_buttons: [],
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [postRes, productsRes, templatesRes, categoriesRes] = await Promise.all([
          api.get(`/api/affiliate/posts/${id}`),
          api.get('/api/affiliate/products'),
          api.get('/api/affiliate/templates/blog'),
          api.get('/api/public/categories'),
        ]);

        const post = postRes?.data?.post;
        const productList = productsRes?.data?.products || [];
        const templateList = templatesRes?.data?.templates || [];
        const categoryList = categoriesRes?.data?.categories || [];

        setProducts(productList);
        setTemplates(templateList);
        setCategories(categoryList);

        applyServerResponseMeta(postRes?.data);

        if (post) {
          const matchedTemplate =
            templateList.find((item) => String(item.id) === String(post.template_id)) || null;

          const preset = resolveBlogTemplatePreset(matchedTemplate);

          const genericFields =
            (post.template_fields || []).map((field, idx) => ({
              field_key: field.field_key || '',
              field_type: field.field_type || 'text',
              field_value: field.field_value || '',
              sort_order: field.sort_order || idx + 1,
              meta: {
                label: field.field_key || `Field ${idx + 1}`,
                section: 'Generic fields',
                helper_text: 'Generic field',
                required: true,
                word_rule: null,
                placeholder: 'Enter value',
                locked: false,
              },
            })) || [];

          const genericButtons =
            (post.cta_buttons || []).map((button, idx) => ({
              button_key: button.button_key || `cta_${idx + 1}`,
              button_label: button.button_label || '',
              button_url: button.button_url || '',
              button_style: button.button_style || 'primary',
              open_in_new_tab: !!button.open_in_new_tab,
              sort_order: button.sort_order || idx + 1,
              meta: {
                label: button.button_key || `Button ${idx + 1}`,
                helper_text: 'Generic CTA button.',
                required: true,
                locked: false,
              },
            })) || [];

          setForm({
            product_id: post.product_id || '',
            category_id: post.category_id || '',
            template_id: post.template_id || '',
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            seo_title: post.seo_title || '',
            seo_description: post.seo_description || '',
            featured_image: post.featured_image || '',
            status: post.status || 'draft',
            template_fields: preset
              ? mergePresetFields(preset.fields, post.template_fields || [])
              : genericFields,
            cta_buttons: preset
              ? mergePresetButtons(preset.ctaButtons, post.cta_buttons || [])
              : genericButtons,
          });

          if (post.quality_review) {
            setQualityReview(post.quality_review);
          }
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!selectedTemplate) return;

    const preset = resolveBlogTemplatePreset(selectedTemplate);

    setForm((prev) => {
      if (!preset) {
        const areCurrentFieldsPreset = prev.template_fields.some((field) => field?.meta?.locked);
        const areCurrentButtonsPreset = prev.cta_buttons.some((button) => button?.meta?.locked);

        if (!areCurrentFieldsPreset && !areCurrentButtonsPreset) {
          return prev;
        }

        return {
          ...prev,
          template_fields: buildGenericDefaultFields(),
          cta_buttons: buildGenericDefaultButtons(),
        };
      }

      const mergedFields = mergePresetFields(preset.fields, prev.template_fields || []);
      const mergedButtons = mergePresetButtons(preset.ctaButtons, prev.cta_buttons || []);

      return {
        ...prev,
        template_fields: mergedFields,
        cta_buttons: mergedButtons,
      };
    });
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
    if (!form.product_id) {
      throw new Error('Product is required');
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
        throw new Error(`${buttonLabelMeta} URL must be a valid URL`);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      validateBeforeSubmit();

      const payload = {
        product_id: Number(form.product_id),
        category_id: form.category_id || null,
        template_id: Number(form.template_id),
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        featured_image: form.featured_image,
        status: form.status,
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

      const { data } = await api.put(`/api/affiliate/posts/${id}`, payload);
      applyServerResponseMeta(data);

      if (data?.ok) {
        setSuccess(data.message || 'Post updated successfully');
      }
    } catch (err) {
      const responseData = err?.response?.data;
      applyServerResponseMeta(responseData);
      setError(responseData?.message || err.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="affiliate-edit-post-page">
        <style>{styles}</style>

        <div className="affiliate-edit-post-loading-wrap">
          <div className="affiliate-edit-post-loading-card">
            <div className="affiliate-edit-post-spinner" />
            <p>Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-edit-post-page">
      <style>{styles}</style>

      <section className="affiliate-edit-post-hero">
        <div className="affiliate-edit-post-hero-copy">
          <div className="affiliate-edit-post-badge">Post editor</div>
          <h1 className="affiliate-edit-post-title">Edit Post</h1>
          <p className="affiliate-edit-post-subtitle">
            {activePreset
              ? 'This template is locked. Replace every Lepresium field, image, and CTA before saving.'
              : 'Update post content, template fields, SEO details, and CTA buttons.'}
          </p>
        </div>

        <div className="affiliate-edit-post-hero-actions">
          <button
            className="affiliate-edit-post-btn secondary"
            type="button"
            onClick={() => navigate('/affiliate/products')}
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
        </div>
      </section>

      <section className="affiliate-edit-post-grid">
        <div className="affiliate-edit-post-panel affiliate-edit-post-panel-main">
          <div className="affiliate-edit-post-panel-head">
            <div>
              <p className="affiliate-edit-post-panel-kicker">Post details</p>
              <h2 className="affiliate-edit-post-panel-title">Update content</h2>
            </div>
          </div>

          <form className="affiliate-edit-post-form" onSubmit={handleSubmit}>
            <div className="affiliate-edit-post-form-grid">
              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <Package size={16} />
                  Product
                </span>
                <select
                  className="affiliate-edit-post-input"
                  name="product_id"
                  value={form.product_id}
                  onChange={handleChange}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <FolderKanban size={16} />
                  Category
                </span>
                <select
                  className="affiliate-edit-post-input"
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

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <LayoutTemplate size={16} />
                  Template
                </span>
                <select
                  className="affiliate-edit-post-input"
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

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <Type size={16} />
                  Post title
                </span>
                <input
                  className="affiliate-edit-post-input"
                  name="title"
                  placeholder="Post title"
                  value={form.title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <Link as LinkIcon size={16} />
                </span>
                <input
                  className="affiliate-edit-post-input"
                  name="slug"
                  placeholder="Custom slug"
                  value={form.slug}
                  onChange={handleChange}
                />
              </label>

              <UploadField
                label={
                  <span className="affiliate-edit-post-label">
                    <ImageIcon size={16} />
                    Featured image
                  </span>
                }
                value={form.featured_image}
                placeholder="Upload image or paste image URL"
                uploading={featuredUploading}
                onChange={(e) =>
                  handleChange({ target: { name: 'featured_image', value: e.target.value } })
                }
                onUpload={handleFeaturedImageUpload}
                inputRef={featuredInputRef}
                previewHeight={130}
              />

              <label className="affiliate-edit-post-field affiliate-edit-post-field-full">
                <span className="affiliate-edit-post-label">
                  <FileText size={16} />
                  Excerpt
                </span>
                <textarea
                  className="affiliate-edit-post-input affiliate-edit-post-textarea"
                  name="excerpt"
                  placeholder="Excerpt"
                  rows="3"
                  value={form.excerpt}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">SEO title</span>
                <input
                  className="affiliate-edit-post-input"
                  name="seo_title"
                  placeholder="SEO title"
                  value={form.seo_title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">Status</span>
                <select
                  className="affiliate-edit-post-input"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="affiliate-edit-post-field affiliate-edit-post-field-full">
                <span className="affiliate-edit-post-label">SEO description</span>
                <textarea
                  className="affiliate-edit-post-input affiliate-edit-post-textarea"
                  name="seo_description"
                  placeholder="SEO description"
                  rows="3"
                  value={form.seo_description}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="affiliate-edit-post-block">
              <div className="affiliate-edit-post-block-head">
                <div>
                  <p className="affiliate-edit-post-panel-kicker">Template fields</p>
                  <h3 className="affiliate-edit-post-block-title">
                    {activePreset ? 'Locked content blocks' : 'Content blocks'}
                  </h3>
                </div>

                {activePreset ? (
                  <div className="affiliate-edit-post-lock-note">
                    <Lock size={15} />
                    <span>Structure locked</span>
                  </div>
                ) : null}
              </div>

              {activePreset ? (
                <div className="affiliate-edit-post-preset-note">
                  <ShieldCheck size={16} />
                  <span>
                    All fields are compulsory. Replace every Lepresium value. Minimum words are enforced,
                    suggested maximum is shown only.
                  </span>
                </div>
              ) : null}

              <div className="affiliate-edit-post-stack">
                {Object.entries(groupedTemplateFields).map(([section, fields]) => (
                  <div key={section} className="affiliate-edit-post-section-group">
                    <div className="affiliate-edit-post-section-title">{section}</div>

                    <div className="affiliate-edit-post-stack">
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

                        const localReview = localFieldReviews[field.field_key];
                        const serverReview = serverFieldMap[field.field_key];

                        return (
                          <div key={field.field_key} className="affiliate-edit-post-card">
                            <div className="affiliate-edit-post-card-top">
                              <div className="affiliate-edit-post-chip">
                                {fieldMeta.label || field.field_key}
                              </div>

                              <div className={`affiliate-edit-post-score-pill ${getFieldScoreTone(serverReview?.quality_score ?? localReview?.score ?? 0)}`}>
                                Score {Math.round(serverReview?.quality_score ?? localReview?.score ?? 0)}
                              </div>

                              {fieldMeta.locked ? (
                                <div className="affiliate-edit-post-chip muted">
                                  <Lock size={13} />
                                  Locked slot
                                </div>
                              ) : null}
                            </div>

                            <div className="affiliate-edit-post-form-grid single">
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
                                <label className="affiliate-edit-post-field affiliate-edit-post-field-full">
                                  <span className="affiliate-edit-post-label">
                                    {fieldMeta.label || field.field_key}
                                  </span>

                                  {field.field_type === 'textarea' ? (
                                    <textarea
                                      className="affiliate-edit-post-input affiliate-edit-post-textarea"
                                      rows="4"
                                      placeholder={fieldMeta.placeholder || 'Enter value'}
                                      value={field.field_value}
                                      onChange={(e) =>
                                        handleTemplateFieldChange(field.__index, 'field_value', e.target.value)
                                      }
                                    />
                                  ) : (
                                    <input
                                      className="affiliate-edit-post-input"
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

                            <div className="affiliate-edit-post-field-meta">
                              <div>
                                {fieldMeta.helper_text || 'Required field'}
                                {wordInfo?.message ? (
                                  <div className="affiliate-edit-post-suggested-note">{wordInfo.message}</div>
                                ) : null}
                              </div>

                              {wordRule ? (
                                <div
                                  className={`affiliate-edit-post-word-rule ${
                                    wordInfo?.ok ? 'valid' : 'invalid'
                                  }`}
                                >
                                  <span>{getFieldWordRuleLabel(wordRule)}</span>
                                  <strong>{wordInfo?.count || 0} words</strong>
                                </div>
                              ) : (
                                <div className="affiliate-edit-post-required-tag">
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
            </div>

            <div className="affiliate-edit-post-block">
              <div className="affiliate-edit-post-block-head">
                <div>
                  <p className="affiliate-edit-post-panel-kicker">CTA buttons</p>
                  <h3 className="affiliate-edit-post-block-title">
                    {activePreset ? 'Locked action buttons' : 'Action buttons'}
                  </h3>
                </div>

                {activePreset ? (
                  <div className="affiliate-edit-post-lock-note">
                    <Lock size={15} />
                    <span>Button count locked</span>
                  </div>
                ) : null}
              </div>

              <div className="affiliate-edit-post-stack">
                {form.cta_buttons.map((button, index) => (
                  <div key={button.button_key || index} className="affiliate-edit-post-card">
                    <div className="affiliate-edit-post-card-top">
                      <div className="affiliate-edit-post-chip">
                        {button?.meta?.label || button.button_key}
                      </div>

                      {button?.meta?.locked ? (
                        <div className="affiliate-edit-post-chip muted">
                          <Lock size={13} />
                          Locked slot
                        </div>
                      ) : null}
                    </div>

                    <div className="affiliate-edit-post-form-grid">
                      <label className="affiliate-edit-post-field">
                        <span className="affiliate-edit-post-label">Button label</span>
                        <input
                          className="affiliate-edit-post-input"
                          placeholder="Button label"
                          value={button.button_label}
                          onChange={(e) => handleCtaChange(index, 'button_label', e.target.value)}
                        />
                      </label>

                      <label className="affiliate-edit-post-field">
                        <span className="affiliate-edit-post-label">Button style</span>
                        <select
                          className="affiliate-edit-post-input"
                          value={button.button_style}
                          onChange={(e) => handleCtaChange(index, 'button_style', e.target.value)}
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                        </select>
                      </label>

                      <label className="affiliate-edit-post-field affiliate-edit-post-field-full">
                        <span className="affiliate-edit-post-label">Button URL</span>
                        <input
                          className="affiliate-edit-post-input"
                          placeholder="Button URL"
                          value={button.button_url}
                          onChange={(e) => handleCtaChange(index, 'button_url', e.target.value)}
                        />
                      </label>

                      <label className="affiliate-edit-post-check">
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

                    <div className="affiliate-edit-post-field-meta">
                      <div>
                        {linkPermission.loaded
                          ? linkPermission.allow_external_links
                            ? 'Your current premium permission allows external links.'
                            : 'Your current plan uses Supgad-only link protection.'
                          : button?.meta?.helper_text || 'Required CTA button'}
                      </div>
                      <div className="affiliate-edit-post-required-tag">Required</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error ? (
              <div className="affiliate-edit-post-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="affiliate-edit-post-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}

            <div className="affiliate-edit-post-actions">
              <button className="affiliate-edit-post-btn primary" type="submit" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Update Post'}
              </button>

              <Link className="affiliate-edit-post-btn secondary" to="/affiliate/posts">
                View My Posts
              </Link>

              <button
                className="affiliate-edit-post-btn secondary"
                type="button"
                onClick={() => navigate('/affiliate/products')}
              >
                <ArrowLeft size={16} />
                Back to Products
              </button>
            </div>
          </form>
        </div>

        <div className="affiliate-edit-post-side-stack">
          <div className="affiliate-edit-post-panel">
            <div className="affiliate-edit-post-panel-head">
              <div>
                <p className="affiliate-edit-post-panel-kicker">Summary</p>
                <h2 className="affiliate-edit-post-panel-title">Post overview</h2>
              </div>
            </div>

            <div className="affiliate-edit-post-summary">
              <div className="affiliate-edit-post-summary-row">
                <span>Title</span>
                <strong>{form.title || '-'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Product</span>
                <strong>{selectedProduct?.title || '-'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Category</span>
                <strong>{selectedCategory?.name || '-'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Template</span>
                <strong>{selectedTemplate?.name || '-'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Mode</span>
                <strong>{activePreset ? 'Locked template editor' : 'Generic field editor'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Status</span>
                <strong>
                  <span className={getStatusClass(form.status)}>{form.status || '-'}</span>
                </strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Fields</span>
                <strong>{form.template_fields.length}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>CTA Buttons</span>
                <strong>{form.cta_buttons.length}</strong>
              </div>
            </div>
          </div>

          <div className="affiliate-edit-post-panel">
            <div className="affiliate-edit-post-panel-head">
              <div>
                <p className="affiliate-edit-post-panel-kicker">Live quality</p>
                <h2 className="affiliate-edit-post-panel-title">Score snapshot</h2>
              </div>
            </div>

            <div className="affiliate-edit-post-summary-card">
              <div className="affiliate-edit-post-summary-score">{overallLocalScore}</div>
              <div className="affiliate-edit-post-summary-line">
                {passedLocalFields}/{form.template_fields.length} fields currently passing
              </div>
            </div>

            <div className="affiliate-edit-post-summary">
              <div className="affiliate-edit-post-summary-row">
                <span>Total text words</span>
                <strong>{totalTextWords}</strong>
              </div>
              <div className="affiliate-edit-post-summary-row">
                <span>Similarity review</span>
                <strong>{totalTextWords >= 100 ? 'Ready on save' : 'Starts at 100 words'}</strong>
              </div>
              <div className="affiliate-edit-post-summary-row">
                <span>Minimum words</span>
                <strong>Enforced</strong>
              </div>
              <div className="affiliate-edit-post-summary-row">
                <span>Maximum words</span>
                <strong>Suggested only</strong>
              </div>
            </div>
          </div>

          <div className="affiliate-edit-post-panel">
            <div className="affiliate-edit-post-panel-head">
              <div>
                <p className="affiliate-edit-post-panel-kicker">Link policy</p>
                <h2 className="affiliate-edit-post-panel-title">Permission</h2>
              </div>
            </div>

            <div className="affiliate-edit-post-plan-note">
              {linkPermission.loaded
                ? linkPermission.allow_external_links
                  ? 'Premium external-link permission is active on your account.'
                  : 'Default Supgad-only link protection is active on your account.'
                : 'Your final link permission is checked by the backend when you save or publish.'}
            </div>
          </div>

          {qualityReview ? (
            <div className="affiliate-edit-post-panel">
              <div className="affiliate-edit-post-panel-head">
                <div>
                  <p className="affiliate-edit-post-panel-kicker">Latest server review</p>
                  <h2 className="affiliate-edit-post-panel-title">Review result</h2>
                </div>
              </div>

              <div className="affiliate-edit-post-summary">
                <div className="affiliate-edit-post-summary-row">
                  <span>Review status</span>
                  <strong>{qualityReview.review_status || '-'}</strong>
                </div>
                <div className="affiliate-edit-post-summary-row">
                  <span>Quality score</span>
                  <strong>{Math.round(qualityReview.quality_score || 0)}</strong>
                </div>
                <div className="affiliate-edit-post-summary-row">
                  <span>Risk score</span>
                  <strong>{Math.round(qualityReview.risk_score || 0)}</strong>
                </div>
                <div className="affiliate-edit-post-summary-row">
                  <span>Similarity score</span>
                  <strong>{Math.round(qualityReview.similarity_score || 0)}%</strong>
                </div>
                {qualityReview.blocked_reason ? (
                  <div className="affiliate-edit-post-server-warning">{qualityReview.blocked_reason}</div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="affiliate-edit-post-panel">
            <div className="affiliate-edit-post-panel-head">
              <div>
                <p className="affiliate-edit-post-panel-kicker">Preview</p>
                <h2 className="affiliate-edit-post-panel-title">Featured image</h2>
              </div>
            </div>

            {form.featured_image ? (
              <img
                src={form.featured_image}
                alt={form.title || 'Post preview'}
                className="affiliate-edit-post-preview-image"
              />
            ) : (
              <div className="affiliate-edit-post-preview-empty">
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

  .affiliate-edit-post-page {
    width: 100%;
  }

  .affiliate-edit-post-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-edit-post-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-edit-post-spinner,
  .affiliate-edit-post-spin {
    animation: affiliateEditPostSpin 0.8s linear infinite;
  }

  .affiliate-edit-post-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
  }

  @keyframes affiliateEditPostSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-edit-post-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-edit-post-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-edit-post-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-edit-post-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-edit-post-hero-actions,
  .affiliate-edit-post-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-edit-post-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-edit-post-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-edit-post-btn:disabled,
  .affiliate-edit-post-upload-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-edit-post-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 20px;
  }

  .affiliate-edit-post-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-edit-post-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-edit-post-panel-head,
  .affiliate-edit-post-block-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-edit-post-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-edit-post-panel-title,
  .affiliate-edit-post-block-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-edit-post-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-edit-post-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-edit-post-form-grid.single {
    grid-template-columns: 1fr;
  }

  .affiliate-edit-post-field,
  .affiliate-edit-post-upload-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-edit-post-field-full {
    grid-column: span 2;
  }

  .affiliate-edit-post-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-edit-post-input {
    width: 100%;
    min-height: 50px;
    border-radius: 16px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    padding: 0 14px;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: 0.2s ease;
  }

  .affiliate-edit-post-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-edit-post-textarea {
    min-height: 110px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-edit-post-upload-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .affiliate-edit-post-upload-btn {
    min-height: 50px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #111827;
    background: #111827;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
  }

  .affiliate-edit-post-inline-preview {
    width: 100%;
    padding: 10px;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    background: #f8fafc;
  }

  .affiliate-edit-post-block {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 22px;
    padding: 18px;
  }

  .affiliate-edit-post-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .affiliate-edit-post-section-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-edit-post-section-title {
    font-size: 14px;
    font-weight: 900;
    color: #111827;
    letter-spacing: 0.02em;
    padding: 2px 2px 0;
  }

  .affiliate-edit-post-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 16px;
  }

  .affiliate-edit-post-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  .affiliate-edit-post-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    color: #111827;
    font-size: 12px;
    font-weight: 800;
  }

  .affiliate-edit-post-chip.muted {
    color: #475467;
    background: #ffffff;
  }

  .affiliate-edit-post-check {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 50px;
    padding: 0 14px;
    border-radius: 16px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
  }

  .affiliate-edit-post-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-edit-post-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-edit-post-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-edit-post-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-edit-post-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-edit-post-summary-row span {
    color: #6b7280;
    font-weight: 700;
    font-size: 13px;
  }

  .affiliate-edit-post-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
    word-break: break-word;
  }

  .affiliate-edit-post-summary-card {
    border-radius: 20px;
    padding: 18px;
    background: linear-gradient(135deg, #111827 0%, #1d4ed8 100%);
    color: #ffffff;
    margin-bottom: 16px;
  }

  .affiliate-edit-post-summary-score {
    font-size: 44px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 8px;
  }

  .affiliate-edit-post-summary-line {
    font-size: 13px;
    color: rgba(255,255,255,0.85);
  }

  .affiliate-edit-post-score-pill {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    border: 1px solid transparent;
  }

  .affiliate-edit-post-score-pill.good,
  .affiliate-edit-post-review-state.good {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-edit-post-score-pill.warn,
  .affiliate-edit-post-review-state.warn {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-edit-post-score-pill.bad,
  .affiliate-edit-post-review-state.bad {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-edit-post-review-box {
    margin-top: 14px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-edit-post-review-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-edit-post-review-state {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    border: 1px solid transparent;
  }

  .affiliate-edit-post-review-meta {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-edit-post-review-message {
    font-size: 14px;
    color: #111827;
    font-weight: 800;
    line-height: 1.5;
  }

  .affiliate-edit-post-review-suggestion {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
  }

  .affiliate-edit-post-review-tag {
    display: inline-flex;
    width: fit-content;
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-size: 12px;
    font-weight: 800;
    align-items: center;
  }

  .affiliate-edit-post-plan-note,
  .affiliate-edit-post-server-warning {
    font-size: 13px;
    line-height: 1.7;
  }

  .affiliate-edit-post-plan-note {
    color: #6b7280;
  }

  .affiliate-edit-post-server-warning {
    color: #b42318;
    font-weight: 800;
    margin-top: 10px;
  }

  .affiliate-edit-post-status {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .affiliate-edit-post-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-edit-post-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-edit-post-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-edit-post-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-edit-post-preview-image,
  .affiliate-edit-post-preview-empty {
    width: 100%;
    height: 240px;
    border-radius: 18px;
    border: 1px solid #edf2f7;
    background: #f8fafc;
  }

  .affiliate-edit-post-preview-image {
    object-fit: cover;
    display: block;
  }

  .affiliate-edit-post-preview-empty {
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-edit-post-lock-note {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 12px;
    font-weight: 800;
  }

  .affiliate-edit-post-preset-note {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 14px;
  }

  .affiliate-edit-post-field-meta {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 12px;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-edit-post-suggested-note {
    margin-top: 4px;
    color: #b45309;
    font-weight: 700;
  }

  .affiliate-edit-post-word-rule {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    border: 1px solid transparent;
  }

  .affiliate-edit-post-word-rule.valid {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-edit-post-word-rule.invalid {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-edit-post-required-tag {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    color: #111827;
    font-size: 12px;
    font-weight: 800;
  }

  @media (max-width: 1100px) {
    .affiliate-edit-post-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-edit-post-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-edit-post-title {
      font-size: 26px;
    }

    .affiliate-edit-post-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-edit-post-title {
      font-size: 22px;
    }

    .affiliate-edit-post-subtitle {
      font-size: 14px;
    }

    .affiliate-edit-post-form-grid,
    .affiliate-edit-post-upload-row {
      grid-template-columns: 1fr;
    }

    .affiliate-edit-post-field-full {
      grid-column: span 1;
    }

    .affiliate-edit-post-hero-actions,
    .affiliate-edit-post-actions,
    .affiliate-edit-post-block-head {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-edit-post-btn,
    .affiliate-edit-post-upload-btn {
      width: 100%;
    }

    .affiliate-edit-post-summary-row,
    .affiliate-edit-post-card-top,
    .affiliate-edit-post-field-meta,
    .affiliate-edit-post-review-top {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-edit-post-score-pill {
      margin-left: 0;
    }
  }
`;