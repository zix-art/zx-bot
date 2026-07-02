# WhatsApp Bot (Baileys) — Termux / VPS / Panel Ready

Bot WhatsApp berbasis [Baileys](https://github.com/WhiskeySockets/Baileys) dengan sistem plugin,
database JSON, auto respond, pairing code + QR fallback. Bisa dijalankan di **Termux**, **VPS**,
maupun **Panel Hosting** (Pterodactyl dan sejenisnya).

## Struktur Project

```
whatsapp-bot/
├── index.js              # entry point & connection handler
├── config.js             # konfigurasi bot
├── package.json
├── ecosystem.config.js   # config PM2 (untuk VPS)
├── .env.example          # template environment variable
├── database/
│   └── db.js             # database JSON sederhana
├── lib/
│   ├── plugin-loader.js
│   └── functions.js
├── plugins/               # semua command bot, 1 file = 1 fitur
│   ├── menu.js
│   ├── ping.js
│   ├── uptime.js
│   ├── sticker.js
│   ├── groupinfo.js
│   ├── group_tagall.js
│   ├── group_kick.js
│   ├── group_welcome.js
│   ├── owner_broadcast.js
│   └── owner_autoresponse.js
└── session/                # auth login, otomatis terbuat, JANGAN di-share
```

## Konfigurasi

Edit `config.js` langsung, **atau** copy `.env.example` menjadi `.env` dan isi:

```
BOT_NAME=WA-Bot
BOT_PREFIX=!
OWNER_NUMBER=628123456789      # nomor kamu, bisa lebih dari 1 pisah koma
LOGIN_METHOD=auto              # auto | pairing | qr
BOT_PHONE_NUMBER=628123456789  # nomor WA yang dipakai bot (untuk pairing code)
```

Kalau `BOT_PHONE_NUMBER` dikosongkan, bot akan tanya nomor lewat terminal saat pertama run
(khusus mode `auto`/`pairing`). Kalau tetap dikosongkan saat ditanya, otomatis fallback ke QR code.

---

## 1. Menjalankan di Termux

```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts git -y

git clone <url-repo-kamu> whatsapp-bot   # atau extract zip project ini
cd whatsapp-bot
npm install
npm start
```

Scan QR / masukkan pairing code sesuai instruksi yang muncul di layar.
Agar bot tetap jalan walau layar HP mati, jalankan `termux-wake-lock` sebelum `npm start`,
dan install Termux:Boot / gunakan `tmux` supaya proses tidak mati saat Termux ditutup:

```bash
pkg install tmux -y
tmux new -s wabot
npm start
# tekan Ctrl+B lalu D untuk detach (bot tetap jalan di background)
# untuk kembali: tmux attach -t wabot
```

---

## 2. Menjalankan di VPS (Ubuntu/Debian)

```bash
sudo apt update && sudo apt install -y nodejs npm git
node -v   # pastikan >= 18, kalau belum install via nvm

git clone <url-repo-kamu> whatsapp-bot
cd whatsapp-bot
npm install
```

Gunakan **PM2** supaya bot auto-restart kalau crash dan tetap jalan setelah SSH ditutup:

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs whatsapp-bot     # lihat log & scan QR/pairing code
pm2 save
pm2 startup               # supaya auto-start saat VPS reboot
```

Perintah PM2 berguna lainnya:
```bash
pm2 restart whatsapp-bot
pm2 stop whatsapp-bot
pm2 delete whatsapp-bot
```

---

## 3. Menjalankan di Panel Hosting (Pterodactyl / panel berbasis Docker)

1. Buat server baru dengan **Egg Node.js** (versi 18/20).
2. Upload seluruh isi folder project ini ke server (lewat File Manager panel atau `git clone`
   di tab Console kalau egg mendukung SFTP/console command).
3. Set **Startup Command** ke:
   ```
   npm install && node index.js
   ```
   atau kalau egg sudah auto `npm install`, cukup:
   ```
   node index.js
   ```
4. Isi **Environment Variables** di panel (kalau egg menyediakan) sesuai `.env.example`
   — atau upload file `.env` langsung lewat File Manager.
5. Start server, buka tab **Console**, scan QR code / masukkan pairing code yang muncul di log.
6. Setelah login sukses, folder `session/` akan menyimpan credential — **jangan hapus** folder
   ini kalau tidak ingin login ulang. Backup folder `session/` secara berkala.

> Catatan: karena panel biasanya berjalan di Docker/headless, mode **pairing code** biasanya
> lebih praktis daripada scan QR (QR di log console kadang sulit di-scan karena resolusi kecil).
> Set `LOGIN_METHOD=pairing` dan isi `BOT_PHONE_NUMBER` di environment variable panel.

---

## Menambah Fitur Baru (Plugin)

Buat file baru di folder `plugins/`, contoh `plugins/halo.js`:

```js
module.exports = {
  command: ["halo"],
  category: "main",
  description: "Contoh command sederhana",
  execute: async (sock, m, args, ctx) => {
    await sock.sendMessage(ctx.from, { text: "Halo juga!" }, { quoted: m });
  },
};
```

Restart bot (atau panggil command `reload` kalau kamu tambahkan plugin reload sendiri), command
`!halo` langsung otomatis muncul di `!menu`.

Opsi tambahan yang bisa dipakai per plugin: `ownerOnly`, `groupOnly`, `adminOnly`.

## Troubleshooting

- **QR code terus muncul ulang / tidak connect**: hapus folder `session/`, lalu run ulang.
- **Bot ke-logout sendiri**: biasanya karena WA di HP juga logout perangkat tertaut, atau
  multi-device limit (maks 4 perangkat tertaut per akun WA).
- **Error `Cannot find module`**: jalankan `npm install` ulang.
- **Node version error**: pastikan Node.js >= 18 (`node -v`).

## Peringatan

Gunakan bot ini secara wajar. Spam/broadcast berlebihan atau otomatisasi agresif bisa membuat
akun WhatsApp kamu diban oleh WhatsApp. Disarankan pakai nomor sekunder, bukan nomor utama.
