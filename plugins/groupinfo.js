module.exports = {
  command: ["groupinfo", "ginfo"],
  category: "group",
  description: "Lihat info grup",
  groupOnly: true,
  execute: async (sock, m, args, ctx) => {
    const meta = ctx.groupMetadata;
    const admins = meta.participants.filter((p) => p.admin).length;
    const text = `*${meta.subject}*\n\n` +
      `ID: ${meta.id}\n` +
      `Anggota: ${meta.participants.length}\n` +
      `Admin: ${admins}\n` +
      `Dibuat: ${new Date(meta.creation * 1000).toLocaleString("id-ID")}\n` +
      (meta.desc ? `\nDeskripsi:\n${meta.desc}` : "");
    await sock.sendMessage(ctx.from, { text }, { quoted: m });
  },
};
