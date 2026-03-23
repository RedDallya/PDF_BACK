export function validateRegister(data) {

  if (!data.username || data.username.length < 3) {
    throw new Error("Username inválido");
  }

  if (!data.password || data.password.length < 6) {
    throw new Error("Password debe tener mínimo 6 caracteres");
  }

}
