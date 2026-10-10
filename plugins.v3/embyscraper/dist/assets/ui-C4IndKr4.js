import{importShared as c}from"./__federation_fn_import-E6wRZccp.js";/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const{h:a}=await c("vue"),f=({size:e,strokeWidth:r=2,absoluteStrokeWidth:i,color:t,iconNode:n,name:d,class:h,...u},{slots:s})=>a("svg",{...o,width:e||o.width,height:e||o.height,stroke:t||o.stroke,"stroke-width":i?Number(r)*24/Number(e):r,class:["lucide",`lucide-${m(d??"icon")}`],...u},[...n.map(p=>a(...p)),...s.default?[s.default()]:[]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const{h:g}=await c("vue"),l=(e,r)=>(i,{slots:t})=>g(f,{...i,iconNode:r,name:e},t);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=l("XIcon",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),b={api:{type:Object,required:!0},pluginId:{type:String,required:!0}};function k(e){const r=t=>`plugin/${encodeURIComponent(e.pluginId)}/${t}`,i=t=>{if(t?.success===!1)throw new Error(t.message||"操作失败");return t};return{get:async(t,n={})=>i(await e.api.get(r(t),{params:n,feedback:"silent"})),post:async(t,n)=>i(await e.api.post(r(t),n,{feedback:"silent"}))}}const P=[["Name","标题"],["OriginalTitle","原始标题"],["Overview","简介"],["PremiereDate","首映日期"],["ProductionYear","年份"],["CommunityRating","评分"],["OfficialRating","分级"],["Genres","类型"],["Studios","制作公司"],["People","演员与演职员"],["Tags","标签"],["Taglines","宣传语"],["ProviderIds","外部 ID"]],I=[["Primary","海报"],["Backdrop","背景"],["Logo","标志"],["Thumb","缩略图"]],N={enabled:!1,servers:[],libraries:{},source:"tmdb",cron:"",auto_transfer:!1,overwrite:"missing",respect_locked:!0,fields:["Name","Overview","Genres","PremiereDate","ProductionYear","CommunityRating","ProviderIds"],images:["Primary","Backdrop"],max_items:100,delay_seconds:1,notify:!1};function O(e){return e==null||e===""?"—":typeof e=="object"?JSON.stringify(e,null,2):String(e)}function x(e){if(!e)return"—";const r=new Date(typeof e=="number"&&e<1e12?e*1e3:e);return Number.isNaN(+r)?String(e):r.toLocaleString("zh-CN")}function C(e){if(typeof e!="string"||!/^(https?:\/\/|\/)/i.test(e)||/(?:api_key|apikey|token|x-emby-token)=/i.test(e))return"";try{const r=new URL(e,window.location.origin);return["http:","https:"].includes(r.protocol)?e:""}catch{return""}}export{y as X,k as a,x as b,l as c,N as d,C as e,P as f,b as h,I as i,O as t};
