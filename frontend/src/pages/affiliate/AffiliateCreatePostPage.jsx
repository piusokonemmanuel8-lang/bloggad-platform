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
import validateSupgadUrl from '../../utils/validateSupgadUrl';

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

function makeLepresiumWords(count) {
  return Array.from({ length: count }, () => 'Lepresium').join(' ');
}

function makeLepresiumSentence(minWords, maxWords) {
  const target = minWords === maxWords ? minWords : maxWords;
  return makeLepresiumWords(target);
}

function makeLepresiumUrl() {
  return 'https://supgad.com/lepresium';
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

function buildField({
  field_key,
  field_type = 'text',
  label,
  section,
  helper_text = '',
  required = true,
  word_rule = null,
  default_value = '',
  placeholder = '',
  sort_order,
}) {
  return {
    field_key,
    field_type,
    field_value: default_value,
    sort_order,
    meta: {
      label,
      section,
      helper_text,
      required,
      word_rule,
      placeholder,
      locked: true,
    },
  };
}

function buildButton({
  button_key,
  button_label,
  button_style = 'primary',
  label,
  helper_text = '',
  required = true,
  sort_order,
}) {
  return {
    button_key,
    button_label,
    button_url: makeLepresiumUrl(),
    button_style,
    open_in_new_tab: true,
    sort_order,
    meta: {
      label,
      helper_text,
      required,
      locked: true,
    },
  };
}

function createNeutralReviewTemplatePreset() {
  const fields = [
    buildField({
      field_key: 'top_bar_title',
      field_type: 'text',
      label: 'Top bar title',
      section: 'Top bar',
      helper_text: 'Full-width announcement text.',
      word_rule: { mode: 'exact', exact_words: 11, label: 'Top bar title' },
      default_value: makeLepresiumSentence(11, 11),
      placeholder: 'Enter exactly 11 words',
      sort_order: 1,
    }),
    buildField({
      field_key: 'hero_product_image',
      field_type: 'image',
      label: 'Hero product image',
      section: 'Hero left column',
      helper_text: 'Required main image. Keep same visual proportion.',
      default_value: '',
      placeholder: 'Upload image or paste image URL',
      sort_order: 2,
    }),
    buildField({
      field_key: 'hero_review_text',
      field_type: 'text',
      label: 'Hero review text',
      section: 'Hero left column',
      helper_text: 'Review count text beside stars.',
      word_rule: { mode: 'range', min_words: 2, max_words: 4, label: 'Hero review text' },
      default_value: makeLepresiumSentence(4, 4),
      placeholder: 'Enter at least 2 words',
      sort_order: 3,
    }),
    buildField({
      field_key: 'hero_certification_image',
      field_type: 'image',
      label: 'Hero certification strip image',
      section: 'Hero left column',
      helper_text: 'Required certification/badge image.',
      default_value: '',
      placeholder: 'Upload image or paste image URL',
      sort_order: 4,
    }),
    buildField({
      field_key: 'hero_title',
      field_type: 'text',
      label: 'Hero title',
      section: 'Hero right column',
      helper_text: 'Main headline.',
      word_rule: { mode: 'range', min_words: 10, max_words: 12, label: 'Hero title' },
      default_value: makeLepresiumSentence(12, 12),
      placeholder: 'Enter at least 10 words',
      sort_order: 5,
    }),
    buildField({
      field_key: 'hero_intro_paragraph_1',
      field_type: 'textarea',
      label: 'Hero intro paragraph 1',
      section: 'Hero right column',
      helper_text: 'First intro paragraph.',
      word_rule: { mode: 'range', min_words: 30, max_words: 38, label: 'Hero intro paragraph 1' },
      default_value: makeLepresiumSentence(38, 38),
      placeholder: 'Enter at least 30 words',
      sort_order: 6,
    }),
    buildField({
      field_key: 'hero_intro_paragraph_2',
      field_type: 'textarea',
      label: 'Hero intro paragraph 2',
      section: 'Hero right column',
      helper_text: 'Second intro paragraph.',
      word_rule: { mode: 'range', min_words: 34, max_words: 42, label: 'Hero intro paragraph 2' },
      default_value: makeLepresiumSentence(42, 42),
      placeholder: 'Enter at least 34 words',
      sort_order: 7,
    }),
    buildField({
      field_key: 'hero_small_cta_line',
      field_type: 'text',
      label: 'Hero small CTA line',
      section: 'Hero right column',
      helper_text: 'Short underlined line above buttons.',
      word_rule: { mode: 'exact', exact_words: 7, label: 'Hero small CTA line' },
      default_value: makeLepresiumSentence(7, 7),
      placeholder: 'Enter exactly 7 words',
      sort_order: 8,
    }),
    buildField({
      field_key: 'hero_trust_item_1',
      field_type: 'text',
      label: 'Hero trust item 1',
      section: 'Hero right column',
      helper_text: 'First trust item under hero buttons.',
      word_rule: { mode: 'exact', exact_words: 2, label: 'Hero trust item 1' },
      default_value: makeLepresiumSentence(2, 2),
      placeholder: 'Enter exactly 2 words',
      sort_order: 9,
    }),
    buildField({
      field_key: 'hero_trust_item_2',
      field_type: 'text',
      label: 'Hero trust item 2',
      section: 'Hero right column',
      helper_text: 'Second trust item under hero buttons.',
      word_rule: { mode: 'exact', exact_words: 2, label: 'Hero trust item 2' },
      default_value: makeLepresiumSentence(2, 2),
      placeholder: 'Enter exactly 2 words',
      sort_order: 10,
    }),
    buildField({
      field_key: 'hero_trust_item_3',
      field_type: 'text',
      label: 'Hero trust item 3',
      section: 'Hero right column',
      helper_text: 'Third trust item under hero buttons.',
      word_rule: { mode: 'exact', exact_words: 2, label: 'Hero trust item 3' },
      default_value: makeLepresiumSentence(2, 2),
      placeholder: 'Enter exactly 2 words',
      sort_order: 11,
    }),
    buildField({
      field_key: 'how_this_product_works_title',
      field_type: 'text',
      label: 'How This Product Works title',
      section: 'How this product works',
      helper_text: 'Neutral section title.',
      word_rule: { mode: 'exact', exact_words: 4, label: 'How This Product Works title' },
      default_value: 'How This Product Works',
      placeholder: 'Enter exactly 4 words',
      sort_order: 12,
    }),
    buildField({
      field_key: 'how_this_product_works_paragraph_1',
      field_type: 'textarea',
      label: 'How this product works paragraph 1',
      section: 'How this product works',
      helper_text: 'Required paragraph.',
      word_rule: {
        mode: 'range',
        min_words: 18,
        max_words: 24,
        label: 'How this product works paragraph 1',
      },
      default_value: makeLepresiumSentence(24, 24),
      placeholder: 'Enter at least 18 words',
      sort_order: 13,
    }),
    buildField({
      field_key: 'how_this_product_works_paragraph_2',
      field_type: 'textarea',
      label: 'How this product works paragraph 2',
      section: 'How this product works',
      helper_text: 'Required paragraph.',
      word_rule: {
        mode: 'range',
        min_words: 22,
        max_words: 30,
        label: 'How this product works paragraph 2',
      },
      default_value: makeLepresiumSentence(30, 30),
      placeholder: 'Enter at least 22 words',
      sort_order: 14,
    }),
    buildField({
      field_key: 'how_this_product_works_paragraph_3',
      field_type: 'textarea',
      label: 'How this product works paragraph 3',
      section: 'How this product works',
      helper_text: 'Required paragraph.',
      word_rule: {
        mode: 'range',
        min_words: 24,
        max_words: 34,
        label: 'How this product works paragraph 3',
      },
      default_value: makeLepresiumSentence(34, 34),
      placeholder: 'Enter at least 24 words',
      sort_order: 15,
    }),
    buildField({
      field_key: 'how_this_product_works_image',
      field_type: 'image',
      label: 'How this product works image',
      section: 'How this product works',
      helper_text: 'Required right-side image.',
      default_value: '',
      placeholder: 'Upload image or paste image URL',
      sort_order: 16,
    }),
    buildField({
      field_key: 'ingredients_section_title',
      field_type: 'text',
      label: 'Ingredients section title',
      section: 'Ingredients / blend',
      helper_text: 'Neutral section heading.',
      word_rule: { mode: 'range', min_words: 6, max_words: 10, label: 'Ingredients section title' },
      default_value: makeLepresiumSentence(8, 8),
      placeholder: 'Enter at least 6 words',
      sort_order: 17,
    }),
    buildField({
      field_key: 'ingredients_intro',
      field_type: 'textarea',
      label: 'Ingredients intro',
      section: 'Ingredients / blend',
      helper_text: 'Short intro paragraph.',
      word_rule: { mode: 'range', min_words: 14, max_words: 18, label: 'Ingredients intro' },
      default_value: makeLepresiumSentence(18, 18),
      placeholder: 'Enter at least 14 words',
      sort_order: 18,
    }),
    ...Array.from({ length: 5 }, (_, index) => {
      const i = index + 1;
      return [
        buildField({
          field_key: `ingredient_${i}_title`,
          field_type: 'text',
          label: `Ingredient ${i} title`,
          section: 'Ingredients / blend',
          helper_text: 'Ingredient item title.',
          word_rule: { mode: 'range', min_words: 1, max_words: 4, label: `Ingredient ${i} title` },
          default_value: makeLepresiumSentence(3, 3),
          placeholder: 'Enter at least 1 word',
          sort_order: 18 + i * 2 - 1,
        }),
        buildField({
          field_key: `ingredient_${i}_text`,
          field_type: 'text',
          label: `Ingredient ${i} text`,
          section: 'Ingredients / blend',
          helper_text: 'Ingredient support text.',
          word_rule: { mode: 'range', min_words: 5, max_words: 9, label: `Ingredient ${i} text` },
          default_value: makeLepresiumSentence(9, 9),
          placeholder: 'Enter at least 5 words',
          sort_order: 18 + i * 2,
        }),
      ];
    }).flat(),
    buildField({
      field_key: 'ingredients_closing_line',
      field_type: 'textarea',
      label: 'Ingredients closing line',
      section: 'Ingredients / blend',
      helper_text: 'Closing support line.',
      word_rule: { mode: 'range', min_words: 14, max_words: 18, label: 'Ingredients closing line' },
      default_value: makeLepresiumSentence(18, 18),
      placeholder: 'Enter at least 14 words',
      sort_order: 29,
    }),
    buildField({
      field_key: 'ingredients_image',
      field_type: 'image',
      label: 'Ingredients image',
      section: 'Ingredients / blend',
      helper_text: 'Required image.',
      default_value: '',
      placeholder: 'Upload image or paste image URL',
      sort_order: 30,
    }),
    buildField({
      field_key: 'what_makes_this_product_different_title',
      field_type: 'text',
      label: 'What makes this product different title',
      section: 'What makes this product different',
      helper_text: 'Neutral section title.',
      word_rule: {
        mode: 'range',
        min_words: 5,
        max_words: 7,
        label: 'What makes this product different title',
      },
      default_value: 'What Makes This Product Different',
      placeholder: 'Enter at least 5 words',
      sort_order: 31,
    }),
    buildField({
      field_key: 'difference_intro',
      field_type: 'textarea',
      label: 'Difference intro',
      section: 'What makes this product different',
      helper_text: 'Intro paragraph.',
      word_rule: { mode: 'range', min_words: 26, max_words: 34, label: 'Difference intro' },
      default_value: makeLepresiumSentence(34, 34),
      placeholder: 'Enter at least 26 words',
      sort_order: 32,
    }),
    ...Array.from({ length: 4 }, (_, index) => {
      const i = index + 1;
      return [
        buildField({
          field_key: `difference_item_${i}_title`,
          field_type: 'text',
          label: `Difference item ${i} title`,
          section: 'What makes this product different',
          helper_text: 'Feature mini heading.',
          word_rule: {
            mode: 'range',
            min_words: 4,
            max_words: 6,
            label: `Difference item ${i} title`,
          },
          default_value: makeLepresiumSentence(6, 6),
          placeholder: 'Enter at least 4 words',
          sort_order: 32 + i * 2 - 1,
        }),
        buildField({
          field_key: `difference_item_${i}_text`,
          field_type: 'textarea',
          label: `Difference item ${i} text`,
          section: 'What makes this product different',
          helper_text: 'Feature paragraph.',
          word_rule: {
            mode: 'range',
            min_words: 20,
            max_words: 36,
            label: `Difference item ${i} text`,
          },
          default_value: makeLepresiumSentence(36, 36),
          placeholder: 'Enter at least 20 words',
          sort_order: 32 + i * 2,
        }),
      ];
    }).flat(),
    buildField({
      field_key: 'benefits_title',
      field_type: 'text',
      label: 'Benefits title',
      section: 'Benefits',
      helper_text: 'Section title.',
      word_rule: { mode: 'range', min_words: 3, max_words: 5, label: 'Benefits title' },
      default_value: 'Benefits Of This Product',
      placeholder: 'Enter at least 3 words',
      sort_order: 41,
    }),
    buildField({
      field_key: 'benefits_intro',
      field_type: 'textarea',
      label: 'Benefits intro',
      section: 'Benefits',
      helper_text: 'Intro paragraph.',
      word_rule: { mode: 'range', min_words: 24, max_words: 30, label: 'Benefits intro' },
      default_value: makeLepresiumSentence(30, 30),
      placeholder: 'Enter at least 24 words',
      sort_order: 42,
    }),
    ...Array.from({ length: 7 }, (_, index) => {
      const i = index + 1;
      return [
        buildField({
          field_key: `benefit_${i}_title`,
          field_type: 'text',
          label: `Benefit ${i} title`,
          section: 'Benefits',
          helper_text: 'Benefit title.',
          word_rule: { mode: 'range', min_words: 3, max_words: 5, label: `Benefit ${i} title` },
          default_value: makeLepresiumSentence(4, 4),
          placeholder: 'Enter at least 3 words',
          sort_order: 42 + i * 2 - 1,
        }),
        buildField({
          field_key: `benefit_${i}_text`,
          field_type: 'text',
          label: `Benefit ${i} text`,
          section: 'Benefits',
          helper_text: 'Benefit short support line.',
          word_rule: { mode: 'range', min_words: 10, max_words: 16, label: `Benefit ${i} text` },
          default_value: makeLepresiumSentence(16, 16),
          placeholder: 'Enter at least 10 words',
          sort_order: 42 + i * 2,
        }),
      ];
    }).flat(),
    buildField({
      field_key: 'benefits_closing_line',
      field_type: 'textarea',
      label: 'Benefits closing line',
      section: 'Benefits',
      helper_text: 'Closing line under benefits.',
      word_rule: { mode: 'range', min_words: 18, max_words: 22, label: 'Benefits closing line' },
      default_value: makeLepresiumSentence(22, 22),
      placeholder: 'Enter at least 18 words',
      sort_order: 57,
    }),
    buildField({
      field_key: 'testimonials_title',
      field_type: 'text',
      label: 'Testimonials title',
      section: 'Testimonials',
      helper_text: 'Section title.',
      word_rule: { mode: 'range', min_words: 4, max_words: 6, label: 'Testimonials title' },
      default_value: makeLepresiumSentence(5, 5),
      placeholder: 'Enter at least 4 words',
      sort_order: 58,
    }),
    ...Array.from({ length: 3 }, (_, index) => {
      const i = index + 1;
      return [
        buildField({
          field_key: `testimonial_${i}_image`,
          field_type: 'image',
          label: `Testimonial ${i} image`,
          section: 'Testimonials',
          helper_text: 'Required reviewer image.',
          default_value: '',
          placeholder: 'Upload image or paste image URL',
          sort_order: 58 + i * 3 - 2,
        }),
        buildField({
          field_key: `testimonial_${i}_name_line`,
          field_type: 'text',
          label: `Testimonial ${i} name line`,
          section: 'Testimonials',
          helper_text: 'Name/location line.',
          word_rule: {
            mode: 'range',
            min_words: 3,
            max_words: 5,
            label: `Testimonial ${i} name line`,
          },
          default_value: makeLepresiumSentence(5, 5),
          placeholder: 'Enter at least 3 words',
          sort_order: 58 + i * 3 - 1,
        }),
        buildField({
          field_key: `testimonial_${i}_text`,
          field_type: 'textarea',
          label: `Testimonial ${i} text`,
          section: 'Testimonials',
          helper_text: 'Required testimonial content.',
          word_rule: {
            mode: 'range',
            min_words: 24,
            max_words: 40,
            label: `Testimonial ${i} text`,
          },
          default_value: makeLepresiumSentence(40, 40),
          placeholder: 'Enter at least 24 words',
          sort_order: 58 + i * 3,
        }),
      ];
    }).flat(),
    buildField({
      field_key: 'pricing_title',
      field_type: 'text',
      label: 'Pricing section title',
      section: 'Pricing',
      helper_text: 'Section title.',
      word_rule: { mode: 'range', min_words: 6, max_words: 10, label: 'Pricing section title' },
      default_value: makeLepresiumSentence(8, 8),
      placeholder: 'Enter at least 6 words',
      sort_order: 68,
    }),
    ...Array.from({ length: 3 }, (_, index) => {
      const i = index + 1;
      return [
        buildField({
          field_key: `pricing_card_${i}_package_title`,
          field_type: 'text',
          label: `Pricing card ${i} package title`,
          section: 'Pricing',
          helper_text: 'Package title.',
          word_rule: {
            mode: 'exact',
            exact_words: 3,
            label: `Pricing card ${i} package title`,
          },
          default_value: makeLepresiumSentence(3, 3),
          placeholder: 'Enter exactly 3 words',
          sort_order: 68 + i * 6 - 5,
        }),
        buildField({
          field_key: `pricing_card_${i}_supply_label`,
          field_type: 'text',
          label: `Pricing card ${i} supply label`,
          section: 'Pricing',
          helper_text: 'Supply label.',
          word_rule: {
            mode: 'exact',
            exact_words: 3,
            label: `Pricing card ${i} supply label`,
          },
          default_value: makeLepresiumSentence(3, 3),
          placeholder: 'Enter exactly 3 words',
          sort_order: 68 + i * 6 - 4,
        }),
        buildField({
          field_key: `pricing_card_${i}_image`,
          field_type: 'image',
          label: `Pricing card ${i} image`,
          section: 'Pricing',
          helper_text: 'Required pack image.',
          default_value: '',
          placeholder: 'Upload image or paste image URL',
          sort_order: 68 + i * 6 - 3,
        }),
        buildField({
          field_key: `pricing_card_${i}_price_text`,
          field_type: 'text',
          label: `Pricing card ${i} price text`,
          section: 'Pricing',
          helper_text: 'Price display text.',
          word_rule: {
            mode: 'range',
            min_words: 1,
            max_words: 3,
            label: `Pricing card ${i} price text`,
          },
          default_value: makeLepresiumSentence(2, 2),
          placeholder: 'Enter at least 1 word',
          sort_order: 68 + i * 6 - 2,
        }),
        buildField({
          field_key: `pricing_card_${i}_total_text`,
          field_type: 'text',
          label: `Pricing card ${i} total text`,
          section: 'Pricing',
          helper_text: 'Total line text.',
          word_rule: {
            mode: 'range',
            min_words: 2,
            max_words: 5,
            label: `Pricing card ${i} total text`,
          },
          default_value: makeLepresiumSentence(4, 4),
          placeholder: 'Enter at least 2 words',
          sort_order: 68 + i * 6 - 1,
        }),
        buildField({
          field_key: `pricing_card_${i}_payments_image`,
          field_type: 'image',
          label: `Pricing card ${i} payments image`,
          section: 'Pricing',
          helper_text: 'Required payment methods strip.',
          default_value: '',
          placeholder: 'Upload image or paste image URL',
          sort_order: 68 + i * 6,
        }),
      ];
    }).flat(),
    buildField({
      field_key: 'bonus_section_title',
      field_type: 'text',
      label: 'Bonus section title',
      section: 'Bonuses',
      helper_text: 'Bonus section heading.',
      word_rule: { mode: 'range', min_words: 6, max_words: 10, label: 'Bonus section title' },
      default_value: makeLepresiumSentence(8, 8),
      placeholder: 'Enter at least 6 words',
      sort_order: 87,
    }),
    ...Array.from({ length: 3 }, (_, index) => {
      const i = index + 1;
      return [
        buildField({
          field_key: `bonus_${i}_image`,
          field_type: 'image',
          label: `Bonus ${i} image`,
          section: 'Bonuses',
          helper_text: 'Required bonus image.',
          default_value: '',
          placeholder: 'Upload image or paste image URL',
          sort_order: 87 + i * 4 - 3,
        }),
        buildField({
          field_key: `bonus_${i}_title`,
          field_type: 'text',
          label: `Bonus ${i} title`,
          section: 'Bonuses',
          helper_text: 'Bonus title.',
          word_rule: { mode: 'range', min_words: 4, max_words: 8, label: `Bonus ${i} title` },
          default_value: makeLepresiumSentence(8, 8),
          placeholder: 'Enter at least 4 words',
          sort_order: 87 + i * 4 - 2,
        }),
        buildField({
          field_key: `bonus_${i}_price_line`,
          field_type: 'text',
          label: `Bonus ${i} price line`,
          section: 'Bonuses',
          helper_text: 'Price/free line.',
          word_rule: { mode: 'range', min_words: 2, max_words: 6, label: `Bonus ${i} price line` },
          default_value: makeLepresiumSentence(4, 4),
          placeholder: 'Enter at least 2 words',
          sort_order: 87 + i * 4 - 1,
        }),
        buildField({
          field_key: `bonus_${i}_text`,
          field_type: 'textarea',
          label: `Bonus ${i} text`,
          section: 'Bonuses',
          helper_text: 'Bonus description.',
          word_rule: { mode: 'range', min_words: 18, max_words: 28, label: `Bonus ${i} text` },
          default_value: makeLepresiumSentence(28, 28),
          placeholder: 'Enter at least 18 words',
          sort_order: 87 + i * 4,
        }),
      ];
    }).flat(),
    buildField({
      field_key: 'faq_section_title',
      field_type: 'text',
      label: 'FAQ section title',
      section: 'FAQ',
      helper_text: 'FAQ section heading.',
      word_rule: { mode: 'range', min_words: 2, max_words: 5, label: 'FAQ section title' },
      default_value: 'This Product FAQ',
      placeholder: 'Enter at least 2 words',
      sort_order: 100,
    }),
    ...Array.from({ length: 10 }, (_, index) => {
      const i = index + 1;
      return [
        buildField({
          field_key: `faq_${i}_question`,
          field_type: 'text',
          label: `FAQ ${i} question`,
          section: 'FAQ',
          helper_text: 'Required question.',
          word_rule: { mode: 'range', min_words: 4, max_words: 9, label: `FAQ ${i} question` },
          default_value: makeLepresiumSentence(7, 7),
          placeholder: 'Enter at least 4 words',
          sort_order: 100 + i * 2 - 1,
        }),
        buildField({
          field_key: `faq_${i}_answer`,
          field_type: 'textarea',
          label: `FAQ ${i} answer`,
          section: 'FAQ',
          helper_text: 'Required answer.',
          word_rule: { mode: 'range', min_words: 12, max_words: 24, label: `FAQ ${i} answer` },
          default_value: makeLepresiumSentence(24, 24),
          placeholder: 'Enter at least 12 words',
          sort_order: 100 + i * 2,
        }),
      ];
    }).flat(),
    buildField({
      field_key: 'guarantee_badge_image',
      field_type: 'image',
      label: 'Guarantee badge image',
      section: 'Guarantee',
      helper_text: 'Required guarantee badge.',
      default_value: '',
      placeholder: 'Upload image or paste image URL',
      sort_order: 121,
    }),
    buildField({
      field_key: 'guarantee_title',
      field_type: 'text',
      label: 'Guarantee title',
      section: 'Guarantee',
      helper_text: 'Guarantee heading.',
      word_rule: { mode: 'range', min_words: 6, max_words: 8, label: 'Guarantee title' },
      default_value: makeLepresiumSentence(8, 8),
      placeholder: 'Enter at least 6 words',
      sort_order: 122,
    }),
    buildField({
      field_key: 'guarantee_paragraph_1',
      field_type: 'textarea',
      label: 'Guarantee paragraph 1',
      section: 'Guarantee',
      helper_text: 'Required paragraph.',
      word_rule: { mode: 'range', min_words: 28, max_words: 38, label: 'Guarantee paragraph 1' },
      default_value: makeLepresiumSentence(38, 38),
      placeholder: 'Enter at least 28 words',
      sort_order: 123,
    }),
    buildField({
      field_key: 'guarantee_paragraph_2',
      field_type: 'textarea',
      label: 'Guarantee paragraph 2',
      section: 'Guarantee',
      helper_text: 'Required paragraph.',
      word_rule: { mode: 'range', min_words: 22, max_words: 30, label: 'Guarantee paragraph 2' },
      default_value: makeLepresiumSentence(30, 30),
      placeholder: 'Enter at least 22 words',
      sort_order: 124,
    }),
    buildField({
      field_key: 'guarantee_paragraph_3',
      field_type: 'text',
      label: 'Guarantee paragraph 3',
      section: 'Guarantee',
      helper_text: 'Short closing line.',
      word_rule: { mode: 'range', min_words: 4, max_words: 8, label: 'Guarantee paragraph 3' },
      default_value: makeLepresiumSentence(6, 6),
      placeholder: 'Enter at least 4 words',
      sort_order: 125,
    }),
    buildField({
      field_key: 'special_offer_title',
      field_type: 'text',
      label: 'Special offer title',
      section: 'Special offer',
      helper_text: 'Section title.',
      word_rule: { mode: 'range', min_words: 8, max_words: 14, label: 'Special offer title' },
      default_value: makeLepresiumSentence(12, 12),
      placeholder: 'Enter at least 8 words',
      sort_order: 126,
    }),
    buildField({
      field_key: 'special_offer_image',
      field_type: 'image',
      label: 'Special offer image',
      section: 'Special offer',
      helper_text: 'Required offer image.',
      default_value: '',
      placeholder: 'Upload image or paste image URL',
      sort_order: 127,
    }),
    buildField({
      field_key: 'special_offer_price_text',
      field_type: 'text',
      label: 'Special offer price text',
      section: 'Special offer',
      helper_text: 'Price text.',
      word_rule: { mode: 'range', min_words: 2, max_words: 6, label: 'Special offer price text' },
      default_value: makeLepresiumSentence(4, 4),
      placeholder: 'Enter at least 2 words',
      sort_order: 128,
    }),
    buildField({
      field_key: 'learn_more_title',
      field_type: 'text',
      label: 'Learn more title',
      section: 'Learn more',
      helper_text: 'Section title.',
      word_rule: { mode: 'exact', exact_words: 5, label: 'Learn more title' },
      default_value: 'Learn More About This Product',
      placeholder: 'Enter exactly 5 words',
      sort_order: 129,
    }),
    ...Array.from({ length: 8 }, (_, index) =>
      buildField({
        field_key: `learn_more_paragraph_${index + 1}`,
        field_type: 'textarea',
        label: `Learn more paragraph ${index + 1}`,
        section: 'Learn more',
        helper_text: 'Long-form paragraph.',
        word_rule: {
          mode: 'range',
          min_words: 45,
          max_words: 75,
          label: `Learn more paragraph ${index + 1}`,
        },
        default_value: makeLepresiumSentence(75, 75),
        placeholder: 'Enter at least 45 words',
        sort_order: 130 + index,
      })
    ),
    buildField({
      field_key: 'scientific_references_title',
      field_type: 'text',
      label: 'Scientific references title',
      section: 'Scientific references',
      helper_text: 'Section title.',
      word_rule: { mode: 'range', min_words: 2, max_words: 5, label: 'Scientific references title' },
      default_value: makeLepresiumSentence(3, 3),
      placeholder: 'Enter at least 2 words',
      sort_order: 138,
    }),
    buildField({
      field_key: 'scientific_references_logo_strip',
      field_type: 'image',
      label: 'Scientific references logo strip',
      section: 'Scientific references',
      helper_text: 'Required image.',
      default_value: '',
      placeholder: 'Upload image or paste image URL',
      sort_order: 139,
    }),
    buildField({
      field_key: 'advertorial_notice',
      field_type: 'textarea',
      label: 'Advertorial notice',
      section: 'Legal',
      helper_text: 'Required legal notice.',
      word_rule: { mode: 'range', min_words: 18, max_words: 30, label: 'Advertorial notice' },
      default_value: makeLepresiumSentence(28, 28),
      placeholder: 'Enter at least 18 words',
      sort_order: 140,
    }),
    buildField({
      field_key: 'platform_notice',
      field_type: 'textarea',
      label: 'Platform notice',
      section: 'Legal',
      helper_text: 'Required platform notice.',
      word_rule: { mode: 'range', min_words: 14, max_words: 24, label: 'Platform notice' },
      default_value: makeLepresiumSentence(22, 22),
      placeholder: 'Enter at least 14 words',
      sort_order: 141,
    }),
    buildField({
      field_key: 'legal_disclaimer_title',
      field_type: 'text',
      label: 'Disclaimer title',
      section: 'Legal',
      helper_text: 'Legal section title.',
      word_rule: { mode: 'exact', exact_words: 1, label: 'Disclaimer title' },
      default_value: 'Disclaimer',
      placeholder: 'Enter exactly 1 word',
      sort_order: 142,
    }),
    buildField({
      field_key: 'legal_disclaimer_paragraph_1',
      field_type: 'textarea',
      label: 'Disclaimer paragraph 1',
      section: 'Legal',
      helper_text: 'Required legal paragraph.',
      word_rule: { mode: 'range', min_words: 28, max_words: 42, label: 'Disclaimer paragraph 1' },
      default_value: makeLepresiumSentence(42, 42),
      placeholder: 'Enter at least 28 words',
      sort_order: 143,
    }),
    buildField({
      field_key: 'legal_disclaimer_paragraph_2',
      field_type: 'textarea',
      label: 'Disclaimer paragraph 2',
      section: 'Legal',
      helper_text: 'Required legal paragraph.',
      word_rule: { mode: 'range', min_words: 20, max_words: 32, label: 'Disclaimer paragraph 2' },
      default_value: makeLepresiumSentence(32, 32),
      placeholder: 'Enter at least 20 words',
      sort_order: 144,
    }),
    buildField({
      field_key: 'affiliate_editorial_disclosure_title',
      field_type: 'text',
      label: 'Affiliate & editorial disclosure title',
      section: 'Legal',
      helper_text: 'Required legal title.',
      word_rule: {
        mode: 'range',
        min_words: 3,
        max_words: 5,
        label: 'Affiliate & editorial disclosure title',
      },
      default_value: makeLepresiumSentence(4, 4),
      placeholder: 'Enter at least 3 words',
      sort_order: 145,
    }),
    buildField({
      field_key: 'affiliate_editorial_disclosure_paragraph_1',
      field_type: 'textarea',
      label: 'Affiliate & editorial disclosure paragraph 1',
      section: 'Legal',
      helper_text: 'Required legal paragraph.',
      word_rule: {
        mode: 'range',
        min_words: 26,
        max_words: 40,
        label: 'Affiliate & editorial disclosure paragraph 1',
      },
      default_value: makeLepresiumSentence(40, 40),
      placeholder: 'Enter at least 26 words',
      sort_order: 146,
    }),
    buildField({
      field_key: 'affiliate_editorial_disclosure_paragraph_2',
      field_type: 'textarea',
      label: 'Affiliate & editorial disclosure paragraph 2',
      section: 'Legal',
      helper_text: 'Required legal paragraph.',
      word_rule: {
        mode: 'range',
        min_words: 18,
        max_words: 30,
        label: 'Affiliate & editorial disclosure paragraph 2',
      },
      default_value: makeLepresiumSentence(30, 30),
      placeholder: 'Enter at least 18 words',
      sort_order: 147,
    }),
    buildField({
      field_key: 'trademark_disclaimer_title',
      field_type: 'text',
      label: 'Trademark disclaimer title',
      section: 'Legal',
      helper_text: 'Required legal title.',
      word_rule: {
        mode: 'range',
        min_words: 2,
        max_words: 4,
        label: 'Trademark disclaimer title',
      },
      default_value: makeLepresiumSentence(3, 3),
      placeholder: 'Enter at least 2 words',
      sort_order: 148,
    }),
    buildField({
      field_key: 'trademark_disclaimer_paragraph',
      field_type: 'textarea',
      label: 'Trademark disclaimer paragraph',
      section: 'Legal',
      helper_text: 'Required legal paragraph.',
      word_rule: {
        mode: 'range',
        min_words: 20,
        max_words: 30,
        label: 'Trademark disclaimer paragraph',
      },
      default_value: makeLepresiumSentence(30, 30),
      placeholder: 'Enter at least 20 words',
      sort_order: 149,
    }),
    buildField({
      field_key: 'fda_compliance_statement_title',
      field_type: 'text',
      label: 'FDA compliance statement title',
      section: 'Legal',
      helper_text: 'Required legal title.',
      word_rule: {
        mode: 'range',
        min_words: 3,
        max_words: 5,
        label: 'FDA compliance statement title',
      },
      default_value: makeLepresiumSentence(4, 4),
      placeholder: 'Enter at least 3 words',
      sort_order: 150,
    }),
    buildField({
      field_key: 'fda_compliance_statement_paragraph_1',
      field_type: 'textarea',
      label: 'FDA compliance statement paragraph 1',
      section: 'Legal',
      helper_text: 'Required legal paragraph.',
      word_rule: {
        mode: 'range',
        min_words: 24,
        max_words: 36,
        label: 'FDA compliance statement paragraph 1',
      },
      default_value: makeLepresiumSentence(36, 36),
      placeholder: 'Enter at least 24 words',
      sort_order: 151,
    }),
    buildField({
      field_key: 'fda_compliance_statement_paragraph_2',
      field_type: 'textarea',
      label: 'FDA compliance statement paragraph 2',
      section: 'Legal',
      helper_text: 'Required legal paragraph.',
      word_rule: {
        mode: 'range',
        min_words: 14,
        max_words: 24,
        label: 'FDA compliance statement paragraph 2',
      },
      default_value: makeLepresiumSentence(24, 24),
      placeholder: 'Enter at least 14 words',
      sort_order: 152,
    }),
  ];

  const ctaButtons = [
    buildButton({
      button_key: 'hero_primary_cta',
      button_label: makeLepresiumSentence(4, 4),
      button_style: 'primary',
      label: 'Hero primary CTA',
      helper_text: 'Main hero CTA. Exactly 4 words.',
      sort_order: 1,
    }),
    buildButton({
      button_key: 'hero_secondary_cta',
      button_label: makeLepresiumSentence(2, 2),
      button_style: 'secondary',
      label: 'Hero secondary CTA',
      helper_text: 'Secondary hero CTA. Exactly 2 words.',
      sort_order: 2,
    }),
    buildButton({
      button_key: 'how_it_works_cta',
      button_label: makeLepresiumSentence(2, 2),
      button_style: 'secondary',
      label: 'How this product works CTA',
      helper_text: 'CTA under how this product works. Exactly 2 words.',
      sort_order: 3,
    }),
    buildButton({
      button_key: 'ingredients_cta',
      button_label: makeLepresiumSentence(3, 3),
      button_style: 'primary',
      label: 'Ingredients CTA',
      helper_text: 'CTA in ingredients section. Exactly 3 words.',
      sort_order: 4,
    }),
    buildButton({
      button_key: 'pricing_card_1_cta',
      button_label: makeLepresiumSentence(2, 2),
      button_style: 'primary',
      label: 'Pricing card 1 CTA',
      helper_text: 'Pricing card 1 CTA. Exactly 2 words.',
      sort_order: 5,
    }),
    buildButton({
      button_key: 'pricing_card_2_cta',
      button_label: makeLepresiumSentence(2, 2),
      button_style: 'primary',
      label: 'Pricing card 2 CTA',
      helper_text: 'Pricing card 2 CTA. Exactly 2 words.',
      sort_order: 6,
    }),
    buildButton({
      button_key: 'pricing_card_3_cta',
      button_label: makeLepresiumSentence(2, 2),
      button_style: 'primary',
      label: 'Pricing card 3 CTA',
      helper_text: 'Pricing card 3 CTA. Exactly 2 words.',
      sort_order: 7,
    }),
    buildButton({
      button_key: 'special_offer_cta',
      button_label: makeLepresiumSentence(5, 5),
      button_style: 'primary',
      label: 'Special offer CTA',
      helper_text: 'Special offer CTA. Exactly 5 words.',
      sort_order: 8,
    }),
  ];

  return {
    codeKeys: ['neutral_review_template_v1', 'blog_review_locked_v1', 'dummy_review_template_v1'],
    slugAliases: ['neutral-review-template-v1', 'dummy-review-template-v1'],
    nameAliases: ['neutral review template', 'dummy review template', 'blog review template'],
    description:
      'Locked review-style blog template with compulsory Lepresium dummy content and strict field validation.',
    fields,
    ctaButtons,
  };
}

const BLOG_TEMPLATE_PRESETS = [createNeutralReviewTemplatePreset()];

function resolveTemplatePreset(template) {
  if (!template) return null;

  const codeKey = String(template.template_code_key || '').trim().toLowerCase();
  const slug = String(template.slug || '').trim().toLowerCase();
  const name = String(template.name || '').trim().toLowerCase();

  return (
    BLOG_TEMPLATE_PRESETS.find((preset) => {
      return (
        preset.codeKeys.includes(codeKey) ||
        preset.slugAliases.includes(slug) ||
        preset.nameAliases.includes(name)
      );
    }) || null
  );
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

  const activePreset = useMemo(() => resolveTemplatePreset(selectedTemplate), [selectedTemplate]);

  const groupedTemplateFields = useMemo(() => {
    return form.template_fields.reduce((acc, field, index) => {
      const section = field?.meta?.section || 'Template fields';
      if (!acc[section]) acc[section] = [];
      acc[section].push({ ...field, __index: index });
      return acc;
    }, {});
  }, [form.template_fields]);

  useEffect(() => {
    if (!selectedTemplate) return;

    const preset = resolveTemplatePreset(selectedTemplate);

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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTemplateFieldChange = (index, key, value) => {
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

      if (looksLikeLinkField && String(field.field_value || '').trim()) {
        const result = validateSupgadUrl(field.field_value, {
          required: true,
          allowEmpty: false,
          fieldName: `Template field (${field.field_key})`,
        });

        if (!result.ok) {
          throw new Error(result.message);
        }
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

      const result = validateSupgadUrl(button.button_url, {
        required: true,
        allowEmpty: false,
        fieldName: `CTA Button URL (${button.button_label || buttonLabelMeta})`,
      });

      if (!result.ok) {
        throw new Error(result.message);
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

      const { data } = await api.post('/api/affiliate/posts', payload);

      if (data?.ok && data?.post?.id) {
        setSuccess('Post created successfully. Redirecting...');
        setTimeout(() => {
          navigate(`/affiliate/posts/${data.post.id}/edit`);
        }, 700);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create post');
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
                          placeholder="Button URL (must be supgad.com)"
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
                      <div>{button?.meta?.helper_text || 'Required CTA button'}</div>
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