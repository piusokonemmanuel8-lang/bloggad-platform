const pool = require('../config/db');

const BUILT_IN_BLOG_TEMPLATES = [
  {
    name: 'Neutral Review Template',
    slug: 'neutral-review-template-v1',
    template_code_key: 'neutral_review_template_v1',
    description:
      'Locked blog review template with compulsory Lepresium content slots, strict word rules, fixed sections, fixed CTA slots, and fixed image slots.',
    is_premium: 1,
    status: 'active',
  },
  {
    name: 'Dxt',
    slug: 'dxt',
    template_code_key: 'dxt_template_v1',
    description:
      'Locked Dxt long-form advertorial template with fixed sales sections, CTA slots, testimonials, pricing blocks, FAQ, guarantee, and special offer layout.',
    is_premium: 1,
    status: 'active',
  },
];

async function syncBuiltInBlogTemplates() {
  for (const template of BUILT_IN_BLOG_TEMPLATES) {
    const [existingRows] = await pool.query(
      `
      SELECT id, preview_image, is_premium, status
      FROM blog_templates
      WHERE LOWER(slug) = LOWER(?)
         OR LOWER(template_code_key) = LOWER(?)
      LIMIT 1
      `,
      [template.slug, template.template_code_key]
    );

    const existing = existingRows[0] || null;

    if (!existing) {
      await pool.query(
        `
        INSERT INTO blog_templates
        (
          name,
          slug,
          preview_image,
          template_code_key,
          description,
          is_premium,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          template.name,
          template.slug,
          null,
          template.template_code_key,
          template.description,
          template.is_premium,
          template.status,
        ]
      );

      console.log(`[template-sync] created blog template: ${template.name}`);
      continue;
    }

    await pool.query(
      `
      UPDATE blog_templates
      SET
        name = ?,
        slug = ?,
        template_code_key = ?,
        description = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        template.name,
        template.slug,
        template.template_code_key,
        template.description,
        existing.id,
      ]
    );

    console.log(`[template-sync] ensured blog template: ${template.name}`);
  }
}

module.exports = {
  syncBuiltInBlogTemplates,
};