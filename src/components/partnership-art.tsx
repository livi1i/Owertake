/// <reference types="vite/client" />
import togetherImage from '../assets/studio-partnership.webp?inline';
import {Reveal} from './reveal';

export function PartnershipArt({compact=false}:{compact?:boolean}) {
  return <Reveal className={'studio-about-photo'+(compact?' about-hero-photo':'')}>
    <img src={togetherImage} alt="" width={900} height={600} loading={compact?'eager':'lazy'} decoding="async"/>
    <span className="studio-about-glow" aria-hidden="true"/>
    <span className="studio-about-reflection" aria-hidden="true"/>
  </Reveal>;
}
