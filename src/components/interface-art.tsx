/// <reference types="vite/client" />
import image from '../assets/studio-interface-stack.webp?inline';

export function InterfaceArt({className=''}:{className?:string}) {
  return <div className={'interface-art '+className} aria-hidden="true">
    <span className="interface-art-orbit"/>
    <img src={image} alt="" width={680} height={510} decoding="async"/>
  </div>;
}
