require('./config/settings')
require('./src/lib/menu')
const fs = require('fs');
const path = require('path');
const {
  Bot,
  Markup,
  InlineKeyboard,
  InputFile
} = require("grammy");
const ora = require('ora');
const axios = require('axios');
const readlineSync = require('readline-sync');
const {
  handleMessage
} = require("./config/xy");
const connectwa = require("./src/lib/connectwa");
const {
  setBotInstance,
  restoreWhatsAppSessions
} = require('./src/lib/connectwa');

const tokenPath = path.join(__dirname, './src/database/token.json');
const warnFile = path.join(__dirname, "./src/database/warns.json");
const partnerFile = path.join(__dirname, "./src/database/partner.json");
const resellerFile = path.join(__dirname, "./src/database/reseller.json");
const sellerFile = path.join(__dirname, "./src/database/seller.json");
const ownerFile = path.join(__dirname, "./owner.json");
const userFile = path.join(__dirname, "./src/database/user.json");

function ensureDatabaseFiles() {
  const files = [{
    path: partnerFile,
    defaultContent: "[]"
  }, {
    path: resellerFile,
    defaultContent: "[]"
  }, {
    path: sellerFile,
    defaultContent: "[]"
  }, {
    path: ownerFile,
    defaultContent: "[]"
  }, {
    path: userFile,
    defaultContent: "[]"
  }, {
    path: warnFile,
    defaultContent: "{}"
  }, {
    path: './src/database/list.json',
    defaultContent: "[]"
  }, {
    path: './src/database/weleave.json',
    defaultContent: "[]"
  }, {
    path: './src/database/antilink.json',
    defaultContent: "[]"
  }];

  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      try {
        fs.writeFileSync(file.path, file.defaultContent, 'utf8');
      } catch (e) {
        console.error(`Gagal membuat file ${file.path}:`, e);
      }
    }
  }
}

ensureDatabaseFiles();

// Fungsi baru untuk mendapatkan status pengguna yang lebih spesifik
function getUserStatus(userId) {
  const userIdStr = String(userId);
  const ownerList = JSON.parse(fs.readFileSync(ownerFile));
  const sellerList = JSON.parse(fs.readFileSync(sellerFile));
  const partnerList = JSON.parse(fs.readFileSync(partnerFile));
  const resellerList = JSON.parse(fs.readFileSync(resellerFile));

  if (ownerList.includes(userIdStr)) return "owner";
  if (sellerList.some(seller => String(seller.id) === userIdStr)) return "seller";
  if (Array.isArray(partnerList) && partnerList.some(partner => String(partner.id) === userIdStr)) return "partner";
  if (Array.isArray(resellerList) && resellerList.some(reseller => String(reseller.id) === userIdStr)) return "reseller";

  return "user";
}

global.startTime = Date.now();

