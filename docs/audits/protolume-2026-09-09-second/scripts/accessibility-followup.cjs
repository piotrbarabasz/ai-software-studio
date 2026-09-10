const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..'),out=path.resolve(__dirname,'../evidence');
const {chromium}=require(path.join(root,'frontend/node_modules/@playwright/test'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const r={recordedAt:new Date().toISOString(),home:[]};try {
 await p.goto('https://protolume.pl/',{waitUntil:'networkidle'});
 await p.evaluate(fs.readFileSync(path.join(root,'frontend/node_modules/axe-core/axe.min.js'),'utf8'));
 const a=await p.evaluate(()=>axe.run(document,{runOnly:{type:'rule',values:['color-contrast','aria-prohibited-attr']}}));r.axe={violations:a.violations,incomplete:a.incomplete.map(x=>({...x,nodes:x.nodes.slice(0,3)}))};
 for(const width of [360,390,430,1440]){await p.setViewportSize({width,height:width===1440?1000:844});await p.goto('https://protolume.pl/',{waitUntil:'networkidle'});const numbers=await p.locator('[data-hero-visual]').evaluate(e=>({html:e.outerHTML,text:e.innerText})).catch(()=>null);await p.screenshot({path:path.join(out,'home-normal-'+width+'.png')});r.home.push({width,numbers});}
 await p.locator('h2').filter({hasText:'Zobacz zamiast'}).scrollIntoViewIfNeeded();await p.waitForTimeout(700);await p.screenshot({path:path.join(out,'home-proof-settled-1440.png')});
 r.header=await p.locator('.site-header').evaluate(e=>({html:e.outerHTML,background:getComputedStyle(e).background,backdrop:getComputedStyle(e).backdropFilter,links:[...e.querySelectorAll('a')].map(a=>({text:a.textContent,color:getComputedStyle(a).color}))}));
 fs.writeFileSync(path.join(out,'accessibility-followup.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({incomplete:r.axe.incomplete.map(x=>({id:x.id,nodes:x.nodes.map(n=>({target:n.target,any:n.any,none:n.none,all:n.all}))})),header:r.header.background}));
}finally{await b.close();}})();
