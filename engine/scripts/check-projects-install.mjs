import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const base='https://anthem-research.github.io/Forum-OS/';const target=base+'projects/index.html?verify='+Date.now();
const profile=await mkdtemp(join(tmpdir(),'pwa-'));
const chrome=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=9227','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let ws;
try{
let tabs;for(let i=0;i<40;i++){try{tabs=await fetch('http://127.0.0.1:9227/json/list').then(r=>r.json());break}catch{await pause(300)}}if(!tabs)throw Error('Chrome did not start');
ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const {resolve,reject}=pending.get(m.id);pending.delete(m.id);m.error?reject(Error(m.error.message)):resolve(m.result)}};
function send(method,params={}){return new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params}));setTimeout(()=>{if(pending.delete(i))reject(Error('Timeout '+method))},15000).unref()})}
await send('Page.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.__installEvent=false;window.addEventListener("beforeinstallprompt",()=>{window.__installEvent=true})'});await send('Emulation.setDeviceMetricsOverride',{width:800,height:1200,deviceScaleFactor:1,mobile:true});await send('Page.navigate',{url:target});
let state;for(let i=0;i<40;i++){await pause(500);state=(await send('Runtime.evaluate',{expression:'({url:location.href,ready:document.readyState,title:document.title,manifest:document.querySelector(\'link[rel="manifest"]\')?.href,install:!!document.querySelector("#install")&&!document.querySelector("#install").hidden,sw:!!navigator.serviceWorker?.controller})',returnByValue:true})).result.value;if(state?.ready==='complete'&&state?.manifest&&state?.sw)break}console.log('Page:',state);
const manifest=await send('Page.getAppManifest');console.log('Manifest:',JSON.stringify(manifest));const errors=await send('Page.getInstallabilityErrors');console.log('Installability:',JSON.stringify(errors));if(errors.installabilityErrors.length||!state?.install||!state?.sw||state?.title!=='Projects')throw Error('Projects is not installable in Chromium');console.log('PASS: installable manifest, visible button and active service worker.');
for(const app of ['projects','principles','stories','project-care']){
await send('Page.navigate',{url:base+app+'/index.html?compare='+Date.now()});
let st;for(let i=0;i<35;i++){await pause(300);st=(await send('Runtime.evaluate',{expression:'({url:location.href,title:document.title,ready:document.readyState,button:!!document.querySelector("#install")&&!document.querySelector("#install").hidden,sw:!!navigator.serviceWorker?.controller,event:window.__installEvent,manifest:document.querySelector(\'link[rel="manifest"]\')?.href})',returnByValue:true})).result.value;if(st?.ready==='complete'&&st?.sw&&st?.url.includes('/'+app+'/'))break}
const m=await send('Page.getAppManifest');const e=await send('Page.getInstallabilityErrors');console.log('COMPARE',app,JSON.stringify({state:st,errors:e.installabilityErrors,id:m.manifest?.id,icons:m.manifest?.icons}));if(e.installabilityErrors.length||!st?.button||!st?.sw)throw Error(app+' failed installability check');
if((app==='projects'||app==='project-care')&&st.manifest.endsWith('?v=4'))throw Error('New Projects release not deployed yet');
}
}finally{ws?.close();chrome.kill();await pause(300);await rm(profile,{recursive:true,force:true}).catch(()=>{})}
