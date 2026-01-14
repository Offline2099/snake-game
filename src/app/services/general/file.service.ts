import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  useFileInputById(id: string): void {
    this.renderer.selectRootElement(`#${id}`).click();
  }

  readUserJSON<T extends {}>(obj: T, event: Event, callback: (obj: T) => void): void {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      Object.assign(obj, JSON.parse(reader.result as string));
      callback(obj);
    }
    reader.readAsText(files[0]);
  }

  downloadAsJSON<T>(obj : T, fileName: string, container: HTMLElement): void {
    const blob: Blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const url: string = window.URL.createObjectURL(blob);
    this.saveFile(url, fileName, 'json', container);
  }

  private saveFile(url: string, name: string, extension: string, container: HTMLElement): void {
    const a: HTMLAnchorElement = this.renderer.createElement('a');
    this.renderer.setAttribute(a, 'href', url);
    this.renderer.setAttribute(a, 'download', `${name}.${extension}`);
    this.renderer.appendChild(container, a);
    a.click();
    this.renderer.removeChild(container, a);
    window.URL.revokeObjectURL(url);
  }

}