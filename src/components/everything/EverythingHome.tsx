import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Home, PlaySquare, Radio, Users, MessageCircle, ShoppingBag, CalendarDays, Video, Wallet, Coins, Crown, Palette, Building2, Code2, Settings, ShieldCheck, Store, Search, CircleHelp, Plus, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { apiClient } from '../../lib/api/client';

type Section = 'home'|'reels'|'videos'|'live'|'communities'|'messages'|'store'|'events'|'wallet'|'coins'|'subscriptions'|'seller'|'creator'|'business'|'developer'|'community-control'|'notifications'|'profile'|'settings'|'details';

const nav: {id:Section;label:string;icon:React.ElementType}[] = [
  {id:'home',label:'Home',icon:Home},{id:'reels',label:'Reels',icon:PlaySquare},{id:'videos',label:'Videos',icon:Video},{id:'live',label:'Live',icon:Radio},{id:'communities',label:'Communities',icon:Users},{id:'messages',label:'Messages',icon:MessageCircle},{id:'store',label:'Store',icon:Store},{id:'events',label:'Events',icon:CalendarDays},
];
const secondary: {id:Section;label:string;icon:React.ElementType}[] = [
  {id:'wallet',label:'Wallet',icon:Wallet},{id:'coins',label:'Everything Coins',icon:Coins},{id:'subscriptions',label:'Subscription',icon:Crown},{id:'creator',label:'Creator Studio',icon:Palette},{id:'business',label:'Business',icon:Building2},{id:'seller',label:'Seller Center',icon:Store},{id:'community-control',label:'Community Control',icon:ShieldCheck},{id:'developer',label:'Developer',icon:Code2},
];

const routeMap: Record<Section,string> = {home:'/home',reels:'/reels',videos:'/videos',live:'/live',communities:'/communities',messages:'/messages',store:'/store',events:'/events',wallet:'/wallet',coins:'/coins',subscriptions:'/subscriptions',seller:'/seller',creator:'/creator',business:'/business',developer:'/developer','community-control':'/community-control',notifications:'/notifications',profile:'/profile',settings:'/settings',details:'/details'};
const resourceMap: Partial<Record<Section,string>> = {home:'/feed',reels:'/reels',videos:'/videos',live:'/live',store:'/products',events:'/events',wallet:'/wallet',coins:'/coins/balance',subscriptions:'/subscriptions',seller:'/seller/dashboard',creator:'/creator/dashboard',business:'/business',developer:'/developer/apps','community-control':'/communities/managed'};

function ServerSection({section}:{section:Section}) {
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const [data,setData]=useState<unknown>(null);
  const endpoint=resourceMap[section];
  useEffect(()=>{
    let cancelled=false;
    if(!endpoint){setState('ready');setData(null);return;}
    setState('loading');
    apiClient.request<unknown>(endpoint).then(r=>{if(!cancelled){setData(r.data ?? null);setState('ready')}}).catch(()=>{if(!cancelled)setState('error')});
    return()=>{cancelled=true};
  },[endpoint]);
  if(state==='loading') return <div className="ev-card ev-server-state"><Loader2 className="animate-spin" size={22}/><span>Loading {section} from Everything IOP server…</span></div>;
  if(state==='error') return <div className="ev-card ev-server-state error"><span>Everything IOP server did not return {section} data.</span><small>Nothing has been substituted with demo data.</small></div>;
  const items=Array.isArray(data)?data: data && typeof data==='object' ? Object.entries(data as Record<string,unknown>) : [];
  return <div className="ev-server-data"><div className="ev-card"><span className="ev-eyebrow">SERVER DATA</span><h2>{section === 'home' ? 'Your Everything IOP feed' : `${section[0].toUpperCase()}${section.slice(1)}`}</h2><p>Live data returned by the authenticated Everything Node/API boundary.</p>{items.length===0?<div className="ev-empty-state">No records were returned by the server yet.</div>:<div className="ev-server-list">{items.slice(0,20).map((item:any,i)=>{const value=Array.isArray(data)?item:item[1];return <div key={String(item?.id||item?.key||i)}><b>{String(item?.name||item?.title||item?.username||item?.id||item?.key||`Record ${i+1}`)}</b><span>{typeof value==='string'||typeof value==='number'?String(value):'Server record'}</span></div>})}</div>}</div></div>;
}