function formatDuration(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${d} hari ${h} jam ${m} menit ${s} detik`;
}

function readWarnDB() {
  try {
    if (fs.existsSync(warnFile)) {
      return JSON.parse(fs.readFileSync(warnFile, "utf8"));
    }
    return {};
  } catch (error) {
    console.error("❌ Error membaca warnDB:", error);
    return {};
  }
}

function saveWarnDB(data) {
  try {
    fs.writeFileSync(warnFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error menyimpan warnDB:", error);
  }
}

let warnDB = readWarnDB();
let pendingWarns = new Map();

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function askToken() {
  console.log('🔑 Masukkan Token Bot Telegram:');
  return readlineSync.question('> ').trim();
}

function getToken() {
  if (fs.existsSync(tokenPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
      if (data.token && data.token.trim() !== '') {
        return data.token.trim();
      }
    } catch (err) {
      console.log('⚠️ Gagal membaca token.json, meminta token baru...');
    }
  }

  const token = askToken();
  if (!token) {
    console.log('❌ Token kosong! Program dihentikan.');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(tokenPath), {
    recursive: true
  });
  fs.writeFileSync(tokenPath, JSON.stringify({
    token
  }, null, 2));
  console.log('✅ Token berhasil disimpan!');
  return token;
}

const botToken = getToken();
const bot = new Bot(botToken);

setBotInstance(bot);

const CHANNEL_ID = "@allinfojak";

function loadUsers() {
  if (!fs.existsSync(userFile)) return [];
  return JSON.parse(fs.readFileSync(userFile, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
}

async function checkMembership(ctx, chatId) {
  try {
    const member = await ctx.api.getChatMember(chatId, ctx.from.id);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (err) {
    console.error("❌ Gagal cek member:", err.message);
    return true;
  }
}

// === CMD /start ===
bot.command("start", async (ctx) => {
  const userId = ctx.from.id;

  const isMember = await checkMembership(ctx, CHANNEL_ID);

  if (!isMember) {
    return ctx.reply(
      `⚠️ *Kamu harus join channel dulu kontol sebelum bisa menggunakan bot ini!*\n\nKlik tombol di bawah untuk join channel`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔗 Join Channel",
                url: `https://t.me/${CHANNEL_ID.replace("@", "")}`,
              },
            ],
          ],
        },
      }
    );
  }

  const users = new Set(loadUsers());
  users.add(userId);
  saveUsers([...users]);

  await ctx.api.sendMessage(
    ctx.chat.id,
    "👋 Hallo Selamat Datang di bot Cpanel ZENNSYX\n\nSilahkan Menikmati :)",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📜 Info Script", callback_data: "script" },
            { text: "👑 Owner", callback_data: "owner" },
          ],
          [{ text: "🧭 Buka Menu", callback_data: "mainmenu" }],
        ],
      },
    }
  );
});

bot.callbackQuery("owner", async (ctx) => {
  await ctx.answerCallbackQuery();

  const ownerId = global.idowner;
  await ctx.reply(`👤 Kontak Owner: [klik di sini](tg://user?id=${ownerId})`, {
    parse_mode: "Markdown"
  });
});

bot.callbackQuery("Testi", async (ctx) => {
  await ctx.answerCallbackQuery();

  await ctx.reply("📄 *Testi:*\n@allinfojak", {
    parse_mode: "Markdown"
  });
});

function getMainMenuKeyboard() {
  return new InlineKeyboard()
    .text("🎉 Special Menu", "specialmenu").row()
    .text("📌 Owner Menu", "ownermenu").row()
    .text("🛠️ Tools Menu", "toolsmenu").row()
    .text("📥 Downloader Menu", "downloadermenu").row()
    .text("🛒 Reseller Panel", "resellerpanel").row()
    .text("🤝 Partner Panel", "partnerpanel").row()
    .text("🛍️ Store Menu", "storemenu").row()
    .text("🎛️ Installer Panel", "installermenu").row()
    .text("👥 Group Menu", "groupmenu");
}

function getPartnerPanelKeyboard() {
  return new InlineKeyboard()
    .text("Server V1", "partnerpanel_v1").row()
    .text("Server V2", "partnerpanel_v2").row()
    .text("Server V3", "partnerpanel_v3").row()
    .text("Server V4", "partnerpanel_v4").row()
    .text("⬅️ Kembali", "mainmenu");
}

function getResellerPanelKeyboard() {
  return new InlineKeyboard()
    .text("Server V1", "resellerpanel_v1").row()
    .text("Server V2", "resellerpanel_v2").row()
    .text("Server V3", "resellerpanel_v3").row()
    .text("Server V4", "resellerpanel_v4").row()
    .text("⬅️ Kembali", "mainmenu");
}

