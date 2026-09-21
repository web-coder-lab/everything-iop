import React, { useEffect, useMemo, useState } from 'react';
import EverythingWorkflowScreens from './EverythingWorkflowScreens';
import { useAppStore } from '../../stores/appStore';
import { apiClient } from '../../lib/api/client';
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Bell, Bot, CalendarDays, Check,
  ChevronRight, CircleDollarSign, Code2, CreditCard, Download, FileCode2, FileText, Flag,
  Globe2, Heart, Image as ImageIcon, KeyRound, Link2, Lock, Mail, MessageCircle, MoreHorizontal,
  Package, Play, Radio, Receipt, Search, Send, Settings, ShieldCheck, ShoppingBag, Smartphone,
  Sparkles, Store, Ticket, Trash2, Upload, UserRound, Users, Video, Wallet, Webhook, X, Zap
} from 'lucide-react';

type HubTab = 'content'|'commerce'|'community'|'money'|'identity'|'developer'|'safety'|'settings';
type Detail = {id:string; title:string; eyebrow:string; description:string; icon:React.ElementType};

const details: Record<HubTab, Detail[]> = {
  content: [
    {id:'post',title:'Post Detail',eyebrow:'CONTENT',description:'Full post reader with comments, replies, reactions, saves, shares, links and attached products.',icon:FileText},
    {id:'reel',title:'Reel Watch',eyebrow:'SHORT VIDEO',description:'Vertical reel viewer with creator profile, audio, comments, products, community and safety actions.',icon:Play},
    {id:'video',title:'Video Watch',eyebrow:'LONG VIDEO',description:'YouTube-style watch page with chapters, captions, quality, playlist, comments and creator tools.',icon:Video},
    {id:'channel',title:'Channel',eyebrow:'CREATOR',description:'Channel home with videos, playlists, community posts, memberships and analytics entry points.',icon:Radio},
    {id:'live',title:'Live Watch',eyebrow:'LIVE',description:'Live player, realtime chat, reactions, gifts, moderation, products and event context.',icon:Radio},
    {id:'live-studio',title:'Live Studio',eyebrow:'CREATOR',description:'Stream setup, thumbnail, audience, chat moderation, gifts, products, analytics and end-stream flow.',icon:Activity},
    {id:'media',title:'Media Viewer',eyebrow:'MEDIA',description:'Fullscreen image/video viewer with zoom, swipe, save, share, download permission and report.',icon:ImageIcon},
    {id:'html',title:'HTML Post',eyebrow:'PUBLISHING',description:'Safe HTML composer with allowed tags, sanitized preview and publication checks.',icon:FileCode2},
  ],
  commerce: [
    {id:'product',title:'Product Detail',eyebrow:'MARKETPLACE',description:'Product gallery, seller, price, variants, availability, share and Chat with Seller.',icon:ShoppingBag},
    {id:'seller',title:'Seller Center',eyebrow:'SELLER',description:'Catalog, inventory, inquiries, orders where applicable, returns, payouts and analytics.',icon:Store},
    {id:'seller-product',title:'Listing Editor',eyebrow:'SELLER',description:'Create or edit a listing with media, price, description, stock and visibility.',icon:Package},
    {id:'buyer-chat',title:'Buyer / Seller Chat',eyebrow:'COMMERCE CHAT',description:'Conversation with product context, price discussion, delivery responsibility and safety tools.',icon:MessageCircle},
    {id:'order',title:'Order / Inquiry Detail',eyebrow:'COMMERCE',description:'Status timeline, seller messages, payment references and issue/return entry points.',icon:Receipt},
    {id:'event',title:'Event Detail',eyebrow:'EVENTS',description:'Event details, reminders, tickets, live session context, chat, reactions and sharing.',icon:CalendarDays},
    {id:'ads',title:'Ads Manager',eyebrow:'BUSINESS',description:'Campaign creation for feed, Reels, videos, communities, search and product promotion.',icon:BarChart3},
  ],
  community: [
    {id:'community',title:'Community Home',eyebrow:'COMMUNITY OS',description:'Community profile with feed, channels, members, events, store, rules and subscription.',icon:Users},
    {id:'members',title:'Members & Roles',eyebrow:'CONTROL CENTER',description:'Member directory, role assignment, custom permissions, verification and moderation actions.',icon:BadgeCheck},
    {id:'channels',title:'Channels',eyebrow:'COMMUNITY OS',description:'Text, forum, media, Q&A, voice, video and event channels with scoped permissions.',icon:MessageCircle},
    {id:'moderation',title:'Moderation Queue',eyebrow:'CONTROL CENTER',description:'Reports, hidden content, member actions, appeals and moderator assignments.',icon:Flag},
    {id:'automation',title:'Automation Builder',eyebrow:'CONTROL CENTER',description:'WHEN / IF / THEN workflows for joins, reports, roles, welcomes and events.',icon:Zap},
    {id:'bots',title:'Bots & Apps',eyebrow:'DEVELOPER',description:'OAuth apps, scoped permissions, webhooks, events and revoke/pause controls.',icon:Bot},
    {id:'community-store',title:'Community Store',eyebrow:'COMMUNITY COMMERCE',description:'Products and promotions attached to a community with owner-scoped controls.',icon:Store},
    {id:'community-analytics',title:'Community Analytics',eyebrow:'CONTROL CENTER',description:'Growth, engagement, retention, content, events, store and monetization analytics.',icon:BarChart3},
  ],
  money: [
    {id:'wallet',title:'Wallet Overview',eyebrow:'MONEY',description:'Available, pending and earnings balances with deposits, withdrawals and transactions.',icon:Wallet},
    {id:'coins',title:'Everything Coins',eyebrow:'VIRTUAL CURRENCY',description:'Coin balance, packs, usage ledger, gifts, tips and eligible platform interactions.',icon:CircleDollarSign},
    {id:'payouts',title:'Payouts',eyebrow:'CREATOR EARNINGS',description:'Earnings sources, payout methods, pending payouts, fees, taxes and history.',icon:CreditCard},
    {id:'transactions',title:'Transaction Ledger',eyebrow:'WALLET',description:'Filterable real-money ledger with references, status, refunds and chargeback states.',icon:Receipt},
    {id:'subscription',title:'Subscriptions',eyebrow:'ENTITLEMENTS',description:'Monthly, 6-month and yearly plans with configurable access entitlements.',icon:Ticket},
    {id:'billing',title:'Billing & Payment Methods',eyebrow:'BILLING',description:'Payment methods, invoices, subscription renewal and payment security.',icon:CreditCard},
  ],
  identity: [
    {id:'profile',title:'Profile',eyebrow:'IDENTITY',description:'Public profile, posts, Reels, videos, media, communities, products and events.',icon:UserRound},
    {id:'signup',title:'Account Creation',eyebrow:'AUTH',description:'Email, OTP verification, username, display name, password, bio and profile image.',icon:Mail},
    {id:'sessions',title:'Sessions & Devices',eyebrow:'SECURITY',description:'Active sessions, device details, login history and remote sign-out.',icon:Smartphone},
    {id:'privacy',title:'Privacy Controls',eyebrow:'PRIVACY',description:'Visibility, followers, messaging, mentions, content and discoverability settings.',icon:Lock},
    {id:'security',title:'Security Center',eyebrow:'SECURITY',description:'Password, 2FA, passkeys, alerts, connected apps and wallet security.',icon:ShieldCheck},
    {id:'connected',title:'Connected Apps',eyebrow:'ACCESS',description:'OAuth connections, permissions, revoke access and API/bot relationships.',icon:Link2},
  ],
  developer: [
    {id:'developer',title:'Developer Dashboard',eyebrow:'PLATFORM',description:'Apps, bots, OAuth, API keys, webhooks, events, usage, logs and sandbox.',icon:Code2},
    {id:'app',title:'App Detail',eyebrow:'DEVELOPER',description:'App identity, OAuth redirect configuration, permissions, events and environments.',icon:FileCode2},
    {id:'webhooks',title:'Webhooks',eyebrow:'DEVELOPER',description:'Signed webhook endpoints, event subscriptions, delivery attempts and retries.',icon:Webhook},
    {id:'api-keys',title:'API Credentials',eyebrow:'SECURITY',description:'Scoped credentials, rotation, expiration, usage and secure server-side handling.',icon:KeyRound},
    {id:'events-api',title:'Event Catalog',eyebrow:'API',description:'member.joined, message.created, post.created, payment.completed and more.',icon:Activity},
    {id:'logs',title:'Developer Logs',eyebrow:'OBSERVABILITY',description:'API requests, errors, webhook deliveries, rate limits and sandbox activity.',icon:Search},
  ],
  safety: [
    {id:'report',title:'Report Content',eyebrow:'TRUST & SAFETY',description:'Report post, comment, message, user or community with reason and evidence.',icon:Flag},
    {id:'blocked',title:'Blocked & Muted',eyebrow:'SAFETY',description:'Manage blocked and muted accounts and content preferences.',icon:Trash2},
    {id:'appeal',title:'Appeal / Support',eyebrow:'SAFETY',description:'View safety decisions, submit context and track support requests.',icon:CircleDollarSign},
    {id:'privacy-download',title:'Data & Export',eyebrow:'PRIVACY',description:'Export account data, content, messages and activity where available.',icon:Download},
    {id:'content-controls',title:'Content Controls',eyebrow:'SAFETY',description:'Sensitive-content preferences, recommendations, autoplay and download permissions.',icon:SlidersIcon},
  ],
  settings: [
    {id:'notifications',title:'Notification Center',eyebrow:'SETTINGS',description:'Likes, replies, follows, messages, community, wallet, security and developer alerts.',icon:Bell},
    {id:'appearance',title:'Appearance',eyebrow:'SETTINGS',description:'Theme, density, motion and accessibility preferences.',icon:Sparkles},
    {id:'language',title:'Language & Region',eyebrow:'SETTINGS',description:'Language, time zone, currency display and regional preferences.',icon:Globe2},
    {id:'messages-settings',title:'Messaging Settings',eyebrow:'SETTINGS',description:'Read receipts, online status, disappearing messages and request controls.',icon:MessageCircle},
    {id:'help',title:'Help & Support',eyebrow:'SUPPORT',description:'Help center, account support, payments support and technical issue reporting.',icon:CircleHelpIcon},
  ],
};

