// Zeitfuchs API – speichert verschlüsselte Datenblöcke (Buchhaltung) für die Werkstatt.
// Der Server sieht nie Klartext: verschlüsselt wird im Browser mit dem Werkstatt-Passwort.
'use strict';
const http=require('http'),crypto=require('crypto');const {Pool}=require('pg');
const DB=process.env.DATABASE_URL||'';
const pool=new Pool({connectionString:DB,ssl:/render\.com|sslmode=require/.test(DB)?{rejectUnauthorized:false}:false,max:3});
const ORIGINS=(process.env.ALLOW_ORIGINS||'https://zeitfuchs.ch').split(',').map(s=>s.trim()).filter(Boolean);
const AUTH=(process.env.ZF_AUTH_HASH||'').toLowerCase();
const MAX=4*1024*1024;
let ready=null;
const init=()=>ready||(ready=pool.query(`CREATE TABLE IF NOT EXISTS zf_store(k text PRIMARY KEY,ver integer NOT NULL DEFAULT 0,data text,updated timestamptz NOT NULL DEFAULT now());CREATE TABLE IF NOT EXISTS zf_inbox(id bigserial PRIMARY KEY,created timestamptz NOT NULL DEFAULT now(),data text NOT NULL)`).catch(e=>{ready=null;throw e}));
// Öffentlicher Eingang (Website-Anfragen): pro IP höchstens 20 pro Stunde, insgesamt höchstens 2000 Einträge
const posts=new Map();
function postOk(ip){const now=Date.now(),l=(posts.get(ip)||[]).filter(t=>now-t<3600e3);if(l.length>=20)return false;l.push(now);posts.set(ip,l);return true}
const fails=new Map();
function authed(req){
  const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim();
  const f=fails.get(ip);if(f&&f.n>=10&&Date.now()-f.t<10*60*1000)return 'blocked';
  const tok=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  const h=crypto.createHash('sha256').update(tok).digest('hex');
  const ok=AUTH.length===64&&tok.length>0&&crypto.timingSafeEqual(Buffer.from(h),Buffer.from(AUTH));
  if(!ok){const x=fails.get(ip)||{n:0,t:0};if(Date.now()-x.t>10*60*1000)x.n=0;x.n++;x.t=Date.now();fails.set(ip,x)}else fails.delete(ip);
  return ok;
}
const cors=(req,res)=>{const o=req.headers.origin;res.setHeader('Access-Control-Allow-Origin',o&&ORIGINS.includes(o)?o:ORIGINS[0]);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Max-Age','600')};
const send=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj))};
const body=req=>new Promise((ok,no)=>{let n=0;const c=[];req.on('data',d=>{n+=d.length;if(n>MAX){no(new Error('too_large'));req.destroy()}else c.push(d)});req.on('end',()=>ok(Buffer.concat(c).toString('utf8')));req.on('error',no)});
http.createServer(async(req,res)=>{
  cors(req,res);
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  const u=new URL(req.url,'http://x');
  if(u.pathname==='/health')return send(res,200,{ok:true});
  if(u.pathname==='/zf/inbox'&&req.method==='POST'){
    const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim();
    if(!postOk(ip))return send(res,429,{error:'too_many'});
    try{await init();let b;try{b=JSON.parse(await body(req))}catch(e){return send(res,400,{error:'bad_json'})}
      if(typeof b.data!=='string'||b.data.length>60000||!/^[A-Za-z0-9+/=.:]+$/.test(b.data))return send(res,400,{error:'bad_request'});
      const c=await pool.query('SELECT count(*)::int n FROM zf_inbox');if(c.rows[0].n>=2000)return send(res,507,{error:'full'});
      const r=await pool.query('INSERT INTO zf_inbox(data) VALUES($1) RETURNING id',[b.data]);return send(res,200,{ok:true,id:r.rows[0].id});
    }catch(e){console.error(e);return send(res,500,{error:'server'})}
  }
  if(u.pathname==='/zf/inbox'||/^\/zf\/inbox\/\d+$/.test(u.pathname)){
    const a=authed(req);if(a==='blocked')return send(res,429,{error:'too_many_attempts'});if(!a)return send(res,401,{error:'unauthorized'});
    try{await init();
      if(req.method==='GET'&&u.pathname==='/zf/inbox'){const r=await pool.query('SELECT id,created,data FROM zf_inbox ORDER BY id DESC LIMIT 500');return send(res,200,{items:r.rows})}
      if(req.method==='DELETE'&&u.pathname!=='/zf/inbox'){await pool.query('DELETE FROM zf_inbox WHERE id=$1',[u.pathname.split('/').pop()]);return send(res,200,{ok:true})}
      return send(res,405,{error:'method'});
    }catch(e){console.error(e);return send(res,500,{error:'server'})}
  }
  const m=u.pathname.match(/^\/zf\/([a-z0-9-]{1,40})$/);
  if(!m)return send(res,404,{error:'not_found'});
  const a=authed(req);if(a==='blocked')return send(res,429,{error:'too_many_attempts'});if(!a)return send(res,401,{error:'unauthorized'});
  try{
    await init();
    const k=m[1];
    if(req.method==='GET'){const r=await pool.query('SELECT ver,data,updated FROM zf_store WHERE k=$1',[k]);return send(res,200,r.rows[0]||{ver:0,data:null,updated:null})}
    if(req.method==='PUT'){
      let b;try{b=JSON.parse(await body(req))}catch(e){return send(res,e.message==='too_large'?413:400,{error:e.message==='too_large'?'too_large':'bad_json'})}
      if(typeof b.data!=='string'||!Number.isInteger(b.ver))return send(res,400,{error:'bad_request'});
      const r=await pool.query(`INSERT INTO zf_store(k,ver,data,updated) VALUES($1,1,$2,now()) ON CONFLICT(k) DO UPDATE SET ver=zf_store.ver+1,data=EXCLUDED.data,updated=now() WHERE zf_store.ver=$3 RETURNING ver,updated`,[k,b.data,b.ver]);
      if(!r.rows.length){const c=await pool.query('SELECT ver,data,updated FROM zf_store WHERE k=$1',[k]);return send(res,409,{error:'conflict',...c.rows[0]})}
      return send(res,200,r.rows[0]);
    }
    return send(res,405,{error:'method'});
  }catch(e){console.error(e);return send(res,500,{error:'server'})}
}).listen(process.env.PORT||10000,()=>console.log('zeitfuchs-api läuft'));
