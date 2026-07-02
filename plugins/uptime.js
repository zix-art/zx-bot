const { formatUptime } = require("../lib/functions");

module.exports = {
  command: ["uptime"],
  category: "main",
  description: "Lihat lama bot menyala",
  execute: async (sock, m, args, ctx) => {
    await sock.sendMessage(ctx.from, { text: `⏱️ Bot sudah menyala selama: ${formatUptime(process.uptime())}` }, { quoted: m });
  },
};
