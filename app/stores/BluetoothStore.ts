import { makeAutoObservable } from "mobx";
import { BleManager, Device, State } from "react-native-ble-plx";
import { Platform, PermissionsAndroid } from "react-native";

class BluetoothStore {
  manager: BleManager;
  devices: Map<string, Device> = new Map();
  deviceTimestamps: Map<string, number> = new Map();
  error: string | null = null;
  isScanning: boolean = false;
  managerState: string | null = null;
  rescanInterval = 5000;
  scanIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this);
    this.manager = new BleManager({
      restoreStateIdentifier: "BluetoothRestoreIdentifier",
      restoreStateFunction: (restoredState) => {
        if (restoredState) {
          console.log("Restored state:", restoredState);
        }
      }
    });

    this.manager.onStateChange((state) => {
      this.setManagerState(state);
      if (state === State.PoweredOn) {
        this.scanAndConnect(true);
      } else if (state === State.Unsupported) {
        this.setError("Bluetooth is unsupported on this device.");
      }
    }, true);
  }

  startRescan() {
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId);
    }
    this.scanIntervalId = setInterval(() => {
      this.scanAndConnect();
    }, this.rescanInterval);
  }

  setManagerState(state: string) {
    this.managerState = state;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setIsScanning(status: boolean) {
    this.isScanning = status;
  }

  addOrUpdateDevice(device: Device) {
    if (device.name) {
      this.devices.set(device.id, device);
      this.deviceTimestamps.set(device.id, Date.now());
    }
  }

  get sortedDevices() {
    return Array.from(this.devices.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  removeStaleDevices() {
    const currentTime = Date.now();
    const devicesToRemove: string[] = [];
    this.deviceTimestamps.forEach((timestamp, id) => {
      if (currentTime - timestamp > this.rescanInterval) {
        devicesToRemove.push(id);
      }
    });
    devicesToRemove.forEach((id) => {
      this.devices.delete(id);
      this.deviceTimestamps.delete(id);
    });
  }

  clearDevices() {
    this.devices.clear();
    this.deviceTimestamps.clear();
  }

  async requestBluetoothPermission(): Promise<boolean> {
    if (Platform.OS === "ios") {
      return true;
    }
    if (
      Platform.OS === "android" &&
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ) {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      if (
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      ) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ]);

        return (
          result["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }

    this.setError("Permissions have not been granted.");
    return false;
  }

  scanAndConnect(forceScan = false) {
    if (this.isScanning && !forceScan) {
      return;
    }

    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.setIsScanning(false);
    }

    this.setError(null);
    this.setIsScanning(true);

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(`Scan error: ${error.message}`);
        return;
      }

      if (device && device.name) {
        this.addOrUpdateDevice(device);
      }
    });

    setTimeout(() => {
      if (this.isScanning) {
        this.manager.stopDeviceScan();
        this.setIsScanning(false);
        this.removeStaleDevices();
      }
    }, this.rescanInterval);

    if (!this.scanIntervalId) {
      this.startRescan();
    }
  }

  rescan() {
    this.clearDevices();
    this.scanAndConnect(true);
  }
}

const bluetoothStore = new BluetoothStore();
export default bluetoothStore;
