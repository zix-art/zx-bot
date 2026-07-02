module.exports = {
  command: ["kick"],
  category: "group",
  description: "Keluarkan member dari grup (reply pesan / mention, admin only)",
  groupOnly: true,
  adminOnly: true,
  execute: async (sock, m, args, ctx) => {
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quotedParticipant = m.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned?.[0] || quotedParticipant;

    if (!target) {
      return sock.sendMessage(ctx.from, { text: "Reply pesan member atau tag member yang ingin dikick." }, { quoted: m });
    }
    try {
      await sock.groupParticipantsUpdate(ctx.from, [target], "remove");
      await sock.sendMessage(ctx.from, { text: "✅ Member berhasil dikeluarkan." }, { quoted: m });
    } catch (e) {
      await sock.sendMessage(ctx.from, { text: `❌ Gagal kick: ${e.message}` }, { quoted: m });
    }
  },
};
