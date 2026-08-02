/**
 * serve.mjs | Minimaler statischer Dateiserver für www/ — nur für lokale
 * Verifikation per echtem Browser gedacht (kein Teil der eigentlichen App).
 */
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';

const PORT = 4173;
const WWW_DIR = path.resolve('www');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

createServer(async (req, res) => {
    let dateiPfad = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const vollerPfad = path.join(WWW_DIR, dateiPfad);
    try {
        const inhalt = await readFile(vollerPfad);
        const ext = path.extname(vollerPfad);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(inhalt);
    } catch (error) {
        res.writeHead(404);
        res.end('Not found');
    }
}).listen(PORT, () => console.log(`Serving www/ on http://localhost:${PORT}`));
