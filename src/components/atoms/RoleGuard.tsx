import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: string[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  requireAny?: boolean; // If true, user needs ANY of the roles. If false, user needs ALL roles
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles = [],
  requireAuth = true,
  fallback = null,
  requireAny = true,
}) => {
  const { isAuthenticated, user } = useAuth();

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // If no roles specified, just check authentication
  if (roles.length === 0) {
    return <>{children}</>;
  }

  // Check role-based access
  if (user) {
    const userRole = user.role || "customer";
    const hasAccess = requireAny
      ? roles.includes(userRole)
      : roles.every((role) => userRole === role);

    if (hasAccess) {
      return <>{children}</>;
    }
  }

  return <>{fallback}</>;
};

interface ConditionalRenderProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  condition,
  children,
  fallback = null,
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

// Specific role guards for common use cases
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard roles={["admin"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const CustomerOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard roles={["customer"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const StaffOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard roles={["staff"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const WarehouseOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard roles={["warehouse_manager"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AuthenticatedOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard requireAuth={true} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const GuestOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{fallback}</> : <>{children}</>;
};

// Higher-order component for role-based access
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  roles?: string[],
  requireAuth = true,
  fallback?: React.ReactNode,
) {
  return function RoleGuardedComponent(props: P) {
    return (
      <RoleGuard roles={roles} requireAuth={requireAuth} fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

// Hook for role-based logic
export function useRoleAccess() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: string): boolean => {
    if (!isAuthenticated || !user) return false;
    return (user.role || "customer") === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    const userRole = user.role || "customer";
    return roles.includes(userRole);
  };

  const hasAllRoles = (roles: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    const userRole = user.role || "customer";
    return roles.every((role) => userRole === role);
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin: hasRole("admin"),
    isCustomer: hasRole("customer"),
    isStaff: hasRole("staff"),
    isWarehouseManager: hasRole("warehouse_manager"),
    canAccessAdmin: hasAnyRole(["admin"]),
    canManageProducts: hasAnyRole(["admin", "warehouse_manager"]),
    canViewOrders: hasAnyRole(["admin", "staff", "customer"]),
    canProcessOrders: hasAnyRole(["admin", "staff"]),
  };
}
