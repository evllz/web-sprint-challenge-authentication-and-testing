const db = require("../../data/dbConfig");
module.exports = {
  add,
  find,
  findById,
  findBy,
};

function find() {
  return db("users").select("id", "username", "password").orderBy("id");
}

async function findBy(filter) {
  const user = await db("users").where(filter).orderBy("id").first();
  return user;
}

async function findById(id) {
  const user = await db("users").where({ id }).first();
  return user;
}

async function add(user) {
  const [id] = await db("users").insert(user, "id");
  const newUser = await findById(id);
  return newUser;
}
