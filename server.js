import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const app=express();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
app.get('/',(req,res)=>{
  let html=fs.readFileSync(path.join(__dirname,'public','index.html'),'utf8');
  html=html.replace('<div class="userbar"><button id="logout"', '<div class="userbar"><span id="signedInAs" class="hidden"></span><button id="logout"');
  html=html.replace('</body>', `<script>
  (()=>{
    let startX=0,startY=0,startAt=0;
    const main=document.getElementById('mainView');
    if(!main)return;
    main.addEventListener('touchstart',e=>{
      if(e.touches.length!==1)return;
      if(document.getElementById('modal').style.display==='flex'||document.getElementById('dateModal').style.display==='flex')return;
      startX=e.touches[0].clientX;startY=e.touches[0].clientY;startAt=Date.now();
    },{passive:true});
    main.addEventListener('touchend',e=>{
      if(!startAt||!e.changedTouches.length)return;
      const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY,elapsed=Date.now()-startAt;
      startAt=0;
      if(elapsed>700||Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.35)return;
      if(dx<0)document.getElementById('next').click();
      else document.getElementById('prev').click();
    },{passive:true});
  })();
  </script></body>`);
  res.type('html').send(html);
});
app.use(express.static(path.join(__dirname,'public')));
app.get('/config.js',(req,res)=>{res.type('application/javascript').send(`window.APP_CONFIG=${JSON.stringify({supabaseUrl:process.env.SUPABASE_URL||'',supabaseKey:process.env.SUPABASE_PUBLISHABLE_KEY||''})}`)});
app.get('/health',(req,res)=>res.json({ok:true}));
app.use((req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const port=process.env.PORT||3000;
app.listen(port,'0.0.0.0',()=>console.log(`Daily Activity listening on ${port}`));