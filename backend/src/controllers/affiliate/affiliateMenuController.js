const pool = require('../../config/db');
const { assertAndLogSupgadUrl } = require('../../services/linkValidationService');

function sanitizeMenu(row) {
  if (!row) return null;

  return {
    id: row.id,
    website_id: row.website_id,
    name: row.name,
    location: row.location,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function sanitizeMenuItem(row) {
  if (!row) return null;

  return {
    id: row.id,
    menu_id: row.menu_id,
    label: row.label,
    type: row.type,
    linked_category_id: row.linked_category_id,
    custom_url: row.custom_url,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: row.linked_category_id
      ? {
          id: row.linked_category_id,
          name: row.category_name,
          slug: row.category_slug,
          status: row.category_status,
        }
      : null,
  };
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
    SELECT id, user_id, website_name, slug, status
    FROM affiliate_websites
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getMenuById(menuId, websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      website_id,
      name,
      location,
      created_at,
      updated_at
    FROM website_menus
    WHERE id = ?
      AND website_id = ?
    LIMIT 1
    `,
    [menuId, websiteId]
  );

  return rows[0] || null;
}

async function getMenuItems(menuId) {
  const [rows] = await pool.query(
    `
    SELECT
      wmi.id,
      wmi.menu_id,
      wmi.label,
      wmi.type,
      wmi.linked_category_id,
      wmi.custom_url,
      wmi.sort_order,
      wmi.created_at,
      wmi.updated_at,
      c.name AS category_name,
      c.slug AS category_slug,
      c.status AS category_status
    FROM website_menu_items wmi
    LEFT JOIN categories c
      ON c.id = wmi.linked_category_id
    WHERE wmi.menu_id = ?
    ORDER BY wmi.sort_order ASC, wmi.id ASC
    `,
    [menuId]
  );

  return rows.map(sanitizeMenuItem);
}

async function getMenusForWebsite(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      website_id,
      name,
      location,
      created_at,
      updated_at
    FROM website_menus
    WHERE website_id = ?
    ORDER BY id DESC
    `,
    [websiteId]
  );

  return rows;
}

async function getCategoryById(categoryId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, slug, status
    FROM categories
    WHERE id = ?
    LIMIT 1
    `,
    [categoryId]
  );

  return rows[0] || null;
}

async function getMyMenus(req, res) {
  try {
    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const menus = await getMenusForWebsite(website.id);
    const menuData = [];

    for (const menu of menus) {
      const items = await getMenuItems(menu.id);
      menuData.push({
        ...sanitizeMenu(menu),
        items,
      });
    }

    return res.status(200).json({
      ok: true,
      menus: menuData,
    });
  } catch (error) {
    console.error('getMyMenus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch menus',
      error: error.message,
    });
  }
}

async function getMyMenuById(req, res) {
  try {
    const menuId = Number(req.params.id);

    if (!Number.isInteger(menuId) || menuId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid menu id',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const menu = await getMenuById(menuId, website.id);

    if (!menu) {
      return res.status(404).json({
        ok: false,
        message: 'Menu not found',
      });
    }

    const items = await getMenuItems(menu.id);

    return res.status(200).json({
      ok: true,
      menu: {
        ...sanitizeMenu(menu),
        items,
      },
    });
  } catch (error) {
    console.error('getMyMenuById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch menu',
      error: error.message,
    });
  }
}

async function createMenu(req, res) {
  try {
    const { name, location } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Menu name is required',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your website first before adding menus',
      });
    }

    const cleanLocation = ['header', 'footer', 'sidebar', 'mobile'].includes(location)
      ? location
      : 'header';

    const [result] = await pool.query(
      `
      INSERT INTO website_menus
      (
        website_id,
        name,
        location,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, NOW(), NOW())
      `,
      [website.id, String(name).trim(), cleanLocation]
    );

    const createdMenu = await getMenuById(result.insertId, website.id);

    return res.status(201).json({
      ok: true,
      message: 'Menu created successfully',
      menu: {
        ...sanitizeMenu(createdMenu),
        items: [],
      },
    });
  } catch (error) {
    console.error('createMenu error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create menu',
      error: error.message,
    });
  }
}

async function updateMenu(req, res) {
  try {
    const menuId = Number(req.params.id);
    const { name, location } = req.body;

    if (!Number.isInteger(menuId) || menuId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid menu id',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const menu = await getMenuById(menuId, website.id);

    if (!menu) {
      return res.status(404).json({
        ok: false,
        message: 'Menu not found',
      });
    }

    const cleanName = name !== undefined ? String(name).trim() : menu.name;

    if (!cleanName) {
      return res.status(400).json({
        ok: false,
        message: 'Menu name is required',
      });
    }

    const cleanLocation = ['header', 'footer', 'sidebar', 'mobile'].includes(location)
      ? location
      : menu.location;

    await pool.query(
      `
      UPDATE website_menus
      SET
        name = ?,
        location = ?,
        updated_at = NOW()
      WHERE id = ?
        AND website_id = ?
      `,
      [cleanName, cleanLocation, menuId, website.id]
    );

    const updatedMenu = await getMenuById(menuId, website.id);
    const items = await getMenuItems(menuId);

    return res.status(200).json({
      ok: true,
      message: 'Menu updated successfully',
      menu: {
        ...sanitizeMenu(updatedMenu),
        items,
      },
    });
  } catch (error) {
    console.error('updateMenu error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update menu',
      error: error.message,
    });
  }
}

async function saveMenuItems(req, res) {
  try {
    const menuId = Number(req.params.id);
    const { items = [] } = req.body;

    if (!Number.isInteger(menuId) || menuId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid menu id',
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        ok: false,
        message: 'Items must be an array',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const menu = await getMenuById(menuId, website.id);

    if (!menu) {
      return res.status(404).json({
        ok: false,
        message: 'Menu not found',
      });
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const type = ['custom', 'category', 'page', 'home'].includes(item.type)
        ? item.type
        : 'custom';
      const label = normalizeNullable(item.label);

      if (!label) {
        return res.status(400).json({
          ok: false,
          message: `Menu item label is required at position ${index + 1}`,
        });
      }

      if (type === 'category') {
        const linkedCategoryId = Number(item.linked_category_id);

        if (!Number.isInteger(linkedCategoryId) || linkedCategoryId <= 0) {
          return res.status(400).json({
            ok: false,
            message: `Valid linked category is required at position ${index + 1}`,
          });
        }

        const category = await getCategoryById(linkedCategoryId);

        if (!category || category.status !== 'active') {
          return res.status(400).json({
            ok: false,
            message: `Selected category is invalid or inactive at position ${index + 1}`,
          });
        }
      }

      if (type === 'custom') {
        const customUrl = normalizeNullable(item.custom_url);

        if (!customUrl) {
          return res.status(400).json({
            ok: false,
            message: `Custom URL is required at position ${index + 1}`,
          });
        }

        await assertAndLogSupgadUrl({
          value: customUrl,
          fieldName: `Menu item URL (${label})`,
          required: true,
          allowEmpty: false,
          userId: req.user.id,
          websiteId: website.id,
          sourceType: 'menu',
          sourceId: menuId,
        });
      }
    }

    await pool.query(`DELETE FROM website_menu_items WHERE menu_id = ?`, [menuId]);

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const type = ['custom', 'category', 'page', 'home'].includes(item.type)
        ? item.type
        : 'custom';
      const label = String(item.label).trim();
      const linkedCategoryId =
        type === 'category' ? Number(item.linked_category_id) : null;
      const customUrl = type === 'custom' ? normalizeNullable(item.custom_url) : null;
      const sortOrder =
        Number.isInteger(Number(item.sort_order)) ? Number(item.sort_order) : index + 1;

      await pool.query(
        `
        INSERT INTO website_menu_items
        (
          menu_id,
          label,
          type,
          linked_category_id,
          custom_url,
          sort_order,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [menuId, label, type, linkedCategoryId, customUrl, sortOrder]
      );
    }

    const updatedMenu = await getMenuById(menuId, website.id);
    const savedItems = await getMenuItems(menuId);

    return res.status(200).json({
      ok: true,
      message: 'Menu items saved successfully',
      menu: {
        ...sanitizeMenu(updatedMenu),
        items: savedItems,
      },
    });
  } catch (error) {
    console.error('saveMenuItems error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to save menu items',
      error: error.status ? undefined : error.message,
    });
  }
}

async function deleteMenu(req, res) {
  try {
    const menuId = Number(req.params.id);

    if (!Number.isInteger(menuId) || menuId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid menu id',
      });
    }

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const menu = await getMenuById(menuId, website.id);

    if (!menu) {
      return res.status(404).json({
        ok: false,
        message: 'Menu not found',
      });
    }

    await pool.query(
      `
      DELETE FROM website_menus
      WHERE id = ?
        AND website_id = ?
      `,
      [menuId, website.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Menu deleted successfully',
    });
  } catch (error) {
    console.error('deleteMenu error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete menu',
      error: error.message,
    });
  }
}

module.exports = {
  getMyMenus,
  getMyMenuById,
  createMenu,
  updateMenu,
  saveMenuItems,
  deleteMenu,
};