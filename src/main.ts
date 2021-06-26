import { Pr0grammAPI, NodeRequester } from "pr0gramm-api";
import * as dotenv from 'dotenv';
import WatchService from './services/WatchService';
import Pr0Service from './services/Pr0Service';
import MusicService from './services/MusicService';
import DatabaseService from './services/DatabaseService';
import log from './helper/log';
import queue from 'queue';

dotenv.config();
const q = queue();

main();
async function main() {

  //const requester = NodeRequester.create("https://1fa20fb1-768a-401b-8e86-7b6c9f8ffe8b.mock.pstmn.io");
  const requester = NodeRequester.create();
  const api = Pr0grammAPI.create(requester);

  const loginResponse = await api.user.login(process.env.PR0_USER, process.env.PR0_PASSWORD);
  if (!loginResponse.success) {
    log.error("Could not log in", {tags: { service: "PR0", action: "Login" } });
    if (loginResponse.ban !== null) {
      log.error("You are banned. Reason: " + loginResponse.ban.reason, {tags: { service: "PR0", action: "Login" } });
      return;
    }
  } else {
    log.info("Logged in", {tags: { service: "PR0", action: "Login" } });
    const watcher = new WatchService();
    const pr0 = new Pr0Service(api);
    const music = new MusicService();
    const db = new DatabaseService(process.env.DB_HOST, Number.parseInt(process.env.DB_PORT), process.env.DB_USER, process.env.DB_PASS, process.env.DB_DATABASE, false);
    await db.connect();

    watcher.start(async () => {
      const Comments = await api.messages.getComments();
      const messages = Comments.messages.filter((msg) => {
        return msg.read == 0 && (msg.message == "@Sauce" || msg.message == "@sauce");
      })
      messages.forEach(async msg => {
        q.push(async () => {
          const thumb = await pr0.resolveThumb(msg.thumb); //Hole mir die original URL zu dem Video
          if (thumb !== false) {
            const checkItem = await db.checkItem(msg.itemId); //Überpüft ob der Post bereits abgefragt wurde
            if (!checkItem.empty && checkItem.data != null) {
              log.debug("Found data in DB ", {tags: { service: "DB", itemID: msg.itemId, action: "Comment" } });
              pr0.notifyUser(msg, true, checkItem.data); //Post wurde bereits abgefragt, antworte mit einer privaten Nachricht
            } else if (checkItem.empty == null && checkItem.data == null) { //Post wurde noch nicht abgefragt
              log.info("Start Download", {tags: { service: "PR0", itemID: msg.itemId, action: "Download" } });
              const downloadPath = await pr0.downloadItem(thumb.toString(), msg.itemId); //Herunterladen des Videos
              log.info("Start Convertion", {tags: { service: "ACR", itemID: msg.itemId, action: "Conversation" } });
              const musicPath = await music.convertToAudio(downloadPath, msg.itemId); //Extrahieren der Audiospur aus dem Video
              log.info("Start Identification", {tags: { service: "ACR", itemID: msg.itemId, action: "Identify" } });
              const musicInfo = await music.identifyMusic(musicPath); //Musik in der Audiospur erkennen
              if (musicInfo.status.code == 0) { //Erfolgreich erkannt?
                log.debug("Found data", {tags: { service: "PR0", itemID: msg.itemId, action: "Comment" } });
                await db.insertItem(msg.itemId, musicInfo); //Metadaten in die DB speichern
                await pr0.commentMusicInfo(msg.itemId, msg.id, true, musicInfo); //Unter der Markierung mit den Metadaten kommentieren
              } else { //Es wurden keine Metadaten erkannt
                log.debug("No data found", {tags: { service: "PR0", itemID: msg.itemId, action: "Comment" } });
                await db.insertItem(msg.itemId, musicInfo); //Leere Metadaten in die DB speichern
                await pr0.commentMusicInfo(msg.itemId, msg.id, false); //Benutzer per Kommentar benachrichtigen
              }
            } else if (checkItem.empty && checkItem.data == null) { //Post wurde abgefragt, es konnten aber keine Daten gefunden werden.
              log.debug("Never found data", {tags: { service: "PR0", itemID: msg.itemId, action: "Message" } });
              await pr0.notifyUser(msg, false); //Benutzer per private Nachricht benachrichtigen
            }
          } else {
            //Es konnte keine originale URL gefunden werden oder es ist kein Video
            log.debug("Found no video", {tags: { service: "PR0", itemID: msg.itemId, action: "Message" } });
            await pr0.messageNoThumb(msg.name, msg.itemId); //Benutzer per Kommentar benachrichtigen
          }
          await music.deleteFiles(msg.itemId); //Lösche alle temporären Dateien
        });
      });
      q.start((err) => {
        if (err) log.error(err.toString());
      })
    });
  }
}

q.on('success', () => {
  log.debug('[Queue] Job done!')
})
