import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {
  constructor() {}

  async prepare() {
    await BarcodeScanner.prepare();
  }

  async startScan() {
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      return result.content;
    }
    return null;
  }

  async stopScan() {
    await BarcodeScanner.stopScan();
  }

  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location', error);
      return null;
    }
  }
}
