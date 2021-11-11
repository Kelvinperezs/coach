import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import * as CryptoJS from 'crypto-js';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import { environment } from 'src/environments/environment';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/coach-seguro-movilidad/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  server.post('/redirect', async (req,res)=>{
    const origin =environment.production ? req.headers.origin:'';
    try{
       const rut = CryptoJS.AES.encrypt(
        req.body.rut.trim() + '-' + req.body.dv.trim(),
        "{{environment.keyCrypto}}"
       ).toString();

 
        
      const telefono = CryptoJS.AES.encrypt(req.body.telefono.trim(), "{{environment.keyCrypto}}").toString();

      const email = CryptoJS.AES.encrypt(req.body.email.trim(), "{{environment.keyCrypto}}").toString();

      const id = CryptoJS.AES.encrypt(req.body.id.trim(), "{{environment.keyCrypto}}").toString();

      const strEncript = '${rut}.${telefono}.${email}.${id}';
      alert(strEncript);
      res.redirect(

        '/redirect/?code=' + strEncript.replace(/\+/g, 'p1L2u3S').replace(/=/g, '3qu4l').replace(/\//g, 'sl45h')

      ); 
    }catch (error){
      res.redirect('/recomendador/error');
    }
  })

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';


