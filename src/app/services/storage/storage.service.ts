import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;
  private storage = inject(Storage);

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    if (this._storage) {
      return;
    }

    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async get(key: string): Promise<any> {
    await this.init();

    return await this._storage?.get(key);
  }

  public async set(key: string, value: any): Promise<void> {
    await this.init();

    return await this._storage?.set(key, value);
  }

  public async remove(key: string): Promise<void> {
    await this.init();

    return await this._storage?.remove(key);
  }

  public async removeAll(): Promise<void> {
    await this.init();

    if (confirm('Desea limpiar el storage?')) {
      return await this._storage
        ?.clear()
        .then(() => alert('elementos eliminados'))
        .catch((e) => {
          throw new Error(e);
        });
    } else {
      return;
    }
  }
}
