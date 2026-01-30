declare global {
  interface Window {
    electron: {
      close: () => void;
      minimize: () => void;
      toggleFullscreen: () => void;
    };
  }
}

export {};