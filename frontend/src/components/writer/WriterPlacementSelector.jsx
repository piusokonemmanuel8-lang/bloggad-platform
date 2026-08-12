import { useEffect,useMemo,useState } from 'react';
import api from '../../api/axios';

export default function WriterPlacementSelector({pageIds=[],showOnStorefront=false,contentType='article',postId=null,onChange}) {
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState('');
  const [context,setContext]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        setLoading(true);setError('');
        const suffix=postId?`?post_id=${encodeURIComponent(postId)}`:'';
        const {data}=await api.get(`/api/writer/pages/context${suffix}`);
        if(!active)return;
        setContext(data||null);
        const old=data?.placement||null;
        const primary=Number(data?.primary_page?.id||0);
        let next=old&&Array.isArray(old.page_ids)?old.page_ids.map(Number).filter(Boolean):(pageIds||[]).map(Number).filter(Boolean);
        if(!next.length&&primary)next=[primary];
        let onStore=old?!!old.show_on_storefront:!!showOnStorefront;
        if(!postId&&String(contentType||'').toLowerCase()==='product_post'&&data?.entitlement?.paid_writer&&data?.storefront)onStore=true;
        onChange?.({page_ids:next,show_on_storefront:onStore});
      }catch(err){
        if(active)setError(err?.response?.data?.message||err.message||'Failed to load publishing destinations.');
      }finally{if(active)setLoading(false);}
    })();
    return()=>{active=false;};
  },[postId]);

  const pages=Array.isArray(context?.pages)?context.pages:[];
  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return q?pages.filter((p)=>`${p.name||''} ${p.slug||''}`.toLowerCase().includes(q)):pages;
  },[pages,search]);

  function togglePage(id){
    const selected=new Set((pageIds||[]).map(Number).filter(Boolean));
    const n=Number(id);
    if(selected.has(n)){if(selected.size<=1)return;selected.delete(n);}else selected.add(n);
    onChange?.({page_ids:[...selected],show_on_storefront:!!showOnStorefront});
  }
  const canStore=!!context?.entitlement?.paid_writer&&!!context?.storefront;

  return <div style={{marginTop:14,border:'1px solid #d7dde5',borderRadius:12,background:'#fff',overflow:'hidden'}}>
    <button type="button" onClick={()=>setOpen(v=>!v)}
      style={{width:'100%',border:0,background:'#f8fafc',padding:'12px 14px',display:'flex',justifyContent:'space-between',cursor:'pointer',fontWeight:700}}>
      <span>Publish destinations</span>
      <span style={{fontWeight:500,color:'#64748b',fontSize:13}}>
        {loading?'Loading...':`${(pageIds||[]).length} Page${(pageIds||[]).length===1?'':'s'}${showOnStorefront?' + Storefront':''}`}
      </span>
    </button>
    {open?<div style={{padding:14}}>
      {error?<div style={{color:'#b91c1c',marginBottom:10}}>{error}</div>:null}
      <div style={{fontSize:13,color:'#475569',marginBottom:10}}>Choose one or more Pages. Storefront placement is available to paid Writers with a Storefront.</div>
      <input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Pages"
        style={{width:'100%',border:'1px solid #cbd5e1',borderRadius:9,padding:'9px 10px',marginBottom:10}}/>
      <div style={{maxHeight:240,overflowY:'auto',border:'1px solid #e2e8f0',borderRadius:9}}>
        {filtered.map(page=><label key={page.id} style={{display:'flex',gap:9,alignItems:'center',padding:'10px 11px',borderBottom:'1px solid #f1f5f9'}}>
          <input type="checkbox" checked={(pageIds||[]).map(Number).includes(Number(page.id))} onChange={()=>togglePage(page.id)}/>
          <span><strong>{page.name}</strong><small style={{display:'block',color:'#64748b'}}>/page/{page.slug}{page.is_primary?' - Primary Page':''}</small></span>
        </label>)}
        {!filtered.length&&!loading?<div style={{padding:12,color:'#64748b'}}>No Pages match your search.</div>:null}
      </div>
      <label style={{display:'flex',gap:9,alignItems:'flex-start',marginTop:12,paddingTop:12,borderTop:'1px solid #e2e8f0',opacity:canStore?1:.65}}>
        <input type="checkbox" checked={!!showOnStorefront} disabled={!canStore}
          onChange={()=>onChange?.({page_ids:(pageIds||[]).map(Number).filter(Boolean),show_on_storefront:!showOnStorefront})}/>
        <span><strong>Also show on Storefront</strong><small style={{display:'block',color:'#64748b'}}>
          {canStore?`${context.storefront.website_name} - /${context.storefront.slug}`:'Requires an active paid Writer plan and Storefront.'}
        </small></span>
      </label>
    </div>:null}
  </div>;
}