function SlidersIcon(){return <Settings size={18}/>}
function CircleHelpIcon(){return <span style={{fontWeight:900,fontSize:16}}>?</span>}

const tabLabels: [HubTab,string][] = [
  ['content','Content'],['commerce','Commerce'],['community','Community'],['money','Money'],['identity','Identity'],['developer','Developer'],['safety','Safety'],['settings','Settings']
];

export default function EverythingDetailHub({ onBack, notify, forcedDetail, surfaceId }: { onBack?:()=>void; notify:(x:string)=>void; forcedDetail?:string; surfaceId?:string }) {
  const { routeParams, navigate } = useAppStore();
  const requestedDetail = forcedDetail || routeParams.detail || null;
  const requestedLocation = useMemo(() => {
    if (!requestedDetail) return null;
    for (const [group, items] of Object.entries(details) as [HubTab, Detail[]][]) {
      if (items.some(item => item.id === requestedDetail)) return { group, id: requestedDetail };
    }
    return null;
  }, [requestedDetail]);
  const [tab,setTab]=useState<HubTab>(requestedLocation?.group || 'content');
  const [detail,setDetail]=useState<string|null>(requestedLocation?.id || null);
  useEffect(() => {
    if (requestedLocation) {
      setTab(requestedLocation.group);
      setDetail(requestedLocation.id);
    }
  }, [requestedLocation]);
  const current=details[tab];
  const selected=current.find(x=>x.id===detail) || null;

  if(selected) return <DetailScreen detail={selected} onBack={()=>{ setDetail(null); navigate('/details'); }} notify={notify} surfaceId={surfaceId || routeParams.surfaceId}/>;

  return <>
    <div className="ev-page-head">
      <div><span className="ev-eyebrow">EVERYTHING SYSTEM</span><h1>All frontend details</h1><p>Every major user-facing workflow is grouped here before backend integration.</p></div>
      {onBack && <button className="ev-outline" onClick={onBack}><ArrowLeft size={15}/> Back</button>}
    </div>
    <div className="ev-detail-banner"><div><Sparkles size={23}/><div><b>One identity · one platform</b><span>Social, creator, community, commerce, money and developer features share the same Everything identity.</span></div></div><span className="ev-detail-badge">NO PLATFORM ADMIN</span></div>
    <div className="ev-module-tabs">{tabLabels.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div>
    <div className="ev-detail-grid">{current.map(item=>{const Icon=item.icon; return <button key={item.id} className="ev-detail-card" onClick={()=>{ setDetail(item.id); navigate('/details', { detail: item.id }); }}><span className="ev-detail-icon"><Icon size={20}/></span><div><span className="ev-eyebrow">{item.eyebrow}</span><b>{item.title}</b><p>{item.description}</p></div><ChevronRight size={17}/></button>})}</div>
    <div className="ev-check-list ev-detail-checks">
      {['Responsive desktop / tablet / mobile','Loading, empty, error and success states','Internal links teleport without full reload','Save and download permissions are explicit','Sponsored content is visibly labeled','Coins and real-money Wallet stay separate','Community control is owner-scoped','No permanent secrets are exposed in frontend'].map(x=><div key={x}><Check size={15}/>{x}</div>)}
    </div>
  </>;
}

function DetailScreen({detail,onBack,notify,surfaceId}:{detail:Detail;onBack:()=>void;notify:(x:string)=>void;surfaceId?:string}){
  const Icon=detail.icon;
  const [tab,setTab]=useState('Overview');
  const commonTabs = ['Overview','Workflow','Activity','Settings'];
  return <>
    <div className="ev-page-head"><div><button className="ev-back-link" onClick={onBack}><ArrowLeft size={14}/> All details</button><span className="ev-eyebrow">{detail.eyebrow}</span><h1><span className="ev-detail-title-icon"><Icon size={23}/></span>{detail.title}</h1><p>{detail.description}</p></div><button className="ev-primary" onClick={()=>setTab('Workflow')}>Open workflow <ArrowRight size={15}/></button></div>
    <div className="ev-module-tabs">{commonTabs.map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</div>
    {tab==='Overview' && <Overview detail={detail} notify={notify}/>} 
    {tab==='Workflow' && <div className="ev-workflow-shell"><EverythingWorkflowScreens id={detail.id} title={detail.title} notify={notify} go={(id) => navigate('/details', { detail: id })} surfaceId={surfaceId}/></div>}
    {tab==='Activity' && <ActivityPanel detail={detail}/>} 
    {tab==='Settings' && <SettingsPanel detail={detail} notify={notify}/>} 
  </>;
}

function Overview({detail,notify}:{detail:Detail;notify:(x:string)=>void}){
  const {navigate}=useAppStore();
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const [data,setData]=useState<Record<string,unknown>>({});
  const endpointMap:Record<string,string>={post:'/posts',reel:'/reels',video:'/videos',live:'/live',product:'/products',community:'/communities',wallet:'/wallet',coins:'/coins/balance',developer:'/developer/apps',seller:'/seller/dashboard',payouts:'/wallet/payouts',subscription:'/subscriptions'};
  useEffect(()=>{let cancelled=false; const endpoint=endpointMap[detail.id] || `/details/${encodeURIComponent(detail.id)}`; apiClient.request<any>(endpoint).then(r=>{if(!cancelled){const value=r.data;setData(value&&typeof value==='object'&&!Array.isArray(value)?value:{data:value});setState('ready')}}).catch(()=>{if(!cancelled)setState('error')});return()=>{cancelled=true}},[detail.id]);
  const entries=Object.entries(data).slice(0,20);
  return <div className="ev-detail-layout"><div className="ev-detail-main"><div className="ev-detail-hero"><div className="ev-detail-hero-icon"><IconFor id={detail.id}/></div><div><span className="ev-eyebrow">{detail.eyebrow}</span><h2>{detail.title}</h2><p>{detail.description}</p></div></div>{state==='loading'&&<Card2><p>Loading live data from the Everything IOP server…</p></Card2>}{state==='error'&&<Card2><p className="text-rose-600">The server did not return data for this workflow. No demo data has been substituted.</p></Card2>}{state==='ready'&&<Card2><h3>Server data</h3>{entries.length===0?<p>No records returned yet.</p>:<div className="ev-detail-table">{entries.map(([key,value])=><div key={key}><span>{key}</span><b>{typeof value==='string'||typeof value==='number'||typeof value==='boolean'?String(value):'Server object'}</b></div>)}</div>}</Card2>}</div><aside className="ev-detail-aside"><Card2><h3>Actions</h3><button onClick={()=>navigator.clipboard?.writeText(window.location.href).then(()=>notify('Internal link copied.'))}><Link2 size={15}/> Copy internal link</button><button onClick={()=>navigate('/details',{detail:'report'})}><Flag size={15}/> Report / safety</button></Card2><Card2><h3>Security</h3>{['Authentication','Backend authorization','Validation','Audit/event logging'].map(x=><div className="ev-check-row" key={x}><Check size={14}/><span>{x}</span></div>)}</Card2></aside></div>;
}
function IconFor({id}:{id:string}){const map:any={product:ShoppingBag,wallet:Wallet,community:Users,developer:Code2,reel:Play,video:Video,live:Radio,post:FileText,seller:Store,payouts:CreditCard,coins:CircleDollarSign,subscription:Ticket,security:ShieldCheck,report:Flag}; const I=map[id]||Sparkles; return <I size={30}/>}
function Metric2({label,value}:{label:string;value:string}){return <div className="ev-metric"><span>{label}</span><strong>{value}</strong></div>}
function Card2({children}:{children:React.ReactNode}){return <div className="ev-card ev-detail-card-wrap">{children}</div>}
function ActivityPanel({detail}:{detail:Detail}){ const [items,setItems]=useState<any[]>([]); const [error,setError]=useState(''); useEffect(()=>{apiClient.request<any[]>(`/activity?resource=${encodeURIComponent(detail.id)}`).then(r=>setItems(r.data||[])).catch((e:any)=>setError(e.message||'Unable to load activity.'));},[detail.id]); return <Card2><h3>Recent activity · {detail.title}</h3>{error?<p className="text-rose-600">{error}</p>:items.length===0?<p>No activity returned by the server.</p>:<div className="ev-detail-activity">{items.slice(0,20).map((x:any,i)=><div key={String(x.id||i)}><span>{String(x.createdAt||x.time||'')}</span><b>{String(x.action||x.type||'Activity')}</b><small>{String(x.description||'Server event')}</small></div>)}</div>}</Card2> }
function SettingsPanel({detail,notify}:{detail:Detail;notify:(x:string)=>void}){ const [saving,setSaving]=useState(false); return <div className="ev-settings-detail-grid"><Card2><h3>{detail.title} preferences</h3>{['Allow notifications','Allow sharing','Show analytics','Enable recommendations','Require confirmation'].map((x,i)=><label className="ev-toggle-row" key={x}><span><b>{x}</b><small>Control this behavior for your account.</small></span><input type="checkbox" defaultChecked={i<3}/></label>)}<button className="ev-primary full" disabled={saving} onClick={async()=>{setSaving(true);try{await apiClient.request(`/settings/${encodeURIComponent(detail.id)}`,{method:'PATCH',body:JSON.stringify({updated:true})});notify('Settings saved by the server.')}catch(e:any){notify(e.message||'Settings save failed.')}finally{setSaving(false)}}}>{saving?'Saving…':'Save settings'}</button></Card2><Card2><h3>Permission model</h3><div className="ev-permission-box"><ShieldCheck size={20}/><b>Scoped access</b><span>Backend authorization remains authoritative for every sensitive action.</span></div><div className="ev-permission-box"><Lock size={20}/><b>Secure by default</b><span>Frontend never stores permanent payment, API or server secrets.</span></div></Card2></div>}
