if (!isSelf && message.mentioned && afk.isAfk) {
            const timeSince = ((Date.now() - afk.since) / (1000 * 60)).toFixed(1);
            await client.sendMessage(chatId, {
                message: `<blockquote>
<b>Sedang AFK</b>
📝 Reason: ${afk.reason || 'No Reason'}
⏰️ Time: ${timeSince} berapa menit yang lalu</blockquote>`,
                replyTo: message.id,
                parseMode: 'html'
            });
        }
        
        
// Pastikan myId sudah didefinisikan di awal, misal saat bot start:
let myId;
(async () => {
    try {
        const me = await client.getMe();
        myId = me.id; // simpan ID sendiri
    } catch (e) {
        console.error("Gagal ambil ID sendiri:", e);
    }
})();

// Auto-reply AFK
if (afk.isAfk && (!myId || message.senderId.toString() !== myId.toString())) {
    // Hitung durasi AFK
    const detikTotal = Math.floor((Date.now() - afk.since) / 1000);
    let durasi = "";
    if (detikTotal >= 3600) {
        const jam = Math.floor(detikTotal / 3600);
        const menit = Math.floor((detikTotal % 3600) / 60);
        durasi = `${jam} jam ${menit} menit`;
    } else if (detikTotal >= 60) {
        const menit = Math.floor(detikTotal / 60);
        const sisaDetik = detikTotal % 60;
        durasi = `${menit} menit ${sisaDetik} detik`;
    } else {
        durasi = `${detikTotal} detik`;
    }

    const reason = afk.reason || "No Reason";

    // Kirim auto-reply jika:
    // - Privat, atau
    // - Mention di grup, atau reply pesan kita di grup
    if (
        message.isPrivate ||
        message.mentioned ||
        (message.isGroup && message.replyTo?.senderId?.toString() === myId?.toString())
    ) {
        await client.sendMessage(message.chatId, {
            message: `<blockquote>😴 <b>Sedang AFK</b>
📝 Reason: ${reason}
⏱️ Durasi: ${durasi}</blockquote>`,
            parseMode: "html",
            replyTo: message.id
        });
    }
}