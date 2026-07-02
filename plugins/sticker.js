const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

async function toBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = {
  command: ["sticker", "s"],
  category: "tools",
  description: "Ubah gambar/video (reply/caption) jadi stiker",
  execute: async (sock, m, args, ctx) => {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const target = quoted || m.message;

    const imageMsg = target?.imageMessage;
    const videoMsg = target?.videoMessage;

    if (!imageMsg && !videoMsg) {
      return sock.sendMessage(ctx.from, { text: `Kirim/reply gambar atau video pendek dengan caption ${ctx.prefix}sticker` }, { quoted: m });
    }

    try {
      const stream = await downloadContentFromMessage(imageMsg || videoMsg, imageMsg ? "image" : "video");
      const buffer = await toBuffer(stream);
      await sock.sendMessage(ctx.from, { sticker: buffer }, { quoted: m });
    } catch (e) {
      await sock.sendMessage(ctx.from, { text: `❌ Gagal membuat stiker: ${e.message}` }, { quoted: m });
    }
  },
};
