const dbName = process.env.DATABASE;
const mongoUser = process.env.MONGODB_USER;
const mongoPasswd = process.env.MONGODB_PASSWORD;
const rootPasswd = process.env.MONGO_INITDB_ROOT_PASSWORD;

db = db.getSiblingDB(dbName);
db.createUser({
  user: mongoUser,
  pwd: mongoPasswd,
  roles: [{ role: "readWrite", db: dbName }],
});
