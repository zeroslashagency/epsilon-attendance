import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Shield, Eye } from 'lucide-react';

const RoleTestPage: React.FC = () => {
  const { 
    user, 
    employeeCode, 
    employeeName, 
    role, 
    hasPermission, 
    canAccessStandaloneAttendance,
    shouldRestrictToOwnData 
  } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p>Please log in to test role-based access</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const permissions = [
    { module: 'dashboard', action: 'view', label: 'View Dashboard' },
    { module: 'schedule', action: 'view', label: 'View Schedule' },
    { module: 'schedule', action: 'create', label: 'Create Schedule' },
    { module: 'attendance', action: 'view_own', label: 'View Own Attendance' },
    { module: 'attendance', action: 'view_all', label: 'View All Attendance' },
    { module: 'attendance', action: 'export', label: 'Export Attendance' },
    { module: 'analytics', action: 'view', label: 'View Analytics' },
    { module: 'users', action: 'manage', label: 'Manage Users' },
    { module: 'production', action: 'view', label: 'View Production' },
    { module: 'monitoring', action: 'view', label: 'View Monitoring' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Role-Based Access Control Test</h1>
        <p className="text-muted-foreground">Testing permissions for the current user</p>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="font-mono">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Employee Name</label>
              <p>{employeeName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Employee Code</label>
              <p className="font-mono">{employeeCode || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                {role || 'N/A'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Standalone Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {canAccessStandaloneAttendance() ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>
                {canAccessStandaloneAttendance() ? 'Allowed' : 'Denied'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Can access standalone attendance system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              Data Access Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {shouldRestrictToOwnData() ? (
                <Badge variant="outline">Own Data Only</Badge>
              ) : (
                <Badge variant="default">All Data</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {shouldRestrictToOwnData() 
                ? `Can only see attendance for employee code: ${employeeCode}`
                : 'Can see all employee attendance data'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Role Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={
                role === 'admin' ? 'default' : 
                role === 'manager' ? 'secondary' : 
                'outline'
              }
              className="text-lg px-3 py-1"
            >
              {role?.toUpperCase() || 'UNKNOWN'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Current user role level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detailed Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {permissions.map((permission) => {
              const hasAccess = hasPermission(permission.module, permission.action);
              return (
                <div
                  key={`${permission.module}-${permission.action}`}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    hasAccess 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}
                >
                  {hasAccess ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">{permission.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Admin User (admin@example.com):</strong> Can access all features and see all attendance data</p>
            <p><strong>Employee User (operator@example.com / Vyshakh):</strong> Can only access standalone attendance and see their own data (employee code "4")</p>
            <p><strong>To test:</strong> Log out and log in with different users to see how permissions change</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleTestPage;
