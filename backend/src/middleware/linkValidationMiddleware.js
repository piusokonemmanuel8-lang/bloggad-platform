const { validateAndLogSupgadUrl } = require('../services/linkValidationService');

function createSupgadLinkValidationMiddleware(config = {}) {
  const {
    fields = [],
    sourceType = 'general',
    allowEmpty = true,
    required = false,
  } = config;

  return async function supgadLinkValidationMiddleware(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const websiteId =
        req.body?.website_id ||
        req.params?.websiteId ||
        req.query?.website_id ||
        null;

      for (const field of fields) {
        const value = req.body?.[field.name];
        const fieldRequired =
          typeof field.required === 'boolean' ? field.required : required;
        const fieldAllowEmpty =
          typeof field.allowEmpty === 'boolean' ? field.allowEmpty : allowEmpty;

        const result = await validateAndLogSupgadUrl({
          value,
          fieldName: field.label || field.name || 'URL',
          required: fieldRequired,
          allowEmpty: fieldAllowEmpty,
          userId,
          websiteId,
          sourceType: field.sourceType || sourceType,
          sourceId: field.sourceId || null,
        });

        if (!result.ok) {
          return res.status(400).json({
            ok: false,
            message: result.message,
            field: field.name,
            validation: result,
          });
        }
      }

      next();
    } catch (error) {
      return res.status(error.status || 500).json({
        ok: false,
        message: error.message || 'Link validation failed',
      });
    }
  };
}

module.exports = {
  createSupgadLinkValidationMiddleware,
};