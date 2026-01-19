# Product Requirements Document (PRD)
## Epsilon Device Monitoring Module

**Version:** 1.2  
**Created:** January 18, 2026  
**Last Updated:** January 19, 2026  
**Status:** ✅ Implementation Complete - Phase 4 (Enhanced Monitoring & Instant Sync)

---

## 1. Executive Summary

### 1.1 Overview
The Epsilon Device Monitoring Module extends the existing Epsilon Attendance System to capture comprehensive device usage data from Android mobile devices. The mobile app (Flutter) will collect and transmit device metrics to the backend, which will then be visualized on the web dashboard.

### 1.2 Goal
Enable organizations to monitor employee device usage patterns for productivity insights, security compliance, and resource optimization. The data collected from Android devices will be aggregated and displayed in a new "Device Monitoring" section on the Epsilon web application.

### 1.3 Key Value Propositions
- **Productivity Insights**: Track screen time and app usage to understand work patterns
- **Security Compliance**: Monitor network connections and Bluetooth activity
- **Resource Optimization**: Identify heavy data consumers and optimize mobile plans
- **Remote Workforce Management**: Gain visibility into remote employee device activity

---

## 2. Stakeholders

| Role | Responsibilities |
|------|------------------|
| Product Owner | Define requirements, prioritize features, approve deliverables |
| Development Team | Implement mobile SDK, backend APIs, and web dashboard |
| IT/Security Admin | Configure policies, view monitoring data |
| HR/Operations | Use insights for workforce management |
| Employees | Primary users of the mobile app (data subjects) |

---

## 3. Target Users

### 3.1 Primary Users
- **IT Administrators**: Need to monitor device security compliance
- **Operations Managers**: Track employee productivity and device usage
- **HR Managers**: Workforce analytics and policy compliance

### 3.2 Shared Platform Users
> [!NOTE]
> Both the **Mobile App** (Flutter) and **Web Dashboard** (React) are used by the **same users** - employees who are also administrators. This is an admin-focused dashboard where admins can monitor their own and team device usage.

- **Employees/Admins**: View their own device usage data (self-service) + admin capabilities
- **Executive Leadership**: High-level dashboards and reports

---

## 4. Functional Requirements

### 4.1 Mobile App (Android Flutter) - Data Collection

#### 4.1.1 Screen Time Monitoring
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| ST-001 | Track total daily screen time | P0 |
| ST-002 | Track screen unlock count per day | P0 |
| ST-003 | Track screen-on/screen-off timestamps | P1 |
| ST-004 | Track first/last device unlock times | P1 |
| ST-005 | Weekly/Monthly screen time trends | P2 |

#### 4.1.2 App Usage Tracking
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| AU-001 | Track time spent per app (foreground) | P0 |
| AU-002 | Track app launch frequency | P0 |
| AU-003 | Categorize apps (Productivity, Social, Entertainment, etc.) | P1 |
| AU-004 | Track most used apps (top 10) daily | P1 |
| AU-005 | Background app activity tracking | P2 |
| AU-006 | App install/uninstall tracking | P2 |

#### 4.1.3 Network Monitoring

##### WiFi
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| NW-001 | Track WiFi connection status (connected/disconnected) | P0 |
| NW-002 | Log WiFi network names (SSID) connected | P0 |
| NW-003 | Track WiFi data usage (bytes sent/received) | P1 |
| NW-004 | WiFi connection duration per network | P1 |
| NW-005 | WiFi signal strength logging | P2 |

##### Mobile Data
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| MD-001 | Track mobile data usage (total daily) | P0 |
| MD-002 | Track data usage per app | P0 |
| MD-003 | Track mobile network type (4G/5G/LTE) | P1 |
| MD-004 | Data roaming status | P1 |
| MD-005 | SIM operator/carrier info | P2 |

#### 4.1.4 Bluetooth Monitoring
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| BT-001 | Track Bluetooth on/off status | P0 |
| BT-002 | Log connected Bluetooth devices | P0 |
| BT-003 | Track connection duration per device | P1 |
| BT-004 | Device type identification (headphones, speaker, etc.) | P1 |
| BT-005 | Historical Bluetooth connection log | P2 |

