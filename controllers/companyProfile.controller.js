import pool from "../config/db.js";

/* ===============================
GET ALL PROFILES
================================ */
export async function getMyProfiles(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT * FROM pdf_brand_profiles WHERE user_id = ? ORDER BY id DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET PROFILES ERROR:", err);
    res.status(500).json({ error: "Error obteniendo perfiles" });
  }
}

/* ===============================
GET ONE PROFILE
================================ */
export async function getProfileById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM pdf_brand_profiles WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json(rows[0] || null);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
}

/* ===============================
CREATE / UPDATE PROFILE
================================ */
export async function saveProfile(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      profile_name,
      company_name,
      company_email,
      company_phone,
      company_address,
      company_website,
      pdf_footer,
      layout_type
    } = req.body;

    if (id) {
      // UPDATE
      await pool.query(
        `
        UPDATE pdf_brand_profiles
        SET
          profile_name = ?,
          company_name = ?,
          company_email = ?,
          company_phone = ?,
          company_address = ?,
          company_website = ?,
          pdf_footer = ?,
          layout_type = ?
        WHERE id = ? AND user_id = ?
        `,
        [
          profile_name,
          company_name,
          company_email,
          company_phone,
          company_address,
          company_website,
          pdf_footer,
          layout_type,
          id,
          userId
        ]
      );

      return res.json({ ok: true, id });
    }

    // CREATE
    const [result] = await pool.query(
      `
      INSERT INTO pdf_brand_profiles
      (
        user_id,
        profile_name,
        company_name,
        company_email,
        company_phone,
        company_address,
        company_website,
        pdf_footer,
        layout_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        profile_name,
        company_name,
        company_email,
        company_phone,
        company_address,
        company_website,
        pdf_footer,
        layout_type || "classic"
      ]
    );

    res.json({ ok: true, id: result.insertId });

  } catch (err) {
    console.error("SAVE PROFILE ERROR:", err);
    res.status(500).json({ error: "Error guardando perfil" });
  }
}

/* ===============================
DELETE PROFILE
================================ */
export async function deleteProfile(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await pool.query(
      `DELETE FROM pdf_brand_profiles WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE PROFILE ERROR:", err);
    res.status(500).json({ error: "Error eliminando perfil" });
  }
}

/* ===============================
UPLOAD LOGO (por perfil)
================================ */
export async function uploadProfileLogo(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    await pool.query(
      `
      UPDATE pdf_brand_profiles
      SET logo_path = ?
      WHERE id = ? AND user_id = ?
      `,
      [filePath, id, userId]
    );

    res.json({ ok: true, logo_path: filePath });
  } catch (err) {
    console.error("UPLOAD LOGO ERROR:", err);
    res.status(500).json({ error: "Error subiendo logo" });
  }
}

export async function uploadProfileCover(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    await pool.query(
      `
      UPDATE pdf_brand_profiles
      SET cover_image_path = ?
      WHERE id = ? AND user_id = ?
      `,
      [filePath, id, userId]
    );

    res.json({ ok: true, cover_image_path: filePath });
  } catch (err) {
    console.error("UPLOAD COVER ERROR:", err);
    res.status(500).json({ error: "Error subiendo portada" });
  }
}