const fs = require("fs-extra");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

const DEFAULT_DB = {
  users: {},     // data per user: { xp, level, banned, ... }
  groups: {},    // data per group: { welcome, antilink, ... }
  settings: {},  // pengaturan global bot: { autoResponses: {...} }
};

function load() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeJsonSync(DB_PATH, DEFAULT_DB, { spaces: 2 });
      return { ...DEFAULT_DB };
    }
    return fs.readJsonSync(DB_PATH);
  } catch (e) {
    console.error("Gagal load database, membuat baru:", e.message);
    fs.writeJsonSync(DB_PATH, DEFAULT_DB, { spaces: 2 });
    return { ...DEFAULT_DB };
  }
}

let db = load();
let saveTimeout = null;

// Debounced save supaya tidak nulis disk terlalu sering saat banyak pesan masuk
function save() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    fs.writeJsonSync(DB_PATH, db, { spaces: 2 });
  }, 500);
}

function ensureUser(jid) {
  if (!db.users[jid]) {
    db.users[jid] = { banned: false, xp: 0, joinedAt: Date.now() };
    save();
  }
  return db.users[jid];
}

function ensureGroup(jid) {
  if (!db.groups[jid]) {
    db.groups[jid] = { welcome: true, antilink: false };
    save();
  }
  return db.groups[jid];
}

module.exports = {
  db,
  save,
  ensureUser,
  ensureGroup,
  get: (path_) => path_.split(".").reduce((o, k) => (o ? o[k] : undefined), db),
};
