// Type definitions for VANTA.js
interface VantaEffect {
  destroy: () => void;
}

interface VantaHaloOptions {
  el: HTMLElement;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  backgroundColor?: number;
  amplitudeFactor?: number;
  size?: number;
}

interface VantaHalo {
  (options: VantaHaloOptions): VantaEffect;
}

interface VantaAPI {
  HALO: VantaHalo;
}

// Extend the Window interface
declare global {
  interface Window {
    VANTA: VantaAPI;
  }
}

export {};
