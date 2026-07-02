module.exports = {
  command: ["tagall", "everyone"],
  category: "group",
  description: "Tag semua anggota grup (admin only)",
  groupOnly: true,
  adminOnly: true,
  execute: async (sock, m, args, ctx) => {
    const participants = ctx.groupMetadata.participants.map((p) => p.id);
    const text = args.join(" ") || "Halo semua!";
    const mentionText = `📢 ${text}\n\n` + participants.map((p) => `@${p.split("@")[0]}`).join(" ");
    await sock.sendMessage(ctx.from, { text: mentionText, mentions: participants }, { quoted: m });
  },
};
