import * as UserModel from "../models/usuarios.model.js";

export const forceLogout = async (req, res) => {

  await UserModel.incrementTokenVersion(req.user.id);

  res.json({ ok: true });
};
