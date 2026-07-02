const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const qrcodeTerminal = require("qrcode-terminal");
const chalk = require("chalk");
const readlineSync = require("readline-sync");
const path = require("path");

const config = require("./config");
const { loadPlugins } = require("./lib/plugin-loader");
const { isOwner, getText, isGroupAdmin } = require("./lib/functions");
const { ensureUser, ensureGroup, db, save } = require("./database/db");

const SESSION_DIR = path.join(__dirname, config.sessionName);
let { commands, pluginList } = loadPlugins();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Safari"),
    generateHighQualityLinkPreview: true,
  });

  // ---------- LOGIN: Pairing Code / QR fallback ----------
  const usePairing = config.loginMethod === "pairing" || config.loginMethod === "auto";

  if (usePairing && !sock.authState.creds.registered) {
    let phone = config.botPhoneNumber;
    if (!phone) {
      phone = readlineSync.question(
        chalk.cyan("Masukkan nomor WhatsApp bot (format 62812xxxxxxx), atau kosongkan untuk pakai QR: ")
      );
    }
    if (phone) {
      try {
        setTimeout(async () => {
          const code = await sock.requestPairingCode(phone.replace(/\D/g, ""));
          console.log(chalk.green.bold(`\n>> Kode Pairing kamu: ${code} <<\n`));
          console.log(chalk.gray("Buka WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon, lalu masukkan kode di atas.\n"));
        }, 3000);
      } catch (e) {
        console.log(chalk.red("Gagal request pairing code, fallback ke QR code..."));
      }
    }
  }

  // ---------- CONNECTION EVENTS ----------
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && (!usePairing || !config.botPhoneNumber)) {
      console.log(chalk.yellow("\nScan QR Code berikut dengan WhatsApp:\n"));
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red(`Koneksi terputus. Reconnect: ${shouldReconnect}`));
      if (shouldReconnect) {
        startBot();
      } else {
        console.log(chalk.red("Logged out. Hapus folder session dan scan/pairing ulang."));
      }
    } else if (connection === "open") {
      console.log(chalk.green.bold(`\n✓ Bot berhasil terhubung sebagai ${config.botName}!\n`));
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ---------- GROUP PARTICIPANT EVENTS (welcome/leave) ----------
  sock.ev.on("group-participants.update", async (event) => {
    try {
      const groupData = ensureGroup(event.id);
      if (!groupData.welcome) return;

      const metadata = await sock.groupMetadata(event.id);
      for (const participant of event.participants) {
        const name = participant.split("@")[0];
        if (event.action === "add") {
          await sock.sendMessage(event.id, {
            text: `👋 Selamat datang @${name} di grup *${metadata.subject}*!`,
            mentions: [participant],
          });
        } else if (event.action === "remove") {
          await sock.sendMessage(event.id, {
            text: `👋 @${name} telah keluar dari grup.`,
            mentions: [participant],
          });
        }
      }
    } catch (e) {
      console.log(chalk.red("Error welcome event:"), e.message);
    }
  });

  // ---------- MESSAGE HANDLER ----------
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    try {
      const from = m.key.remoteJid;
      const isGroup = from.endsWith("@g.us");
      const sender = isGroup ? m.key.participant : from;
      const text = getText(m).trim();

      ensureUser(sender);
      if (isGroup) ensureGroup(from);

      if (config.autoRead) await sock.readMessages([m.key]);

      const ctx = {
        prefix: config.prefix,
        isOwner: isOwner(sender),
        isGroup,
        sender,
        from,
        botName: config.botName,
        commands,
        pluginList,
        groupMetadata: isGroup ? await sock.groupMetadata(from).catch(() => null) : null,
        isAdmin: isGroup ? await isGroupAdmin(sock, from, sender) : false,
        db,
        save,
      };

      // ----- Command handling -----
      if (text.startsWith(config.prefix)) {
        const [cmdRaw, ...args] = text.slice(config.prefix.length).trim().split(/\s+/);
        const cmd = cmdRaw.toLowerCase();
        const plugin = commands.get(cmd);

        if (plugin) {
          if (plugin.ownerOnly && !ctx.isOwner) {
            return sock.sendMessage(from, { text: "❌ Command ini khusus owner." }, { quoted: m });
          }
          if (plugin.groupOnly && !isGroup) {
            return sock.sendMessage(from, { text: "❌ Command ini hanya bisa dipakai di grup." }, { quoted: m });
          }
          if (plugin.adminOnly && !ctx.isAdmin && !ctx.isOwner) {
            return sock.sendMessage(from, { text: "❌ Command ini khusus admin grup." }, { quoted: m });
          }

          if (config.autoTyping) await sock.sendPresenceUpdate("composing", from);

          try {
            await plugin.execute(sock, m, args, ctx);
          } catch (err) {
            console.log(chalk.red(`Error plugin ${cmd}:`), err);
            await sock.sendMessage(from, { text: `⚠️ Terjadi error saat menjalankan command: ${err.message}` }, { quoted: m });
          }
        }
        return;
      }

      // ----- Auto respond (non-command keyword reply) -----
      const autoResponses = db.settings.autoResponses || {};
      const key = Object.keys(autoResponses).find((k) => text.toLowerCase().includes(k.toLowerCase()));
      if (key) {
        await sock.sendMessage(from, { text: autoResponses[key] }, { quoted: m });
      }
    } catch (err) {
      console.log(chalk.red("Error message handler:"), err);
    }
  });

  return sock;
}

startBot().catch((err) => console.log(chalk.red("Fatal error:"), err));

// Reload plugins tanpa restart bot (opsional, dipanggil dari plugin owner "reload")
module.exports.reloadPlugins = () => {
  const reloaded = loadPlugins();
  commands = reloaded.commands;
  pluginList = reloaded.pluginList;
};
