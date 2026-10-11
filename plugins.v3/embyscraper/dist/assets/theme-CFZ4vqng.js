import{importShared as d}from"./__federation_fn_import-E6wRZccp.js";/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var s={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const{h:c}=await d("vue"),m=({size:e,strokeWidth:i=2,absoluteStrokeWidth:n,color:t,iconNode:r,name:l,class:f,...u},{slots:a})=>c("svg",{...s,width:e||s.width,height:e||s.height,stroke:t||s.stroke,"stroke-width":n?Number(i)*24/Number(e):i,class:["lucide",`lucide-${g(l??"icon")}`],...u},[...r.map(p=>c(...p)),...a.default?[a.default()]:[]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const{h}=await d("vue"),o=(e,i)=>(n,{slots:t})=>h(m,{...n,iconNode:i,name:e},t);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=o("ListVideoIcon",[["path",{d:"M12 12H3",key:"18klou"}],["path",{d:"M16 6H3",key:"1wxfjs"}],["path",{d:"M12 18H3",key:"11ftsu"}],["path",{d:"m16 12 5 3-5 3v-6Z",key:"zpskkp"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=o("Settings2Icon",[["path",{d:"M20 7h-9",key:"3s1dr2"}],["path",{d:"M14 17H5",key:"gfn3mx"}],["circle",{cx:"17",cy:"17",r:"3",key:"18b49y"}],["circle",{cx:"7",cy:"7",r:"3",key:"dfmy0x"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=o("XIcon",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),_={api:{type:Object,required:!0},pluginId:{type:String,required:!0}};function x(e){const i=t=>`plugin/${encodeURIComponent(e.pluginId)}/${t}`,n=t=>{if(t?.success===!1)throw new Error(t.message||"操作失败");return t};return{get:async(t,r={})=>n(await e.api.get(i(t),{params:r,feedback:"silent"})),post:async(t,r)=>n(await e.api.post(i(t),r,{feedback:"silent"}))}}const I=[["Name","标题"],["OriginalTitle","原始标题"],["Overview","简介"],["PremiereDate","首映日期"],["ProductionYear","年份"],["CommunityRating","评分"],["OfficialRating","分级"],["Genres","类型"],["Studios","制作公司"],["People","演员与演职员"],["Tags","标签"],["Taglines","宣传语"],["ProviderIds","外部 ID"]],P=[["Primary","海报"],["Backdrop","背景"],["Logo","标志"],["Thumb","缩略图"]],S={enabled:!1,servers:[],libraries:{},source:"tmdb",language:"",rating_country:"",actor_limit:30,include_crew:!0,image_languages:["zh","en","null"],image_size:"original",match_threshold:.92,include_specials:!0,reindex_episodes:!1,episode_group_mode:"aired",episode_group_bindings:{},ai_translation:!1,translate_titles:!1,cron:"",auto_transfer:!1,overwrite:"missing",respect_locked:!0,fields:["Name","Overview","Genres","PremiereDate","ProductionYear","CommunityRating","ProviderIds"],images:["Primary","Backdrop"],max_items:100,backup_limit:1e3,delay_seconds:1,notify:!1};function N(e){return e==null||e===""?"—":typeof e=="object"?JSON.stringify(e,null,2):String(e)}function L(e){if(!e)return"—";const i=new Date(typeof e=="number"&&e<1e12?e*1e3:e);return Number.isNaN(+i)?String(e):i.toLocaleString("zh-CN")}function O(e){if(typeof e!="string"||!/^(https?:\/\/|\/)/i.test(e)||/(?:api_key|apikey|token|x-emby-token)=/i.test(e))return"";try{const i=new URL(e,window.location.origin);return["http:","https:"].includes(i.protocol)?e:""}catch{return""}}export{k as L,w as S,b as X,x as a,L as b,o as c,S as d,O as e,I as f,_ as h,P as i,N as t};
