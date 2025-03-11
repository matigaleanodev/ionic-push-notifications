import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  private _storage = inject(StorageService);

  async initialize() {
    if (Capacitor.getPlatform() !== 'web') {
      await this.registerPush();
      await this.getDeliveredNotifications();
    }
  }

  async registerPush() {
    let permStatus = await PushNotifications.checkPermissions();
    console.log(permStatus);
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    } else {
      await this.addListeners();
    }
    await PushNotifications.register();
  }

  async getDeliveredNotifications() {
    const notifications = await PushNotifications.getDeliveredNotifications();
    console.log('Delivered notifications:', notifications);
  }

  async addListeners() {
    await PushNotifications.addListener('registration', async (token) => {
      const storedToken = await this._storage.get('FCM_TOKEN');

      if (storedToken !== token.value) {
        this._storage.set('FCM_TOKEN', token.value);
        //TODO: aca hay que enviar el token al back
        console.info('New Registration token: ', token.value);
      } else {
        console.info('Existing token is still valid:', token.value);
      }
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Registration error: ', err.error);
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push notification received: ', notification);
      }
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log(
          'Push notification action performed',
          notification.actionId,
          notification.inputValue
        );
      }
    );
  }

  async enableNotifications() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        await this.registerPush();
        console.info('Notificaciones push activadas');
      } else {
        console.warn('El usuario sigue denegando los permisos');
      }
    } else {
      console.info('Las notificaciones push ya están activadas');
    }
  }
}
