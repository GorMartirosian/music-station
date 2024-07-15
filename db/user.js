const db = require("./db");
const bcrypt = require("bcryptjs");

async function verifyUserLogin(login, password) {
  const query = "SELECT * FROM users WHERE login = $1";
  const result = await db.pool.query(query, [login]);
  const user = result.rows[0];
  if (!user) {
    return false; // User not found
  }
  return await bcrypt.compare(password, user.user_password);
}

async function createUser(name, surname, login, password, email) {
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  const query = `INSERT INTO users (name, surname, login, user_password, email)
                     VALUES ($1, $2, $3, $4, $5);`;
  const values = [name, surname, login, hashedPassword, email];
  const result = await db.pool.query(query, values);
  const successfullyCreated = result.rowCount === 1;
  if(successfullyCreated){
    console.log(`User ${login} created successfully!`);
  }else {
    console.log(`User ${login} already exists! Unable to create new user.`);
  }
  return successfullyCreated;
}

async function findUser(login) {
  const query = `SELECT * 
                 FROM users
                 WHERE login = $1;`;
  const queryResult = (await db.pool.query(query, [login])).rows;
  if (queryResult.length === 0) {
    return null;
  }
  return queryResult[0];
}

// (async () => {
//   process.exit(1);
// })();

module.exports = { createUser, verifyUserLogin, findUser };