#### 4.1.5 Additional Monitoring (Phase 2)
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| AM-001 | Battery level and charging events | P1 |
| AM-002 | GPS/Location tracking (work hours only) | P1 |
| AM-003 | Phone call duration (not content) | P2 |
| AM-004 | SMS count (not content) | P2 |
| AM-005 | Notification count per app | P2 |
| AM-006 | Storage usage | P2 |
| AM-007 | Camera/Microphone access events | P3 |

### 4.2 Mobile App - Prompt System

#### 4.2.1 Notification Prompts
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| NP-001 | Display work-hour reminders (configurable) | P1 |
| NP-002 | Break time suggestions based on screen time | P1 |
| NP-003 | Data usage limit warnings | P1 |
| NP-004 | Low battery alerts during work hours | P2 |
| NP-005 | Excessive social media usage prompts | P2 |

#### 4.2.2 Remote Prompts (from Web Dashboard)
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| RP-001 | Admin can send custom messages to devices | P1 |
| RP-002 | Push notifications for policy reminders | P1 |
| RP-003 | Emergency broadcast messages | P0 |
| RP-004 | Acknowledgement receipts for important messages | P2 |

### 4.3 Backend APIs (Supabase)

#### 4.3.1 Data Ingestion
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| BE-001 | API endpoint for batch uploading device metrics | P0 |
| BE-002 | Real-time sync via Supabase Realtime | P1 |
| BE-003 | Data compression before upload | P1 |
| BE-004 | Offline data queuing and sync | P0 |
| BE-005 | Data deduplication on server | P1 |

#### 4.3.2 Data Storage
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| DS-001 | New PostgreSQL tables for device metrics | P0 |
| DS-002 | Aggregation tables for quick dashboard queries | P1 |
| DS-003 | Data retention policies (configurable) | P1 |
| DS-004 | Data anonymization options | P2 |

### 4.4 Web Dashboard (React/Vite)

#### 4.4.1 Device Monitoring Section
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| WD-001 | New sidebar navigation item "Device Monitoring" | P0 |
| WD-002 | Overview dashboard with key metrics | P0 |
| WD-003 | Screen time visualization (charts) | P0 |
| WD-004 | App usage breakdown (pie chart, bar chart) | P0 |
| WD-005 | Network usage dashboard | P0 |
| WD-006 | Bluetooth activity log | P1 |
| WD-007 | Per-employee device details view | P0 |
| WD-008 | Date range filters | P0 |
| WD-009 | Export data to CSV/Excel | P1 |
| WD-010 | Real-time device status indicators | P1 |

#### 4.4.2 Alerts & Reports
| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| AR-001 | Configure threshold alerts (e.g., >4 hrs social media) | P1 |
| AR-002 | Automated daily/weekly reports | P2 |
| AR-003 | Email notifications for policy violations | P2 |
| AR-004 | Printable PDF reports | P2 |

---

## 5. Database Schema (New Tables)

### 5.1 Device Metrics Table
```sql
CREATE TABLE device_metrics (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employee_master(employee_code),
  device_id TEXT NOT NULL,
  metric_date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- 'screen_time', 'app_usage', 'wifi', 'mobile_data', 'bluetooth'
  metric_data JSONB NOT NULL,
  sync_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_daily_metric UNIQUE (employee_code, device_id, metric_date, metric_type)
);

-- Index for efficient queries
CREATE INDEX idx_device_metrics_employee ON device_metrics(employee_code);
CREATE INDEX idx_device_metrics_date ON device_metrics(metric_date);
CREATE INDEX idx_device_metrics_type ON device_metrics(metric_type);
```

### 5.2 Screen Time Log Table
```sql
CREATE TABLE screen_time_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employee_master(employee_code),
  device_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  total_screen_time_minutes INTEGER DEFAULT 0,
  unlock_count INTEGER DEFAULT 0,
  first_unlock TIMESTAMPTZ,
  last_lock TIMESTAMPTZ,
  screen_events JSONB, -- Array of {event_type: 'on'|'off', timestamp}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 App Usage Table
```sql
CREATE TABLE app_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employee_master(employee_code),
  device_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  package_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  category TEXT, -- 'productivity', 'social', 'entertainment', 'communication', 'utility', 'other'
  foreground_time_minutes INTEGER DEFAULT 0,
  launch_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_app_daily UNIQUE (employee_code, device_id, log_date, package_name)
);

