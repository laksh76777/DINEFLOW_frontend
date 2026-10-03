import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { Role } from '../../types/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button, Card, CardBody } from '../ui';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Not authenticated -> Redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Inactive account -> Block access
  if (!user.active) {
    return <Navigate to="/login?reason=deactivated" replace />;
  }

  // 3. Role validation check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleLandingMap: Record<Role, string> = {
      OWNER: '/owner',
      MANAGER: '/manager',
      KITCHEN: '/kitchen',
      WAITER: '/waiter',
    };

    return (
      <div className="min-h-screen bg-[#fbf9f6] text-[#211d1a] flex items-center justify-center p-4 font-sans">
        <Card className="max-w-md w-full border-[#fecaca] shadow-md">
          <CardBody className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#211d1a]">Access Restricted</h2>
              <p className="text-xs text-[#7b726a] mt-1">
                Your role (<span className="text-[#d96236] font-bold">{user.role}</span>) is not
                authorized to view this area.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                onClick={() => navigate(roleLandingMap[user.role] || '/')}
              >
                Go to My Dashboard ({user.role})
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                Return to Portal
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
