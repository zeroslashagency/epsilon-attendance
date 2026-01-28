export const USER_ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee',
    OPERATOR: 'Operator'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
