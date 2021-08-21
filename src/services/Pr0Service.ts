import * as needle from 'needle';
import { InboxComments, Pr0grammAPI, Pr0grammResponse } from 'pr0gramm-api';
import { Items } from '../entity/Items';
import { ACRResponse } from './DatabaseService';
import log from '../helper/log';

class Pr0Service {

  private api: Pr0grammAPI;

  constructor(api: Pr0grammAPI) {
    this.api = api;
  }

  resolveThumb(thumbPath: string): Promise<string | false> {
    const splittedPath = thumbPath.split(".");
    thumbPath = "https://vid.pr0gramm.com/" + splittedPath[0] + ".mp4"
    return needle('get', thumbPath).then((response) => {
      if (response.statusCode == 404) return false;
      if (response.statusCode == 200) return thumbPath;
      log.error("Error while getting real URL from thumbnail", {tags: { service: "PR0", action: "Resolve" } });;
      return false;
    });
  }

  downloadItem(itemUrl: string, itemID: number): Promise<string> {
    const path = `./tmp/${itemID}.mp4`;
    return new Promise((resolve, reject) => {
      return needle.get(itemUrl, { output: path }, (err) => {
        if (err) reject(err);
        resolve(path);
      });
    });
  }

  async notifyUser(msg: InboxComments, found: boolean, item?: Items): Promise<boolean> {
    let messageNotFound: string;
    let messageFound: string;

    if (found) {
      messageFound = `Hallo ${msg.name},

    Du hast bei https://pr0gramm.com/new/${msg.itemId} nach der Musik gefragt.
    Jemand hat bereits danach gefragt, daher erhälst du hier nur eine Kopie.

    Titel: ${item.title}
    Album: ${item.album}
    Artist: ${item.artist}

    Hier ist ein Link: ${item.url}
    `;
    } else {
      messageNotFound = `Hallo ${msg.name},

    Du hast bei https://pr0gramm.com/new/${msg.itemId} nach der Musik gefragt.
    Leider wurden keine Informationen gefunden.`;
    }



    return this.api.messages.sendMessage(msg.name, (found ? messageFound : messageNotFound))
      .catch((err) => {
        log.error(err, {tags: { service: "PR0", action: "Message" } }); return false
      }).then(() => {
        return true;
      })
  }

  async commentMusicInfo(itemId: number, replyTo: number, found: boolean, data?: ACRResponse): Promise<Pr0grammResponse> {

    if (found) {
      const messageFound = `Es wurden folgende Informationen dazu gefunden:
      ${data.metadata.music[0].title} - ${data.metadata.music[0].artists[0].name}
      Aus dem Album: ${data.metadata.music[0].album.name}

      Hier ist ein Link: https://www.aha-music.com/${data.metadata.music[0].acrid}?utm_source=blast
      Zeitpunkt der Überprüfung ${this.getTimestamp}
    `;
      return await this.api.comments.post(itemId, messageFound, replyTo);
    } else {
      const messageNotFound = `Es wurden keine Informationen zu dem Lied gefunden

      Zeitpunkt der Überprüfung ${this.getTimestamp}`;
      return await this.api.comments.post(itemId, messageNotFound, replyTo);
    }
  }

  async messageNoThumb(user: string, itemID: number): Promise<Pr0grammResponse> {
    const message = `Hallo ${user},
    
    du hast mich unter https://pr0gramm.com/new/${itemID} markiert, dazu gibt es leider keine Informationen!`;
    return await this.api.messages.sendMessage(user, message);
  }

  getTimestamp(): string {
    const checkTime = new Date();
    const date = new Intl.DateTimeFormat('de').format(checkTime);
    const time = new Intl.DateTimeFormat('de', { hour: '2-digit',  minute: 'numeric' }).format(checkTime);
    return `${date} um ${time}`
  }

}

export default Pr0Service;
