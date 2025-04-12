import { app, BrowserWindow, protocol } from 'electron';
import path from 'path';
import expressApp, { loadKafka } from './app/server/src/server';
import { Readable } from 'stream';

let mainWindow: any;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: false,
    },
  });

  // Load local frontend (built) index.html
  mainWindow.loadFile(path.join(__dirname, 'app/frontend/index.html'), {
    baseURLForDataURL: `file://${path.join(__dirname, 'app/frontend/dist/')}/`,
  });
}

app.whenReady().then(async () => {
  await loadKafka();
  protocol.interceptBufferProtocol(
    'http',
    async (request: any, callback: any) => {
      const url: any = new URL(request.url);
      const { pathname } = url;

      if (!pathname?.startsWith('/api')) return callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND

      const reqStream: any = new Readable({
        read() {
          this.push(null);
        },
      });

      reqStream.url = pathname;
      reqStream.method = request.method;
      reqStream.headers = {
        ...request.headers,
        origin: 'http://localhost',
      };

      const resChunks: Buffer[] = [];
      const res: any = {
        statusCode: 200,
        headers: {},
        setHeader: (key: string, value: string) => {
          res.headers[key] = value;
        },
        getHeader: (key: string) => res.headers[key],
        removeHeader: (key: string) => {
          delete res.headers[key];
        },
        write: (chunk: any) => resChunks.push(Buffer.from(chunk)),
        end: (chunk?: any) => {
          if (chunk) resChunks.push(Buffer.from(chunk));
          callback({
            mimeType: 'application/json',
            data: Buffer.concat(resChunks),
          });
        }
      };

      expressApp(reqStream as any, res);
    },
  );

  createWindow();
});
