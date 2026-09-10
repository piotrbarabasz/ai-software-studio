import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const {default:lighthouse} = await import(pathToFileURL(path.join(root, 'tmp/protolume-audit/tooling/node_modules/lighthouse/core/index.js')));
const chromeLauncher = await import(pathToFileURL(path.join(root, 'tmp/protolume-audit/tooling/node_modules/chrome-launcher/dist/index.js')));
const require=createRequire(import.meta.url);
const {chromium}=require(path.join(root, 'frontend/node_modules/@playwright/test'));
const out=path.join(root, 'tmp/protolume-second/performance');
const evidence=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../evidence');
await fs.mkdir(out,{recursive:true});
const runs=[['home-1','/',false],['home-2','/',false],['home-3','/',false],['contact','/kontakt',false],['rag','/rozwiazania/chatbot-ai-dla-firm',false],['home-desktop','/',true]];
const summaries=JSON.parse(await fs.readFile(path.join(evidence,'performance.json'),'utf8').catch(()=> '[]'));
for(const [name,route,desktop] of runs){
 if(summaries.some(s=>s.name===name && !s.runtimeError))continue;
 await fs.mkdir(path.join(out,'profile-'+name),{recursive:true});
 const chrome=await chromeLauncher.launch({chromePath:chromium.executablePath(),userDataDir:path.join(out,'profile-'+name),chromeFlags:['--headless','--disable-gpu','--no-first-run']});
 try{
  const options={port:chrome.port,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],...(desktop?{formFactor:'desktop',screenEmulation:{mobile:false,width:1440,height:1000,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}}:{})};
  const result=await lighthouse('https://protolume.pl'+route,options);
  await fs.writeFile(path.join(out,name+'.lighthouse.json'),result.report[0]);
  await fs.writeFile(path.join(evidence,name+'.lighthouse.html'),result.report[1]);
  const l=result.lhr;
  const summary={name,route,date:l.fetchTime,version:l.lighthouseVersion,settings:l.configSettings,score:Object.fromEntries(Object.entries(l.categories).map(([k,v])=>[k,v.score])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index','total-byte-weight','bootup-time'].map(k=>[k,{value:l.audits[k]?.numericValue,display:l.audits[k]?.displayValue}])),findings:Object.entries(l.audits).filter(([k,v])=>v.score!==null&&v.score<1).map(([k,v])=>({id:k,title:v.title,display:v.displayValue,details:v.details})),warnings:l.runWarnings,runtimeError:l.runtimeError};
  summaries.push(summary);
  await fs.writeFile(path.join(evidence,'performance.json'),JSON.stringify(summaries,null,2)+'\n');
  console.log(JSON.stringify({name,score:summary.score,metrics:summary.metrics,warnings:summary.warnings}));
 }finally{try{await chrome.kill()}catch(e){console.log('Browser cleanup: '+e.code)}}
}