CREATE INDEX idx_app_usage_employee ON app_usage_logs(employee_code);
CREATE INDEX idx_app_usage_date ON app_usage_logs(log_date);
```

### 5.4 Network Logs Table
```sql
CREATE TABLE network_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employee_master(employee_code),
  device_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  connection_type TEXT NOT NULL, -- 'wifi', 'mobile_data'
  network_name TEXT, -- SSID for WiFi, carrier for mobile
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,
  connection_events JSONB, -- Array of connection/disconnection events
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.5 Bluetooth Logs Table
```sql
CREATE TABLE bluetooth_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employee_master(employee_code),
  device_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  device_name TEXT NOT NULL,
  device_mac TEXT,
  device_type TEXT, -- 'audio', 'peripheral', 'computer', 'phone', 'other'
  connection_count INTEGER DEFAULT 0,
  total_connected_minutes INTEGER DEFAULT 0,
  connection_events JSONB, -- Array of connect/disconnect events with timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.6 Push Notifications Table
```sql
CREATE TABLE device_notifications (
  id BIGSERIAL PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employee_master(employee_code),
  device_id TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'reminder', 'alert', 'broadcast', 'policy'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  sent_by TEXT, -- Admin user ID who sent it
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' -- 'pending', 'sent', 'delivered', 'read', 'acknowledged', 'failed'
);
```

---

## 6. Non-Functional Requirements

### 6.1 Performance
| Requirement | Description |
|-------------|-------------|
| NFR-P001 | Mobile data collection must not exceed 5% CPU usage |
| NFR-P002 | Battery consumption < 3% additional drain per day |
| NFR-P003 | Dashboard load time < 2 seconds |
| NFR-P004 | Support for 10,000+ daily metric records per employee |

### 6.2 Security & Privacy
| Requirement | Description |
|-------------|-------------|
| NFR-S001 | All data encrypted in transit (TLS 1.3) |
| NFR-S002 | Data encrypted at rest in Supabase |
| NFR-S003 | Employee consent required before data collection |
| NFR-S004 | GDPR compliance for EU employees |
| NFR-S005 | RLS policies for data access control |
| NFR-S006 | No collection of message content, call audio, or sensitive personal data |

### 6.3 Reliability
| Requirement | Description |
|-------------|-------------|
| NFR-R001 | Offline mode with local caching (up to 7 days) |
| NFR-R002 | Automatic retry on failed syncs |
| NFR-R003 | 99.9% backend uptime |

### 6.4 Scalability
| Requirement | Description |
|-------------|-------------|
| NFR-SC001 | Support up to 5,000 active devices |
| NFR-SC002 | Data partitioning by date for performance |
| NFR-SC003 | Horizontal scaling for API endpoints |

---

## 7. User Stories

### 7.1 Administrator Stories
```
As an IT Admin,
I want to view screen time for all employees
So that I can identify workaholic or disengaged patterns.

As an IT Admin,
I want to see which apps employees use most during work hours
So that I can identify productivity trends.

As an IT Admin,
I want to monitor WiFi networks devices connect to
So that I can ensure security policy compliance.

As an Operations Manager,
I want to send push notifications to employee devices
So that I can broadcast important announcements.
```

### 7.2 Employee Stories
```
As an Employee,
I want to see my own screen time data
So that I can improve my productivity habits.

As an Employee,
I want to receive break reminders
So that I can maintain a healthy work-life balance.

As an Employee,
I want to know what data is being collected
So that I can consent to the monitoring policy.
```

---

## 8. UI/UX Requirements

### 8.1 Mobile App UI Additions

#### 8.1.1 New Screens
1. **Device Monitoring Dashboard** (Self-view)
   - Today's screen time summary
   - Top 5 apps used today
   - Data usage widget
   - Battery status

2. **Monitoring Consent Screen**
   - Clear explanation of data collected
   - Toggle controls for optional categories
   - Privacy policy link
   - Consent button

3. **Notification Center**
   - All messages from admin
   - Acknowledgement buttons
   - Filter by type

#### 8.1.2 Settings Integration
- Add "Device Monitoring" section in Settings
- Toggle for enabling/disabling monitoring (with admin override)
- View sync status and last sync time

### 8.2 Web Dashboard UI

#### 8.2.1 New Navigation Item
Add to sidebar under "Operations":
```
📊 Device Monitoring
   └── Overview
   └── Screen Time
   └── App Usage
   └── Network
   └── Bluetooth
   └── Notifications
