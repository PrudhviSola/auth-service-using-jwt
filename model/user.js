// model/user.js
const db = require("../config/database");

const userSchema = {
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
};



module.exports = userSchema;
