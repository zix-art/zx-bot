module.exports = {
  command: ["ping"],
  category: "main",
  description: "Cek kecepatan respon bot",
  execute: async (sock, m, args, ctx) => {
    const start = Date.now();
    const sent = await sock.sendMessage(ctx.from, { text: "🏓 Pong..." }, { quoted: m });
    const latency = Date.now() - start;
    await sock.sendMessage(ctx.from, { text: `🏓 Pong! ${latency}ms`, edit: sent.key });
  },
};
