const {mono}=require('./_lib/mono');
module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const id=String((req.method==='GET'?req.query?.invoiceId:req.body?.invoiceId)||'').trim();
    if(!id) return res.status(400).json({error:'invoiceId required'});
    const data=await mono('/api/merchant/invoice/'+encodeURIComponent(id));
    return res.status(200).json({ok:true,status:data.status,invoiceId:id,amount:data.amount,ccy:data.ccy,pageUrl:data.pageUrl||null});
  }catch(e){return res.status(e.status||500).json({error:e.message||'Status error'});}
};
