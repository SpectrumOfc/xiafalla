import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from 'ytdl-core';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

let handler = async (m, { conn, command, args, text }) => {
    if (!text) throw `🔮𝙌𝙪𝙚 𝙚𝙨𝙩𝙖𝙨 𝙗𝙪𝙨𝙘𝙖𝙣𝙙𝙤 ?🔮\n𝙄𝙣𝙜𝙧𝙚𝙨𝙚 𝙚𝙡 𝙣𝙤𝙢𝙗𝙧𝙚 𝙙𝙚𝙡 𝙡𝙖 𝙘𝙖𝙣𝙘𝙞𝙤𝙣 𝙮 𝙣𝙤𝙢𝙗𝙧𝙚 𝙙𝙚𝙡 𝙘𝙖𝙣𝙩𝙖𝙣𝙩𝙚\n\n*Ejemplo:*\n#play brattyputy yeri mua`;

    try {
        const yt_play = await search(args.join(" "));
        const videoUrl = yt_play[0].url;

        // Enviar mensaje inicial con detalles del video
        await conn.sendMessage(m.chat, {
            text: `🎶 Buscando la canción...`,
            contextInfo: {
                externalAdReply: {
                    title: yt_play[0].title,
                    body: "𝙓𝙞𝙖𝘽𝙤𝙩-𝙈𝘿",
                    thumbnailUrl: yt_play[0].thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        // Descargar y enviar audio
        let audioUrl = null;

        try {
            const yt = await youtubedl(videoUrl).catch(async () => await youtubedlv2(videoUrl));
            audioUrl = await yt.audio['128kbps'].download();
            console.log("Audio URL from bochilteam:", audioUrl);
        } catch {
            try {
                const dataRE = await fetch(`https://api.akuari.my.id/downloader/youtube?link=${videoUrl}`);
                const dataRET = await dataRE.json();
                audioUrl = dataRET.mp3[1].url;
                console.log("Audio URL from Akuari:", audioUrl);
            } catch {
                console.log("Error al obtener el audio desde Akuari.");
            }
        }

        if (audioUrl) {
            await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: m });
            console.log("Audio enviado correctamente.");
        } else {
            throw new Error("No se pudo obtener el audio.");
        }
    } catch (error) {
        console.error("Error en la función principal:", error);
    }
};

handler.command = ['play'];
handler.exp = 0;
export default handler;

async function search(query, options = {}) {
    const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
    return search.videos;
}
