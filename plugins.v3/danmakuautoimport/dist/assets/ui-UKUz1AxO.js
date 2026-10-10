import{importShared as c}from"./__federation_fn_import-E6wRZccp.js";/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var u={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const{h:d}=await c("vue"),w=({size:e,strokeWidth:t=2,absoluteStrokeWidth:n,color:r,iconNode:a,name:o,class:s,...h},{slots:l})=>d("svg",{...u,width:e||u.width,height:e||u.height,stroke:r||u.stroke,"stroke-width":n?Number(t)*24/Number(e):t,class:["lucide",`lucide-${g(o??"icon")}`],...h},[...a.map(p=>d(...p)),...l.default?[l.default()]:[]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const{h:b}=await c("vue"),f=(e,t)=>(n,{slots:r})=>b(w,{...n,iconNode:t,name:e},r);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=f("LoaderCircleIcon",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=f("XIcon",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),{onBeforeUnmount:m,onMounted:v,ref:i}=await c("vue"),C={api:{type:Object,required:!0},pluginId:{type:String,required:!0},sourcePluginId:{type:String,default:""},nativeSubscribe:{type:[Function,Boolean],default:void 0}};function L(e){const t=n=>`plugin/${encodeURIComponent(e.pluginId)}/${n}`;return{get:(n,r={})=>e.api.get(t(n),{feedback:"silent",...r}),post:async(n,r={})=>{const a=await e.api.post(t(n),r,{feedback:"silent"});if(a?.success===!1)throw new Error(a.message||"操作未完成");return a}}}function N(){const e=i(!1),t=i(""),n=i("");async function r(a,o=""){if(!e.value){e.value=!0,t.value="",n.value="";try{const s=await a();return o&&(n.value=o),s}catch(s){t.value=s?.message||"请求失败，请稍后重试"}finally{e.value=!1}}}return{busy:e,error:t,notice:n,run:r}}function S(e,t=15e3){let n;v(()=>{e(),n=setInterval(e,t)}),m(()=>clearInterval(n))}function $(e){if(!e)return"—";const t=new Date(typeof e=="number"&&e<1e12?e*1e3:e);return Number.isNaN(t.getTime())?String(e):t.toLocaleString("zh-CN",{hour12:!1})}export{k as L,I as X,L as a,S as b,f as c,$ as d,C as h,N as u};
