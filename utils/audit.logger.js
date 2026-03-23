import pool from "../config/db.js";

export async function logAudit(conn, {
  userId,
  entity,
  entityId,
  action,
  payload
}) {

  await conn.query(`
    INSERT INTO audit_logs
    (user_id, entity, entity_id, action, payload)
    VALUES (?, ?, ?, ?, ?)
  `, [
    userId,
    entity,
    entityId,
    action,
    JSON.stringify(payload || {})
  ]);
}