async function sendMainMenu(ctx) {
  const uptime = formatDuration(Date.now() - global.startTime);

  const info = `
🤖 *INFO BOT*

• Nama Bot: ${namabot}
• Status Kamu: ${getUserStatus(ctx.from.id)}
• ID Kamu: ${ctx.from.id}
• Username: @${ctx.from.username || "-"}
• Versi Bot: 2.0.0
• Aktif Sejak: ${uptime}
• Dibuat Oleh: [ZENNSYX](tg://user?id=8127540523})

🔘 Silakan pilih menu:
`;

  try {
    if (ctx.update.message) {
      await ctx.reply(info, {
        parse_mode: "Markdown",
        reply_markup: getMainMenuKeyboard(),
      });
    }

    if (ctx.update.callback_query) {
      await ctx.editMessageText(info, {
        parse_mode: "Markdown",
        reply_markup: getMainMenuKeyboard(),
      });
    }
  } catch (error) {
    console.error("❌ Gagal kirim menu utama:", error);
  }
}

const menus = {
  specialmenu: specialmenu,
  ownermenu: ownermenu,
  toolsmenu: toolsmenu,
  downloadermenu: downloadermenu,
  storemenu: storemenu,
  installermenu: installermenu,
  groupmenu: groupmenu,
};

bot.command("menu", sendMainMenu);

for (const key in menus) {
  bot.callbackQuery(key, async (ctx) => {
    try {
      await ctx.editMessageText(menus[key], {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard().text("⬅️ Kembali", "mainmenu"),
      });
    } catch (error) {
      console.error(`❌ Gagal buka menu ${key}:`, error);
    }
  });
}

bot.callbackQuery("mainmenu", async (ctx) => {
  await sendMainMenu(ctx);
});

bot.callbackQuery("partnerpanel", async (ctx) => {
  await ctx.editMessageText("🤝 **Partner Panel**\n\nSilakan pilih server yang ingin Anda kelola:", {
    parse_mode: "Markdown",
    reply_markup: getPartnerPanelKeyboard(),
  });
});

bot.callbackQuery("resellerpanel", async (ctx) => {
  await ctx.editMessageText("🛒 **Reseller Panel**\n\nSilakan pilih server yang ingin Anda kelola:", {
    parse_mode: "Markdown",
    reply_markup: getResellerPanelKeyboard(),
  });
});

bot.callbackQuery("partnerpanel_v1", async (ctx) => {
  await ctx.editMessageText(partnerpanel, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("⬅️ Kembali", "partnerpanel"),
  });
});
bot.callbackQuery("partnerpanel_v2", async (ctx) => {
  await ctx.editMessageText(partnerpanelV2, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("⬅️ Kembali", "partnerpanel"),
  });
});
bot.callbackQuery("partnerpanel_v3", async (ctx) => {
  await ctx.editMessageText(partnerpanelV3, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("⬅️ Kembali", "partnerpanel"),
  });
});
bot.callbackQuery("partnerpanel_v4", async (ctx) => {
  await ctx.editMessageText(partnerpanelV4, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("⬅️ Kembali", "partnerpanel"),
  });
});
bot.callbackQuery("resellerpanel_v1", async (ctx) => {
  await ctx.editMessageText(resellerpanel, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("⬅️ Kembali", "resellerpanel"),
  });
});
bot.callbackQuery("resellerpanel_v2", async (ctx) => {
  await ctx.editMessageText(resellerpanelV2, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("⬅️ Kembali", "resellerpanel"),
  });
});
bot.callbackQuery("resellerpanel_v3", async (ctx) => {
  await ctx.editMessageText(resellerpanelV3, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("⬅️ Kembali", "resellerpanel"),
  });
});
bot.callbackQuery("resellerpanel_v4", async (ctx) => {
  await ctx.editMessageText(resellerpanelV4, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard().text("⬅️ Kembali", "resellerpanel"),
  });
});

const spinner = ora({
  text: 'Menghubungkan bot...',
  spinner: 'bouncingBar'
}).start();

function animateWaitingText() {
  let dots = '';
  return setInterval(() => {
    dots = dots.length < 3 ? dots + '.' : '';
    process.stdout.write(`\r⌛ Menunggu pesan${dots} `);
  }, 500);
}

