import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  useFileInputById(id: string): void {
    const fileInput: HTMLElement | null = document.getElementById(id);
    if (!fileInput) return;
    fileInput.click();
  }

  // readUserJSON<T extends {}>(obj: T, event: Event): void {
  //   const files: FileList | null = (event.target as HTMLInputElement).files;
  //   if (!files || !files[0]) return;
  //   const reader = new FileReader();
  //   reader.onload = () => Object.assign(obj, JSON.parse(reader.result as string));
  //   reader.readAsText(files[0]);
  // }

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

  downloadAsJSON<T>(obj : T, fileName: string): void {
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const url: string = window.URL.createObjectURL(blob);
    this.saveFile(url, `${fileName}.json`);
  }

  private saveFile(url: string, fileNameWithExtention: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileNameWithExtention;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

}