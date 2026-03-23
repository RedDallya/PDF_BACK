export const refresh = async (req, res) => {

  try {

    const { token } = req.body;

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserModel.getUserById(decoded.id);

    if (!user) throw new Error();

    if (decoded.tokenVersion !== user.token_version) {
      return res.status(401).json({ error: "Token expirado" });
    }

    const newToken = jwt.sign(
      {
        id: user.id,
        role: user.rol,
        tokenVersion: user.token_version
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ accessToken: newToken });

  } catch {
    res.status(401).json({ error: "Refresh inválido" });
  }
};
