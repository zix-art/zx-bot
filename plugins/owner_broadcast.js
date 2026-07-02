module.exports = {
  command: ["broadcast", "bc"],
  category: "owner",
  description: "Kirim pesan ke semua user tersimpan (owner only)",
  ownerOnly: true,
  execute: async (sock, m, args, ctx) => {
    const text = args.join(" ");
    if (!text) {
      return sock.sendMessage(ctx.from, { text: `Gunakan: ${ctx.prefix}broadcast <pesan>` }, { quoted: m });
    }
    const users = Object.keys(ctx.db.users);
    let success = 0;
    for (const jid of users) {
      try {
        await sock.sendMessage(jid, { text: `📢 *Broadcast*\n\n${text}` });
        success++;
        await new Promise((r) => setTimeout(r, 300)); // hindari flood/ban
      } catch {}
    }
    await sock.sendMessage(ctx.from, { text: `✅ Broadcast terkirim ke ${success}/${users.length} user.` }, { quoted: m });
  },
};
