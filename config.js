require("dotenv").config();

// ================== KONFIGURASI BOT ==================
// Edit sesuai kebutuhanmu. Bisa juga di-override lewat Environment Variable
// (berguna kalau deploy di Panel Hosting / VPS supaya nomor owner tidak
// ter-hardcode di source code).

module.exports = {
  // Nama bot, dipakai di menu & pesan
  botName: process.env.BOT_NAME || "WA-Bot",

  // Prefix command, contoh: "!", "/", "."
  prefix: process.env.BOT_PREFIX || "!",

  // Nomor owner, format: 62812xxxxxxx (tanpa + / spasi)
  // Bisa lebih dari satu, pisahkan dengan koma
  ownerNumbers: (process.env.OWNER_NUMBER || "628123456789").split(","),

  // Metode login: "pairing" | "qr" | "auto"
  // "auto" -> coba pairing code dulu (perlu isi nomor di bawah / prompt),
  //           kalau gagal / tidak diisi maka fallback ke QR code
  loginMethod: process.env.LOGIN_METHOD || "auto",

  // Nomor HP bot sendiri untuk pairing code, format: 62812xxxxxxx
  // Kalau dikosongkan, bot akan tanya lewat terminal saat pertama kali run
  botPhoneNumber: process.env.BOT_PHONE_NUMBER || "",

  // Nama folder session (auth) - jangan di-share / commit ke git!
  sessionName: "session",

  // Auto baca pesan masuk
  autoRead: true,

  // Auto typing sebelum reply
  autoTyping: false,

  // Timezone untuk log
  timezone: "Asia/Jakarta",
};
