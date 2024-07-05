
# Bluetooth Scanner App

This is a React Native app built using Expo that scans for nearby BLE devices. The app is designed to work on both Android and iOS devices.

## Features

- Scans for nearby BLE peripherals and displays their names and RSSI values.
- Updates the list of BLE devices every 5 seconds.
- Provides a button to rescan and discover BLE devices.
- Handles scan timeouts and errors gracefully.
- Shows the Bluetooth state in the footer.

## Notes

•  **Real Device Testing:** It is essential to test the app on real devices. Bluetooth peripherals will not be discoverable in simulators or emulators, and the libraries may return errors or function incorrectly. The BLE functionalities require actual hardware to interact with, as the virtual environments do not provide the necessary Bluetooth capabilities. For more information, refer to the [react-native-ble-plx documentation](https://github.com/dotintent/react-native-ble-plx).


## Dependencies

- [react-native](https://github.com/facebook/react-native) and [expo](https://github.com/expo/expo): Core frameworks for building and deploying the app.
- [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx): Cross-platform library to interact with BLE devices.
- [mobx](https://github.com/mobxjs/mobx) and [mobx-react-lite](https://github.com/mobxjs/mobx): State management and relevant React bindings.


## Prerequisites

- Node.js (>= 18.x)
- Expo CLI (>= 6.3) (`npm install -g expo-cli`)
- Xcode (for iOS development)
- Android Studio (for Android development)

## Getting Started

### Installation

1. **Clone the Repository:**

   ```bash
   git clone git@github.com:aroth/BluetoothScanner.git
   cd BluetoothScanner
	
2. **Install Expo CLI (if not already installed):**

	```bash
	npm install -g expo-cli

3. **Install Dependencies**

	```bash
	npm install	
	
4. **Prebuild the Project**
	```bash
	npx expo prebuild
	 
6. **Running on Device**

	```bash
	npx expo run:ios --device
	npx expo run:android --device
   

### Future Development

- Add ability to sort table by device name or RSSI
- Add ability to tap a device to navigate to a screen with full device details
- Handle additional states from `react-native-ble-plx` with custom logic to present/handle each. 


### Native Bridge Development

The current library being used, `react-native-ble-plx`, is popular with over 3000 stars on GitHub, well-supported, and cross-platform with over 5 years of active development. This library is robust and sufficient for most BLE operations. However, there may be scenarios where developing custom native bridge code becomes necessary because the library currently does not support:

- Bluetooth Classic devices.
- Communicating between phones using BLE (Peripheral support).
- Bonding peripherals.

If these features are required, native development will be necessary. Additionally, for scenarios where maximum performance is crucial, such as reducing latency or integrating with specific hardware (inside or outside the scope of Bluetooth), custom native modules can be implemented.

For detailed guides on creating native modules, refer to the official React Native documentation:

- [React Native Native Modules for Android](https://reactnative.dev/docs/native-modules-android)
- [React Native Native Modules for iOS](https://reactnative.dev/docs/native-modules-ios)` 

