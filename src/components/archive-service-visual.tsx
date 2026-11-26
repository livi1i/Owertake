import {useId,useRef} from 'react';
import {motion,useInView} from 'framer-motion';

type ServiceKind='sites'|'bots'|'crm'|'ai'|'integrations';

const routes:Record<ServiceKind,string>={
  sites:'M178 192C209 176 219 153 240 158S271 173 306 139 351 117 400 112',
  bots:'M109 177C132 217 239 223 318 155S452 99 495 115',
  crm:'M107 164H490',
  ai:'M171 143C220 134 231 175 277 151S308 136 341 145',
  integrations:'M180 144C219 120 249 175 290 150S342 125 391 142',
};

// Bounds of the moving objects inside each isolated glass artwork.
const artworkLayers:Record<ServiceKind,readonly {outline:string;dx:number;dy:number}[]>={
  sites:[{outline:'M401 159 Q405 153 431 150 L538 142 Q554 143 555 166 L556 239 Q557 253 538 255 L421 274 Q397 277 397 254 L397 185 Q395 170 401 159Z',dx:7,dy:-4}],
  bots:[
    {outline:'M72 154 Q77 130 101 130 L218 149 Q236 151 234 169 L223 203 Q219 219 199 214 L82 196 Q67 192 70 171Z',dx:-8,dy:3},
    {outline:'M380 65 L505 48 Q526 46 529 63 L534 99 Q536 113 515 118 L400 126 Q384 127 382 114 L376 81 Q372 70 380 65Z',dx:9,dy:-6},
  ],
  crm:[{outline:'M174 163 L316 130 Q330 129 336 145 L347 179 Q350 195 333 202 L194 237 Q174 242 169 225 L159 186 Q155 169 174 163Z',dx:4,dy:-10}],
  ai:[{outline:'M13 109 Q12 96 24 93 L91 81 L137 113 L144 193 Q145 202 133 207 L37 225 Q24 229 22 217Z',dx:-6,dy:-6}],
  integrations:[
    {outline:'M0 0H224V300H0Z',dx:-5,dy:0},
    {outline:'M376 0H600V300H376Z',dx:5,dy:0},
  ],
};

export function ArchiveServiceVisual({kind,src,preview,paused}:{
  kind:ServiceKind;src:string;preview:string;paused:boolean;
}) {
  const ref=useRef<HTMLDivElement>(null);
  const visible=useInView(ref,{amount:.24});
  const playing=visible&&!paused;
  const flow=routes[kind];
  const maskId=useId();
  const layers=artworkLayers[kind];
  return <div ref={ref} className="archive-service-visual" data-art={kind} aria-hidden="true">
    <img src={preview} srcSet={`${preview} 1280w, ${src} 3840w`}
      sizes="(max-width: 670px) 48vw, 45vw" width="1280" height="640" alt="" loading="lazy" decoding="async"/>
    <svg viewBox="0 0 600 300" className="archive-service-effects" preserveAspectRatio="xMidYMid meet">
      {playing && <>
        <defs>{layers.map(({outline},index)=><clipPath id={maskId+index} key={outline}><path d={outline}/></clipPath>)}</defs>
        {layers.map(({outline,dx,dy},index)=><motion.g key={outline}
          initial={{x:0,y:0,opacity:0}}
          animate={{x:[0,dx,dx,0],y:[0,dy,dy,0],opacity:[0,1,1,0]}}
          transition={{duration:3.3,delay:index*.48,repeat:Infinity,repeatDelay:1.55,times:[0,.29,.63,1],ease:'easeInOut'}}>
          <image href={preview} width="600" height="300" clipPath={`url(#${maskId+index})`}/>
        </motion.g>)}
      </>}
      {kind==='sites' && playing && <motion.path d={flow} className="archive-service-trace"
        initial={{pathLength:0,opacity:0}} animate={{pathLength:[0,1,1],opacity:[0,.8,0]}}
        transition={{duration:4.2,repeat:Infinity,repeatDelay:.6,times:[0,.52,1]}}/>}
      {(kind==='ai'||kind==='integrations') && playing && [0,1].map(index=>
        <motion.circle key={index} r="4" className="archive-service-pulse" style={{offsetPath:`path('${flow}')`}}
          animate={{offsetDistance:['0%','100%'],opacity:[0,1,1,0]}}
          transition={{duration:2.4,delay:index*.63,repeat:Infinity,repeatDelay:.9}}/>)}
    </svg>
  </div>;
}
