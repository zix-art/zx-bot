const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const PLUGIN_DIR = path.join(__dirname, "..", "plugins");

/**
 * Setiap file plugin harus export object:
 * {
 *   command: ["ping", "p"],     // alias command (tanpa prefix)
 *   category: "main",           // kategori buat menu
 *   description: "...",         // deskripsi singkat
 *   ownerOnly: false,           // hanya owner yang bisa pakai
 *   groupOnly: false,           // hanya bisa dipakai di grup
 *   adminOnly: false,           // hanya admin grup
 *   execute: async (sock, m, args, ctx) => { ... }
 * }
 */
function loadPlugins() {
  const commands = new Map();
  const pluginList = [];

  if (!fs.existsSync(PLUGIN_DIR)) return { commands, pluginList };

  const files = fs.readdirSync(PLUGIN_DIR).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    try {
      const fullPath = path.join(PLUGIN_DIR, file);
      delete require.cache[require.resolve(fullPath)]; // support hot-reload
      const plugin = require(fullPath);

      if (!plugin.command || !plugin.execute) {
        console.log(chalk.yellow(`[SKIP] ${file} tidak punya command/execute`));
        continue;
      }

      const aliases = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      for (const alias of aliases) {
        commands.set(alias.toLowerCase(), plugin);
      }
      pluginList.push({ file, ...plugin });
    } catch (e) {
      console.log(chalk.red(`[ERROR] Gagal load plugin ${file}: ${e.message}`));
    }
  }

  console.log(chalk.green(`✓ ${pluginList.length} plugin berhasil dimuat (${commands.size} command)`));
  return { commands, pluginList };
}

module.exports = { loadPlugins, PLUGIN_DIR };
