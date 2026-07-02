module.exports = {
  command: ["menu", "help"],
  category: "main",
  description: "Menampilkan daftar semua command",
  execute: async (sock, m, args, ctx) => {
    const grouped = {};
    for (const p of ctx.pluginList) {
      if (!grouped[p.category]) grouped[p.category] = [];
      const aliases = Array.isArray(p.command) ? p.command : [p.command];
      grouped[p.category].push(`${ctx.prefix}${aliases[0]} - ${p.description || ""}`);
    }

    let text = `╭───────────────╮\n│ *${ctx.botName}*\n╰───────────────╯\n\n`;
    for (const category of Object.keys(grouped)) {
      text += `*${category.toUpperCase()}*\n`;
      text += grouped[category].map((c) => `• ${c}`).join("\n");
      text += "\n\n";
    }
    text += `Total: ${ctx.pluginList.length} command`;

    await sock.sendMessage(ctx.from, { text }, { quoted: m });
  },
};