bot.api.getMe().then((me) => {
  console.clear();
  console.log("==================================");
  spinner.succeed("✅ Bot berhasil terhubung!");
  console.log(`🤖 Nama Bot  : ${me.first_name}`);
  console.log(`📛 Username  : @${me.username}`);
  console.log("▶️ Bot aktif dan siap menerima perintah");
  console.log("==================================");

  animateWaitingText();

  (async () => {
    await connectwa.restoreWhatsAppSessions();
    console.log("✅ Semua sesi berhasil direstore. Bot siap digunakan.");
  })();
  bot.start();
}).catch((err) => {
  console.error("❌ Gagal menghubungkan bot:", err.message);
  process.exit(1);
});

bot.on("message:new_chat_members", async (ctx) => {
  const groupID = ctx.chat.id;
  let listData = [];
  try {
    listData = JSON.parse(fs.readFileSync('./src/database/weleave.json', 'utf8'));
  } catch (e) {}

  const found = listData.find(item => item.id === groupID);
  if (!found || !found.welcome) return;

  for (const user of ctx.message.new_chat_members) {
    const name = user.first_name || "Pengguna";
    await ctx.reply(`👋 Selamat datang, *${name}*!`, {
      parse_mode: "Markdown"
    });
  }
});

bot.on("message:left_chat_member", async (ctx) => {
  const groupID = ctx.chat.id;
  let listData = [];
  try {
    listData = JSON.parse(fs.readFileSync('./src/database/weleave.json', 'utf8'));
  } catch (e) {}

  const found = listData.find(item => item.id === groupID);
  if (!found || !found.leave) return;

  const name = ctx.message.left_chat_member?.first_name || "Pengguna";
  await ctx.reply(`👋 Selamat tinggal, *${name}*!`, {
    parse_mode: "Markdown"
  });
});


bot.on("message", async (xy, next) => {
  const chatId = xy.chat.id;
  const userId = xy.from.id;
  const text = xy.message.text;
  const entities = xy.message.entities;

  if (xy.chat.type !== "group" && xy.chat.type !== "supergroup") return next();

  const antilinkFile = './src/database/antilink.json';
  if (!fs.existsSync(antilinkFile)) {
    fs.writeFileSync(antilinkFile, "[]", 'utf8');
  }

  const listData = JSON.parse(fs.readFileSync(antilinkFile, "utf8"));
  const groupData = listData.find((item) => item.id === chatId);

  if (!groupData || !groupData.antilink) return next();

  const admins = await xy.getChatAdministrators();
  const isAdmin = admins.some((a) => a.user.id === userId);
  if (isAdmin) return next();

  let containsLink = /(https?:\/\/[^\s]+)/.test(text);
  if (entities && Array.isArray(entities)) {
    for (let entity of entities) {
      if (entity.type === "url" || entity.type === "text_link") {
        containsLink = true;
        break;
      }
    }
  }

  if (!containsLink) return next();

  let warningDataFile = "./src/database/warningData.json";
  if (!fs.existsSync(warningDataFile)) {
    fs.writeFileSync(warningDataFile, "{}", 'utf8');
  }

  let warningData = JSON.parse(fs.readFileSync(warningDataFile, "utf8"));
  if (!warningData[chatId]) warningData[chatId] = {};
  if (!warningData[chatId][userId]) warningData[chatId][userId] = 0;

  warningData[chatId][userId]++;

  try {
    await xy.api.deleteMessage(chatId, xy.message.message_id);
  } catch (err) {
    console.error("Gagal hapus pesan:", err);
  }

  if (warningData[chatId][userId] < 3) {
    await xy.reply(`⚠️ *Peringatan ${warningData[chatId][userId]}/3!* ${xy.from.first_name}, jangan kirim link!`, {
      parse_mode: "Markdown",
    });
  } else {
    try {
      const muteUntil = Math.floor(Date.now() / 1000) + 3 * 3600;
      await xy.restrictChatMember(userId, {
        permissions: {
          can_send_messages: false,
        },
        until_date: muteUntil,
      });
      await xy.reply(`🚨 ${xy.from.first_name} telah mencapai 3 pelanggaran dan di-mute 3 jam.`);
      warningData[chatId][userId] = 0;
    } catch (e) {
      console.error("Gagal mute:", e);
    }
  }

  fs.writeFileSync(warningDataFile, JSON.stringify(warningData, null, 2));

});

