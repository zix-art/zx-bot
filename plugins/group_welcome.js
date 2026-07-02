module.exports = {
  command: ["welcome"],
  category: "group",
  description: "Aktifkan/nonaktifkan pesan welcome. Gunakan: welcome on/off",
  groupOnly: true,
  adminOnly: true,
  execute: async (sock, m, args, ctx) => {
    const mode = args[0]?.toLowerCase();
    if (!["on", "off"].includes(mode)) {
      return sock.sendMessage(ctx.from, { text: `Gunakan: ${ctx.prefix}welcome on/off` }, { quoted: m });
    }
    ctx.db.groups[ctx.from].welcome = mode === "on";
    ctx.save();
    await sock.sendMessage(ctx.from, { text: `✅ Welcome message ${mode === "on" ? "diaktifkan" : "dinonaktifkan"}.` }, { quoted: m });
  },
};