```

#### 8.2.2 Dashboard Components
1. **Overview Dashboard**
   - Total active devices card
   - Average screen time (org-wide)
   - Top 10 apps org-wide
   - Data usage summary
   - Alert indicators

2. **Screen Time View**
   - Employee list with screen time bars
   - Drill-down to individual employee
   - Heat map of screen activity by hour
   - Daily/Weekly/Monthly views

3. **App Usage View**
   - Category breakdown pie chart
   - App ranking bar chart
   - Filter by employee, date range, category
   - "Flagged" apps list

4. **Network View**
   - WiFi vs Mobile data split
   - Network names connected
   - Data consumption per employee
   - Unknown network alerts

5. **Bluetooth View**
   - Connected devices list
   - Device types distribution
   - Connection duration analytics

6. **Notifications Panel**
   - Compose new notification
   - Notification history
   - Delivery status tracking
   - Broadcast to all / target specific employees

---

## 9. Integration Points

### 9.1 Existing System Integration
| Component | Integration Type |
|-----------|------------------|
| `AuthProvider` | Use existing auth for API calls |
| `employee_master` | Link device data to employees via `employee_code` |
| `profiles` | Role-based access control |
| Supabase Realtime | Real-time dashboard updates |

### 9.2 External Dependencies
| Dependency | Purpose |
|------------|---------|
| Android UsageStatsManager | App usage data |
| Android ConnectivityManager | Network info |
| Android BluetoothManager | Bluetooth data |
| Flutter packages | `device_info_plus`, `connectivity_plus`, `battery_plus` |

---

## 10. Android Permissions Required

```xml
<!-- AndroidManifest.xml additions -->
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions"/>
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
```

> [!IMPORTANT]
> The `PACKAGE_USAGE_STATS` permission requires user to manually enable in device settings. The app must guide users through this process.

---

## 11. Flutter Packages to Add

```yaml
# pubspec.yaml additions
dependencies:
  # Device monitoring
  device_info_plus: ^10.0.0       # Device info
  app_usage: ^2.0.0               # App usage tracking (Android only)
  connectivity_plus: ^6.0.0       # Network connectivity
  network_info_plus: ^5.0.0       # WiFi info
  flutter_blue_plus: ^1.31.0      # Bluetooth management
  battery_plus: ^6.0.0            # Battery monitoring
  workmanager: ^0.5.0             # Background tasks
  flutter_background_service: ^5.0.5  # Background service
