import { Navigate,useParams } from 'react-router-dom';
import { useEffect,useState } from 'react';
import api from '../../api/axios';

export default function WriterProfilePage(){
  const {writerId}=useParams();const [slug,setSlug]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;api.get(`/api/public/writer-pages/writers/${encodeURIComponent(writerId||'')}/primary`)
    .then(r=>{if(active)setSlug(r?.data?.page?.slug||'')}).catch(e=>{if(active)setError(e?.response?.data?.message||e.message||'Primary Writer Page not found.')})
    .finally(()=>{if(active)setLoading(false)});return()=>{active=false};},[writerId]);
  if(loading)return <div style={{padding:24}}>Loading Writer Page...</div>;
  if(slug)return <Navigate to={`/page/${slug}`} replace/>;
  return <div style={{padding:24}}>{error||'Primary Writer Page not found.'}</div>;
}