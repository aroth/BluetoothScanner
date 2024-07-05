import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Device } from "react-native-ble-plx";
import bluetoothStore from "../stores/BluetoothStore";

const HomeScreen = observer(() => {
  useEffect(() => {
    const initializeBluetooth = async () => {
      const granted = await bluetoothStore.requestBluetoothPermission();
      if (granted) {
        bluetoothStore.startRescan();
      }
    };

    initializeBluetooth();

    return () => {
      if (bluetoothStore.scanIntervalId) {
        clearInterval(bluetoothStore.scanIntervalId);
        bluetoothStore.scanIntervalId = null;
      }
    };
  }, []);

  const ScreenHeader = () => (
    <View>
      <Text style={styles.appTitle}>BTLE App</Text>
      <View style={[styles.headerContainer, styles.rowSpaceBetween]}>
        <Text style={styles.headerText}>Devices</Text>
        <TouchableOpacity
          onPress={() => bluetoothStore.rescan()}
          style={styles.rescanButton}
        >
          <Text style={styles.rescanButtonText}>Rescan</Text>
        </TouchableOpacity>
      </View>
      {bluetoothStore.error && (
        <Text style={styles.errorText}>{`Error: ${bluetoothStore.error}`}</Text>
      )}
    </View>
  );

  const ListHeader = () => (
    <View style={[styles.listHeaderContainer, styles.rowSpaceBetween]}>
      <Text style={styles.listHeaderTextLeft}>Name</Text>
      <Text style={styles.listHeaderTextRight}>RSSI</Text>
    </View>
  );

  const DeviceRow = ({ item }: { item: Device }) => (
    <View style={[styles.deviceContainer, styles.rowSpaceBetween]}>
      <Text style={styles.deviceName}>{item.name || "Unknown"}</Text>
      <Text style={styles.deviceRSSI}>{item.rssi}</Text>
    </View>
  );

  const EmptyList = () => {
    if (bluetoothStore.error) {
      return <Text></Text>;
    } else if (bluetoothStore.isScanning) {
      return <Text style={styles.listNoticeText}>Rescanning...</Text>;
    } else if (bluetoothStore.sortedDevices.length === 0) {
      return <Text style={styles.listNoticeText}>No devices found</Text>;
    }
    return null;
  };

  const ScreenFooter = () => (
    <View style={[styles.footerContainer, styles.rowSpaceBetween]}>
      <Text style={styles.footerTextLeft}>
        {bluetoothStore.managerState === "PoweredOn" ? (
          <>
            <Text>🟢</Text> Powered On
          </>
        ) : bluetoothStore.managerState === "Unsupported" ||
          bluetoothStore.error ? (
          <>
            <Text>🔴</Text>{" "}
            {bluetoothStore.managerState === "Unsupported"
              ? "Unsupported"
              : "Error"}
          </>
        ) : (
          <>
            <Text>🔴</Text> Unknown State
          </>
        )}
      </Text>
      <View style={styles.footerRightContainer}>
        {bluetoothStore.isScanning && (
          <ActivityIndicator
            style={styles.footerActivityIndicator}
            color="turquoise"
          />
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader />
      <FlatList
        data={bluetoothStore.sortedDevices}
        keyExtractor={(item) => item.id}
        renderItem={DeviceRow}
        ListHeaderComponent={ListHeader}
        stickyHeaderIndices={[0]}
        ListEmptyComponent={EmptyList}
        style={styles.list}
      />
      <ScreenFooter />
    </SafeAreaView>
  );
});

const commonTextStyles = {
  fontSize: 18,
  fontWeight: "bold"
};

const commonContainerStyles = {
  padding: 10,
  backgroundColor: "#f8f8f8",
  borderBottomWidth: 1,
  borderBottomColor: "#ccc"
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "turquoise"
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  deviceContainer: {
    ...commonContainerStyles
  },
  deviceName: {
    flex: 1
  },
  deviceRSSI: {
    flex: 1,
    textAlign: "right"
  },
  headerContainer: {
    ...commonContainerStyles,
    backgroundColor: "#f8f8f8"
  },
  headerText: {
    ...commonTextStyles
  },
  listHeaderContainer: {
    ...commonContainerStyles,
    backgroundColor: "#ddd"
  },
  listHeaderTextLeft: {
    ...commonTextStyles,
    flex: 1,
    textAlign: "left"
  },
  listHeaderTextRight: {
    ...commonTextStyles,
    flex: 1,
    textAlign: "right"
  },
  rescanButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  rescanButtonText: {
    color: "#fff",
    fontSize: 16
  },
  list: {
    flex: 1
  },
  listNoticeText: {
    textAlign: "center",
    margin: 20,
    fontSize: 16
  },
  footerContainer: {
    ...commonContainerStyles,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  footerTextLeft: {
    flex: 1,
    textAlign: "left",
    fontSize: 16
  },
  footerRightContainer: {
    flex: 1,
    alignItems: "flex-end"
  },
  footerActivityIndicator: {
    textAlign: "right"
  }
});

export default HomeScreen;
