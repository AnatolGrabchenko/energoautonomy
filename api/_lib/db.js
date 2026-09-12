const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
function enabled(){ return !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY); }
async function sb(path, options={}){
  if(!enabled()) return null;
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...options,headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=representation',...(options.headers||{})}});
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{data={raw:text}}
  if(!r.ok){const e=new Error(data?.message||`Supabase HTTP ${r.status}`);e.status=r.status;e.data=data;throw e}
  return data;
}
async function saveOrder(order){ if(!enabled()) return null; return sb('orders',{method:'POST',body:JSON.stringify(order)}); }
async function updateOrder(id, patch){ if(!enabled()) return null; return sb(`orders?order_id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(patch)}); }
async function listOrders(limit=100){ if(!enabled()) return []; return sb(`orders?select=*&order=created_at.desc&limit=${Math.min(500,Math.max(1,limit))}`)||[]; }
module.exports={enabled,saveOrder,updateOrder,listOrders};
