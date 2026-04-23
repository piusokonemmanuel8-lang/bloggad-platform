import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

export default function AffiliateCreatePostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const presetProductId = searchParams.get('product_id') || '';
  const presetTemplateId = searchParams.get('template_id') || '';

  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    product_id: presetProductId,
    category_id: '',
    template_id: presetTemplateId,
    title: '',
    slug: '',
    excerpt: '',
    seo_title: '',
    seo_description: '',
    featured_image: '',
    status: 'draft',
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

    setForm((prev) => {
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

      const { data } = await api.post('/api/affiliate/posts', payload);
      applyServerResponseMeta(data);

      if (data?.ok && data?.post?.id) {
        setSuccess('Post created successfully. Redirecting...');
        setTimeout(() => {
          navigate(`/affiliate/posts/${data.post.id}/edit`);
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

      <section className="affiliate-create-post-hero">
        <div className="affiliate-create-post-hero-copy">
          <div className="affiliate-create-post-badge">Post creator</div>
          <h1 className="affiliate-create-post-title">Create Post</h1>
          <p className="affiliate-create-post-subtitle">
            {activePreset
              ? 'This template is locked. Replace every Lepresium field, image, and CTA before saving.'
              : 'Choose a template and fill in the content blocks for this product post.'}
          </p>
        </div>

        <div className="affiliate-create-post-hero-actions">
          <button
            className="affiliate-create-post-btn secondary"
            type="button"
            onClick={() => navigate('/affiliate/products')}
          >
            Back to Products
          </button>
        </div>
      </section>

      <section className="affiliate-create-post-grid">
        <div className="affiliate-create-post-panel affiliate-create-post-panel-main">
          <div className="affiliate-create-post-panel-head">
            <div>
              <p className="affiliate-create-post-panel-kicker">Post details</p>
              <h2 className="affiliate-create-post-panel-title">Create content</h2>
            </div>
          </div>

          <form className="affiliate-create-post-form" onSubmit={handleSubmit}>
            <div className="affiliate-create-post-form-grid">
              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <Package size={16} />
                  Product
                </span>
                <select
                  className="affiliate-create-post-input"
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
                                  {wordRule ? ` • ${getFieldWordRuleLabel(wordRule)}` : ''}
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
            </div>

            <div className="affiliate-create-post-block">
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
                        {linkPermission.loaded
                          ? linkPermission.allow_external_links
                            ? 'Your current premium permission allows external links.'
                            : 'Your current plan uses Supgad-only link protection.'
                          : 'Final link permission is checked on save based on your current plan.'}
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

              <Link className="affiliate-create-post-btn secondary" to="/affiliate/posts">
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
                <strong>{activePreset ? 'Locked template editor' : 'Generic field editor'}</strong>
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

          <div className="affiliate-create-post-panel">
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
                Total text words: {totalTextWords} • Similarity review starts fully from 100 words
              </div>
            </div>
          </div>

          <div className="affiliate-create-post-panel">
            <div className="affiliate-create-post-panel-head">
              <div>
                <p className="affiliate-create-post-panel-kicker">Link policy</p>
                <h2 className="affiliate-create-post-panel-title">Plan permission</h2>
              </div>
            </div>

            <div className="affiliate-create-post-summary">
              <div className="affiliate-create-post-plan-note">
                {linkPermission.loaded
                  ? linkPermission.allow_external_links
                    ? 'Premium external-link permission is active on your account.'
                    : 'Default Supgad-only link protection is active on your account.'
                  : 'Backend checks your live plan on save or publish.'}
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
  }

  .affiliate-create-post-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-create-post-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-create-post-spinner,
  .affiliate-create-post-spin {
    animation: affiliateCreatePostSpin 0.8s linear infinite;
  }

  .affiliate-create-post-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
  }

  @keyframes affiliateCreatePostSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-create-post-hero {
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

  .affiliate-create-post-badge {
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

  .affiliate-create-post-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-create-post-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-create-post-hero-actions,
  .affiliate-create-post-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-create-post-btn {
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

  .affiliate-create-post-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-create-post-btn:disabled,
  .affiliate-create-post-upload-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-create-post-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 20px;
  }

  .affiliate-create-post-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-create-post-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-create-post-panel-head,
  .affiliate-create-post-block-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-create-post-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-create-post-panel-title,
  .affiliate-create-post-block-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-create-post-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-create-post-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-create-post-form-grid.single {
    grid-template-columns: 1fr;
  }

  .affiliate-create-post-field,
  .affiliate-create-post-upload-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-create-post-field-full {
    grid-column: span 2;
  }

  .affiliate-create-post-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-create-post-input {
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

  .affiliate-create-post-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-create-post-textarea {
    min-height: 110px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-create-post-upload-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .affiliate-create-post-upload-btn {
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

  .affiliate-create-post-inline-preview {
    width: 100%;
    padding: 10px;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    background: #f8fafc;
  }

  .affiliate-create-post-block {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 22px;
    padding: 18px;
  }

  .affiliate-create-post-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .affiliate-create-post-section-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-post-section-title {
    font-size: 14px;
    font-weight: 900;
    color: #111827;
    letter-spacing: 0.02em;
    padding: 2px 2px 0;
  }

  .affiliate-create-post-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 16px;
  }

  .affiliate-create-post-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  .affiliate-create-post-chip {
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

  .affiliate-create-post-chip.muted {
    color: #475467;
    background: #ffffff;
  }

  .affiliate-create-post-check {
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

  .affiliate-create-post-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-create-post-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-create-post-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-create-post-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-post-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-create-post-summary-row span {
    color: #6b7280;
    font-weight: 700;
    font-size: 13px;
  }

  .affiliate-create-post-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
    word-break: break-word;
  }

  .affiliate-create-post-status {
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

  .affiliate-create-post-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-create-post-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-create-post-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-create-post-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-create-post-preview-image,
  .affiliate-create-post-preview-empty {
    width: 100%;
    height: 240px;
    border-radius: 18px;
    border: 1px solid #edf2f7;
    background: #f8fafc;
  }

  .affiliate-create-post-preview-image {
    object-fit: cover;
    display: block;
  }

  .affiliate-create-post-preview-empty {
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-create-post-lock-note {
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

  .affiliate-create-post-preset-note {
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

  .affiliate-create-post-field-meta {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 12px;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-create-post-suggested-note {
    margin-top: 4px;
    color: #b45309;
    font-weight: 700;
  }

  .affiliate-create-post-word-rule {
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

  .affiliate-create-post-word-rule.valid {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-create-post-word-rule.invalid {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-create-post-required-tag {
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

  .affiliate-create-post-score-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }

  .affiliate-create-post-score-pill.good,
  .affiliate-create-post-review-state.good {
    background: #ecfdf3;
    color: #166534;
  }

  .affiliate-create-post-score-pill.warn,
  .affiliate-create-post-review-state.warn {
    background: #fff7e6;
    color: #9a6700;
  }

  .affiliate-create-post-score-pill.bad,
  .affiliate-create-post-review-state.bad {
    background: #fff1f2;
    color: #b42318;
  }

  .affiliate-create-post-review-box {
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 18px;
    padding: 14px;
    display: grid;
    gap: 8px;
  }

  .affiliate-create-post-review-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-create-post-review-state {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
  }

  .affiliate-create-post-review-meta {
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
  }

  .affiliate-create-post-review-message {
    font-size: 14px;
    line-height: 1.6;
    color: #111827;
    font-weight: 800;
  }

  .affiliate-create-post-review-suggestion {
    font-size: 13px;
    line-height: 1.6;
    color: #6b7280;
  }

  .affiliate-create-post-review-tag {
    display: inline-flex;
    align-items: center;
    width: max-content;
    padding: 6px 10px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-size: 12px;
    font-weight: 800;
  }

  .affiliate-create-post-quality-box {
    border-radius: 24px;
    padding: 22px;
    background: linear-gradient(135deg, #111827 0%, #1d4ed8 100%);
    color: #ffffff;
  }

  .affiliate-create-post-quality-score {
    font-size: 52px;
    line-height: 1;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .affiliate-create-post-quality-text {
    font-size: 14px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.92);
    margin-bottom: 8px;
  }

  .affiliate-create-post-quality-meta,
  .affiliate-create-post-plan-note,
  .affiliate-create-post-server-warning {
    font-size: 13px;
    line-height: 1.7;
  }

  .affiliate-create-post-quality-meta,
  .affiliate-create-post-plan-note {
    color: rgba(255, 255, 255, 0.82);
  }

  .affiliate-create-post-server-warning {
    color: #b42318;
    font-weight: 800;
    margin-top: 10px;
  }

  @media (max-width: 1100px) {
    .affiliate-create-post-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-create-post-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-create-post-title {
      font-size: 26px;
    }

    .affiliate-create-post-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-create-post-title {
      font-size: 22px;
    }

    .affiliate-create-post-subtitle {
      font-size: 14px;
    }

    .affiliate-create-post-form-grid,
    .affiliate-create-post-upload-row {
      grid-template-columns: 1fr;
    }

    .affiliate-create-post-field-full {
      grid-column: span 1;
    }

    .affiliate-create-post-hero-actions,
    .affiliate-create-post-actions,
    .affiliate-create-post-block-head {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-create-post-btn,
    .affiliate-create-post-upload-btn {
      width: 100%;
    }

    .affiliate-create-post-summary-row,
    .affiliate-create-post-card-top,
    .affiliate-create-post-field-meta {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;