import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private ipcRenderer: any;

  constructor() {
    // Verificamos de forma segura si estamos ejecutándonos dentro de Electron
    if (this.isElectron) {
      this.ipcRenderer = (window as any).require('electron').ipcRenderer;
      console.log('🔌 [ElectronService] Puente nativo IPC inicializado correctamente.');
    }
  }

  get isElectron(): boolean {
    return !!(window && (window as any).process && (window as any).process.type);
  }

  // Método genérico para enviar una orden a Node.js y esperar su respuesta
  async invoke<T>(channel: string, ...args: any[]): Promise<T> {
    if (this.isElectron && this.ipcRenderer) {
      return await this.ipcRenderer.invoke(channel, ...args);
    }
    console.warn(`⚠️ [ElectronService] Orden '${channel}' ignorada (ejecución web estándar).`);
    throw new Error('Entorno no nativo');
  }
}