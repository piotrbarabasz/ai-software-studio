const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');
const { chromium, expect } = require(path.join(root, 'frontend/node_modules/@playwright/test'));
const out = path.resolve(__dirname, '../evidence');
const origin = 'https://protolume.pl';
(async () => {
 const b = await chromium.launch();
 const result = {recordedAt:new Date().toISOString(), checks:[], blockedWrites:[]};
 const context = await b.newContext({viewport:{width:390,height:844}});
 await context.route('**/*', r => ['GET','HEAD'].includes(r.request().method()) ? r.continue() : (result.blockedWrites.push(r.request().url()),r.abort()));
 const p = await context.newPage();
 const check = async (name, fn) => {try { result.checks.push({name,passed:true,...await fn()}); } catch(e) {result.checks.push({name,passed:false,error:e.message});} console.log(name+': '+result.checks.at(-1).passed); fs.writeFileSync(path.join(out,'followup.json'),JSON.stringify(result,null,2)+'\n');};
 try {
 await check('rag-visible-sales-cta-context',async()=>{
  const route='/rozwiazania/chatbot-ai-dla-firm';
  await p.goto(origin+route,{waitUntil:'networkidle'});
  const links=await p.locator('main a[href*="/kontakt"]').evaluateAll(es=>es.filter(e=>e.checkVisibility()).map(e=>({text:e.textContent.trim(),href:e.getAttribute('href')})));
  const visited=[];
  for(const href of [...new Set(links.map(e=>e.href))]) {await p.goto(origin+route,{waitUntil:'networkidle'});await p.locator('main a[href="'+href+'"]').first().click();await expect(p.locator('#projectType')).toHaveValue('rag_chatbot_demo');expect(new URL(p.url()).searchParams.get('service')).toBe('rag');visited.push({url:p.url(),firstInput:(await p.locator('#name').boundingBox()).y});}
  return {links,visited,corrects:'interactions.json selector included a hidden source reference to /kontakt; this is not a sales CTA failure'};
 });
 await check('native-details-code-download-and-pdf',async()=>{
  const native=await b.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await native.goto(origin+'/development',{waitUntil:'networkidle'});await native.locator('.source-files summary').focus();await native.keyboard.press('Enter');await expect(native.locator('.source-files')).toHaveAttribute('open','');
  const link=await native.locator('.artifact-files a').first().getAttribute('href');const response=await native.request.get(origin+link);const sourceMime=response.headers()['content-type'];const sourceBytes=(await response.body()).length;
  await native.goto(origin+'/kontakt',{waitUntil:'networkidle'});const mailFallback=await native.locator('.noscript-contact').innerText();const honeypot=await native.locator('#website').evaluate(e=>({tabindex:e.tabIndex,ariaHidden:e.closest('[aria-hidden]')?.getAttribute('aria-hidden')}));
  await p.goto(origin+'/przyklad-demo',{waitUntil:'networkidle'});const download=p.waitForEvent('download');await p.locator('a[download="protolume-raport-demo.pdf"]').first().click();const received=await download;await received.saveAs(path.join(out,'production-report.pdf'));await native.close();return {sourceMime,sourceBytes,mailFallback,honeypot,pdfFilename:received.suggestedFilename(),corrects:'interactions.json attempted response.body after disposing the browser context; captured before close here'};
 });
 await check('header-cta-context-and-unknown-query',async()=>{
  await p.goto(origin+'/rozwiazania/voice-ai-dla-firm',{waitUntil:'networkidle'});const headerLinks=await p.locator('header a[href*="kontakt"]').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),href:e.getAttribute('href')})));
  await p.goto(origin+'/kontakt?projectType=unknown&service=unknown',{waitUntil:'networkidle'});return {headerLinks,unknownProjectType:await p.locator('#projectType').inputValue(),unknownServiceVisible:await p.locator('.service-context').count(),canonical:await p.locator('link[rel="canonical"]').getAttribute('href')};
 });
 await check('home-proof-contrast-normal-motion-and-readable-sections',async()=>{
  const captures=[['/','proof',390],['/','proof',1440],['/development','engineering-artifact',390],['/dla-software-house','engineering-artifact',1440],['/studio','studio',390],['/rd','research',1440],['/przyklad-demo','report',390]];
  const data=[];
  for(const [route,label,width] of captures){await p.setViewportSize({width,height:width===1440?1000:844});await p.goto(origin+route,{waitUntil:'networkidle'});const section=label==='proof'?p.locator('h2').filter({hasText:'Zobacz'}).first():label==='engineering-artifact'?p.locator('.engineering-artifact'):p.locator('main h2').first();
   if(await section.count())await section.scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,label+'-'+width+'-detail.png')});
   data.push({route,width,animations:await p.evaluate(()=>document.getAnimations().map(a=>({state:a.playState,iterations:a.effect.getTiming().iterations}))),headings:await p.locator('main h2,main h3').evaluateAll(es=>es.filter(e=>e.checkVisibility()).map(e=>({text:e.textContent.trim(),color:getComputedStyle(e).color,backgrounds:[e,...function*(n){while(n.parentElement){n=n.parentElement;yield n;}}(e)].map(n=>getComputedStyle(n).backgroundColor).filter(c=>c!=='rgba(0, 0, 0, 0)'),fontSize:getComputedStyle(e).fontSize,fontWeight:getComputedStyle(e).fontWeight}))) });
  }return {data};
 });
 await check('studio-education-and-report-print',async()=>{
  await p.goto(origin+'/studio',{waitUntil:'networkidle'});const education=await p.locator('details').filter({hasText:'Doświadczenie i wykształcenie'}).textContent();
  await p.goto(origin+'/przyklad-demo',{waitUntil:'networkidle'});await p.emulateMedia({media:'print'});return {education,print:await p.evaluate(()=>({bodyOverflow:document.documentElement.scrollWidth>innerWidth,headerDisplay:getComputedStyle(document.querySelector('header')).display,mainText:document.querySelector('main').innerText,details:[...document.querySelectorAll('details')].map(e=>({summary:e.querySelector('summary').innerText,open:e.open}))}))};
 });
 result.completedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'followup.json'),JSON.stringify(result,null,2)+'\n');
 } finally {await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