```

---

## 12. Implementation Phases

### Phase 1: Foundation (2 weeks)
- [ ] Database schema creation (all tables)
- [ ] Basic API endpoints for data ingestion
- [ ] Mobile permission handling
- [ ] Core data collection services (screen time, app usage)
- [ ] Consent flow implementation
- [ ] Web: Navigation and empty dashboard shells

### Phase 2: Core Features (3 weeks)
- [ ] Complete screen time tracking
- [ ] Complete app usage tracking
- [ ] Network monitoring (WiFi + Mobile data)
- [ ] Web: Screen time and app usage dashboards
- [ ] Web: Basic filtering and date ranges
- [ ] Offline data caching and sync

### Phase 3: Extended Features (2 weeks)
- [ ] Bluetooth monitoring
- [ ] Push notification system (send from web)
- [ ] Web: Network and Bluetooth views
- [ ] Web: Employee detail pages
- [ ] Real-time dashboard updates

### Phase 4: Analytics & Polish (2 weeks)
- [ ] Alert system and thresholds
- [ ] Export functionality (CSV/Excel)
- [ ] Self-service employee view (mobile)
- [ ] Performance optimization
- [ ] Documentation and user guides

---

## 13. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Data Collection Reliability | >99% sync success rate | Monitor failed syncs |
| Battery Impact | <3% additional drain | User reports, battery stats |
| Dashboard Load Time | <2 seconds | Performance monitoring |
| Feature Adoption | 80% of devices reporting | Active device count |
| User Satisfaction | >4/5 rating | In-app feedback |

---

## 14. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Battery drain complaints | High | Medium | Optimize background services, configurable sync intervals |
| Privacy concerns | High | Medium | Clear consent flow, transparent data policy, minimal data collection |
| Android permission complexity | Medium | High | Step-by-step permission guides, fallback for denied permissions |
| Data storage costs | Medium | Medium | Implement data retention policies, aggregation instead of raw logs |
| Employee resistance | High | Medium | Communicate benefits, optional self-view features, anonymization options |

### 14.1 Samsung/Android 13+ Restricted Settings Handling

> [!WARNING]
> On Android 13+ (API 33+), apps installed via APK sideloading are blocked from granting sensitive permissions like Usage Access due to "Restricted Settings" security feature.

#### Problem
Samsung devices (and stock Android 13+) show:
- "Controlled by restricted setting" on the app's entry in Usage Access settings
- "App was denied access" dialog when attempting to toggle permission

#### Implemented Solution

| Component | Implementation |
|-----------|----------------|
| **Native Detection** | `DeviceMonitoringChannelHandler.kt` → `getDeviceInfo()` detects Samsung, sideloaded apps, Android version |
| **Platform Interface** | `device_monitoring_platform.dart` → `getDeviceInfo()`, `openAppSettings()` |
| **Provider State** | `isSamsungDevice`, `isSideloaded`, `hasRestrictedSettingsRisk` |
| **Permission UI** | Orange warning banner with Samsung-specific step-by-step instructions |

#### User Flow (Sideloaded APK)
1. App detects sideloaded installation on Android 13+
2. Permission screen shows warning: "Samsung Restricted Settings"
3. User taps "Open App Settings" button
4. User scrolls to "Allow restricted settings" and enables it
5. User returns and taps "Open Settings" for Usage Access
6. User enables Usage Access for Epsilon

---

## 15. Decisions & Configuration

> [!IMPORTANT]
> The following decisions have been made by the product owner:

| Question | Decision |
|----------|----------|
| **Data Retention Policy** | ✅ 90 days raw data, 1 year aggregated |
| **Employee Self-View** | ✅ Yes - Employees can see their own usage data on mobile |
| **Work Hours Monitoring** | ✅ Default: All-time monitoring. Admin configurable to limit to work hours if needed |
| **Opt-Out Options** | ✅ Admin configurable per tracking category |
| **Geofencing** | 📋 Deferred to Phase 2 |

---

## 16. Future Enhancement: Role-Based Access Control (RBAC)

> [!CAUTION]
> **IMPLEMENTATION DEFERRED** - This section is for future implementation after core device monitoring is complete.

### 16.1 Planned Role Hierarchy

| Role | Description | Access Level |
|------|-------------|---------------|
| **Super Admin** | Full system control | See everything, configure everything, manage all users |
| **Admin** | Standard admin | View team data, send notifications, manage settings |
| **Manager** | Team lead | View own team's device data |
| **Employee** | Regular user | View only their own usage data |

### 16.2 Super Admin Capabilities (Future)
- Full access to all device monitoring data across organization
- Grant/revoke access to other admins
- Configure monitoring policies organization-wide
- Access audit logs
- Override any settings
- Delete/anonymize data
- Manage user roles

### 16.3 RBAC Database Schema (Future)
```sql
-- FUTURE IMPLEMENTATION
CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'employee', -- 'super_admin', 'admin', 'manager', 'employee'
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  resource TEXT NOT NULL,
  UNIQUE(role, permission, resource)
);
```

### 16.4 Implementation Notes
- Will integrate with existing `profiles.role` field
- RLS policies will enforce role-based data access
- Super Admin bypass for emergency access
- Audit trail for all privileged actions

---

## 17. Appendix

### A. Related Documents
- [Database Schema Documentation](./DATABASE_SCHEMA.md)
- [Agent Guidelines](../.agent/agent.md)

### B. Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-18 | Claude | Initial draft |
| 1.1 | 2026-01-18 | Claude | Updated with stakeholder decisions, added RBAC future phase, clarified shared user model |
| 1.2 | 2026-01-19 | Claude | Phase 3 complete, added Samsung Restricted Settings handling (section 14.1) |

---

> [!NOTE]
> This PRD is a living document. Updates should be made as requirements evolve and stakeholder feedback is incorporated.
