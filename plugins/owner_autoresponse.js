module.exports = {
  command: ["addresponse", "delresponse"],
  category: "owner",
  description: "Kelola auto respond keyword (owner only)",
  ownerOnly: true,
  execute: async (sock, m, args, ctx) => {
    if (!ctx.db.settings.autoResponses) ctx.db.settings.autoResponses = {};
    const isAdd = args[0] !== undefined && m.message && ctx; // just to keep structure

    const raw = args.join(" ");
    const isDel = false; // handled below via command alias check

    // Determine which alias was used based on original text
    const usedDel = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").toLowerCase().startsWith(`${ctx.prefix}delresponse`);

    if (usedDel) {
      const key = args.join(" ");
      if (!key || !ctx.db.settings.autoResponses[key]) {
        return sock.sendMessage(ctx.from, { text: "Keyword tidak ditemukan." }, { quoted: m });
      }
      delete ctx.db.settings.autoResponses[key];
      ctx.save();
      return sock.sendMessage(ctx.from, { text: `✅ Auto respond "${key}" dihapus.` }, { quoted: m });
    }

    // addresponse keyword|balasan
    const [key, ...replyParts] = raw.split("|");
    const reply = replyParts.join("|").trim();
    if (!key || !reply) {
      return sock.sendMessage(ctx.from, { text: `Gunakan: ${ctx.prefix}addresponse keyword|balasan` }, { quoted: m });
    }
    ctx.db.settings.autoResponses[key.trim()] = reply;
    ctx.save();
    await sock.sendMessage(ctx.from, { text: `✅ Auto respond "${key.trim()}" ditambahkan.` }, { quoted: m });
  },
};
