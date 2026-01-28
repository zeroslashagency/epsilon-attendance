export type NetworkStatus = {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'none';
  signalStrength: number; // 0-4 or 0-100
  ssid?: string;
  ipAddress?: string;
  dataUsage: {
    sent: number; // in bytes
    received: number; // in bytes
  };
};

export type BluetoothStatus = {
  isEnabled: boolean;
  connectedDevices: Array<{
    id: string;
    name: string;
    type: string;
    batteryLevel?: number;
  }>;
};

export type DeviceEvent = {
  id: string;
  timestamp: string;
  type: 'system' | 'network' | 'bluetooth' | 'security';
  message: string;
  severity: 'info' | 'warning' | 'error';
};
