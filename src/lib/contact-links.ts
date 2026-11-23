export function contactEmail(value:string){const email=value.trim();return /^[^\s<>;,]+@[^\s<>;,]+\.[^\s<>;,]+$/.test(email)?'mailto:'+encodeURIComponent(email):null;}
export function contactTelegram(value:string){let name=value.trim();if(name.startsWith('https://t.me/'))name=name.slice(13);if(name.startsWith('@'))name=name.slice(1);return /^[A-Za-z0-9_]{1,64}$/.test(name)?'https://t.me/'+name:null;}

export function telegramContacts(contacts:Record<string,string>) {
  const channels=new Map<string,{url:string;label:string}>();
  for (const value of [contacts.telegram,contacts.telegram2]) {
    const url=contactTelegram(value || '');
    if (url) channels.set(url.toLowerCase(),{url,label:'@'+new URL(url).pathname.slice(1)});
  }
  return [...channels.values()];
}
