import{m as ge,j as e,c as Ye,L as ie,D as be,z as fe,a7 as te,a3 as xi,Q as gi,q as Ue,ah as ve,C as fi,r as j,M as Je,g as hi,a as U,X as mi,Z as Ze,A as ui}from"./index-D7wY-Nn2.js";import{a as Te,u as bi,P as _i}from"./PostVideoEmbed-DRi7I_bR.js";import{T as ei}from"./tag-BePbSL1H.js";import{U as ii}from"./user-round-DaVZSJBz.js";import{C as ti}from"./calendar-days-Bxv19lUy.js";import{C as ri}from"./clock-3-C6ssIqfR.js";import{S as le}from"./star-pvLyosVD.js";import{u as yi,C as wi}from"./useAffiliateMonetizationSlots-BaR_4Hjf.js";import{S as ji}from"./shopping-cart-BaWmkakw.js";import{C as ni}from"./circle-check-DwQtcZzx.js";import{S as vi}from"./shield-B30TD3ZY.js";import{C as ki}from"./circle-x-CdiZtEkJ.js";import{L as Si}from"./loader-circle-1nWajjSO.js";import{S as zi}from"./sparkles-DniX3uPT.js";import{B as Ni}from"./badge-check-Q9IaTp8p.js";/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bi=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M22 8c0-2.3-.8-4.3-2-6",key:"5bb3ad"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}],["path",{d:"M4 2C2.8 3.7 2 5.7 2 8",key:"tap9e0"}]],Wi=ge("bell-ring",Bi);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ti=[["path",{d:"M21.54 15H17a2 2 0 0 0-2 2v4.54",key:"1djwo0"}],["path",{d:"M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17",key:"1tzkfa"}],["path",{d:"M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05",key:"14pb5j"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],Ii=ge("earth",Ti);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ci=[["rect",{width:"8",height:"8",x:"3",y:"3",rx:"2",key:"by2w9f"}],["path",{d:"M7 11v4a2 2 0 0 0 2 2h4",key:"xkn7yn"}],["rect",{width:"8",height:"8",x:"13",y:"13",rx:"2",key:"1cgmvn"}]],Hi=ge("workflow",Ci);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ai=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],$i=ge("zap",Ai);function Ri(i){if(!i)return"-";const n=new Date(i);return Number.isNaN(n.getTime())?i:n.toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"})}function Q(i={}){return{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:18,boxShadow:"0 10px 24px rgba(15, 23, 42, 0.04)",...i}}function Pi(i){if(!i)return null;if(i.field_type==="image"&&i.field_value)return e.jsx("img",{src:i.field_value,alt:i.field_key,style:{width:"100%",maxHeight:520,objectFit:"cover",borderRadius:18,marginTop:14,border:"1px solid #e5e7eb"}});if(i.field_type==="heading"&&i.field_value)return e.jsx("h2",{style:{margin:"12px 0 0",fontSize:"clamp(1.5rem, 3vw, 2.1rem)",lineHeight:1.2,color:"#111827"},children:i.field_value});if(i.field_type==="quote"&&i.field_value)return e.jsx("blockquote",{style:{margin:0,padding:"16px 20px",borderLeft:"4px solid #cbd5e1",background:"#f8fafc",color:"#334155",fontSize:18,lineHeight:1.8,fontStyle:"italic"},children:i.field_value});if(i.field_type==="divider")return e.jsx("hr",{style:{border:0,borderTop:"1px solid #e2e8f0",margin:"8px 0"}});if(i.field_type==="url"&&i.field_value&&String(i.field_key||"").toLowerCase().startsWith("simple_writer_video_")){let n=String(i.field_value||"").trim();try{const o=JSON.parse(n);n=String((o==null?void 0:o.url)||"").trim()}catch{}const a=(o=>{if(!/^https?:\/\//i.test(o))return null;try{const x=new URL(o),f=x.hostname.toLowerCase().replace(/^www\./,"");if(f==="youtu.be"){const p=x.pathname.split("/").filter(Boolean)[0]||"";if(/^[A-Za-z0-9_-]{6,}$/.test(p))return{kind:"embed",provider:"YouTube",src:`https://www.youtube-nocookie.com/embed/${p}`}}if(f==="youtube.com"||f==="m.youtube.com"||f==="youtube-nocookie.com"){let p="";if(x.pathname==="/watch")p=x.searchParams.get("v")||"";else{const h=x.pathname.split("/").filter(Boolean);["shorts","embed"].includes(h[0])&&(p=h[1]||"")}if(/^[A-Za-z0-9_-]{6,}$/.test(p))return{kind:"embed",provider:"YouTube",src:`https://www.youtube-nocookie.com/embed/${p}`}}if(f==="vimeo.com"||f==="player.vimeo.com"){const h=[...x.pathname.split("/").filter(Boolean)].reverse().find(t=>/^\d+$/.test(t))||"";if(h)return{kind:"embed",provider:"Vimeo",src:`https://player.vimeo.com/video/${h}`}}if(/\.(mp4|webm|ogg)$/i.test(x.pathname))return{kind:"file",provider:"Direct video",src:x.href}}catch{}return null})(n);return a?a.kind==="file"?e.jsx("video",{src:a.src,controls:!0,preload:"metadata",style:{display:"block",width:"100%",maxHeight:680,borderRadius:14,background:"#0f172a"}}):e.jsx("div",{style:{width:"100%",aspectRatio:"16 / 9",overflow:"hidden",borderRadius:14,background:"#0f172a"},children:e.jsx("iframe",{src:a.src,title:`${a.provider} video`,loading:"lazy",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",allowFullScreen:!0,referrerPolicy:"strict-origin-when-cross-origin",style:{display:"block",width:"100%",height:"100%",border:0}})}):null}if(i.field_type==="url"&&i.field_value){let n=String(i.field_value||"").trim(),r=n;try{const a=JSON.parse(n);n=String((a==null?void 0:a.url)||"").trim(),r=String((a==null?void 0:a.label)||"").trim()||n}catch{}return/^https?:\/\//i.test(n)?e.jsx("a",{href:n,target:"_blank",rel:"nofollow ugc noopener noreferrer",style:{color:"#2563eb",wordBreak:"break-word",fontWeight:700},children:r}):r?e.jsx("span",{children:r}):null}return e.jsx("div",{style:{whiteSpace:"pre-wrap",color:"#334155",lineHeight:1.9,fontSize:16},children:i.field_value||"-"})}function Li({item:i,websiteSlug:n}){return e.jsxs("div",{style:Q({overflow:"hidden"}),children:[i!=null&&i.featured_image?e.jsx("img",{src:i.featured_image,alt:i.title,style:{width:"100%",height:220,objectFit:"cover",display:"block"}}):e.jsx("div",{style:{width:"100%",height:220,background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}),e.jsxs("div",{style:{padding:18},children:[e.jsx("div",{style:{fontSize:12,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:"#2563eb",marginBottom:10},children:"Bloggad Article"}),e.jsx("div",{style:{fontSize:20,lineHeight:1.35,fontWeight:900,color:"#111827",marginBottom:10},children:(i==null?void 0:i.title)||"Related post"}),e.jsx("div",{style:{fontSize:14,lineHeight:1.8,color:"#64748b",marginBottom:16},children:(i==null?void 0:i.excerpt)||"No excerpt"}),e.jsxs(ie,{to:`/${n}/post/${i.slug}`,style:{display:"inline-flex",alignItems:"center",gap:8,color:"#111827",fontWeight:800,textDecoration:"none"},children:["Read Post",e.jsx(fe,{size:16})]})]})]})}function Ei({post:i,templateFields:n,ctaButtons:r,relatedPosts:a,websiteSlug:o,categories:x,emailCaptureFooter:f,onOpenPopup:p,emailCapture:h,sponsoredRelatedPostsSlot:t}){var u,s,S,k,b,N;return e.jsxs("div",{style:{minHeight:"100vh",background:"#f5f7fb"},children:[e.jsx("style",{children:`
        .post-layout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 28px;
        }

        .post-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .post-layout-grid,
          .post-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}),e.jsxs("div",{style:{width:"min(1460px, calc(100% - 24px))",margin:"0 auto",padding:"18px 0 40px"},children:[e.jsx("header",{style:{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:18,boxShadow:"0 10px 28px rgba(15, 23, 42, 0.04)",marginBottom:18,overflow:"hidden"},children:e.jsxs("div",{style:{padding:"14px 18px",borderBottom:"1px solid #eef2f7",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"},children:[e.jsx("div",{style:{display:"inline-flex",alignItems:"center",gap:12,color:"#111827",fontWeight:900,fontSize:28,letterSpacing:"-0.03em"},children:"Bloggad"}),e.jsxs("div",{style:{flex:"1 1 520px",maxWidth:720,position:"relative"},children:[e.jsx(Ye,{size:18,style:{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"#64748b"}}),e.jsx("input",{type:"text",placeholder:"Search Bloggad articles",style:{width:"100%",height:52,borderRadius:14,border:"1px solid #dbe1ea",background:"#f8fafc",padding:"0 16px 0 48px",fontSize:15,color:"#111827",outline:"none"}})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:16,color:"#111827",fontWeight:700,flexWrap:"wrap"},children:[e.jsx("span",{children:"Blog"}),e.jsx("span",{children:"About Us"}),e.jsx("span",{children:"Contact Us"}),e.jsx("span",{children:"FAQs"})]})]})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:18},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",color:"#64748b",fontSize:14,fontWeight:600},children:[e.jsx(ie,{to:"/",style:{color:"#64748b"},children:"Home"}),e.jsx("span",{children:"/"}),e.jsx("span",{children:((u=i==null?void 0:i.category)==null?void 0:u.name)||"Category"}),e.jsx("span",{children:"/"}),e.jsx("span",{style:{color:"#111827",fontWeight:800},children:(i==null?void 0:i.title)||"Post"})]}),h!=null&&h.enabled&&["popup","both"].includes(String((h==null?void 0:h.display_mode)||(h==null?void 0:h.show_mode)||"").toLowerCase())?e.jsx("button",{type:"button",onClick:p,style:{minHeight:44,padding:"0 16px",borderRadius:14,border:"1px solid #111827",background:"#111827",color:"#ffffff",fontWeight:800,cursor:"pointer"},children:"Open Email Offer"}):null]}),e.jsxs("div",{className:"post-layout-grid",style:{marginBottom:28},children:[e.jsxs("main",{children:[e.jsxs("article",{style:Q({overflow:"hidden",marginBottom:24}),children:[i!=null&&i.featured_image?e.jsx("img",{src:i.featured_image,alt:i.title,style:{width:"100%",maxHeight:560,objectFit:"cover",display:"block"}}):null,e.jsxs("div",{style:{padding:26},children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:999,background:"#eff6ff",color:"#2563eb",fontWeight:800,fontSize:12,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16},children:[e.jsx(ei,{size:13}),((s=i==null?void 0:i.category)==null?void 0:s.name)||"Bloggad Story"]}),e.jsx("h1",{style:{margin:"0 0 16px",fontSize:"clamp(2rem, 4vw, 3.4rem)",lineHeight:1.08,fontWeight:900,letterSpacing:"-0.04em",color:"#111827"},children:(i==null?void 0:i.title)||"Post"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:18,color:"#64748b",fontSize:14,fontWeight:600},children:[e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:8},children:[e.jsx(ii,{size:15}),((S=i==null?void 0:i.website)==null?void 0:S.website_name)||"Bloggad"]}),e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:8},children:[e.jsx(ti,{size:15}),Ri(i==null?void 0:i.published_at)]}),e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:8},children:[e.jsx(ri,{size:15}),"6 min read"]})]}),e.jsx("div",{style:{fontSize:18,lineHeight:1.85,color:"#475569",marginBottom:18},children:(i==null?void 0:i.excerpt)||"No excerpt"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",paddingTop:14,borderTop:"1px solid #eef2f7",marginBottom:8},children:[e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:8,color:"#111827",fontWeight:800},children:[e.jsx(be,{size:16}),"Share"]}),e.jsx("button",{type:"button",style:{width:38,height:38,borderRadius:999,border:"1px solid #e5e7eb",background:"#ffffff",color:"#111827",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx(Ii,{size:16})}),e.jsx("button",{type:"button",style:{width:38,height:38,borderRadius:999,border:"1px solid #e5e7eb",background:"#ffffff",color:"#111827",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx(be,{size:16})}),e.jsx("button",{type:"button",style:{width:38,height:38,borderRadius:999,border:"1px solid #e5e7eb",background:"#ffffff",color:"#111827",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx(be,{size:16})})]})]})]}),e.jsxs("section",{style:Q({padding:24,marginBottom:24}),children:[e.jsx("div",{style:{fontSize:24,lineHeight:1.2,fontWeight:900,color:"#111827",marginBottom:18},children:"Article Content"}),e.jsx("div",{style:{display:"grid",gap:22},children:n.length?n.map(m=>{var l;return e.jsxs("div",{style:{paddingBottom:20,borderBottom:"1px solid #eef2f7"},children:[String(((l=i==null?void 0:i.template)==null?void 0:l.template_code_key)||(i==null?void 0:i.template_code_key)||"").toLowerCase()==="simple_writer_template_v1"?null:e.jsx("div",{style:{fontSize:20,fontWeight:900,color:"#111827",marginBottom:12,textTransform:"capitalize"},children:m.field_key}),Pi(m)]},m.id)}):e.jsx("div",{style:{color:"#64748b"},children:"No post content fields available."})})]}),e.jsxs("section",{style:Q({padding:24}),children:[e.jsx("div",{style:{fontSize:24,lineHeight:1.2,fontWeight:900,color:"#111827",marginBottom:18},children:"Call To Action"}),e.jsx("div",{style:{display:"flex",gap:12,flexWrap:"wrap"},children:r.length?r.map(m=>e.jsx("a",{href:m.button_url||"#",target:m.open_in_new_tab?"_blank":"_self",rel:m.open_in_new_tab?"noreferrer":void 0,style:{padding:"12px 18px",borderRadius:14,border:m.button_style==="secondary"?"1px solid #d1d5db":"1px solid #2563eb",background:m.button_style==="secondary"?"#ffffff":"#2563eb",color:m.button_style==="secondary"?"#111827":"#ffffff",fontWeight:800,textDecoration:"none"},children:m.button_label},m.id)):e.jsx("div",{style:{color:"#64748b"},children:"No CTA buttons available."})})]}),f]}),e.jsxs("aside",{style:{display:"grid",gap:20,alignSelf:"start"},children:[e.jsxs("div",{style:Q({padding:20}),children:[e.jsx("div",{style:{fontSize:20,fontWeight:900,color:"#111827",marginBottom:16},children:"Categories"}),e.jsx("div",{style:{display:"grid",gap:6},children:(x||[]).length?x.map(m=>e.jsxs(ie,{to:`/category/${m.slug}`,style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"12px 12px",borderRadius:12,color:"#111827",fontWeight:700,background:"#ffffff",textDecoration:"none"},children:[e.jsx("span",{children:m.name}),e.jsx(fe,{size:15})]},m.id)):e.jsx("div",{style:{color:"#64748b"},children:"No categories found."})})]}),e.jsxs("div",{style:Q({padding:20}),children:[e.jsx("div",{style:{fontSize:20,fontWeight:900,color:"#111827",marginBottom:16},children:"About This Post"}),e.jsxs("div",{style:{display:"grid",gap:12},children:[e.jsxs("div",{style:{padding:14,borderRadius:14,background:"#f8fafc",border:"1px solid #e5e7eb"},children:[e.jsx("div",{style:{fontSize:12,color:"#64748b",marginBottom:6},children:"Website"}),e.jsx("div",{style:{fontWeight:800,color:"#111827"},children:((k=i==null?void 0:i.website)==null?void 0:k.website_name)||"Bloggad"})]}),e.jsxs("div",{style:{padding:14,borderRadius:14,background:"#f8fafc",border:"1px solid #e5e7eb"},children:[e.jsx("div",{style:{fontSize:12,color:"#64748b",marginBottom:6},children:"Product"}),e.jsx("div",{style:{fontWeight:800,color:"#111827"},children:((b=i==null?void 0:i.product)==null?void 0:b.title)||"-"})]}),e.jsxs("div",{style:{padding:14,borderRadius:14,background:"#f8fafc",border:"1px solid #e5e7eb"},children:[e.jsx("div",{style:{fontSize:12,color:"#64748b",marginBottom:6},children:"Template"}),e.jsx("div",{style:{fontWeight:800,color:"#111827"},children:((N=i==null?void 0:i.template)==null?void 0:N.name)||"-"})]})]})]})]})]}),t?e.jsx("section",{style:{marginBottom:28},children:t}):null,e.jsxs("section",{children:[e.jsx("div",{style:{display:"flex",alignItems:"end",justifyContent:"space-between",gap:16,flexWrap:"wrap",marginBottom:18},children:e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:12,fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",color:"#2563eb",marginBottom:8},children:"Bloggad"}),e.jsx("h2",{style:{margin:0,fontSize:30,lineHeight:1.1,fontWeight:900,color:"#111827",letterSpacing:"-0.03em"},children:"Related Posts"})]})}),e.jsx("div",{className:"post-related-grid",children:a.length?a.map(m=>e.jsx(Li,{item:m,websiteSlug:o},m.id)):e.jsx("div",{style:{...Q({padding:20,color:"#64748b"})},children:"No related posts found."})})]})]})]})}function qi(i){if(!i)return"-";const n=new Date(i);return Number.isNaN(n.getTime())?i:n.toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"})}function W(i={}){return{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:18,boxShadow:"0 10px 24px rgba(15, 23, 42, 0.04)",...i}}function ke(i){return String(i||"").trim().toLowerCase()}function Mi(i=[],n=[]){const r={},a={};return i.forEach(o=>{r[ke(o.field_key)]=(o==null?void 0:o.field_value)||""}),n.forEach(o=>{a[ke(o.button_key)]=o||{}}),{fieldMap:r,buttonMap:a}}function F(i,n,r="Learn More"){const a=i[ke(n)]||{};return{label:a.button_label||r,url:a.button_url||"#",style:a.button_style||"primary",openInNewTab:!!a.open_in_new_tab}}function ee({button:i,fullWidth:n=!1}){const r=i.style==="secondary";return e.jsx("a",{href:i.url||"#",target:i.openInNewTab?"_blank":"_self",rel:i.openInNewTab?"noreferrer":void 0,style:{minHeight:48,padding:"0 18px",borderRadius:12,border:r?"1px solid #d1d5db":"1px solid #2563eb",background:r?"#ffffff":"#2563eb",color:r?"#111827":"#ffffff",fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center",textDecoration:"none",width:n?"100%":"fit-content",textAlign:"center"},children:i.label})}function A({children:i}){return e.jsx("div",{style:{background:"#0f5132",borderRadius:16,padding:"16px 18px",marginBottom:18,color:"#ffffff",fontSize:24,fontWeight:900,lineHeight:1.2,textAlign:"center"},children:i})}function z({children:i}){return e.jsx("p",{style:{margin:"0 0 16px",color:"#334155",fontSize:16,lineHeight:1.9},children:i||"-"})}function Fi({item:i,websiteSlug:n}){return e.jsxs("div",{style:W({overflow:"hidden"}),children:[i!=null&&i.featured_image?e.jsx("img",{src:i.featured_image,alt:i.title,style:{width:"100%",height:220,objectFit:"cover",display:"block"}}):e.jsx("div",{style:{width:"100%",height:220,background:"#f8fafc",borderBottom:"1px solid #e5e7eb"}}),e.jsxs("div",{style:{padding:18},children:[e.jsx("div",{style:{fontSize:12,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:"#2563eb",marginBottom:10},children:"Bloggad Article"}),e.jsx("div",{style:{fontSize:20,lineHeight:1.35,fontWeight:900,color:"#111827",marginBottom:10},children:(i==null?void 0:i.title)||"Related post"}),e.jsx("div",{style:{fontSize:14,lineHeight:1.8,color:"#64748b",marginBottom:16},children:(i==null?void 0:i.excerpt)||"No excerpt"}),e.jsxs(ie,{to:`/${n}/post/${i.slug}`,style:{display:"inline-flex",alignItems:"center",gap:8,color:"#111827",fontWeight:800,textDecoration:"none"},children:["Read Post",e.jsx(fe,{size:16})]})]})]})}function si({post:i,templateFields:n,ctaButtons:r,relatedPosts:a,websiteSlug:o,emailCaptureFooter:x,onOpenPopup:f,emailCapture:p,sponsoredRelatedPostsSlot:h}){var Y,R;const{fieldMap:t,buttonMap:u}=Mi(n,r),s=F(u,"hero_primary_cta","Buy Now"),S=F(u,"hero_secondary_cta","Official Website"),k=F(u,"how_it_works_cta","Official Website"),b=F(u,"ingredients_cta","Get Discount"),N=F(u,"pricing_card_1_cta","Buy Now"),m=F(u,"pricing_card_2_cta","Buy Now"),l=F(u,"pricing_card_3_cta","Buy Now"),H=F(u,"special_offer_cta","Order Now"),T=Array.from({length:7},(d,c)=>({title:t[`benefit_${c+1}_title`],text:t[`benefit_${c+1}_text`]})),$=Array.from({length:3},(d,c)=>({image:t[`testimonial_${c+1}_image`],nameLine:t[`testimonial_${c+1}_name_line`],text:t[`testimonial_${c+1}_text`]})),E=[{packageTitle:t.pricing_card_1_package_title,supplyLabel:t.pricing_card_1_supply_label,image:t.pricing_card_1_image,priceText:t.pricing_card_1_price_text,totalText:t.pricing_card_1_total_text,paymentsImage:t.pricing_card_1_payments_image,button:N},{packageTitle:t.pricing_card_2_package_title,supplyLabel:t.pricing_card_2_supply_label,image:t.pricing_card_2_image,priceText:t.pricing_card_2_price_text,totalText:t.pricing_card_2_total_text,paymentsImage:t.pricing_card_2_payments_image,button:m},{packageTitle:t.pricing_card_3_package_title,supplyLabel:t.pricing_card_3_supply_label,image:t.pricing_card_3_image,priceText:t.pricing_card_3_price_text,totalText:t.pricing_card_3_total_text,paymentsImage:t.pricing_card_3_payments_image,button:l}],g=Array.from({length:3},(d,c)=>({image:t[`bonus_${c+1}_image`],title:t[`bonus_${c+1}_title`],priceLine:t[`bonus_${c+1}_price_line`],text:t[`bonus_${c+1}_text`]})),V=Array.from({length:10},(d,c)=>({question:t[`faq_${c+1}_question`],answer:t[`faq_${c+1}_answer`]})),q=Array.from({length:8},(d,c)=>({text:t[`learn_more_paragraph_${c+1}`]})),re=Array.from({length:5},(d,c)=>({title:t[`ingredient_${c+1}_title`],text:t[`ingredient_${c+1}_text`]})),ne=Array.from({length:4},(d,c)=>({title:t[`difference_item_${c+1}_title`],text:t[`difference_item_${c+1}_text`]}));return e.jsxs("div",{style:{minHeight:"100vh",background:"#f6f8fb"},children:[e.jsx("style",{children:`
        .neutral-review-page-wrap {
          width: min(1180px, calc(100% - 24px));
          margin: 0 auto;
          padding: 18px 0 48px;
        }

        .neutral-review-hero-grid,
        .neutral-review-two-col {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px;
        }

        .neutral-review-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .neutral-review-testimonial-grid,
        .neutral-review-bonus-grid,
        .neutral-review-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        @media (max-width: 1100px) {
          .neutral-review-hero-grid,
          .neutral-review-two-col,
          .neutral-review-pricing-grid,
          .neutral-review-testimonial-grid,
          .neutral-review-bonus-grid,
          .neutral-review-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}),e.jsx(Te,{url:t.bloggad_video_url}),e.jsxs("div",{className:"neutral-review-page-wrap",children:[e.jsx("div",{style:{background:"#0f5132",color:"#ffffff",borderRadius:18,padding:"14px 18px",textAlign:"center",fontWeight:900,fontSize:22,lineHeight:1.35,marginBottom:18},children:t.top_bar_title||(i==null?void 0:i.title)||"Blog Post"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",color:"#64748b",fontSize:14,marginBottom:18,fontWeight:700},children:[e.jsx(ie,{to:"/",style:{color:"#64748b",textDecoration:"none"},children:"Home"}),e.jsx("span",{children:"/"}),e.jsx("span",{children:((Y=i==null?void 0:i.category)==null?void 0:Y.name)||"Category"}),e.jsx("span",{children:"/"}),e.jsx("span",{style:{color:"#111827"},children:(i==null?void 0:i.title)||"Post"})]}),p!=null&&p.enabled&&["popup","both"].includes(String((p==null?void 0:p.display_mode)||(p==null?void 0:p.show_mode)||"").toLowerCase())?e.jsx("div",{style:{marginBottom:18,textAlign:"right"},children:e.jsx("button",{type:"button",onClick:f,style:{minHeight:46,padding:"0 16px",borderRadius:14,border:"1px solid #111827",background:"#111827",color:"#ffffff",fontWeight:800,cursor:"pointer"},children:"Open Email Offer"})}):null,e.jsx("section",{style:W({padding:20,marginBottom:22}),children:e.jsxs("div",{className:"neutral-review-hero-grid",children:[e.jsxs("div",{children:[t.hero_product_image?e.jsx("img",{src:t.hero_product_image,alt:(i==null?void 0:i.title)||"Hero product",style:{width:"100%",borderRadius:16,display:"block",background:"#f8fafc",border:"1px solid #e5e7eb"}}):e.jsx("div",{style:{width:"100%",minHeight:360,borderRadius:16,background:"#f8fafc",border:"1px solid #e5e7eb"}}),e.jsxs("div",{style:{marginTop:16,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",color:"#111827",fontWeight:800},children:[Array.from({length:5},(d,c)=>e.jsx(le,{size:18,fill:"#f59e0b",color:"#f59e0b"},c)),e.jsx("span",{style:{marginLeft:6},children:t.hero_review_text||"-"})]}),t.hero_certification_image?e.jsx("img",{src:t.hero_certification_image,alt:"Certifications",style:{width:"100%",marginTop:16,borderRadius:12,display:"block"}}):null]}),e.jsxs("div",{children:[e.jsx("h1",{style:{margin:0,color:"#111827",fontSize:"clamp(2rem, 3.6vw, 3rem)",lineHeight:1.05,fontWeight:900,letterSpacing:"-0.04em"},children:t.hero_title||(i==null?void 0:i.title)||"Post"}),e.jsx(z,{children:t.hero_intro_paragraph_1}),e.jsx(z,{children:t.hero_intro_paragraph_2}),e.jsx("div",{style:{margin:"10px 0 16px",color:"#92400e",fontWeight:900,fontSize:18,textDecoration:"underline"},children:t.hero_small_cta_line||"-"}),e.jsxs("div",{style:{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16},children:[e.jsx(ee,{button:s}),e.jsx(ee,{button:S})]}),e.jsx("div",{style:{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center",color:"#475569",fontWeight:700},children:[t.hero_trust_item_1,t.hero_trust_item_2,t.hero_trust_item_3].map((d,c)=>e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:6},children:[e.jsx(te,{size:16,color:"#16a34a"}),d||"-"]},c))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",marginTop:18,color:"#64748b",fontSize:14,fontWeight:600},children:[e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:8},children:[e.jsx(ii,{size:15}),((R=i==null?void 0:i.website)==null?void 0:R.website_name)||"Bloggad"]}),e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:8},children:[e.jsx(ti,{size:15}),qi(i==null?void 0:i.published_at)]}),e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:8},children:[e.jsx(ri,{size:15}),"6 min read"]})]})]})]})}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.how_this_product_works_title||"How This Product Works"}),e.jsx("div",{style:W({padding:22}),children:e.jsxs("div",{className:"neutral-review-two-col",children:[e.jsxs("div",{children:[e.jsx(z,{children:t.how_this_product_works_paragraph_1}),e.jsx(z,{children:t.how_this_product_works_paragraph_2}),e.jsx(z,{children:t.how_this_product_works_paragraph_3}),e.jsx(ee,{button:k})]}),e.jsx("div",{children:t.how_this_product_works_image?e.jsx("img",{src:t.how_this_product_works_image,alt:"How this product works",style:{width:"100%",borderRadius:16,display:"block",border:"1px solid #e5e7eb"}}):e.jsx("div",{style:{width:"100%",minHeight:340,borderRadius:16,background:"#f8fafc",border:"1px solid #e5e7eb"}})})]})})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.ingredients_section_title||"Ingredients"}),e.jsx("div",{style:W({padding:22}),children:e.jsxs("div",{className:"neutral-review-two-col",children:[e.jsxs("div",{children:[e.jsx(z,{children:t.ingredients_intro}),e.jsx("div",{style:{display:"grid",gap:12,marginBottom:18},children:re.map((d,c)=>e.jsxs("div",{style:{color:"#334155",lineHeight:1.8},children:[e.jsx("strong",{style:{color:"#111827"},children:d.title||"-"})," — ",d.text||"-"]},c))}),e.jsx(z,{children:t.ingredients_closing_line}),e.jsx(ee,{button:b})]}),e.jsx("div",{children:t.ingredients_image?e.jsx("img",{src:t.ingredients_image,alt:"Ingredients",style:{width:"100%",borderRadius:16,display:"block",border:"1px solid #e5e7eb"}}):e.jsx("div",{style:{width:"100%",minHeight:340,borderRadius:16,background:"#f8fafc",border:"1px solid #e5e7eb"}})})]})})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.what_makes_this_product_different_title||"What Makes This Product Different"}),e.jsxs("div",{style:W({padding:22}),children:[e.jsx(z,{children:t.difference_intro}),e.jsx("div",{style:{display:"grid",gap:16},children:ne.map((d,c)=>e.jsxs("div",{style:{paddingBottom:14,borderBottom:"1px solid #eef2f7"},children:[e.jsx("div",{style:{color:"#111827",fontWeight:900,fontSize:20,marginBottom:8},children:d.title||"-"}),e.jsx(z,{children:d.text})]},c))})]})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.benefits_title||"Benefits"}),e.jsxs("div",{style:W({padding:22}),children:[e.jsx(z,{children:t.benefits_intro}),e.jsx("div",{style:{display:"grid",gap:14},children:T.map((d,c)=>e.jsxs("div",{style:{borderBottom:"1px solid #eef2f7",paddingBottom:12},children:[e.jsx("div",{style:{color:"#111827",fontWeight:900,fontSize:18,marginBottom:6},children:d.title||"-"}),e.jsx("div",{style:{color:"#475569",fontSize:15,lineHeight:1.8},children:d.text||"-"})]},c))}),e.jsx("div",{style:{marginTop:14,color:"#475569",lineHeight:1.8,fontSize:15},children:t.benefits_closing_line||"-"})]})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.testimonials_title||"Testimonials"}),e.jsx("div",{className:"neutral-review-testimonial-grid",children:$.map((d,c)=>e.jsxs("div",{style:W({padding:20}),children:[d.image?e.jsx("img",{src:d.image,alt:d.nameLine||`Testimonial ${c+1}`,style:{width:120,height:120,borderRadius:"50%",objectFit:"cover",display:"block",margin:"0 auto 16px"}}):e.jsx("div",{style:{width:120,height:120,borderRadius:"50%",background:"#f8fafc",border:"1px solid #e5e7eb",margin:"0 auto 16px"}}),e.jsx("div",{style:{color:"#111827",fontWeight:900,textAlign:"center",marginBottom:10},children:d.nameLine||"-"}),e.jsx("div",{style:{display:"flex",justifyContent:"center",gap:4,marginBottom:10},children:Array.from({length:5},(J,w)=>e.jsx(le,{size:16,fill:"#f59e0b",color:"#f59e0b"},w))}),e.jsx("div",{style:{color:"#475569",lineHeight:1.8,textAlign:"center",fontSize:15},children:d.text||"-"})]},c))})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.pricing_title||"Pricing"}),e.jsx("div",{className:"neutral-review-pricing-grid",children:E.map((d,c)=>e.jsxs("div",{style:W({padding:20,textAlign:"center"}),children:[e.jsx("div",{style:{fontWeight:900,color:"#111827",fontSize:22,marginBottom:6},children:d.packageTitle||"-"}),e.jsx("div",{style:{color:"#64748b",fontWeight:700,marginBottom:14},children:d.supplyLabel||"-"}),d.image?e.jsx("img",{src:d.image,alt:d.packageTitle||`Pricing ${c+1}`,style:{width:"100%",maxHeight:280,objectFit:"contain",display:"block",marginBottom:16}}):e.jsx("div",{style:{width:"100%",minHeight:220,borderRadius:16,background:"#f8fafc",border:"1px solid #e5e7eb",marginBottom:16}}),e.jsx("div",{style:{color:"#2563eb",fontWeight:900,fontSize:28,marginBottom:10},children:d.priceText||"-"}),e.jsx("div",{style:{color:"#475569",fontWeight:800,marginBottom:14},children:d.totalText||"-"}),e.jsx("div",{style:{marginBottom:14},children:e.jsx(ee,{button:d.button,fullWidth:!0})}),d.paymentsImage?e.jsx("img",{src:d.paymentsImage,alt:"Payments",style:{width:"100%",display:"block"}}):null]},c))})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.bonus_section_title||"Bonuses"}),e.jsx("div",{className:"neutral-review-bonus-grid",children:g.map((d,c)=>e.jsxs("div",{style:W({padding:18}),children:[d.image?e.jsx("img",{src:d.image,alt:d.title||`Bonus ${c+1}`,style:{width:"100%",height:220,objectFit:"cover",borderRadius:14,display:"block",marginBottom:14}}):e.jsx("div",{style:{width:"100%",height:220,borderRadius:14,background:"#f8fafc",border:"1px solid #e5e7eb",marginBottom:14}}),e.jsx("div",{style:{fontSize:20,lineHeight:1.35,fontWeight:900,color:"#111827",marginBottom:10},children:d.title||"-"}),e.jsx("div",{style:{color:"#92400e",fontWeight:800,marginBottom:12},children:d.priceLine||"-"}),e.jsx("div",{style:{color:"#475569",lineHeight:1.8,fontSize:15},children:d.text||"-"})]},c))})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.faq_section_title||"FAQ"}),e.jsx("div",{style:W({padding:22}),children:e.jsx("div",{style:{display:"grid",gap:14},children:V.map((d,c)=>e.jsxs("div",{style:{paddingBottom:14,borderBottom:"1px solid #eef2f7"},children:[e.jsx("div",{style:{color:"#111827",fontWeight:900,fontSize:18,marginBottom:8},children:d.question||"-"}),e.jsx("div",{style:{color:"#475569",lineHeight:1.8,fontSize:15},children:d.answer||"-"})]},c))})})]}),e.jsx("section",{style:{marginBottom:22},children:e.jsx("div",{style:W({overflow:"hidden"}),children:e.jsxs("div",{className:"neutral-review-two-col",style:{gap:0},children:[e.jsx("div",{style:{background:"#0f5132",padding:22,display:"flex",alignItems:"center",justifyContent:"center"},children:t.guarantee_badge_image?e.jsx("img",{src:t.guarantee_badge_image,alt:"Guarantee",style:{width:"100%",maxWidth:280,display:"block"}}):e.jsx("div",{style:{width:280,height:280,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)"}})}),e.jsxs("div",{style:{background:"#0f5132",color:"#ffffff",padding:26},children:[e.jsx("div",{style:{fontSize:28,lineHeight:1.15,fontWeight:900,marginBottom:16},children:t.guarantee_title||"-"}),e.jsxs("div",{style:{color:"rgba(255,255,255,0.92)",lineHeight:1.9,fontSize:16},children:[e.jsx("p",{style:{margin:"0 0 14px"},children:t.guarantee_paragraph_1||"-"}),e.jsx("p",{style:{margin:"0 0 14px"},children:t.guarantee_paragraph_2||"-"}),e.jsx("p",{style:{margin:0,fontWeight:800},children:t.guarantee_paragraph_3||"-"})]})]})]})})}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.special_offer_title||"Special Offer"}),e.jsxs("div",{style:W({padding:22,textAlign:"center"}),children:[t.special_offer_image?e.jsx("img",{src:t.special_offer_image,alt:"Special offer",style:{width:"100%",maxWidth:420,display:"block",margin:"0 auto 18px"}}):e.jsx("div",{style:{width:"100%",maxWidth:420,minHeight:300,borderRadius:18,background:"#f8fafc",border:"1px solid #e5e7eb",margin:"0 auto 18px"}}),e.jsx("div",{style:{color:"#111827",fontWeight:900,fontSize:34,lineHeight:1.1,marginBottom:18},children:t.special_offer_price_text||"-"}),e.jsx("div",{style:{display:"flex",justifyContent:"center"},children:e.jsx(ee,{button:H})})]})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.learn_more_title||"Learn More"}),e.jsx("div",{style:W({padding:22}),children:q.map((d,c)=>e.jsx(z,{children:d.text},c))})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsx(A,{children:t.scientific_references_title||"Scientific References"}),e.jsxs("div",{style:W({padding:22}),children:[t.scientific_references_logo_strip?e.jsx("img",{src:t.scientific_references_logo_strip,alt:"Scientific references logos",style:{width:"100%",display:"block",marginBottom:18}}):null,e.jsx("div",{style:{color:"#64748b",lineHeight:1.9,fontSize:15},children:"This section uses the uploaded scientific references area for this template."})]})]}),e.jsxs("section",{style:{marginBottom:22},children:[e.jsxs("div",{style:W({padding:22,marginBottom:18}),children:[e.jsx(z,{children:t.advertorial_notice}),e.jsx(z,{children:t.platform_notice})]}),e.jsxs("div",{style:W({padding:22}),children:[e.jsx("div",{style:{fontSize:24,fontWeight:900,color:"#111827",marginBottom:12},children:t.legal_disclaimer_title||"Disclaimer"}),e.jsx(z,{children:t.legal_disclaimer_paragraph_1}),e.jsx(z,{children:t.legal_disclaimer_paragraph_2}),e.jsx("div",{style:{fontSize:22,fontWeight:900,color:"#111827",margin:"18px 0 12px"},children:t.affiliate_editorial_disclosure_title||"-"}),e.jsx(z,{children:t.affiliate_editorial_disclosure_paragraph_1}),e.jsx(z,{children:t.affiliate_editorial_disclosure_paragraph_2}),e.jsx("div",{style:{fontSize:22,fontWeight:900,color:"#111827",margin:"18px 0 12px"},children:t.trademark_disclaimer_title||"-"}),e.jsx(z,{children:t.trademark_disclaimer_paragraph}),e.jsx("div",{style:{fontSize:22,fontWeight:900,color:"#111827",margin:"18px 0 12px"},children:t.fda_compliance_statement_title||"-"}),e.jsx(z,{children:t.fda_compliance_statement_paragraph_1}),e.jsx(z,{children:t.fda_compliance_statement_paragraph_2})]})]}),h?e.jsx("section",{style:{margin:"26px 0 22px"},children:h}):null,x,e.jsxs("section",{style:{marginTop:22},children:[e.jsx("div",{style:{display:"flex",alignItems:"end",justifyContent:"space-between",gap:16,flexWrap:"wrap",marginBottom:18},children:e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:12,fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",color:"#2563eb",marginBottom:8},children:"Bloggad"}),e.jsx("h2",{style:{margin:0,fontSize:30,lineHeight:1.1,fontWeight:900,color:"#111827",letterSpacing:"-0.03em"},children:"Related Posts"})]})}),e.jsx("div",{className:"neutral-review-related-grid",children:a.length?a.map(d=>e.jsx(Fi,{item:d,websiteSlug:o},d.id)):e.jsx("div",{style:{...W({padding:20,color:"#64748b"})},children:"No related posts found."})})]})]})]})}const Oi=`data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="100" viewBox="0 0 800 100">
  <rect width="800" height="100" fill="transparent"/>

  <g>
    <rect x="12" y="10" rx="4" ry="4" width="124" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="74" y="57" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="#1a73e8">VISA</text>
  </g>

  <g>
    <rect x="148" y="10" rx="4" ry="4" width="124" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="210" y="55" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#16386b">PayPal</text>
  </g>

  <g>
    <rect x="284" y="10" rx="4" ry="4" width="124" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <circle cx="340" cy="48" r="20" fill="#ea001b" opacity="0.92"/>
    <circle cx="365" cy="48" r="20" fill="#f79e1b" opacity="0.92"/>
    <text x="352" y="54" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="#ffffff">MasterCard</text>
  </g>

  <g>
    <rect x="420" y="10" rx="4" ry="4" width="124" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="482" y="48" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#111827">DISCOVER</text>
    <path d="M438 68 Q482 44 526 68 L526 80 L438 80 Z" fill="#f7931e"/>
  </g>

  <g>
    <rect x="556" y="10" rx="4" ry="4" width="232" height="80" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="672" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#199ad6">AMERICAN</text>
    <text x="672" y="66" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#199ad6">EXPRESS</text>
  </g>
</svg>
`)}`;function Se(i){return String(i||"").trim().toLowerCase()}function Di(i=[],n=[]){const r={},a={};return i.forEach(o=>{r[Se(o.field_key)]=(o==null?void 0:o.field_value)||""}),n.forEach(o=>{a[Se(o.button_key)]=o||{}}),{fieldMap:r,buttonMap:a}}function O(i,n,r="Order Now"){const a=i[Se(n)]||{};return{label:a.button_label||r,url:a.button_url||"#",style:a.button_style||"primary",openInNewTab:!!a.open_in_new_tab}}function Ui(i={}){return{background:"#f3f3f3",border:"none",borderRadius:0,boxShadow:"none",...i}}function ze({children:i,style:n={}}){return e.jsx("section",{style:{width:"100%",...n},children:i})}function B({children:i,style:n={}}){return e.jsx("div",{style:{width:"100%",maxWidth:"100%",margin:"0",padding:"0 14px",...n},children:i})}function ae({src:i,alt:n,maxWidth:r="100%",imgStyle:a={}}){return i?e.jsx("img",{src:i,alt:n||"Product",style:{width:"100%",maxWidth:r,display:"block",margin:"0 auto",objectFit:"contain",...a}}):e.jsx("div",{style:{width:"100%",maxWidth:r,minHeight:320,background:"#ececec",margin:"0 auto"}})}function L({children:i}){return e.jsx(ze,{style:{background:"#0b7f4b",marginTop:22},children:e.jsx(B,{children:e.jsx("div",{style:{color:"#ffffff",textAlign:"center",fontWeight:800,fontSize:24,lineHeight:1.25,padding:"24px 10px"},children:i})})})}function oe({children:i,center:n=!1,bold:r=!1,className:a="",style:o={}}){return e.jsx("p",{className:a,style:{margin:"0 0 16px",color:"#1f2937",fontSize:16,lineHeight:1.8,textAlign:n?"center":"left",fontWeight:r?800:500,overflowWrap:"break-word",wordBreak:"break-word",...o},children:i||"-"})}function D({button:i,full:n=!1,className:r=""}){return e.jsxs("a",{href:i.url||"#",target:i.openInNewTab?"_blank":"_self",rel:i.openInNewTab?"noreferrer":void 0,className:`dxt-btn ${r}`,style:{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:56,padding:"0 26px",width:n?"100%":"auto",maxWidth:"100%",borderRadius:9999,background:"#facc15",color:"#111827",textDecoration:"none",fontWeight:700,fontSize:15,lineHeight:1.2,boxShadow:"0 3px 12px rgba(0,0,0,0.18)",border:"none",whiteSpace:"nowrap"},children:[e.jsx("span",{children:i.label}),e.jsx(ji,{size:17,strokeWidth:2.4})]})}function Vi({items:i=[]}){const n=i.filter(Boolean);return n.length?e.jsx("div",{className:"dxt-hero-trust-line",children:n.map((r,a)=>e.jsxs("div",{className:"dxt-hero-trust-item",children:[e.jsx(te,{size:18,strokeWidth:2.4}),e.jsx("span",{children:r})]},`${r}-${a}`))}):null}function Xi({text:i}){return i?e.jsxs("div",{className:"dxt-review-row",style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap",marginTop:16,marginBottom:18},children:[e.jsx("div",{style:{display:"flex",gap:2,flexShrink:0},children:Array.from({length:5}).map((n,r)=>e.jsx(le,{size:18,fill:"#f59e0b",color:"#f59e0b"},r))}),e.jsx("div",{className:"dxt-review-text",style:{color:"#6b7280",fontSize:15,fontWeight:700,lineHeight:1.2},children:i})]}):null}function Gi({images:i=[]}){const n=i.filter(Boolean);return n.length?e.jsx("div",{style:{width:"100%",marginTop:18},children:e.jsx("div",{className:"dxt-circle-badges-wrap",children:e.jsx("div",{className:"dxt-circle-badges-row",children:n.map((r,a)=>e.jsx("div",{className:"dxt-circle-badge",children:e.jsx("img",{src:r,alt:`Badge ${a+1}`,style:{width:"74%",height:"74%",objectFit:"contain",display:"block"}})},`${r}-${a}`))})})}):null}function Ki({items:i=[]}){const n=i.filter(Boolean);return n.length?e.jsx("div",{className:"dxt-feature-bullets",children:n.map((r,a)=>e.jsxs("div",{className:"dxt-feature-bullet",children:[e.jsx(te,{size:17,strokeWidth:2.4}),e.jsx("span",{children:r})]},`${r}-${a}`))}):null}function Qi({item:i}){return e.jsxs("div",{style:{background:"#ffffff",padding:16,textAlign:"center",border:"1px solid #d9e3dc"},children:[i.image?e.jsx("img",{src:i.image,alt:i.name||"Testimonial",style:{width:86,height:86,borderRadius:"50%",objectFit:"cover",display:"block",margin:"0 auto 12px"}}):e.jsx("div",{style:{width:86,height:86,borderRadius:"50%",background:"#f1f5f9",margin:"0 auto 12px"}}),e.jsx("div",{style:{display:"flex",justifyContent:"center",gap:3,marginBottom:10},children:Array.from({length:5}).map((n,r)=>e.jsx(le,{size:15,fill:"#f59e0b",color:"#f59e0b"},r))}),e.jsx("div",{style:{fontSize:18,fontWeight:700,color:"#111827",marginBottom:8,lineHeight:1.3},children:i.name||"-"}),e.jsx("div",{style:{color:"#334155",fontSize:14,lineHeight:1.75},children:i.text||"-"})]})}function Yi(){return e.jsx("div",{className:"dxt-payment-row",children:e.jsx("div",{className:"dxt-payment-strip-card",children:e.jsx("img",{src:Oi,alt:"Visa, PayPal, Mastercard, Discover and American Express",className:"dxt-payment-strip-image"})})})}function _e({item:i,featured:n=!1}){return e.jsxs("div",{className:`dxt-pricing-card ${n?"is-featured":""}`,children:[e.jsx("div",{className:"dxt-pricing-title",children:i.title||"-"}),e.jsx("div",{className:"dxt-pricing-subtitle",children:i.subtitle||"-"}),e.jsxs("div",{className:"dxt-pricing-image-wrap",children:[e.jsx(ae,{src:i.image,alt:i.title,maxWidth:"100%",imgStyle:{maxHeight:320}}),n&&i.badgeText?e.jsx("div",{className:"dxt-pricing-badge",children:i.badgeText}):null]}),e.jsxs("div",{className:"dxt-pricing-price-line",children:[e.jsx("span",{className:"dxt-pricing-price-main",children:i.price||"-"}),e.jsx("span",{className:"dxt-pricing-price-suffix",children:i.priceSuffix||""})]}),e.jsx("div",{className:"dxt-pricing-btn-wrap",children:e.jsx(D,{button:i.button,className:"dxt-pricing-btn"})}),e.jsxs("div",{className:"dxt-pricing-total-line",children:[e.jsx("span",{className:"dxt-pricing-total-label",children:i.totalLabel||"TOTAL:"})," ",e.jsx("span",{className:"dxt-pricing-total-old",children:i.totalOldPrice||"-"})," ",e.jsx("span",{className:"dxt-pricing-total-new",children:i.totalNewPrice||"-"})]}),e.jsx(Yi,{})]})}function Ji({item:i,websiteSlug:n}){return e.jsxs("div",{style:{background:"#ffffff",border:"1px solid #d9e3dc",overflow:"hidden"},children:[i!=null&&i.featured_image?e.jsx("img",{src:i.featured_image,alt:i.title,style:{width:"100%",height:200,objectFit:"cover",display:"block"}}):e.jsx("div",{style:{height:200,background:"#e5e7eb"}}),e.jsxs("div",{style:{padding:16},children:[e.jsx("div",{style:{fontSize:18,lineHeight:1.35,fontWeight:700,color:"#111827",marginBottom:10},children:(i==null?void 0:i.title)||"Related post"}),e.jsx("div",{style:{color:"#475569",fontSize:14,lineHeight:1.75,marginBottom:12},children:(i==null?void 0:i.excerpt)||"No excerpt"}),e.jsxs(ie,{to:`/${n}/post/${i.slug}`,style:{display:"inline-flex",alignItems:"center",gap:6,color:"#0b7f4b",fontWeight:700,textDecoration:"none"},children:["Read More",e.jsx(fe,{size:16})]})]})]})}function ye({slotKey:i,monetizationSettings:n,websiteId:r,affiliateUserId:a}){return e.jsx(xi,{slotKey:i,monetizationSettings:n,placementMode:"storefront",reviewRequired:!0,darkMode:!1,websiteId:r,affiliateUserId:a})}function oi({post:i,templateFields:n,ctaButtons:r,relatedPosts:a=[],websiteSlug:o,emailCaptureFooter:x,website:f,settings:p,sponsoredRelatedPostsSlot:h}){var J;const{fieldMap:t,buttonMap:u}=Di(n,r),{settings:s}=yi({enabled:!0}),S=(f==null?void 0:f.id)||(p==null?void 0:p.website_id)||((J=p==null?void 0:p.website)==null?void 0:J.id)||(s==null?void 0:s.website_id)||"",k=(f==null?void 0:f.user_id)||(f==null?void 0:f.affiliate_id)||(p==null?void 0:p.affiliate_id)||(p==null?void 0:p.user_id)||(s==null?void 0:s.affiliate_user_id)||(s==null?void 0:s.user_id)||"",b=O(u,"hero_primary_cta","Get Discount"),N=O(u,"hero_secondary_cta","Official Website"),m=O(u,"how_it_works_cta","Official Website"),l=O(u,"ingredients_cta","Get A Discount"),H=O(u,"special_offer_cta","Claim Offer"),T=O(u,"pricing_card_1_cta","Buy Now"),$=O(u,"pricing_card_2_cta","Buy Now"),E=O(u,"pricing_card_3_cta","Buy Now"),g=[t.hero_trust_item_1,t.hero_trust_item_2,t.hero_trust_item_3],V=[t.hero_badge_logo_1,t.hero_badge_logo_2,t.hero_badge_logo_3,t.hero_badge_logo_4,t.hero_badge_logo_5],q=[t.feature_bullet_1,t.feature_bullet_2,t.feature_bullet_3],re=Array.from({length:5},(w,y)=>({title:t[`ingredient_${y+1}_title`],text:t[`ingredient_${y+1}_text`]})),ne=Array.from({length:6},(w,y)=>({title:t[`benefit_${y+1}_title`],text:t[`benefit_${y+1}_text`]})),Y=Array.from({length:3},(w,y)=>({image:t[`testimonial_${y+1}_image`],name:t[`testimonial_${y+1}_name_line`],text:t[`testimonial_${y+1}_text`]})),R=[{title:t.pricing_card_1_package_title,subtitle:t.pricing_card_1_supply_label,image:t.pricing_card_1_image,price:t.pricing_card_1_price_text,priceSuffix:t.pricing_card_1_price_suffix||"",totalLabel:t.pricing_card_1_total_label||"TOTAL:",totalOldPrice:t.pricing_card_1_total_old_price,totalNewPrice:t.pricing_card_1_total_new_price,button:T},{title:t.pricing_card_2_package_title,subtitle:t.pricing_card_2_supply_label,image:t.pricing_card_2_image,price:t.pricing_card_2_price_text,priceSuffix:t.pricing_card_2_price_suffix||"",totalLabel:t.pricing_card_2_total_label||"TOTAL:",totalOldPrice:t.pricing_card_2_total_old_price,totalNewPrice:t.pricing_card_2_total_new_price,badgeText:t.pricing_card_2_badge_text||"BEST VALUE",button:$},{title:t.pricing_card_3_package_title,subtitle:t.pricing_card_3_supply_label,image:t.pricing_card_3_image,price:t.pricing_card_3_price_text,priceSuffix:t.pricing_card_3_price_suffix||"",totalLabel:t.pricing_card_3_total_label||"TOTAL:",totalOldPrice:t.pricing_card_3_total_old_price,totalNewPrice:t.pricing_card_3_total_new_price,button:E}],d=Array.from({length:10},(w,y)=>({question:t[`faq_${y+1}_question`],answer:t[`faq_${y+1}_answer`]})),c=Array.from({length:10},(w,y)=>t[`learn_more_paragraph_${y+1}`]).filter(Boolean);return e.jsxs("div",{style:{width:"100%",minHeight:"100vh",background:"#f3f3f3",overflowX:"hidden"},children:[e.jsx("style",{children:`
        * {
          box-sizing: border-box;
        }

        html, body {
          overflow-x: hidden;
        }

        .dxt-btn {
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
        }

        .dxt-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 6px 18px rgba(0,0,0,0.22);
          filter: brightness(1.02);
        }

        .dxt-ad-top-wrap {
          margin: 0 0 22px;
        }

        .dxt-ad-sidebar-wrap {
          margin-top: 22px;
          width: 100%;
        }

        .dxt-ad-bottom-wrap {
          margin: 28px 0 18px;
        }

        .dxt-sponsored-related-wrap {
          margin: 28px 0 24px;
        }

        .dxt-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 44%) minmax(0, 56%);
          gap: 28px;
          align-items: start;
          width: 100%;
        }

        .dxt-hero-grid > div,
        .dxt-two-col > div,
        .dxt-works-grid > div,
        .dxt-three-grid > div,
        .dxt-pricing-grid > div {
          min-width: 0;
        }

        .dxt-hero-title {
          font-size: 30px;
          line-height: 1.3;
          font-weight: 600;
          color: #0b7f4b;
          margin: 0 0 24px;
          overflow-wrap: anywhere;
          word-break: break-word;
          hyphens: auto;
          max-width: 100%;
        }

        .dxt-hero-description {
          font-size: 20px;
          line-height: 1.6;
          font-weight: 400;
          color: #111827;
          overflow-wrap: anywhere;
          word-break: break-word;
          hyphens: auto;
          margin: 0;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-hero-description p {
          margin: 0 0 34px;
          overflow-wrap: anywhere;
          word-break: break-word;
          hyphens: auto;
          max-width: 100%;
        }

        .dxt-hero-cta-group {
          width: 100%;
          padding-left: 64px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-hero-cta-line {
          margin: 0 0 22px;
          color: #0b7f4b;
          font-size: 18px;
          line-height: 1.4;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-hero-cta-buttons {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 22px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-hero-trust-line {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-hero-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #111827;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 400;
          min-width: 0;
        }

        .dxt-circle-badges-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-left: 28px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-circle-badges-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: nowrap;
          justify-content: center;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 6px;
          max-width: 100%;
          min-width: 0;
          scrollbar-width: thin;
        }

        .dxt-circle-badge {
          width: 112px;
          height: 112px;
          min-width: 112px;
          border-radius: 50%;
          border: 4px solid #ef4444;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .dxt-feature-bullets {
          display: flex;
          align-items: center;
          gap: 26px;
          flex-wrap: wrap;
          margin-top: 18px;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-feature-bullet {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #111827;
          font-size: 15px;
          line-height: 1.45;
          font-weight: 500;
          min-width: 0;
        }

        .dxt-two-col {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 30px;
          align-items: center;
        }

        .dxt-three-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .dxt-faq-item {
          margin-bottom: 24px;
        }

        .dxt-faq-item h3 {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 1.3;
          font-weight: 600;
          color: #1e293b;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .dxt-faq-item p {
          margin: 0;
          font-size: 16px;
          line-height: 1.75;
          color: #334155;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .dxt-works-grid {
          display: grid;
          grid-template-columns: minmax(0, 46%) minmax(0, 54%);
          gap: 40px;
          align-items: center;
          width: 100%;
        }

        .dxt-works-text {
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        .dxt-works-paragraph {
          margin: 0 0 26px;
          color: #111827;
          font-size: 20px;
          line-height: 1.6;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-ingredients-intro {
          margin: 0 0 22px;
          color: #111827;
          font-size: 22px;
          line-height: 1.65;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-ingredient-item {
          margin-bottom: 18px;
        }

        .dxt-ingredient-title {
          font-size: 24px;
          line-height: 1.35;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-ingredient-text {
          color: #334155;
          font-size: 19px;
          line-height: 1.7;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-ingredient-closing {
          margin-top: 10px;
          margin-bottom: 24px;
          color: #111827;
          font-size: 21px;
          line-height: 1.65;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-benefits-intro {
          margin: 0 0 24px;
          color: #111827;
          font-size: 22px;
          line-height: 1.65;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-benefit-item {
          margin-bottom: 24px;
        }

        .dxt-benefit-title {
          font-size: 24px;
          line-height: 1.35;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-benefit-text {
          color: #334155;
          font-size: 19px;
          line-height: 1.7;
          font-weight: 400;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-benefit-closing {
          margin-top: 14px;
          color: #111827;
          font-size: 21px;
          line-height: 1.65;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
          align-items: stretch;
        }

        .dxt-pricing-card {
          border: 3px solid #3b4b63;
          background: #f3f3f3;
          padding: 18px 18px 22px;
          text-align: center;
          position: relative;
          min-height: 100%;
          min-width: 0;
          overflow: hidden;
        }

        .dxt-pricing-title {
          color: #0b7f4b;
          font-size: 32px;
          line-height: 1.15;
          font-weight: 800;
          margin-bottom: 22px;
          text-transform: uppercase;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-pricing-subtitle {
          color: #111827;
          font-size: 26px;
          line-height: 1.2;
          font-weight: 800;
          margin-bottom: 22px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-pricing-image-wrap {
          position: relative;
          margin-bottom: 18px;
          min-height: 330px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          min-width: 0;
        }

        .dxt-pricing-badge {
          position: absolute;
          right: 8%;
          top: 8%;
          width: 122px;
          height: 122px;
          border-radius: 50%;
          background: #ff6a5e;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 18px;
          line-height: 1.05;
          font-weight: 900;
          padding: 10px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.18);
          border: 4px solid #ffd6d2;
        }

        .dxt-pricing-price-line {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 6px;
          margin-bottom: 18px;
          flex-wrap: wrap;
          min-width: 0;
        }

        .dxt-pricing-price-main {
          color: #0b7f4b;
          font-size: 58px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .dxt-pricing-price-suffix {
          color: #0b7f4b;
          font-size: 28px;
          line-height: 1.15;
          font-weight: 500;
          padding-bottom: 7px;
        }

        .dxt-pricing-btn-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
          min-width: 0;
        }

        .dxt-pricing-btn {
          min-width: 290px;
          min-height: 64px;
          font-size: 22px;
          font-weight: 800;
          box-shadow: 0 7px 18px rgba(0,0,0,0.2);
          max-width: 100%;
        }

        .dxt-pricing-total-line {
          color: #111827;
          font-size: 24px;
          line-height: 1.3;
          font-weight: 900;
          margin-bottom: 18px;
          overflow-wrap: anywhere;
          word-break: break-word;
          max-width: 100%;
        }

        .dxt-pricing-total-label {
          text-transform: uppercase;
        }

        .dxt-pricing-total-old {
          text-decoration: line-through;
        }

        .dxt-pricing-total-new {
          color: #111827;
        }

        .dxt-payment-row {
          width: 100%;
          margin-top: 6px;
          min-width: 0;
        }

        .dxt-payment-strip-card {
          width: 100%;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }

        .dxt-payment-strip-image {
          width: 100%;
          max-width: 540px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .dxt-works-image-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 24px 10px 12px;
          min-width: 0;
        }

        .dxt-works-image {
          width: 100%;
          max-width: 620px;
          display: block;
          margin: 0 auto;
          object-fit: contain;
        }

        @media (max-width: 1100px) {
          .dxt-hero-grid,
          .dxt-two-col,
          .dxt-three-grid,
          .dxt-works-grid,
          .dxt-pricing-grid {
            grid-template-columns: 1fr;
          }

          .dxt-hero-title {
            font-size: 28px;
          }

          .dxt-hero-description {
            font-size: 18px;
          }

          .dxt-works-paragraph,
          .dxt-ingredients-intro,
          .dxt-ingredient-text,
          .dxt-ingredient-closing,
          .dxt-benefits-intro,
          .dxt-benefit-text,
          .dxt-benefit-closing {
            font-size: 18px;
          }

          .dxt-ingredient-title,
          .dxt-benefit-title {
            font-size: 22px;
          }

          .dxt-pricing-title {
            font-size: 28px;
          }

          .dxt-pricing-subtitle {
            font-size: 22px;
          }

          .dxt-pricing-price-main {
            font-size: 52px;
          }

          .dxt-pricing-price-suffix {
            font-size: 24px;
          }

          .dxt-pricing-btn {
            min-width: 260px;
            font-size: 20px;
          }

          .dxt-pricing-total-line {
            font-size: 22px;
          }

          .dxt-hero-cta-group {
            padding-left: 0;
          }

          .dxt-circle-badges-wrap {
            justify-content: flex-start;
            padding-left: 0;
          }

          .dxt-circle-badges-row {
            justify-content: flex-start;
          }

          .dxt-works-image-wrap {
            padding: 0;
          }

          .dxt-works-image {
            max-width: 560px;
          }

          .dxt-ad-sidebar-wrap {
            margin-top: 18px;
          }
        }

        @media (max-width: 767px) {
          .dxt-hero-grid,
          .dxt-two-col,
          .dxt-three-grid,
          .dxt-works-grid,
          .dxt-pricing-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .dxt-hero-title {
            font-size: 17px;
            line-height: 1.5;
            margin-bottom: 12px;
            letter-spacing: 0;
          }

          .dxt-hero-description {
            font-size: 14px;
            line-height: 1.7;
          }

          .dxt-hero-description p {
            margin: 0 0 14px;
          }

          .dxt-works-paragraph,
          .dxt-ingredients-intro,
          .dxt-ingredient-text,
          .dxt-ingredient-closing,
          .dxt-benefits-intro,
          .dxt-benefit-text,
          .dxt-benefit-closing {
            font-size: 15px;
            line-height: 1.7;
          }

          .dxt-ingredient-title,
          .dxt-benefit-title {
            font-size: 18px;
          }

          .dxt-pricing-title {
            font-size: 22px;
          }

          .dxt-pricing-subtitle {
            font-size: 18px;
          }

          .dxt-pricing-image-wrap {
            min-height: 220px;
          }

          .dxt-pricing-price-main {
            font-size: 38px;
          }

          .dxt-pricing-price-suffix {
            font-size: 20px;
            padding-bottom: 4px;
          }

          .dxt-pricing-btn {
            min-width: 100%;
            width: 100%;
            font-size: 17px;
            padding: 0 18px;
          }

          .dxt-pricing-total-line {
            font-size: 18px;
          }

          .dxt-pricing-badge {
            width: 82px;
            height: 82px;
            font-size: 13px;
            top: 6px;
            right: 6px;
          }

          .dxt-payment-strip-image {
            max-width: 100%;
          }

          .dxt-hero-cta-buttons,
          .dxt-hero-trust-line,
          .dxt-feature-bullets {
            gap: 10px;
          }

          .dxt-hero-cta-group {
            padding-left: 0;
          }

          .dxt-hero-cta-line {
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 14px;
          }

          .dxt-circle-badges-wrap {
            justify-content: flex-start;
            padding-left: 0;
          }

          .dxt-circle-badges-row {
            justify-content: flex-start;
            gap: 12px;
          }

          .dxt-circle-badge {
            width: 78px;
            height: 78px;
            min-width: 78px;
            border-width: 3px;
          }

          .dxt-works-image-wrap {
            padding: 0;
          }

          .dxt-works-image {
            max-width: 100%;
          }

          .dxt-review-row {
            justify-content: flex-start !important;
            gap: 6px !important;
            margin-top: 10px !important;
            margin-bottom: 14px !important;
            flex-wrap: nowrap !important;
            overflow: hidden;
            min-width: 0;
            max-width: 100%;
          }

          .dxt-review-text {
            font-size: 12px !important;
            line-height: 1.2 !important;
            min-width: 0;
            flex: 1 1 auto;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .dxt-feature-bullet,
          .dxt-hero-trust-item {
            font-size: 14px;
          }

          .dxt-pricing-card {
            padding: 14px 12px 18px;
          }

          .dxt-faq-item h3 {
            font-size: 20px;
          }

          .dxt-faq-item p {
            font-size: 15px;
            line-height: 1.7;
          }

          .dxt-ad-top-wrap {
            margin-bottom: 16px;
          }

          .dxt-ad-sidebar-wrap {
            margin-top: 16px;
          }

          .dxt-ad-bottom-wrap {
            margin-top: 22px;
            margin-bottom: 12px;
          }

          .dxt-sponsored-related-wrap {
            margin-top: 22px;
            margin-bottom: 18px;
          }

          section,
          div,
          p,
          h1,
          h2,
          h3,
          a,
          span {
            max-width: 100%;
          }
        }
      `}),e.jsx(Te,{url:t.bloggad_video_url}),e.jsx(ze,{style:{background:"#0b7f4b",marginBottom:30},children:e.jsx(B,{children:e.jsx("h1",{style:{margin:0,padding:"18px 0",textAlign:"center",color:"#ffffff",fontWeight:700,fontSize:36,lineHeight:1.25},children:t.top_bar_title||(i==null?void 0:i.title)||"-"})})}),e.jsx(B,{children:e.jsx("div",{className:"dxt-ad-top-wrap",children:e.jsx(ye,{slotKey:"storefront_top",monetizationSettings:s,websiteId:S,affiliateUserId:k})})}),e.jsx(B,{style:{marginBottom:34},children:e.jsx("div",{style:Ui(),children:e.jsxs("div",{className:"dxt-hero-grid",children:[e.jsxs("div",{children:[e.jsx("a",{href:b.url||"#",target:b.openInNewTab?"_blank":"_self",rel:b.openInNewTab?"noreferrer":void 0,style:{display:"block",textDecoration:"none",minWidth:0},children:e.jsx(ae,{src:t.hero_product_image||(i==null?void 0:i.featured_image),alt:(i==null?void 0:i.title)||"Product",maxWidth:"100%"})}),e.jsx(Xi,{text:t.hero_review_text})]}),e.jsxs("div",{children:[e.jsx("h2",{className:"dxt-hero-title",children:t.hero_title||(i==null?void 0:i.title)||"-"}),e.jsxs("div",{className:"dxt-hero-description",children:[e.jsx("p",{children:t.hero_intro_paragraph_1||"-"}),e.jsx("p",{children:t.hero_intro_paragraph_2||"-"})]}),e.jsxs("div",{className:"dxt-hero-cta-group",children:[e.jsx("div",{className:"dxt-hero-cta-line",children:t.hero_small_cta_line||"-"}),e.jsxs("div",{className:"dxt-hero-cta-buttons",children:[e.jsx(D,{button:b}),e.jsx(D,{button:N})]}),e.jsx(Vi,{items:g}),e.jsx(Gi,{images:V}),e.jsx("div",{className:"dxt-ad-sidebar-wrap",children:e.jsx(ye,{slotKey:"storefront_sidebar",monetizationSettings:s,websiteId:S,affiliateUserId:k})})]})]})]})})}),e.jsx(L,{children:t.how_this_product_works_title||"How This Product Works"}),e.jsx(B,{style:{marginTop:26,marginBottom:30},children:e.jsxs("div",{className:"dxt-works-grid",children:[e.jsxs("div",{className:"dxt-works-text",children:[e.jsx("p",{className:"dxt-works-paragraph",children:t.how_this_product_works_paragraph_1||"-"}),e.jsx("p",{className:"dxt-works-paragraph",children:t.how_this_product_works_paragraph_2||"-"}),e.jsx("p",{className:"dxt-works-paragraph",children:t.how_this_product_works_paragraph_3||"-"}),e.jsx(D,{button:m})]}),e.jsx("div",{className:"dxt-works-image-wrap",children:t.how_this_product_works_image?e.jsx("img",{src:t.how_this_product_works_image,alt:"How it works",className:"dxt-works-image"}):e.jsx(ae,{src:"",alt:"How it works",maxWidth:"100%",imgStyle:{objectFit:"contain"}})})]})}),e.jsx(L,{children:t.ingredients_section_title||"A Thoughtfully Selected Blend"}),e.jsx(B,{style:{marginTop:26,marginBottom:30},children:e.jsxs("div",{className:"dxt-two-col",children:[e.jsxs("div",{children:[e.jsx("p",{className:"dxt-ingredients-intro",children:t.ingredients_intro||"-"}),re.map((w,y)=>e.jsxs("div",{className:"dxt-ingredient-item",children:[e.jsx("div",{className:"dxt-ingredient-title",children:w.title||"-"}),e.jsx("div",{className:"dxt-ingredient-text",children:w.text||"-"})]},y)),e.jsx("div",{className:"dxt-ingredient-closing",children:t.ingredients_closing_line||"-"}),e.jsx(D,{button:l})]}),e.jsx("div",{children:e.jsx(ae,{src:t.ingredients_image,alt:"Ingredients",maxWidth:"100%"})})]})}),e.jsx(L,{children:t.benefits_title||"Benefits Of This Product"}),e.jsx(B,{style:{marginTop:26,marginBottom:30},children:e.jsxs("div",{style:{background:"#f3f3f3"},children:[e.jsx("p",{className:"dxt-benefits-intro",children:t.benefits_intro||"-"}),ne.map((w,y)=>e.jsxs("div",{className:"dxt-benefit-item",children:[e.jsx("div",{className:"dxt-benefit-title",children:w.title||"-"}),e.jsx("div",{className:"dxt-benefit-text",children:w.text||"-"})]},y)),e.jsx("div",{className:"dxt-benefit-closing",children:t.benefits_closing_line||"-"})]})}),e.jsx(L,{children:t.feature_row_title||"See What Users Are Saying"}),e.jsx(B,{style:{marginTop:26,marginBottom:30},children:e.jsxs("div",{children:[e.jsx("div",{className:"dxt-hero-cta-line",style:{marginBottom:18},children:t.hero_small_cta_line||t.feature_row_cta_line||"-"}),e.jsxs("div",{className:"dxt-hero-cta-buttons",style:{marginBottom:16},children:[e.jsx(D,{button:b}),e.jsx(D,{button:N})]}),e.jsx(Ki,{items:q})]})}),e.jsx(L,{children:t.testimonials_title||"What Users Are Saying"}),e.jsx(B,{style:{marginTop:26,marginBottom:30},children:e.jsx("div",{className:"dxt-three-grid",children:Y.map((w,y)=>e.jsx(Qi,{item:w},y))})}),e.jsx(L,{children:t.pricing_title||"How Much Does It Cost?"}),e.jsx(B,{style:{marginTop:26,marginBottom:30},children:e.jsxs("div",{className:"dxt-pricing-grid",children:[e.jsx(_e,{item:R[0]}),e.jsx(_e,{item:R[1],featured:!0}),e.jsx(_e,{item:R[2]})]})}),e.jsx(ze,{style:{background:"#8db08e",marginTop:22,marginBottom:26},children:e.jsxs(B,{style:{paddingTop:30,paddingBottom:30},children:[e.jsx("div",{style:{color:"#ffffff",textAlign:"center",fontSize:28,lineHeight:1.25,fontWeight:700,marginBottom:16},children:t.guarantee_title||"Guarantee"}),e.jsxs("div",{style:{maxWidth:980,margin:"0 auto",color:"#ffffff",textAlign:"center"},children:[e.jsx(oe,{center:!0,style:{color:"#ffffff"},children:t.guarantee_paragraph_1}),e.jsx(oe,{center:!0,style:{color:"#ffffff"},children:t.guarantee_paragraph_2}),e.jsx(oe,{center:!0,style:{color:"#ffffff",fontWeight:700},children:t.guarantee_paragraph_3})]})]})}),e.jsx(B,{style:{marginBottom:34},children:e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx(ae,{src:t.special_offer_image,alt:"Special offer",maxWidth:280}),e.jsx("div",{style:{fontSize:42,lineHeight:1.05,fontWeight:800,color:"#111827",margin:"12px 0 16px"},children:t.special_offer_price_text||"-"}),e.jsx(D,{button:H})]})}),e.jsx(L,{children:t.learn_more_title||"Learn More About This Product"}),e.jsx(B,{style:{marginTop:26,marginBottom:30},children:c.length?c.map((w,y)=>e.jsx(oe,{children:w},y)):e.jsx(oe,{children:"-"})}),e.jsx(L,{children:t.faq_section_title||"ProDentim FAQ"}),e.jsx(B,{style:{marginTop:26,marginBottom:30},children:d.map((w,y)=>e.jsxs("div",{className:"dxt-faq-item",children:[e.jsx("h3",{children:w.question||"-"}),e.jsx("p",{children:w.answer||"-"})]},y))}),x?e.jsx(B,{style:{marginBottom:30},children:x}):null,e.jsx(B,{children:e.jsx("div",{className:"dxt-ad-bottom-wrap",children:e.jsx(ye,{slotKey:"storefront_bottom",monetizationSettings:s,websiteId:S,affiliateUserId:k})})}),h?e.jsx(B,{children:e.jsx("div",{className:"dxt-sponsored-related-wrap",children:h})}):null,e.jsx(L,{children:"Related Posts"}),e.jsx(B,{style:{marginTop:26,paddingBottom:40},children:e.jsx("div",{className:"dxt-three-grid",children:a.length?a.map(w=>e.jsx(Ji,{item:w,websiteSlug:o},w.id)):e.jsx("div",{style:{background:"#ffffff",border:"1px solid #d9e3dc",padding:20,color:"#64748b"},children:"No related posts found."})})})]})}function Ne(i){return Array.isArray(i)?i:[]}function Zi(i,n=""){return i==null?n:typeof i=="string"||typeof i=="number"?String(i):(i==null?void 0:i.value)||(i==null?void 0:i.field_value)||(i==null?void 0:i.content)||(i==null?void 0:i.text)||n}function K(i,n,r=""){var a,o;return i&&((i==null?void 0:i[n])||((a=i==null?void 0:i.button)==null?void 0:a[n])||((o=i==null?void 0:i.settings)==null?void 0:o[n]))||r}function et(i,n){return j.useMemo(()=>{const r={},a={};return Ne(i).forEach(o=>{const x=(o==null?void 0:o.key)||(o==null?void 0:o.field_key)||(o==null?void 0:o.name);x&&(r[x]=Zi(o))}),Ne(n).forEach(o=>{const x=(o==null?void 0:o.key)||(o==null?void 0:o.button_key)||(o==null?void 0:o.name);x&&(a[x]=o)}),{fieldMap:r,buttonMap:a}},[i,n])}function it(i,n){return{label:K(i,"label")||K(i,"button_label")||n,url:K(i,"url")||K(i,"button_url")||K(i,"destination_url")||"#",target:K(i,"open_in_new_tab")===!0||K(i,"target")==="_blank"?"_blank":"_self"}}function Ve(i){if(!i)return null;const n=(i==null?void 0:i.image)||(i==null?void 0:i.image_url)||(i==null?void 0:i.banner_image)||(i==null?void 0:i.banner_image_url)||(i==null?void 0:i.creative_url)||(i==null?void 0:i.media_url),r=(i==null?void 0:i.html)||(i==null?void 0:i.ad_html)||(i==null?void 0:i.code),a=(i==null?void 0:i.title)||(i==null?void 0:i.name)||(i==null?void 0:i.headline),o=(i==null?void 0:i.url)||(i==null?void 0:i.link)||(i==null?void 0:i.destination_url)||(i==null?void 0:i.target_url);return!n&&!r&&!a?null:{image:n,html:r,title:a,url:o}}function tt(i,n=[]){var r,a;if(!i||typeof i!="object")return null;for(const o of n){const x=i[o],f=((r=i==null?void 0:i[o])==null?void 0:r.ad)||((a=i==null?void 0:i[o])==null?void 0:a.campaign),p=Ve(x);if(p)return p;const h=Ve(f);if(h)return h}return null}function we({placements:i,keys:n,className:r="",label:a=""}){const o=tt(i,n);if(!o)return null;const x=o.image?e.jsx("img",{src:o.image,alt:o.title||a||"Advertisement"}):o.html?e.jsx("div",{dangerouslySetInnerHTML:{__html:o.html}}):e.jsx("span",{children:o.title});return o.url&&o.url!=="#"?e.jsx("a",{className:`sp-ad-slot ${r}`,href:o.url,target:"_blank",rel:"noreferrer",children:x}):e.jsx("div",{className:`sp-ad-slot ${r}`,children:x})}function Xe({button:i,fallbackLabel:n,className:r=""}){const a=it(i,n);return e.jsxs("a",{className:`sp-cta-btn ${r}`,href:a.url,target:a.target,rel:"noreferrer",children:[a.label,e.jsx("span",{children:"→"})]})}function Be({src:i,icon:n=ve,alt:r=""}){return i?e.jsx("div",{className:"sp-image-box has-image",children:e.jsx("img",{src:i,alt:r||"Blog visual"})}):e.jsx("div",{className:"sp-image-box",children:e.jsx(n,{size:54,strokeWidth:1.8})})}function pe({icon:i,title:n,text:r}){return!n&&!r?null:e.jsxs("div",{className:"sp-feature-item",children:[e.jsx("div",{className:"sp-feature-icon",children:e.jsx(i,{size:21})}),e.jsxs("div",{children:[e.jsx("h4",{children:n}),e.jsx("p",{children:r})]})]})}function Ge({title:i,items:n,type:r}){const a=n.filter(Boolean);return!i&&a.length===0?null:e.jsxs("div",{className:`sp-pros-cons-box ${r}`,children:[e.jsxs("h4",{children:[e.jsx("span",{children:i}),r==="pros"?e.jsx(ni,{size:16}):e.jsx(ki,{size:16})]}),e.jsx("ul",{children:a.map(o=>e.jsx("li",{children:o},o))})]})}function rt({question:i,answer:n}){const[r,a]=j.useState(!1);return!i&&!n?null:e.jsxs("div",{className:"sp-faq-item",children:[e.jsxs("button",{type:"button",onClick:()=>a(o=>!o),children:[e.jsx("span",{children:i}),e.jsx(wi,{size:16,className:r?"is-open":""})]}),r?e.jsx("p",{children:n}):null]})}function xe({title:i,image:n,meta:r,url:a}){if(!i&&!n)return null;const o=e.jsxs("article",{className:"sp-related-card",children:[e.jsx(Be,{src:n,alt:i}),e.jsxs("div",{className:"sp-related-content",children:[e.jsx("h4",{children:i}),e.jsx("p",{children:r})]})]});return a?e.jsx("a",{href:a,className:"sp-related-link",children:o}):o}function nt({fieldMap:i}){const n=i.email_capture_title||"Stay Updated",r=i.email_capture_text||"Get the latest reviews, guides, and deals straight to your inbox.",a=i.email_capture_placeholder||"Enter your email",o=i.email_capture_button_label||"Subscribe",x=i.email_capture_privacy_text||"We respect your privacy.";return e.jsxs("div",{className:"sp-email-box",children:[e.jsx("div",{className:"sp-email-icon",children:e.jsx(Je,{size:28})}),e.jsx("h3",{children:n}),e.jsx("p",{children:r}),e.jsxs("form",{onSubmit:f=>f.preventDefault(),children:[e.jsx("input",{type:"email",placeholder:a}),e.jsx("button",{type:"submit",children:o})]}),e.jsx("small",{children:x})]})}function We({post:i,templateFields:n,ctaButtons:r,relatedPosts:a,website:o,websiteSlug:x,adPlacements:f,placements:p,platformPlacements:h,directPlacements:t,sponsoredRelatedPostsSlot:u}){const{fieldMap:s,buttonMap:S}=et(n,r),k={...p||{},...f||{},...h||{},...t||{}},b=(o==null?void 0:o.store_name)||(o==null?void 0:o.website_name)||(o==null?void 0:o.name)||(i==null?void 0:i.website_name)||(i==null?void 0:i.store_name)||x||"DemoBlog",N=s.hero_title||(i==null?void 0:i.title)||"ProductX Review: The All-in-One Tool for Modern Teams",m=s.hero_subtitle||(i==null?void 0:i.excerpt)||"Deep dive into features, pricing, pros and cons, and who it’s best for.",l=s.hero_image||(i==null?void 0:i.featured_image)||(i==null?void 0:i.image_url)||(i==null?void 0:i.cover_image),H=S.summary_cta,T=S.final_verdict_cta,$=[[s.faq_1_question,s.faq_1_answer],[s.faq_2_question,s.faq_2_answer],[s.faq_3_question,s.faq_3_answer],[s.faq_4_question,s.faq_4_answer]],E=Ne(a);return e.jsxs("div",{className:"simple-posts-template",children:[e.jsx("style",{children:`
        .simple-posts-template {
          --sp-blue: #1f73ea;
          --sp-blue-dark: #155bd6;
          --sp-blue-soft: #eaf3ff;
          --sp-border: #d8e2f1;
          --sp-border-soft: #eef3fa;
          --sp-text: #0f172a;
          --sp-muted: #607089;
          --sp-soft: #f8fbff;
          width: 100%;
          min-height: 100vh;
          background: #ffffff;
          color: var(--sp-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .simple-posts-template * {
          box-sizing: border-box;
        }

        .sp-shell {
          width: min(1500px, calc(100% - 32px));
          margin: 0 auto;
          border: 1px solid var(--sp-border);
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }

        .sp-top-notice {
          min-height: 54px;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          border-bottom: 1px solid var(--sp-border);
          background: #fbfdff;
          color: #1f2937;
          font-size: 16px;
          font-weight: 800;
          text-align: center;
        }

        .sp-top-notice a {
          color: var(--sp-blue);
          text-decoration: none;
          font-weight: 900;
        }

        .sp-nav {
          min-height: 68px;
          padding: 0 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--sp-border);
          background: #fff;
          gap: 22px;
        }

        .sp-logo {
          min-width: 210px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 20px;
          font-weight: 950;
          color: #111827;
          white-space: nowrap;
        }

        .sp-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--sp-blue-soft);
          color: var(--sp-blue);
          display: grid;
          place-items: center;
          font-weight: 950;
        }

        .sp-nav-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 44px;
          font-size: 15px;
          font-weight: 900;
          color: #111827;
          flex: 1;
        }

        .sp-nav-actions {
          min-width: 210px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 22px;
        }

        .sp-subscribe-btn {
          border: 0;
          border-radius: 7px;
          background: var(--sp-blue);
          color: #fff;
          padding: 13px 24px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
        }

        .sp-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 400px;
          gap: 34px;
          padding: 36px 42px 30px;
        }

        .sp-main {
          min-width: 0;
          width: 100%;
          max-width: none;
        }

        .sp-sidebar {
          border-left: 1px solid var(--sp-border-soft);
          padding-left: 34px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
        }

        .sp-category {
          display: inline-flex;
          align-items: center;
          background: var(--sp-blue-soft);
          color: var(--sp-blue);
          font-size: 14px;
          font-weight: 950;
          padding: 7px 15px;
          border-radius: 999px;
          margin-bottom: 18px;
        }

        .sp-title {
          font-size: clamp(44px, 4.2vw, 62px);
          line-height: .98;
          letter-spacing: -0.065em;
          margin: 0 0 14px;
          max-width: 980px;
          color: #0b1220;
        }

        .sp-subtitle {
          color: #596985;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.55;
          margin: 0 0 28px;
          max-width: 940px;
        }

        .sp-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          color: #475467;
          font-size: 15px;
          font-weight: 900;
          margin-bottom: 30px;
        }

        .sp-author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: #e7edf7;
          overflow: hidden;
          display: grid;
          place-items: center;
          color: #5d6c82;
        }

        .sp-author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sp-author-name {
          color: var(--sp-blue);
        }

        .sp-hero-image {
          width: 100%;
          height: clamp(260px, 27vw, 390px);
          border: 1px solid #9fc1f4;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
          margin-bottom: 18px;
          display: grid;
          place-items: center;
        }

        .sp-hero-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          display: block;
          background: #ffffff;
        }

        .sp-placeholder-mountain {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #98b6e5;
          background: linear-gradient(180deg, #eaf3ff 0%, #e6f0ff 100%);
        }

        .sp-summary-card {
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          border: 1px solid #b9cff0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 22px;
          background: #fff;
        }

        .sp-summary-left {
          border-right: 1px solid #b9cff0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 24px 16px;
          text-align: center;
          color: var(--sp-blue);
          font-size: 14px;
          font-weight: 950;
          background: #fbfdff;
        }

        .sp-star-circle {
          width: 70px;
          height: 70px;
          border-radius: 999px;
          border: 2px solid var(--sp-blue);
          background: var(--sp-blue-soft);
          display: grid;
          place-items: center;
        }

        .sp-summary-body {
          padding: 24px 26px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
        }

        .sp-summary-body p {
          margin: 0 0 12px;
          color: #111827;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 700;
        }

        .sp-summary-body strong {
          color: #0f172a;
          margin-right: 10px;
          font-weight: 950;
        }

        .sp-check-list {
          display: grid;
          gap: 9px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .sp-check-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 750;
          color: #344054;
        }

        .sp-check-list svg {
          color: var(--sp-blue);
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .sp-cta-btn {
          height: 50px;
          min-width: 210px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--sp-blue);
          color: #fff;
          border-radius: 7px;
          padding: 0 24px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 950;
          white-space: nowrap;
          box-shadow: 0 12px 22px rgba(31, 115, 234, .18);
        }

        .sp-cta-btn:hover {
          background: var(--sp-blue-dark);
        }

        .sp-section {
          margin-top: 22px;
        }

        .sp-section h2 {
          margin: 0 0 8px;
          font-size: 24px;
          letter-spacing: -0.035em;
          line-height: 1.1;
          color: #0f172a;
        }

        .sp-section p {
          margin: 0 0 11px;
          color: #1f2937;
          font-size: 15.5px;
          line-height: 1.58;
          font-weight: 650;
        }

        .sp-sponsored-slot-wrap {
          margin: 28px 0 24px;
        }

        .sp-content-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 28px;
          align-items: center;
          border-top: 1px solid var(--sp-border-soft);
          padding-top: 20px;
          margin-top: 18px;
        }

        .sp-image-box {
          min-height: 130px;
          border: 1px solid #a9c5ef;
          background: var(--sp-blue-soft);
          color: #8daee1;
          border-radius: 7px;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .sp-image-box.has-image img,
        .sp-related-card .sp-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sp-ad-slot {
          width: 100%;
          border: 1px dashed #9fb4d4;
          background: #f5f9ff;
          color: #111827;
          display: grid;
          place-items: center;
          text-decoration: none;
          overflow: hidden;
          font-size: 18px;
          font-weight: 800;
          text-align: center;
        }

        .sp-ad-slot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sp-inline-ad {
          height: 90px;
          margin: 24px 0 20px;
          border-radius: 7px;
        }

        .sp-sidebar-ad {
          height: 250px;
          border-style: solid;
          border-color: #9fc1f4;
          border-radius: 8px;
        }

        .sp-sticky-ad {
          min-height: 600px;
          border-style: solid;
          border-color: #9fc1f4;
          border-radius: 8px;
          position: sticky;
          top: 18px;
        }

        .sp-features-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px 42px;
          margin-top: 22px;
        }

        .sp-feature-item {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
          max-width: 100%;
        }

        .sp-feature-icon {
          width: 58px;
          height: 58px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--sp-blue-soft);
          color: var(--sp-blue);
          flex: 0 0 auto;
        }

        .sp-feature-item h4 {
          margin: 3px 0 7px;
          font-size: 16px;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: #111827;
        }

        .sp-feature-item p {
          margin: 0;
          font-size: 14.5px;
          line-height: 1.55;
          color: #475467;
          font-weight: 650;
        }

        .sp-pros-cons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 28px;
        }

        .sp-pros-cons-box {
          border-radius: 7px;
          padding: 18px 22px;
          min-height: 140px;
        }

        .sp-pros-cons-box.pros {
          background: #f3fff3;
          border: 1px solid #bfe7c1;
        }

        .sp-pros-cons-box.cons {
          background: #fff6f6;
          border: 1px solid #ffc5c5;
        }

        .sp-pros-cons-box h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 10px;
          font-size: 15px;
        }

        .sp-pros-cons-box.pros h4 svg {
          color: #35b653;
        }

        .sp-pros-cons-box.cons h4 svg {
          color: #ff5964;
        }

        .sp-pros-cons-box ul {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
        }

        .sp-pros-cons-box li {
          font-size: 13.5px;
          line-height: 1.4;
          color: #1f2937;
          font-weight: 700;
        }

        .sp-faq-list {
          border: 1px solid var(--sp-border);
          border-radius: 7px;
          overflow: hidden;
          background: #fff;
        }

        .sp-faq-item + .sp-faq-item {
          border-top: 1px solid var(--sp-border);
        }

        .sp-faq-item button {
          width: 100%;
          border: 0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 42px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 950;
          color: #111827;
          cursor: pointer;
          text-align: left;
        }

        .sp-faq-item svg {
          transition: transform .2s ease;
        }

        .sp-faq-item svg.is-open {
          transform: rotate(180deg);
        }

        .sp-faq-item p {
          padding: 0 18px 14px;
          margin: 0;
          color: #475467;
          font-size: 14px;
          line-height: 1.55;
        }

        .sp-final-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
          margin-top: 26px;
        }

        .sp-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 12px;
        }

        .sp-related-link {
          color: inherit;
          text-decoration: none;
        }

        .sp-related-card {
          border: 1px solid #c8d6eb;
          border-radius: 7px;
          overflow: hidden;
          background: #fff;
          height: 100%;
        }

        .sp-related-card .sp-image-box {
          border: 0;
          border-radius: 0;
          min-height: 110px;
        }

        .sp-related-content {
          padding: 13px 14px 15px;
        }

        .sp-related-card h4 {
          margin: 0 0 8px;
          font-size: 15px;
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: #111827;
        }

        .sp-related-card p {
          margin: 0;
          color: #667085;
          font-size: 12.5px;
          font-weight: 800;
        }

        .sp-email-box {
          border: 1px solid var(--sp-border);
          border-radius: 10px;
          padding: 34px 26px;
          text-align: center;
          background: #fff;
        }

        .sp-email-icon {
          width: 72px;
          height: 72px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--sp-blue-soft);
          color: var(--sp-blue);
          margin: 0 auto 18px;
        }

        .sp-email-box h3 {
          margin: 0 0 10px;
          font-size: 24px;
          line-height: 1.15;
          letter-spacing: -0.035em;
        }

        .sp-email-box p {
          margin: 0 auto 22px;
          color: #475467;
          font-size: 14.5px;
          line-height: 1.48;
          font-weight: 700;
          max-width: 280px;
        }

        .sp-email-box form {
          display: grid;
          gap: 11px;
        }

        .sp-email-box input {
          width: 100%;
          height: 48px;
          border: 1px solid var(--sp-border);
          border-radius: 6px;
          padding: 0 15px;
          font-size: 14px;
          outline: none;
        }

        .sp-email-box button {
          height: 48px;
          border: 0;
          border-radius: 6px;
          background: var(--sp-blue);
          color: #fff;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
        }

        .sp-email-box small {
          display: block;
          margin-top: 14px;
          color: #667085;
          font-size: 12px;
          font-weight: 750;
        }

        @media (max-width: 1180px) {
          .sp-shell {
            width: calc(100% - 20px);
          }

          .sp-layout {
            grid-template-columns: minmax(0, 1fr) 340px;
            gap: 26px;
            padding: 30px 28px 26px;
          }

          .sp-sidebar {
            padding-left: 24px;
          }

          .sp-title {
            font-size: clamp(38px, 4.4vw, 54px);
          }

          .sp-features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px 30px;
          }
        }

        @media (max-width: 980px) {
          .sp-layout {
            grid-template-columns: 1fr;
          }

          .sp-main {
            max-width: none;
          }

          .sp-sidebar {
            border-left: 0;
            padding-left: 0;
          }

          .sp-sticky-ad {
            position: static;
            min-height: 260px;
          }

          .sp-nav-links {
            display: none;
          }

          .sp-nav {
            padding: 0 22px;
          }

          .sp-logo,
          .sp-nav-actions {
            min-width: auto;
          }

          .sp-summary-body,
          .sp-final-row,
          .sp-content-row {
            grid-template-columns: 1fr;
          }

          .sp-summary-card {
            grid-template-columns: 1fr;
          }

          .sp-summary-left {
            border-right: 0;
            border-bottom: 1px solid #b9cff0;
          }

          .sp-summary-body {
            align-items: start;
          }

          .sp-cta-btn {
            width: fit-content;
          }
        }

        @media (max-width: 720px) {
          .sp-shell {
            width: calc(100% - 12px);
            border-radius: 8px;
          }

          .sp-layout {
            padding: 22px 16px;
          }

          .sp-top-notice {
            min-height: 42px;
            font-size: 11.5px;
            line-height: 1.25;
            padding: 8px 10px;
            flex-wrap: nowrap;
            gap: 8px;
            white-space: nowrap;
            overflow: hidden;
          }

          .sp-top-notice span {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .sp-top-notice a {
            flex: 0 0 auto;
            font-size: 11.5px;
          }

          .sp-nav {
            min-height: 66px;
            padding: 12px 14px;
            flex-wrap: nowrap;
            gap: 10px;
          }

          .sp-logo {
            min-width: 0;
            width: auto;
            flex: 1;
            justify-content: flex-start;
            gap: 8px;
            font-size: 16px;
            overflow: hidden;
          }

          .sp-logo-mark {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            flex: 0 0 auto;
          }

          .sp-logo span:last-child {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .sp-nav-actions {
            min-width: 0;
            width: auto;
            flex: 0 0 auto;
            justify-content: flex-end;
            gap: 10px;
          }

          .sp-nav-actions svg {
            width: 22px;
            height: 22px;
            flex: 0 0 auto;
          }

          .sp-subscribe-btn {
            padding: 10px 14px;
            font-size: 12px;
            border-radius: 8px;
            white-space: nowrap;
          }

          .sp-title {
            font-size: 34px;
            letter-spacing: -0.05em;
          }

          .sp-subtitle {
            font-size: 15px;
          }

          .sp-hero-image {
            height: 220px;
          }

          .sp-summary-body {
            padding: 20px;
          }

          .sp-cta-btn {
            width: 100%;
          }

          .sp-features-grid,
          .sp-pros-cons,
          .sp-related-grid {
            grid-template-columns: 1fr;
          }

          .sp-feature-item {
            grid-template-columns: 58px minmax(0, 1fr);
          }

          .sp-content-row {
            gap: 16px;
          }

          .sp-sidebar-ad {
            height: 220px;
          }
        }
      `}),e.jsx(Te,{url:s.bloggad_video_url}),e.jsxs("div",{className:"sp-shell",children:[(s.top_notice_text||s.top_notice_link_label)&&e.jsxs("div",{className:"sp-top-notice",children:[e.jsx(gi,{size:17}),e.jsx("span",{children:s.top_notice_text||"Limited time: Get 20% off all tools this week!"}),s.top_notice_link_label?e.jsxs("a",{href:s.top_notice_link_url||"#",children:[s.top_notice_link_label," →"]}):null]}),e.jsxs("header",{className:"sp-nav",children:[e.jsxs("div",{className:"sp-logo",children:[e.jsx("span",{className:"sp-logo-mark",children:String(b).charAt(0).toUpperCase()}),e.jsx("span",{children:b})]}),e.jsxs("nav",{className:"sp-nav-links",children:[e.jsx("span",{children:"Home"}),e.jsx("span",{children:"Categories⌄"}),e.jsx("span",{children:"Reviews"}),e.jsx("span",{children:"Guides"}),e.jsx("span",{children:"About"})]}),e.jsxs("div",{className:"sp-nav-actions",children:[e.jsx(Ye,{size:24}),e.jsx("button",{type:"button",className:"sp-subscribe-btn",children:"Subscribe"})]})]}),e.jsxs("div",{className:"sp-layout",children:[e.jsxs("main",{className:"sp-main",children:[e.jsxs("section",{children:[e.jsx("span",{className:"sp-category",children:s.hero_category_label||(i==null?void 0:i.category_name)||"Productivity"}),e.jsx("h1",{className:"sp-title",children:N}),e.jsx("p",{className:"sp-subtitle",children:m}),e.jsxs("div",{className:"sp-meta",children:[e.jsx("span",{className:"sp-author-avatar",children:s.hero_author_image?e.jsx("img",{src:s.hero_author_image,alt:s.hero_author_name||"Author"}):e.jsx(Ue,{size:22})}),e.jsxs("span",{children:["By ",e.jsx("span",{className:"sp-author-name",children:s.hero_author_name||(i==null?void 0:i.author_name)||"Jane Doe"})]}),e.jsx("span",{children:"·"}),e.jsx("span",{children:s.hero_date_text||(i==null?void 0:i.published_at_text)||(i==null?void 0:i.created_at)||"May 15, 2024"}),e.jsx("span",{children:"·"}),e.jsx("span",{children:s.hero_read_time||(i==null?void 0:i.read_time)||"8 min read"})]}),e.jsx("div",{className:"sp-hero-image",children:l?e.jsx("img",{src:l,alt:N}):e.jsx("div",{className:"sp-placeholder-mountain",children:e.jsx(ve,{size:72,strokeWidth:1.5})})})]}),e.jsxs("section",{className:"sp-summary-card",children:[e.jsxs("div",{className:"sp-summary-left",children:[e.jsx("span",{className:"sp-star-circle",children:e.jsx(le,{size:30,fill:"currentColor"})}),e.jsx("span",{children:s.summary_label||"Quick Summary"})]}),e.jsxs("div",{className:"sp-summary-body",children:[e.jsxs("div",{children:[e.jsxs("p",{children:[e.jsx("strong",{children:s.summary_verdict_label||"Short Verdict:"}),s.summary_verdict_text||"ProductX is a powerful all-in-one platform that simplifies workflows and boosts team productivity."]}),e.jsx("ul",{className:"sp-check-list",children:[s.summary_point_1,s.summary_point_2,s.summary_point_3].filter(Boolean).map(g=>e.jsxs("li",{children:[e.jsx(ni,{size:18}),g]},g))})]}),e.jsx(Xe,{button:H,fallbackLabel:"Visit Official Site"})]})]}),e.jsxs("section",{className:"sp-section",children:[e.jsx("h2",{children:s.intro_title||"Introduction"}),e.jsx("p",{children:s.intro_paragraph_1||(i==null?void 0:i.content_intro)||"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec convallis, enim at facilisis mollis, velit justo cursus nibh, ut hendrerit leo justo sed libero."}),e.jsx("p",{children:s.intro_paragraph_2||"In this review, we will explore what it is, how it works, key features, pricing, benefits, drawbacks, and who it is best for."})]}),e.jsxs("section",{className:"sp-section sp-content-row",children:[e.jsxs("div",{children:[e.jsx("h2",{children:s.content_block_1_title||"What It Is"}),e.jsx("p",{children:s.content_block_1_text||"ProductX is an all-in-one platform designed to help teams manage projects, collaborate in real-time, and automate repetitive tasks."})]}),e.jsx(Be,{src:s.content_block_1_image,icon:ve})]}),e.jsxs("section",{className:"sp-section sp-content-row",children:[e.jsxs("div",{children:[e.jsx("h2",{children:s.content_block_2_title||"How It Works"}),e.jsx("p",{children:s.content_block_2_text||"ProductX connects your tools and centralizes your data so your team can stay aligned and move faster."})]}),e.jsx(Be,{src:s.content_block_2_image,icon:Hi})]}),e.jsx(we,{placements:k,keys:["post_inline_728x90","inline_728x90","content_728x90","blog_post_inline"],className:"sp-inline-ad",label:"Ad Slot 728x90"}),e.jsxs("section",{className:"sp-section",children:[e.jsx("h2",{children:s.features_title||"Benefits / Key Features"}),e.jsx("p",{children:s.features_intro||"ProductX comes with a wide range of features that help teams save time and get more done."}),e.jsxs("div",{className:"sp-features-grid",children:[e.jsx(pe,{icon:$i,title:s.feature_1_title||"Automation",text:s.feature_1_text||"Automate repetitive tasks and workflows."}),e.jsx(pe,{icon:Ue,title:s.feature_2_title||"Collaboration",text:s.feature_2_text||"Real-time collaboration across teams."}),e.jsx(pe,{icon:fi,title:s.feature_3_title||"Analytics",text:s.feature_3_text||"Powerful insights to track performance."}),e.jsx(pe,{icon:vi,title:s.feature_4_title||"Security",text:s.feature_4_text||"Enterprise-grade security and privacy."})]})]}),e.jsxs("section",{className:"sp-pros-cons",children:[e.jsx(Ge,{type:"pros",title:s.pros_title||"Pros",items:[s.pros_item_1||"Easy to use and intuitive interface",s.pros_item_2||"Feature-rich and highly customizable",s.pros_item_3||"Excellent customer support",s.pros_item_4||"Great value for the price"]}),e.jsx(Ge,{type:"cons",title:s.cons_title||"Cons",items:[s.cons_item_1||"Steeper learning curve for advanced features",s.cons_item_2||"Some integrations could be improved",s.cons_item_3||"Mobile app lacks a few features"]})]}),e.jsxs("section",{className:"sp-section",children:[e.jsx("h2",{children:s.faq_title||"Frequently Asked Questions"}),e.jsx("div",{className:"sp-faq-list",children:$.map(([g,V],q)=>e.jsx(rt,{question:g||["Is ProductX suitable for small teams?","Does ProductX offer a free trial?","What integrations does ProductX support?","Is my data secure with ProductX?"][q],answer:V||"Yes. This section can be edited by the affiliate from the template editor."},`faq-${q}`))})]}),e.jsxs("section",{className:"sp-section sp-final-row",children:[e.jsxs("div",{children:[e.jsx("h2",{children:s.final_verdict_title||"Final Verdict"}),e.jsx("p",{children:s.final_verdict_text||"ProductX is a robust, all-in-one solution for teams looking to streamline workflows, collaborate better, and achieve more."})]}),e.jsx(Xe,{button:T,fallbackLabel:"Try ProductX Now"})]}),u?e.jsx("div",{className:"sp-sponsored-slot-wrap",children:u}):null,e.jsxs("section",{className:"sp-section",children:[e.jsx("h2",{children:s.related_posts_title||"Related Posts"}),e.jsx("div",{className:"sp-related-grid",children:E.length>0?E.slice(0,3).map(g=>e.jsx(xe,{title:g==null?void 0:g.title,image:(g==null?void 0:g.featured_image)||(g==null?void 0:g.image_url)||(g==null?void 0:g.cover_image),meta:(g==null?void 0:g.meta)||(g==null?void 0:g.date_text)||(g==null?void 0:g.created_at),url:(g==null?void 0:g.url)||(g==null?void 0:g.public_url)},(g==null?void 0:g.id)||(g==null?void 0:g.slug)||(g==null?void 0:g.title))):e.jsxs(e.Fragment,{children:[e.jsx(xe,{title:s.related_post_1_title||"Best Project Management Tools for 2024",image:s.related_post_1_image,meta:s.related_post_1_meta||"May 1, 2024 · 7 min read",url:s.related_post_1_url}),e.jsx(xe,{title:s.related_post_2_title||"ProductX vs Competitor Y: Which Is Better?",image:s.related_post_2_image,meta:s.related_post_2_meta||"Apr 22, 2024 · 10 min read",url:s.related_post_2_url}),e.jsx(xe,{title:s.related_post_3_title||"How to Boost Team Productivity with Automation",image:s.related_post_3_image,meta:s.related_post_3_meta||"Apr 10, 2024 · 6 min read",url:s.related_post_3_url})]})})]})]}),e.jsxs("aside",{className:"sp-sidebar",children:[e.jsx(we,{placements:k,keys:["post_sidebar_300x250","sidebar_300x250","blog_sidebar_top","sidebar_top"],className:"sp-sidebar-ad",label:"Sidebar Ad 300x250"}),e.jsx(we,{placements:k,keys:["post_sticky_300x600","sticky_300x600","blog_sidebar_sticky","sidebar_sticky"],className:"sp-sticky-ad",label:"Sticky Ad 300x600"}),e.jsx(nt,{fieldMap:s})]})]})]})]})}function je(i=""){return String(i||"").trim().toLowerCase()}const Ke={neutral_review_template_v1:si,dxt_template_v1:oi,simple_posts_template_v1:We,"simple-posts":We};function st(i){const n=je(i==null?void 0:i.template_code_key),r=je(i==null?void 0:i.slug),a=je(i==null?void 0:i.name);return Ke[n]?Ke[n]:["neutral-review-template-v1","dummy-review-template-v1"].includes(r)||["neutral review template","dummy review template","blog review template"].includes(a)?si:r==="dxt"||a==="dxt"?oi:r==="simple-posts"||a==="simple posts"||n==="simple_posts_template_v1"?We:Ei}function ai(i){return`bloggad_email_capture_cooldown_${i}`}function Ie(i){return`bloggad_email_capture_dismissed_${i}`}function Qe(i,n){if(!(i!=null&&i.enabled)||!n)return!1;const r=String((i==null?void 0:i.display_mode)||(i==null?void 0:i.show_mode)||"popup").toLowerCase();if(!["popup","both"].includes(r))return!1;try{const a=localStorage.getItem(Ie(n)),o=Number(localStorage.getItem(ai(n))||0);if(a==="1"||o&&Date.now()<o)return!1}catch{return!0}return!0}function ot(i,n=10){if(i)try{localStorage.setItem(ai(i),String(Date.now()+n*60*1e3))}catch{}}function li(i,n=10){if(i){try{localStorage.setItem(Ie(i),"1")}catch{}ot(i,n)}}function at(i){if(i)try{localStorage.removeItem(Ie(i))}catch{}}function lt(i={}){return{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:18,boxShadow:"0 10px 24px rgba(15, 23, 42, 0.04)",...i}}function di(i){var o;const n=String(((o=i==null?void 0:i.template)==null?void 0:o.template_key)||"").toLowerCase(),r=n.includes("footer"),a=n.includes("popup");return r?{accent:"#7c3aed",accentSoft:"#f5f3ff",accentBorder:"#ddd6fe",title:"#111827",text:"#6b7280",buttonBg:"#7c3aed"}:a?{accent:"#2563eb",accentSoft:"#eff6ff",accentBorder:"#bfdbfe",title:"#111827",text:"#64748b",buttonBg:"#111827"}:{accent:"#2563eb",accentSoft:"#eff6ff",accentBorder:"#bfdbfe",title:"#111827",text:"#64748b",buttonBg:"#111827"}}function dt(i,n=""){const r=(i==null?void 0:i.website_slug)||n,a=(i==null?void 0:i.post_slug)||"";return r&&a?`/${r}/post/${a}`:a?`/post/${a}`:"#"}function ct(i){return(i==null?void 0:i.display_image)||(i==null?void 0:i.campaign_image_url)||(i==null?void 0:i.campaign_image)||(i==null?void 0:i.target_image)||(i==null?void 0:i.featured_image)||""}function pt({ad:i,websiteSlug:n,onView:r,onClick:a,index:o}){const x=j.useRef(null);j.useEffect(()=>{const u=x.current;if(!u)return;const s=new IntersectionObserver(S=>{S.forEach(k=>{k.isIntersecting&&(r(i),s.unobserve(k.target))})},{threshold:.3});return s.observe(u),()=>s.disconnect()},[i,r]);const f=ct(i),p=(i==null?void 0:i.target_title)||(i==null?void 0:i.campaign_title)||"Sponsored Post",h=(i==null?void 0:i.campaign_description)||"Promoted article selected for readers of this category.",t=String(o+1).padStart(2,"0");return e.jsxs("article",{ref:x,className:"sponsored-premium-card",children:[e.jsxs("div",{className:"sponsored-premium-image-wrap",children:[e.jsx("div",{className:"sponsored-premium-top-label",children:"Sponsored"}),f?e.jsx("img",{src:f,alt:p,className:"sponsored-premium-image"}):e.jsxs("div",{className:"sponsored-premium-image-fallback",children:[e.jsx(Ze,{size:30}),e.jsx("span",{children:"Sponsored"})]})]}),e.jsxs("div",{className:"sponsored-premium-body",children:[e.jsxs("div",{className:"sponsored-premium-meta",children:[e.jsxs("span",{children:[e.jsx(ei,{size:13}),"Promoted Post"]}),e.jsx("strong",{children:t})]}),e.jsx("h3",{className:"sponsored-premium-title",children:p}),e.jsx("p",{className:"sponsored-premium-description",children:h}),e.jsxs("button",{type:"button",onClick:()=>a(i,n),className:"sponsored-premium-button",children:["Read Sponsored Post",e.jsx(ui,{size:16})]})]})]})}function xt({ads:i,websiteSlug:n,onView:r,onClick:a}){return i!=null&&i.length?e.jsxs("section",{className:"sponsored-premium-section",children:[e.jsx("style",{children:`
        .sponsored-premium-section {
          width: 100%;
          margin: 24px 0;
          border-radius: 30px;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 32%),
            linear-gradient(135deg, #07111f 0%, #111827 48%, #1e1b4b 100%);
          border: 1px solid rgba(191, 219, 254, 0.28);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
          overflow: hidden;
        }

        .sponsored-premium-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: end;
          margin-bottom: 18px;
        }

        .sponsored-premium-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #bfdbfe;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 10px;
        }

        .sponsored-premium-heading {
          margin: 0;
          color: #ffffff;
          font-size: clamp(1.4rem, 3vw, 2.2rem);
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -0.04em;
        }

        .sponsored-premium-subtitle {
          margin: 8px 0 0;
          color: rgba(226, 232, 240, 0.82);
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .sponsored-premium-count {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          border-radius: 999px;
          background: #ffffff;
          color: #111827;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
        }

        .sponsored-premium-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .sponsored-premium-card {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          overflow: hidden;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 18px 44px rgba(2, 6, 23, 0.18);
          position: relative;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .sponsored-premium-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 58px rgba(2, 6, 23, 0.24);
        }

        .sponsored-premium-image-wrap {
          position: relative;
          width: 100%;
          height: 210px;
          background: #e5e7eb;
          overflow: hidden;
        }

        .sponsored-premium-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.01);
        }

        .sponsored-premium-image-fallback {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #1d4ed8, #7c3aed);
          color: #ffffff;
          font-weight: 950;
        }

        .sponsored-premium-top-label {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 0 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          color: #1d4ed8;
          border: 1px solid rgba(37, 99, 235, 0.2);
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
        }

        .sponsored-premium-body {
          padding: 17px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .sponsored-premium-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .sponsored-premium-meta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sponsored-premium-meta strong {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          color: #ffffff;
          font-size: 12px;
          font-weight: 950;
        }

        .sponsored-premium-title {
          margin: 0 0 9px;
          color: #111827;
          font-size: 19px;
          line-height: 1.28;
          font-weight: 950;
          letter-spacing: -0.02em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sponsored-premium-description {
          margin: 0 0 15px;
          color: #475569;
          font-size: 13px;
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sponsored-premium-button {
          margin-top: auto;
          border: 0;
          min-height: 48px;
          width: 100%;
          border-radius: 16px;
          background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 14px 26px rgba(37, 99, 235, 0.22);
        }

        @media (max-width: 1100px) {
          .sponsored-premium-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .sponsored-premium-section {
            border-radius: 24px;
            padding: 16px;
          }

          .sponsored-premium-header {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .sponsored-premium-count {
            width: fit-content;
          }

          .sponsored-premium-grid {
            display: flex;
            overflow-x: auto;
            gap: 14px;
            padding: 2px 2px 8px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }

          .sponsored-premium-card {
            min-width: 82%;
            scroll-snap-align: start;
          }

          .sponsored-premium-image-wrap {
            height: 190px;
          }
        }

        @media (max-width: 440px) {
          .sponsored-premium-card {
            min-width: 90%;
          }

          .sponsored-premium-image-wrap {
            height: 175px;
          }
        }
      `}),e.jsxs("div",{className:"sponsored-premium-header",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"sponsored-premium-kicker",children:[e.jsx(Ze,{size:14}),"Sponsored Picks"]}),e.jsx("h2",{className:"sponsored-premium-heading",children:"Promoted stories you may like"}),e.jsx("p",{className:"sponsored-premium-subtitle",children:"Rotated sponsored posts from approved campaigns. Each view and click is tracked for fair delivery."})]}),e.jsxs("div",{className:"sponsored-premium-count",children:[i.length," shown now"]})]}),e.jsx("div",{className:"sponsored-premium-grid",children:i.map((o,x)=>e.jsx(pt,{ad:o,index:x,websiteSlug:n,onView:r,onClick:a},o.id))})]}):null}function gt({open:i,onClose:n,capture:r,websiteSlug:a,websiteId:o,onSubmitted:x}){const[f,p]=j.useState(""),[h,t]=j.useState(!1),[u,s]=j.useState(""),[S,k]=j.useState(""),b=di(r);if(j.useEffect(()=>{i||(p(""),t(!1),s(""),k(""))},[i]),!i||!(r!=null&&r.enabled))return null;async function N(m){var l,H;if(m.preventDefault(),!f.trim()){s("Email is required");return}try{t(!0),s(""),k("");const{data:T}=await U.post("/api/email-list/public/capture",{website_id:o,website_slug:a,email:f.trim(),source_type:"popup"}),$=(T==null?void 0:T.message)||(r==null?void 0:r.success_message)||"Submitted successfully";k($),p(""),li(o,10),x==null||x($)}catch(T){s(((H=(l=T==null?void 0:T.response)==null?void 0:l.data)==null?void 0:H.message)||"Failed to save email")}finally{t(!1)}}return e.jsxs(e.Fragment,{children:[e.jsx("div",{onClick:n,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.46)",backdropFilter:"blur(4px)",zIndex:200}}),e.jsxs("div",{style:{position:"fixed",inset:"50% auto auto 50%",transform:"translate(-50%, -50%)",width:"min(620px, calc(100% - 24px))",background:"#ffffff",borderRadius:28,border:`1px solid ${b.accentBorder}`,boxShadow:"0 30px 80px rgba(15, 23, 42, 0.24)",zIndex:201,overflow:"hidden"},children:[e.jsxs("div",{style:{position:"relative",padding:"26px 24px 22px",background:`linear-gradient(135deg, ${b.accentSoft} 0%, #ffffff 72%)`,borderBottom:"1px solid #eef2f7"},children:[e.jsx("button",{type:"button",onClick:n,style:{position:"absolute",top:16,right:16,width:42,height:42,borderRadius:14,border:"1px solid #e5e7eb",background:"#ffffff",color:"#111827",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},children:e.jsx(mi,{size:18})}),e.jsxs("div",{style:{display:"flex",gap:12,flexWrap:"wrap",marginBottom:14},children:[e.jsx("div",{style:{width:58,height:58,borderRadius:18,background:b.buttonBg,color:"#ffffff",display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:"0 14px 28px rgba(17,24,39,0.12)"},children:e.jsx(Je,{size:26})}),e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:8,height:36,padding:"0 12px",borderRadius:999,border:`1px solid ${b.accentBorder}`,background:"#ffffff",color:b.accent,fontWeight:800,fontSize:12,letterSpacing:"0.08em",textTransform:"uppercase"},children:[e.jsx(zi,{size:14}),"Free updates"]})]}),e.jsx("h3",{style:{margin:0,fontSize:"clamp(1.8rem, 4vw, 2.6rem)",lineHeight:1.05,fontWeight:900,letterSpacing:"-0.05em",color:b.title},children:(r==null?void 0:r.title)||"Join our email list"}),e.jsx("p",{style:{margin:"12px 0 0",color:b.text,fontSize:15,lineHeight:1.85,maxWidth:520},children:(r==null?void 0:r.subtitle)||"Get updates, offers, and new post alerts."}),e.jsx("div",{style:{marginTop:16,display:"flex",gap:10,flexWrap:"wrap"},children:["New posts","Special updates","Helpful offers"].map(m=>e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:999,background:"#ffffff",border:"1px solid #e5e7eb",color:"#334155",fontSize:13,fontWeight:700},children:[e.jsx(Ni,{size:14,color:b.accent}),m]},m))})]}),e.jsxs("form",{onSubmit:N,style:{padding:24,display:"grid",gap:14},children:[e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1fr) 170px",gap:12},className:"email-popup-form-grid",children:[e.jsx("input",{type:"email",value:f,onChange:m=>p(m.target.value),placeholder:(r==null?void 0:r.placeholder_text)||"Enter your email",style:{width:"100%",minHeight:56,borderRadius:18,border:"1px solid #dbe1ea",background:"#ffffff",padding:"0 18px",fontSize:15,color:"#111827",outline:"none"}}),e.jsx("button",{type:"submit",disabled:h,style:{minHeight:56,borderRadius:18,border:`1px solid ${b.buttonBg}`,background:b.buttonBg,color:"#ffffff",fontSize:15,fontWeight:800,cursor:h?"not-allowed":"pointer",opacity:h?.7:1,boxShadow:"0 14px 28px rgba(17,24,39,0.12)"},children:h?"Saving...":(r==null?void 0:r.button_text)||"Subscribe"})]}),u?e.jsx("div",{style:{borderRadius:14,border:"1px solid #fecaca",background:"#fff1f2",padding:"12px 14px",color:"#be123c",fontSize:14,fontWeight:700},children:u}):null,S?e.jsxs("div",{style:{borderRadius:16,border:"1px solid #bbf7d0",background:"#ecfdf5",padding:"14px 16px",color:"#166534",fontSize:14,fontWeight:800,display:"flex",alignItems:"center",gap:8},children:[e.jsx(te,{size:16}),S]}):null,e.jsx("div",{style:{color:"#94a3b8",fontSize:12,lineHeight:1.7},children:"We keep this simple. Enter your email once and continue reading."})]}),e.jsx("style",{children:`
          @media (max-width: 640px) {
            .email-popup-form-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `})]})]})}function ft({capture:i,websiteSlug:n,websiteId:r}){const[a,o]=j.useState(""),[x,f]=j.useState(!1),[p,h]=j.useState(""),[t,u]=j.useState(""),s=di(i),S=String((i==null?void 0:i.display_mode)||(i==null?void 0:i.show_mode)||"popup").toLowerCase();if(!(i!=null&&i.enabled)||!["footer","both"].includes(S))return null;async function k(b){var N,m;if(b.preventDefault(),!a.trim()){h("Email is required");return}try{f(!0),h(""),u("");const{data:l}=await U.post("/api/email-list/public/capture",{website_id:r,website_slug:n,email:a.trim(),source_type:"footer"}),H=(l==null?void 0:l.message)||(i==null?void 0:i.success_message)||"Submitted successfully";u(H),o("")}catch(l){h(((m=(N=l==null?void 0:l.response)==null?void 0:N.data)==null?void 0:m.message)||"Failed to save email")}finally{f(!1)}}return e.jsxs("section",{style:lt({padding:0,marginTop:24,overflow:"hidden",background:"#ffffff"}),children:[e.jsx("div",{style:{padding:24,background:`linear-gradient(135deg, ${s.accentSoft} 0%, #ffffff 70%)`,borderBottom:"1px solid #eef2f7"},children:e.jsxs("div",{className:"email-capture-footer-grid",style:{display:"grid",gridTemplateColumns:"minmax(0, 1fr) minmax(320px, 430px)",gap:24,alignItems:"center"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:999,background:"#ffffff",border:`1px solid ${s.accentBorder}`,color:s.accent,fontWeight:800,fontSize:12,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14},children:[e.jsx(Wi,{size:14}),"Stay connected"]}),e.jsx("h3",{style:{margin:0,fontSize:"clamp(1.7rem, 4vw, 2.4rem)",lineHeight:1.06,fontWeight:900,letterSpacing:"-0.05em",color:"#111827"},children:(i==null?void 0:i.title)||"Join our email list"}),e.jsx("p",{style:{margin:"12px 0 0",color:"#64748b",fontSize:15,lineHeight:1.8,maxWidth:560},children:(i==null?void 0:i.subtitle)||"Subscribe for new posts and important updates."}),e.jsx("div",{style:{marginTop:16,display:"flex",gap:10,flexWrap:"wrap"},children:["Fresh post alerts","Useful updates","No long process"].map(b=>e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:999,background:"#ffffff",border:"1px solid #e5e7eb",color:"#334155",fontSize:13,fontWeight:700},children:[e.jsx(te,{size:14,color:s.accent}),b]},b))})]}),e.jsxs("form",{onSubmit:k,style:{display:"grid",gap:12},children:[e.jsx("input",{type:"email",value:a,onChange:b=>o(b.target.value),placeholder:(i==null?void 0:i.placeholder_text)||"Enter your email",style:{width:"100%",minHeight:54,borderRadius:18,border:"1px solid #dbe1ea",background:"#ffffff",padding:"0 18px",fontSize:15,color:"#111827",outline:"none"}}),e.jsx("button",{type:"submit",disabled:x,style:{minHeight:54,borderRadius:18,border:`1px solid ${s.buttonBg}`,background:s.buttonBg,color:"#ffffff",fontSize:15,fontWeight:800,cursor:x?"not-allowed":"pointer",opacity:x?.7:1,boxShadow:"0 14px 28px rgba(17,24,39,0.1)"},children:x?"Saving...":(i==null?void 0:i.button_text)||"Subscribe"}),p?e.jsx("div",{style:{borderRadius:14,border:"1px solid #fecaca",background:"#fff1f2",padding:"12px 14px",color:"#be123c",fontSize:14,fontWeight:700},children:p}):null,t?e.jsxs("div",{style:{borderRadius:16,border:"1px solid #bbf7d0",background:"#ecfdf5",padding:"14px 16px",color:"#166534",fontSize:14,fontWeight:800,display:"flex",alignItems:"center",gap:8},children:[e.jsx(te,{size:16}),t]}):null]})]})}),e.jsx("div",{style:{padding:"14px 24px",color:"#94a3b8",fontSize:12,lineHeight:1.7,background:"#ffffff"},children:"Quick signup for updates related to this post."}),e.jsx("style",{children:`
        @media (max-width: 900px) {
          .email-capture-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `})]})}function Tt(){var R,d,c,J,w,y;const{websiteSlug:i,slug:n}=hi(),[r,a]=j.useState(null),[o,x]=j.useState(null),[f,p]=j.useState(null),[h,t]=j.useState([]),[u,s]=j.useState(!1),S=j.useRef(new Set),[k,b]=j.useState(!0),[N,m]=j.useState("");j.useEffect(()=>{let _=!1,C=null;return i&&n&&(async()=>{var Z,se,he,Ce,He,Ae,$e,Re,Pe,Le,Ee,qe,Me,Fe,Oe;try{b(!0),m(""),t([]),S.current=new Set;const[X,me,I]=await Promise.all([U.get(`/api/public/posts/${i}/post/${n}`),U.get("/api/public/home"),U.get("/api/email-list/public/popup",{params:{website_slug:i}})]);if(_)return;const G=(X==null?void 0:X.data)||null,v=(G==null?void 0:G.post)||null,P=((Z=I==null?void 0:I.data)==null?void 0:Z.capture)||((se=I==null?void 0:I.data)==null?void 0:se.popup)||null;a(G),x((me==null?void 0:me.data)||null),p((he=I==null?void 0:I.data)!=null&&he.enabled?{enabled:!0,...P}:null);const ci=((Ce=v==null?void 0:v.category)==null?void 0:Ce.id)||(v==null?void 0:v.category_id)||(v==null?void 0:v.post_category_id)||((He=v==null?void 0:v.product)==null?void 0:He.category_id)||(v==null?void 0:v.product_category_id)||(v==null?void 0:v.categoryId)||null,De=Number(ci||0);try{const ue={ad_type:"post",placement_key:"post_page_related_posts",publisher_website_slug:i,publisher_website_id:((Ae=v==null?void 0:v.website)==null?void 0:Ae.id)||"",publisher_affiliate_id:(($e=v==null?void 0:v.website)==null?void 0:$e.user_id)||"",limit:6};De>0&&(ue.category_id=De);const ce=await U.get("/api/public/affiliate-ads",{params:ue});_||t(Array.isArray((Re=ce==null?void 0:ce.data)==null?void 0:Re.ads)?ce.data.ads:[])}catch{_||t([])}const de=((Le=(Pe=G==null?void 0:G.post)==null?void 0:Pe.website)==null?void 0:Le.id)||((qe=(Ee=I==null?void 0:I.data)==null?void 0:Ee.website)==null?void 0:qe.id)||null,pi=Number((P==null?void 0:P.popup_delay_seconds)??(P==null?void 0:P.delay_seconds)??8)||8;de&&((Me=I==null?void 0:I.data)!=null&&Me.enabled)&&Qe({enabled:!0,...P},de)&&(at(de),C=window.setTimeout(()=>{!_&&Qe({enabled:!0,...P},de)&&s(!0)},pi*1e3))}catch(X){_||m(((Oe=(Fe=X==null?void 0:X.response)==null?void 0:Fe.data)==null?void 0:Oe.message)||"Failed to load post")}finally{_||b(!1)}})(),()=>{_=!0,C&&window.clearTimeout(C)}},[i,n]);const l=r==null?void 0:r.post,H=Number((l==null?void 0:l.id)||0);bi({postId:H,contentSelector:"[data-bloggad-post-content]"});const T=(r==null?void 0:r.template_fields)||[],$=(r==null?void 0:r.cta_buttons)||[],E=(r==null?void 0:r.related_posts)||[],g=(o==null?void 0:o.categories)||[],V=j.useMemo(()=>st(l==null?void 0:l.template),[l==null?void 0:l.template]),q=j.useCallback(async _=>{var C,M;if(!(!(_!=null&&_.id)||S.current.has(_.id))){S.current.add(_.id);try{await U.post(`/api/public/affiliate-ads/${_.id}/view`,{placement_key:"post_page_related_posts",page_url:window.location.href,publisher_website_slug:i,publisher_website_id:((C=l==null?void 0:l.website)==null?void 0:C.id)||"",publisher_affiliate_id:((M=l==null?void 0:l.website)==null?void 0:M.user_id)||""})}catch{}}},[(R=l==null?void 0:l.website)==null?void 0:R.id,(d=l==null?void 0:l.website)==null?void 0:d.user_id,i]),re=j.useCallback(async(_,C="")=>{var Z,se;if(!(_!=null&&_.id))return;const M=dt(_,C);try{await U.post(`/api/public/affiliate-ads/${_.id}/click`,{placement_key:"post_page_related_posts",page_url:window.location.href,destination_url:M,publisher_website_slug:i,publisher_website_id:((Z=l==null?void 0:l.website)==null?void 0:Z.id)||"",publisher_affiliate_id:((se=l==null?void 0:l.website)==null?void 0:se.user_id)||""})}catch{}M&&M!=="#"&&(window.location.href=M)},[(c=l==null?void 0:l.website)==null?void 0:c.id,(J=l==null?void 0:l.website)==null?void 0:J.user_id,i]),ne=e.jsx(xt,{ads:h,websiteSlug:i,onView:q,onClick:re}),Y=e.jsx(ft,{capture:f,websiteSlug:i,websiteId:(w=l==null?void 0:l.website)==null?void 0:w.id});return k?e.jsxs("div",{style:{minHeight:"100vh",background:"#f5f7fb",display:"flex",alignItems:"center",justifyContent:"center",padding:24},children:[e.jsxs("div",{style:{background:"#ffffff",border:"1px solid #e5e7eb",borderRadius:18,padding:22,display:"flex",alignItems:"center",gap:12,color:"#334155",boxShadow:"0 12px 30px rgba(15, 23, 42, 0.06)"},children:[e.jsx(Si,{size:18,className:"spin-soft"}),e.jsx("span",{children:"Loading post..."})]}),e.jsx("style",{children:`
          .spin-soft {
            animation: spinSoft 0.9s linear infinite;
          }
          @keyframes spinSoft {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `})]}):N?e.jsx("div",{style:{minHeight:"100vh",background:"#f5f7fb",padding:24},children:e.jsx("div",{style:{width:"min(1100px, calc(100% - 24px))",margin:"0 auto",background:"#ffffff",border:"1px solid #fca5a5",borderLeft:"4px solid #dc2626",borderRadius:16,padding:18,color:"#991b1b",fontWeight:700},children:N})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{"data-bloggad-post-content":!0,style:{display:"contents"},children:e.jsx(V,{post:l,templateFields:T,ctaButtons:$,relatedPosts:E,websiteSlug:i,categories:g,emailCapture:f,emailCaptureFooter:Y,sponsoredRelatedPostsSlot:ne,onOpenPopup:()=>s(!0)})}),e.jsx(_i,{post:l,websiteSlug:i,access:(r==null?void 0:r.access)||null,templateFields:(r==null?void 0:r.template_fields)||[],onUnlocked:_=>{a(C=>({...C||{},template_fields:(_==null?void 0:_.template_fields)||[],cta_buttons:(_==null?void 0:_.cta_buttons)||[],access:(_==null?void 0:_.access)||(C==null?void 0:C.access)||null}))}}),e.jsx(gt,{open:u,onClose:()=>{var _;li((_=l==null?void 0:l.website)==null?void 0:_.id,10),s(!1)},capture:f,websiteSlug:i,websiteId:(y=l==null?void 0:l.website)==null?void 0:y.id,onSubmitted:()=>{setTimeout(()=>{s(!1)},1600)}})]})}export{Tt as default};
