const API='https://api.monobank.ua';
function env(name, required=true){const v=process.env[name];if(required&&!v)throw new Error(`Missing environment variable: ${name}`);return v;}
async function mono(path, options={}){
  const token=env('MONO_TOKEN');
  const r=await fetch(API+path,{...options,headers:{'X-Token':token,'Content-Type':'application/json',...(options.headers||{})}});
  const text=await r.text(); let data; try{data=JSON.parse(text)}catch{data={raw:text}}
  if(!r.ok){const e=new Error(data?.errorDescription||data?.message||`Monobank HTTP ${r.status}`);e.status=r.status;e.data=data;throw e}
  return data;
}
function baseUrl(req){return process.env.PUBLIC_BASE_URL || `${req.headers['x-forwarded-proto']||'https'}://${req.headers.host}`;}
module.exports={mono,env,baseUrl};
