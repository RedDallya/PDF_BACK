import db from "../config/db.js";

/* =========================================
GET FILES BY VOUCHER (ownership)
========================================= */
export async function getFilesByVoucher(voucherId, userId) {
  const [rows] = await db.query(
    `
    SELECT vf.*
    FROM voucher_files vf
    JOIN vouchers vc ON vf.voucher_id = vc.id
    JOIN viajes v ON vc.viaje_id = v.id
    WHERE vf.voucher_id = ?
      AND v.created_by = ?
    ORDER BY vf.created_at DESC, vf.id DESC
    `,
    [voucherId, userId]
  );

  return rows;
}

/* =========================================
ADD FILE
========================================= */
export async function createVoucherFile(conn, data) {
  const {
    voucher_id,
    original_name,
    stored_name,
    file_path,
    mime_type,
    file_size
  } = data;

  const [result] = await conn.query(
    `
    INSERT INTO voucher_files
    (
      voucher_id,
      original_name,
      stored_name,
      file_path,
      mime_type,
      file_size
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      voucher_id,
      original_name,
      stored_name,
      file_path,
      mime_type || null,
      file_size || null
    ]
  );

  return result.insertId;
}

/* =========================================
GET FILE BY ID (ownership)
========================================= */
export async function getFileById(id, userId) {
  const [rows] = await db.query(
    `
    SELECT vf.*
    FROM voucher_files vf
    JOIN vouchers vc ON vf.voucher_id = vc.id
    JOIN viajes v ON vc.viaje_id = v.id
    WHERE vf.id = ?
      AND v.created_by = ?
    `,
    [id, userId]
  );

  return rows[0] || null;
}

/* =========================================
DELETE FILE (ownership)
========================================= */
export async function deleteVoucherFile(conn, id, userId) {
  const [result] = await conn.query(
    `
    DELETE vf FROM voucher_files vf
    JOIN vouchers vc ON vf.voucher_id = vc.id
    JOIN viajes v ON vc.viaje_id = v.id
    WHERE vf.id = ?
      AND v.created_by = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}