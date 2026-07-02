const config = require("../config");

function isOwner(jid) {
  const number = jid.split("@")[0].split(":")[0];
  return config.ownerNumbers.map((n) => n.trim()).includes(number);
}

function getText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ""
  );
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}h ${h}j ${m}m ${s}d`;
}

async function isGroupAdmin(sock, groupId, userId) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const participant = metadata.participants.find((p) => p.id === userId);
    return participant?.admin === "admin" || participant?.admin === "superadmin";
  } catch {
    return false;
  }
}

module.exports = { isOwner, getText, formatUptime, isGroupAdmin };