bot.on("message", async (xy) => {
  const msg = xy.message

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  const user = xy.from;
  const nama = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const username = user.username ? `@${user.username}` : '(tanpa username)';
  const waktu = new Date().toLocaleTimeString();

  console.log(`⏰ ${waktu}`);
  console.log(`🆔 Id : ${user.id}`)
  console.log(`📩 Dari     : ${username} (${nama})`);
  console.log(`📝 Pesan    : ${msg.text}`);
  console.log("==================================");


  const seller = JSON.parse(fs.readFileSync('./src/database/seller.json'));
  const partner = JSON.parse(fs.readFileSync('./src/database/partner.json'));
  const reseller = JSON.parse(fs.readFileSync('./src/database/reseller.json')); // Load reseller data
  const sellerPath = './src/database/seller.json';
  const owners = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
  const db_respon_list = JSON.parse(fs.readFileSync('./src/database/list.json'));

  const isOwner = owners.includes(String(xy.from.id));

  const now = Date.now();

  const validSellers = seller.filter(item => item.expiresAt > now);

  const {
    CatBox,
    fileIO,
    pomfCDN
  } = require('./src/lib/uploader');

  if (validSellers.length !== seller.length) {
    fs.writeFileSync(sellerPath, JSON.stringify(validSellers, null, 2));
  }

  const isSeller = validSellers.some(item =>
    item.id === String(xy.from.id)
  );

  const isPartner = Array.isArray(partner) && partner.some(item =>
    item.id === String(xy.from.id)
  );
  
  const isReseller = Array.isArray(reseller) && reseller.some(item =>
    item.id === String(xy.from.id)
  );

  const isGroup = ['group', 'supergroup'].includes(xy.chat.type);

  const groupName = isGroup ? xy.chat.title : "";
  const groupId = isGroup ? xy.chat.id : "";

  let groupAdmins = [];
  let isGroupAdmins = false;
  let isBotGroupAdmins = false;

  if (isGroup) {
    const participants = await xy.getChatAdministrators();
    groupAdmins = participants.map(admin => admin.user.id);
    isGroupAdmins = groupAdmins.includes(xy.from.id);

    const botId = xy.me.id;
    isBotGroupAdmins = groupAdmins.includes(botId);
  }

  const reply = (teks) => xy.reply(teks);

  function generateReadableString(length) {
    const words = ["sky", "cloud", "wind", "fire", "storm", "light", "wave", "stone", "shadow", "earth"];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return randomWord + randomNumber;
  }

  let body = msg.text ||
    msg.caption ||
    msg.document?.file_name ||
    msg.video?.file_name ||
    msg.audio?.file_name ||
    (msg.voice && '[Voice Message]') ||
    (msg.sticker && '[Sticker]') ||
    (msg.animation && '[GIF]') ||
    (msg.photo && '[Photo]') ||
    (msg.contact && '[Contact]') ||
    (msg.location && '[Location]') ||
    (msg.venue && '[Venue]') ||
    (msg.poll && '[Poll]') ||
    "";

  const command = body.startsWith(prefix) ?
    body.slice(prefix.length).trim().split(" ")[0].split("@")[0].toLowerCase() :
    "";
  const args = body.trim().split(/ +/).slice(1);
  const q = text = args.join(" ");

  const sender = xy.message.chat.id;

  if (body && xy.chat && xy.chat.type !== 'private') {
    let userInput = body.trim();
    let matchedProduct = db_respon_list.find(item =>
      item.id === xy.chat.id &&
      item.key.toLowerCase() === userInput.toLowerCase()
    );

    if (matchedProduct) {
      if (matchedProduct.isImage && matchedProduct.image_url) {
        const response = await axios.get(matchedProduct.image_url, {
          responseType: "arraybuffer"
        });
        const imagePath = `./temp.jpg`;

        fs.writeFileSync(imagePath, response.data);

        await xy.api.sendPhoto(xy.chat.id, new InputFile(imagePath), {
          caption: `*${matchedProduct.key}*\n\n${matchedProduct.response}`,
          parse_mode: "Markdown"
        });

        fs.unlinkSync(imagePath);
      } else {
        reply(`*${matchedProduct.key}*\n\n${matchedProduct.response}`, {
          parse_mode: "Markdown"
        });
      }
    }
  }

  if (!global.groupMembers) {
    global.groupMembers = {};
  }

  if (xy.message && xy.message.from && xy.message.chat && xy.message.chat.type !== 'private') {
    const chatId = xy.message.chat.id;
    const user = xy.message.from;
    try {
      if (!global.groupMembers[chatId]) {
        global.groupMembers[chatId] = [];
      }

      const existingMemberIndex = global.groupMembers[chatId].findIndex(
        member => member.id === user.id
      );

      if (existingMemberIndex === -1) {
        global.groupMembers[chatId].push({
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          username: user.username || '',
          is_bot: user.is_bot || false,
          last_seen: new Date().toISOString()
        });
      } else {
        global.groupMembers[chatId][existingMemberIndex].last_seen = new Date().toISOString();
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      global.groupMembers[chatId] = global.groupMembers[chatId].filter(member => {
        const lastSeen = new Date(member.last_seen);
        return lastSeen > thirtyDaysAgo;
      });
    } catch (error) {
      console.error("Error auto-collecting member:", error);
    }
  }
  await handleMessage(xy, command, sleep, isOwner, isSeller, isPartner, isReseller, reply, owners, seller, sellerPath, q, text, InlineKeyboard, paket, isGroupAdmins, mess, warnDB, saveWarnDB, pendingWarns, InputFile, botToken, CatBox, sender, db_respon_list, generateReadableString);
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const chatId = ctx.chat.id;
  const messageId = ctx.callbackQuery.message.message_id;
  const userId = ctx.from.id;

  if (data.startsWith("cancel_warn_")) {
    try {
      const admins = await ctx.getChatAdministrators();
      const isAdmin = admins.some((admin) => admin.user.id === userId);
      if (!isAdmin) {
        return ctx.answerCallbackQuery({
          text: "❌ Hanya admin yang bisa membatalkan peringatan.",
          show_alert: true,
        });
      }
    } catch (e) {
      console.error("Gagal cek admin:", e);
      return ctx.answerCallbackQuery({
        text: "❌ Terjadi kesalahan saat memverifikasi admin.",
        show_alert: true,
      });
    }

    const warnedUserId = data.split("_")[2];
    if (!warnDB[warnedUserId] || warnDB[warnedUserId].length === 0) {
      return ctx.answerCallbackQuery({
        text: "⚠️ Tidak ada peringatan yang bisa dibatalkan.",
        show_alert: true,
      });
    }

    warnDB[warnedUserId].pop();
    saveWarnDB(warnDB);

    const warnCount = warnDB[warnedUserId].length;
    let updatedText = `⚠️ Peringatan telah diperbarui!\n📌 Total peringatan: ${warnCount}/3`;

    await ctx.editMessageText(updatedText, {
      reply_markup: warnCount > 0 ? {
        inline_keyboard: [
          [{
            text: "❌ Batalkan Peringatan",
            callback_data: `cancel_warn_${warnedUserId}`
          }]
        ]
      } : undefined
    });

    await ctx.answerCallbackQuery({
      text: "✅ Peringatan berhasil dibatalkan!",
      show_alert: true,
    });
  }
});
