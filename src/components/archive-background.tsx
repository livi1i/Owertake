import hero from '../assets/home-backgrounds/regenerated/01-hero.png';
import company from '../assets/home-backgrounds/regenerated/02-company.png';
import services from '../assets/home-backgrounds/regenerated/03-services.png';
import idea from '../assets/home-backgrounds/regenerated/04-idea.png';
import process from '../assets/home-backgrounds/regenerated/05-process.png';
import calculator from '../assets/home-backgrounds/regenerated/06-calculator.png';
import portfolio from '../assets/home-backgrounds/07-portfolio.png';
import contact from '../assets/home-backgrounds/regenerated/08-contact.png';
import footer from '../assets/home-backgrounds/regenerated/09-footer.png';
import './archive-background.css';
const backgrounds={hero,company,services,idea,process,calculator,portfolio,contact,footer};
const sizes={"hero":[1586,992],"company":[1672,941],"services":[1448,1086],"idea":[2172,724],"process":[1774,887],"calculator":[1774,887],"portfolio":[1024,1536],"contact":[1586,992],"footer":[2172,724]};
type Background=keyof typeof backgrounds;
export function ArchiveBackground({variant}:{variant:Background}) {
  const [width,height]=sizes[variant];
  return <img className="archive-background" data-variant={variant}
    src={backgrounds[variant]} width={width} height={height}
    alt="" aria-hidden="true" draggable="false" decoding="async"
    loading={variant==='hero'?'eager':'lazy'} fetchPriority={variant==='hero'?'high':undefined}/>;
}