export const EverythingHome: React.FC = () => {
  const {currentRoute,navigate,currentUser,notifications,unreadMessagesCount,unreadNotificationsCount,serverStatus} = useAppStore();
  const routeToSection=useMemo(()=>Object.fromEntries(Object.entries(routeMap).map(([k,v])=>[v,k as Section])) as Record<string,Section>,[]);
  const [section,setSection]=useState<Section>(routeToSection[currentRoute]||'home');
  const [search,setSearch]=useState('');
  useEffect(()=>{setSection(routeToSection[currentRoute]||'home')},[currentRoute,routeToSection]);
  const go=(next:Section)=>{setSection(next);navigate(routeMap[next])};
  return <div className="everything-app">
    <header className="ev-topbar">
      <button className="ev-brand" onClick={()=>go('home')} aria-label="Go to Everything IOP home"><div className="ev-brand-mark">E</div><div><b>Everything IOP</b><span>one identity. every surface.</span></div></button>
      <div className="ev-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&search.trim())navigate('/search',{q:search.trim()})}} placeholder="Search Everything IOP…"/><kbd>⌘ K</kbd></div>
      <div className="ev-top-actions"><button className="ev-icon-btn" onClick={()=>go('notifications')} aria-label="Notifications"><Bell size={20}/>{unreadNotificationsCount>0&&<i>{unreadNotificationsCount}</i>}</button><button className="ev-avatar" onClick={()=>go('profile')} aria-label="Profile">{(currentUser?.fullName||'U').slice(0,2).toUpperCase()}</button></div>
    </header>
    <aside className="ev-sidebar">
      <div className="ev-side-group"><p>EVERYTHING</p>{nav.map(item=><button key={item.id} className={section===item.id?'active':''} onClick={()=>go(item.id)}><item.icon size={19}/><span>{item.label}</span>{item.id==='messages'&&unreadMessagesCount>0&&<em>{unreadMessagesCount}</em>}</button>)}</div>
      <div className="ev-side-group"><p>WORKSPACE</p>{secondary.map(item=><button key={item.id} className={section===item.id?'active':''} onClick={()=>go(item.id)}><item.icon size={19}/><span>{item.label}</span></button>)}</div>
      <div className="ev-side-group ev-side-bottom"><button onClick={()=>go('settings')}><Settings size={19}/><span>Settings</span></button><button onClick={()=>navigate('/help')}><CircleHelp size={19}/><span>Help & Support</span></button></div>
      <div className="ev-side-profile"><div className="ev-avatar">{(currentUser?.fullName||'U').slice(0,2).toUpperCase()}</div><div><b>{currentUser?.fullName||'Account'}</b><span>@{currentUser?.username||'account'}</span></div></div>
    </aside>
    <main className="ev-main">
      <div className="ev-mobile-title"><span>{section}</span><button onClick={()=>go('notifications')} aria-label="Notifications"><Bell size={19}/></button></div>
      <div className="ev-page-head"><div><span className="ev-eyebrow">EVERYTHING IOP</span><h1>{section==='home'?'Everything IOP':section[0].toUpperCase()+section.slice(1)}</h1><p>{serverStatus==='ok'?'Connected to the Everything IOP server.':'Server connection is required; no local/demo data is shown.'}</p></div>{section==='home'&&<button className="ev-primary" onClick={()=>navigate('/create')}><Plus size={17}/> Create</button>}</div>
      {section==='communities'?<div className="ev-card ev-server-state"><Users size={22}/><span>Communities are served by the real Community OS.</span><button className="ev-primary" onClick={()=>navigate('/communities')}>Open Communities <ArrowUpRight size={15}/></button></div>:
       section==='messages'?<div className="ev-card ev-server-state"><MessageCircle size={22}/><span>Messages are served by the real messaging API.</span><button className="ev-primary" onClick={()=>navigate('/messages')}>Open Messages <ArrowUpRight size={15}/></button></div>:
       section==='notifications'?<div className="ev-card ev-server-state"><Bell size={22}/><span>{notifications.length} server notifications loaded.</span><button className="ev-primary" onClick={()=>navigate('/notifications')}>Open Notifications <ArrowUpRight size={15}/></button></div>:
       section==='profile'?<div className="ev-card ev-server-state"><span>Authenticated profile data is server-backed.</span><button className="ev-primary" onClick={()=>navigate('/profile')}>Open Profile <ArrowUpRight size={15}/></button></div>:
       <ServerSection section={section}/>} 
    </main>
  </div>;
};

export default EverythingHome;
