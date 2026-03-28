import pool from "../config/db.js";

/* ===============================
   GET PROFILE (usuario logueado)
================================ */

export async function getMyCompanyProfile(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT *
      FROM user_company_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    res.json(rows[0] || null);
  } catch (err) {
    console.error("GET COMPANY PROFILE ERROR:", err);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
}

/* ===============================
   CREATE OR UPDATE PROFILE
================================ */

export async function saveMyCompanyProfile(req, res) {
  try {
    const userId = req.user.id;

    const {
      company_name,
      company_email,
      company_phone,
      company_address,
      company_website,
      pdf_footer,
      primary_color,
      secondary_color
    } = req.body;

    const [existing] = await pool.query(
      `SELECT id FROM user_company_profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (existing.length) {
      // UPDATE
      await pool.query(
        `
        UPDATE user_company_profiles
        SET
          company_name = ?,
          company_email = ?,
          company_phone = ?,
          company_address = ?,
          company_website = ?,
          pdf_footer = ?,
          primary_color = ?,
          secondary_color = ?
        WHERE user_id = ?
        `,
        [
          company_name,
          company_email,
          company_phone,
          company_address,
          company_website,
          pdf_footer,
          primary_color,
          secondary_color,
          userId
        ]
      );
    } else {
      // INSERT
      await pool.query(
        `
        INSERT INTO user_company_profiles
        (
          user_id,
          company_name,
          company_email,
          company_phone,
          company_address,
          company_website,
          pdf_footer,
          primary_color,
          secondary_color
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          company_name,
          company_email,
          company_phone,
          company_address,
          company_website,
          pdf_footer,
          primary_color,
          secondary_color
        ]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("SAVE COMPANY PROFILE ERROR:", err);
    res.status(500).json({ error: "Error guardando perfil" });
  }
}
export async function uploadCompanyLogo(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const [existing] = await pool.query(
      `SELECT id FROM user_company_profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (existing.length) {
      await pool.query(
        `
        UPDATE user_company_profiles
        SET logo_path = ?
        WHERE user_id = ?
        `,
        [filePath, userId]
      );
    } else {
      await pool.query(
        `
        INSERT INTO user_company_profiles (user_id, company_name, logo_path)
        VALUES (?, 'Mi Empresa', ?)
        `,
        [userId, filePath]
      );
    }

    res.json({
      ok: true,
      logo_path: filePath
    });
  } catch (err) {
    console.error("UPLOAD LOGO ERROR:", err);
    res.status(500).json({ error: "Error subiendo logo" });
  }
}