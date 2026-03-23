import pool from "../config/db.js";

export const TagModel = {

  async getAll() {
    const [rows] = await pool.query(
      "SELECT * FROM tags ORDER BY nombre"
    );
    return rows;
  },

  async create(nombre) {

    const [result] = await pool.query(
      "INSERT IGNORE INTO tags(nombre) VALUES (?)",
      [nombre]
    );

    return result.insertId;
  },

  async saveClientTags(clientId, tagsArray) {

    await pool.query(
      "DELETE FROM cliente_tags WHERE cliente_id = ?",
      [clientId]
    );

    for (const tagName of tagsArray) {

      const [tag] = await pool.query(
        "SELECT id FROM tags WHERE nombre = ?",
        [tagName]
      );

      let tagId;

      if (tag.length) {
        tagId = tag[0].id;
      } else {

        const [newTag] = await pool.query(
          "INSERT INTO tags(nombre) VALUES (?)",
          [tagName]
        );

        tagId = newTag.insertId;
      }

      await pool.query(
        "INSERT INTO cliente_tags(cliente_id, tag_id) VALUES (?, ?)",
        [clientId, tagId]
      );
    }
  }

};
