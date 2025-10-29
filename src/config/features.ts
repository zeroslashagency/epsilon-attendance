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
    enabled: true, // Overview is now enabled
    name: 'Overview',
    path: '/overview',
    description: 'Advanced dashboard with comprehensive analytics'
  },
  calendar: {
    enabled: true, // Calendar enabled with real data
    name: 'Calendar',
    path: '/calendar',
    description: 'Interactive calendar view with detailed attendance patterns'
  },
  reports: {
    enabled: true, // Reports enabled
    name: 'Reports',
    path: '/reports',
    description: 'Comprehensive reporting system with custom filters'
  },
  callHistory: {
    enabled: true, // Call History enabled
    name: 'Call History',
    path: '/call-history',
    description: 'View and manage call logs and history'
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


