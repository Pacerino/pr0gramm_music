import * as needle from 'needle';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as crypto from 'crypto';
import { ACRResponse } from './DatabaseService';

class MusicService {

  private defaultOptions;

  constructor() {
    this.defaultOptions = {
      host: 'https://identify-eu-west-1.acrcloud.com',
      endpoint: '/v1/identify',
      signature_version: '1',
      data_type:'audio',
      secure: true,
      access_key: process.env.ACR_ACCESS_KEY,
      access_secret: process.env.ACR_SECRET_KEY,
      timestamp: (new Date().getTime()/1000)
    };
  }

  convertToAudio(pathToFile: string, itemID: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `./tmp/${itemID}.mp3`;
      ffmpeg(pathToFile).output(outputPath).on('end', function () {
        resolve(outputPath);
      }).on('error', function (err) {
        reject(err);
      }).run();
    });
  }

  identifyMusic(pathToAudio: string): Promise<ACRResponse> {
    const stringToSign = this.buildStringToSign('POST', this.defaultOptions.endpoint, this.defaultOptions.access_key, this.defaultOptions.data_type, this.defaultOptions.signature_version, this.defaultOptions.timestamp);
    const signature = this.sign(stringToSign, process.env.ACR_SECRET_KEY);
    const bitmap = fs.readFileSync(pathToAudio);
    const data = Buffer.from(bitmap);
    const formData = {
      sample: data,
      access_key: this.defaultOptions.access_key,
      data_type: this.defaultOptions.data_type,
      signature_version: this.defaultOptions.signature_version,
      signature: signature,
      sample_bytes: data.length,
      timestamp: this.defaultOptions.timestamp,
    };
    return new Promise<ACRResponse>((resolve, reject) => {
      needle.post(this.defaultOptions.host + this.defaultOptions.endpoint, formData, {multipart: true}, (err, _resp, body) => {
        if (err) return reject(err);
        const data: ACRResponse = JSON.parse(body);
        if(data.status.code == 2001) return reject("Init failed or request timeout");
        if(data.status.code == 2002) return reject("Metadata parse error");
        if(data.status.code == 2004) return reject("Unable to generate fingerprint");
        if(data.status.code == 2005) return reject("Timeout");
        if(data.status.code == 3000) return reject("Recognition service error（http error 500）");
        if(data.status.code == 3003) return reject("Limit exceeded, please upgrade your account");
        if(data.status.code == 3006) return reject("Invalid arguments");
        if(data.status.code == 3014) return reject("Invalid signature");
        if(data.status.code == 3015) return reject("QpS limit exceeded, please upgrade your account");
        resolve(data);
      });
    });
  }

  async deleteFiles(itemID: number): Promise<void> {
    await [`./tmp/${itemID}.mp3`, `./tmp/${itemID}.mp4`].map(file => new Promise<void>((resolve, reject) => {
      fs.stat(file, (exists) => {
        if (exists == null) {
          fs.unlink(file, err => {
            if(err) reject(err);
            resolve();
          });
        } else if (exists.code === 'ENOENT') {
          resolve();
        }
      });
    }));
  }

  private buildStringToSign(method: string, uri: string, accessKey: string, dataType: string, signatureVersion: string, timestamp: number): string {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
  }

  private sign(signString: string, accessSecret: string): string {
    return crypto.createHmac('sha1', accessSecret)
      .update(Buffer.from(signString, 'utf-8'))
      .digest().toString('base64');
  }

}

export default MusicService;
