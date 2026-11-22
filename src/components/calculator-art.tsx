/// <reference types="vite/client" />
import calculator from '../assets/studio-calculator.webp?inline';

export function CalculatorArt() {
  return <span className="calculator-art" aria-hidden="true"><img src={calculator} alt="" decoding="async"/></span>;
}
