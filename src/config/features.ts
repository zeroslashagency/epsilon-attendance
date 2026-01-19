// Feature flags configuration
// Set enabled: true to activate features when ready

export const FEATURE_FLAGS = {
  attendance: {
    enabled: true,
    name: 'Attendance',
    path: '/',
    description: 'Real-time attendance tracking and dashboard'
  },
  overview: {
    enabled: false, // Moved to Attendance page as tab
    name: 'Overview',
    path: '/overview',
    description: 'Advanced dashboard with comprehensive analytics'
  },
  calendar: {
    enabled: false, // Moved to Attendance page as tab
    name: 'Calendar',
    path: '/calendar',
    description: 'Interactive calendar view with detailed attendance patterns'
  },
  operations: {
    enabled: true, // New Operations section with FIR, Reports, History
    name: 'Operations',
    path: '/operations',
    description: 'FIR Dashboard, Reports, and Analytics'
  },
  reports: {
    enabled: false, // Moved inside Operations
    name: 'Reports',
    path: '/reports',
    description: 'Comprehensive reporting system with custom filters'
  },
  callHistory: {
    enabled: false, // Moved inside Operations as History
    name: 'History',
    path: '/history',
    description: 'View and manage call logs and history'
  },
  fir: {
    enabled: false, // Moved inside Operations
    name: 'FIR',
    path: '/fir',
    description: 'Mistake Reporting System'
  },
  callRecordings: {
    enabled: true,
    name: 'Calls',
    path: '/call-recordings',
    description: 'Call recordings dashboard with real-time monitoring'
  },
  deviceMonitoring: {
    enabled: true,
    name: 'Device Monitoring',
    path: '/device-monitoring',
    description: 'Monitor screen time, app usage, network, and Bluetooth activity'
  }
} as const;

// Helper function to get enabled features
export function getEnabledFeatures() {
  return Object.values(FEATURE_FLAGS).filter(feature => feature.enabled);
}

// Helper function to check if a feature is enabled
export function isFeatureEnabled(featureName: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[featureName].enabled;
}

// Helper function to get all navigation tabs with enabled status
export function getNavigationTabs() {
  return Object.values(FEATURE_FLAGS).map(feature => ({
    id: feature.name.toLowerCase(),
    label: feature.name,
    path: feature.path,
    enabled: feature.enabled,
    description: feature.description
  }));
}
