const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../../..');
const { chromium, expect } = require(path.join(root, 'frontend/node_modules/@playwright/test'));
const out = path.resolve(__dirname, '../evidence');
const origin = 'https://protolume.pl';
const write = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');

(async () => {
 const b = await chromium.launch();
 const results = { recordedAt: new Date().toISOString(), browser: b.version(), bootstrap: [], checks: [], blockedNonReadRequests: [], formRequestsIntercepted: 0, actualContactRequestsSent: 0 };
 const check = async (name, fn) => { try { const data = await fn(); results.checks.push({name, passed: true, ...data}); } catch(e) { results.checks.push({name, passed: false, error: e.message}); } write('interactions.json', results); console.log(name + ': ' + results.checks.at(-1).passed); };
 try {
  for(const route of ['/', '/kontakt', '/rozwiazania/chatbot-ai-dla-firm']) for(let run=1; run<=3; run++) {
   const context = await b.newContext({viewport:{width:390,height:844}});
   const page = await context.newPage();
   const errors=[]; page.on('pageerror', e=>errors.push(e.message));
   const cdp=await context.newCDPSession(page);
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await page.addInitScript(() => {
    window.auditStartup={samples:[],shifts:[],lcp:[]};
    new PerformanceObserver(list=>{for(const e of list.getEntries()) window.auditStartup.shifts.push({time:e.startTime,value:e.value,recentInput:e.hadRecentInput});}).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(list=>{for(const e of list.getEntries()) window.auditStartup.lcp.push({time:e.startTime,size:e.size,tag:e.element?.tagName});}).observe({type:'largest-contentful-paint',buffered:true});
    let seen=false;
    const sample=()=>{const main=document.querySelector('main');const h1=!!main?.querySelector('h1');if(h1)seen=true;if(main&&seen)window.auditStartup.samples.push({time:performance.now(),height:main.getBoundingClientRect().height,h1});if(performance.now()<5000)requestAnimationFrame(sample);}; requestAnimationFrame(sample);
   });
   await page.goto(origin+route,{waitUntil:'networkidle'});
   await page.waitForTimeout(3500);
   const data=await page.evaluate(()=>window.auditStartup);
   let start=0,last=0,sum=0,cls=0;
   for(const s of data.shifts.filter(s=>!s.recentInput)){if(s.time-last>1000||s.time-start>5000){start=s.time;sum=0;}sum+=s.value;last=s.time;cls=Math.max(cls,sum);}
   results.bootstrap.push({route,run,cpuThrottle:4,network:'unthrottled, fresh browser context',samples:data.samples.length,zeroMainAfterH1:data.samples.filter(s=>!s.h1||s.height===0),cls,shifts:data.shifts,lcp:data.lcp.at(-1),errors});
   write('interactions.json',results); await context.close();
  }
  console.log('Nine cold startup observations complete');
  const context=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{if(!['GET','HEAD'].includes(route.request().method())){results.blockedNonReadRequests.push({method:route.request().method(),url:route.request().url()});await route.abort();}else await route.continue();});
  const p=await context.newPage();
  await check('keyboard-menu-skip-link',async()=>{
   await p.goto(origin,{waitUntil:'networkidle'});await p.keyboard.press('Tab');await expect(p.locator('.skip-link')).toBeFocused();await p.keyboard.press('Enter');await expect(p.locator('main')).toBeFocused();
   const states=[];
   for(const width of [360,390,430,768]){await p.setViewportSize({width,height:844});await p.getByRole('button',{name:'Otwórz menu główne'}).click();states.push(await p.evaluate(()=>({width:innerWidth,expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'),mainInert:document.querySelector('main').inert,focus:document.activeElement.textContent,overflow:getComputedStyle(document.body).overflow})));await expect(p.locator('.menu-toggle')).toHaveAttribute('aria-expanded','true');await p.keyboard.press('Escape');await expect(p.locator('.menu-toggle')).toBeFocused();await expect(p.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');}
   return {states};
  });
  const crawl=JSON.parse(fs.readFileSync(path.join(out,'crawl.json'),'utf8'));
  const mappings=[['/rozwiazania/chatbot-ai-dla-firm','rag_chatbot_demo','rag'],['/rozwiazania/voice-ai-dla-firm','voice_agent_demo','voice'],['/rozwiazania/integracje-whatsapp-crm','whatsapp_agent_management','whatsapp'],['/rozwiazania/automatyzacja-procesow','business_process_automation','automation'],['/rozwiazania/systemy-agentowe','ai_automation','agents'],['/development','custom_web_app',null],['/dla-software-house','software_house_partnership',null]];
  for(const [route,expectedType,expectedService] of mappings) await check('contact-context '+route,async()=>{
   await p.setViewportSize({width:390,height:844});await p.goto(origin+route,{waitUntil:'networkidle'});
   const ctas=await p.locator('main a[href*="/kontakt"]').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),href:e.getAttribute('href')})));
   const visited=[];
   for(const href of [...new Set(ctas.map(c=>c.href))]){await p.goto(origin+route,{waitUntil:'networkidle'});await p.locator('main a').filter({hasText:ctas.find(c=>c.href===href).text}).first().click();await expect(p.locator('#projectType')).toHaveValue(expectedType);const u=new URL(p.url());if(expectedService)expect(u.searchParams.get('service')).toBe(expectedService);visited.push({url:p.url(),projectType:await p.locator('#projectType').inputValue(),context:await p.locator('.service-context').textContent().catch(()=>null),firstInput:(await p.locator('#name').boundingBox()).y,canonical:await p.locator('link[rel="canonical"]').getAttribute('href')});}
   return {ctas,visited};
  });
  await check('manual-contact-topic',async()=>{
   await p.goto(origin+'/kontakt?projectType=voice_agent_demo&service=voice',{waitUntil:'networkidle'});await p.locator('#projectType').selectOption('custom_web_app');return {selected:await p.locator('#projectType').inputValue(),context:await p.locator('.service-context').textContent()};
  });
  await check('demo-known-fallback-reset-focus',async()=>{
   await p.goto(origin+'/demo-ai#interactive-demo',{waitUntil:'networkidle'});const requests=[];const listener=r=>requests.push({method:r.method(),url:r.url()});p.on('request',listener);
   await p.locator('.scenario-button').first().click();await expect(p.locator('#knowledge-demo-answer-title')).toBeFocused();const known={text:await p.locator('#knowledge-demo-result').innerText(),box:await p.locator('#knowledge-demo-answer-title').boundingBox()};
   await p.locator('#custom-question').fill('Czy sprzedajecie rowery górskie?');await p.locator('.custom-question-form button').click();await expect(p.locator('#knowledge-demo-answer-title')).toBeFocused();const fallback={text:await p.locator('#knowledge-demo-result').innerText(),contactLinks:await p.locator('.demo-actions a').count()};
   await p.screenshot({path:path.join(out,'demo-fallback-390.png')});await p.locator('.reset-button').click();await expect(p.locator('.empty-state')).toBeVisible();p.off('request',listener);return {known,fallback,requests};
  });
  await check('rag-citation-focus-and-unknown',async()=>{
   await p.goto(origin+'/rozwiazania/chatbot-ai-dla-firm#rag-source-example',{waitUntil:'networkidle'});await p.locator('#rag-source-link').click();const opened=await p.locator('#rag-source-document').getAttribute('open');const focused=await p.evaluate(()=>document.activeElement.id);await p.locator('.rag-close-source').click();await expect(p.locator('#rag-source-link')).toBeFocused();await p.locator('.rag-question-list button').last().click();await expect(p.locator('#rag-answer-title')).toBeFocused();return {opened,focused,unknown:await p.locator('#rag-answer').innerText()};
  });
  await check('contact-validation-errors-and-success-intercepted',async()=>{
   let status=422;
   await p.route('**/api/contact',async route=>{results.formRequestsIntercepted++;if(status===0)return route.abort('failed');return route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':origin},body:JSON.stringify(status===202?{status:'accepted',message:'Controlled audit response'}:{detail:'Controlled audit response'})});});
   await p.goto(origin+'/kontakt',{waitUntil:'networkidle'});await p.locator('button[type="submit"]').click();await expect(p.locator('#contact-form-error-summary')).toBeFocused();const invalid=await p.locator('[aria-invalid="true"]').evaluateAll(es=>es.map(e=>({id:e.id,describedBy:e.getAttribute('aria-describedby')})));
   await p.locator('#name').fill('Test audytu');await p.locator('#email').fill('audit@example.test');await p.locator('#projectType').selectOption('custom_web_app');const message='Test interfejsu audytu. Żądanie zostaje przechwycone lokalnie.';await p.locator('#message').fill(message);await p.locator('#consent').check();
   const failures=[];for(const s of [422,429,503,0]){status=s;await p.locator('button[type="submit"]').click();await expect(p.locator('#contact-form-error-summary')).toBeFocused();await expect(p.locator('#message')).toHaveValue(message);failures.push({status:s,message:await p.locator('#contact-form-error-summary').innerText()});}
   await p.screenshot({path:path.join(out,'contact-error-390.png')});status=202;await p.locator('button[type="submit"]').click();await expect(p.locator('.contact-success')).toBeFocused();return {invalid,failures,success:await p.locator('.contact-success').innerText()};
  });
  await check('native-details-code-download-and-pdf',async()=>{
   const native=await b.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
   await native.goto(origin+'/development',{waitUntil:'networkidle'});await native.locator('.source-files summary').focus();await native.keyboard.press('Enter');await expect(native.locator('.source-files')).toHaveAttribute('open','');const link=await native.locator('.artifact-files a').first().getAttribute('href');const source=await native.request.get(origin+link);await expect(native.locator('a[href="/assets/evidence/protolume-engineering.md"]')).toBeVisible();
   await native.goto(origin+'/kontakt',{waitUntil:'networkidle'});const mailFallback=await native.locator('.noscript-contact').innerText();const honeypot=await native.locator('#website').evaluate(e=>({tabindex:e.tabIndex,ariaHidden:e.closest('[aria-hidden]')?.getAttribute('aria-hidden')}));
   await p.goto(origin+'/przyklad-demo',{waitUntil:'networkidle'});const download=p.waitForEvent('download');await p.locator('a[download="protolume-raport-demo.pdf"]').first().click();const received=await download;await received.saveAs(path.join(root,'tmp/protolume-second/browser-download.pdf'));await native.close();return {sourceMime:source.headers()['content-type'],sourceBytes:(await source.body()).length,mailFallback,honeypot,pdfFilename:received.suggestedFilename()};
  });
  await check('links-anchors-and-production-asset-hashes',async()=>{
   const version=JSON.parse(fs.readFileSync(path.join(out,'versions.json'),'utf8'));
   const ids=new Map(crawl.pages.map(p=>[p.route,new Set(p.ids)]));const broken=[];
   for(const href of new Set(crawl.pages.flatMap(p=>p.links.map(l=>l.href)))){const u=new URL(href);if(u.origin!==origin)continue;if(u.hash&&ids.has(u.pathname)&&!ids.get(u.pathname).has(decodeURIComponent(u.hash.slice(1))))broken.push(href);}
   for(const item of crawl.downloads){const bytes=cp.execFileSync('git',['show',version.masterSha+':frontend/src'+new URL(item.url).pathname],{cwd:root});item.matchesMasterSource=sha(bytes)===item.sha256;}
   write('crawl.json',crawl);expect(broken).toEqual([]);expect(crawl.downloads.every(d=>d.status===200&&d.matchesMasterSource)).toBe(true);return {broken,downloadMatches:crawl.downloads.length};
  });
  const api='https://aisoftware-studio-api-175725977490.europe-central2.run.app';
  results.backend=[];
  for(const route of ['/health','/ready']){const response=await context.request.get(api+route);results.backend.push({route,status:response.status(),body:await response.json(),headers:response.headers()});}
  results.completedAt=new Date().toISOString();write('interactions.json',results);
 } finally {await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
