import{importShared as u}from"./__federation_fn_import-E6wRZccp.js";/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const{h}=await u("vue"),k=({size:e,strokeWidth:t=2,absoluteStrokeWidth:n,color:a,iconNode:r,name:o,class:s,...f},{slots:d})=>h("svg",{...i,width:e||i.width,height:e||i.height,stroke:a||i.stroke,"stroke-width":n?Number(t)*24/Number(e):t,class:["lucide",`lucide-${g(o??"icon")}`],...f},[...r.map(p=>h(...p)),...d.default?[d.default()]:[]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const{h:w}=await u("vue"),l=(e,t)=>(n,{slots:a})=>w(k,{...n,iconNode:t,name:e},a);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=l("ListChecksIcon",[["path",{d:"m3 17 2 2 4-4",key:"1jhpwq"}],["path",{d:"m3 7 2 2 4-4",key:"1obspn"}],["path",{d:"M13 6h8",key:"15sg57"}],["path",{d:"M13 12h8",key:"h98zly"}],["path",{d:"M13 18h8",key:"oe0vm4"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=l("LoaderCircleIcon",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=l("XIcon",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),{onBeforeUnmount:m,onMounted:y,ref:c}=await u("vue"),L={api:{type:Object,required:!0},pluginId:{type:String,required:!0},sourcePluginId:{type:String,default:""},nativeSubscribe:{type:[Function,Boolean],default:void 0}};function M(e){const t=n=>`plugin/${encodeURIComponent(e.pluginId)}/${n}`;return{get:(n,a={})=>e.api.get(t(n),{feedback:"silent",...a}),post:async(n,a={})=>{const r=await e.api.post(t(n),a,{feedback:"silent"});if(r?.success===!1)throw new Error(r.message||"操作未完成");return r}}}function N(){const e=c(!1),t=c(""),n=c("");async function a(r,o=""){if(!e.value){e.value=!0,t.value="",n.value="";try{const s=await r();return o&&(n.value=o),s}catch(s){t.value=s?.message||"请求失败，请稍后重试"}finally{e.value=!1}}}return{busy:e,error:t,notice:n,run:a}}function S(e,t=15e3){let n,a=!0;const r=()=>{a&&e()};y(()=>{r(),n=setInterval(r,t)}),m(()=>{a=!1,clearInterval(n)})}function $(e){if(!e)return"—";const t=new Date(typeof e=="number"&&e<1e12?e*1e3:e);return Number.isNaN(t.getTime())?String(e):t.toLocaleString("zh-CN",{hour12:!1})}export{v as L,C as X,I as a,M as b,l as c,S as d,$ as e,L as h,N as u};
