import bcrypt from "bcryptjs";

const password = "Test1234!";

bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});