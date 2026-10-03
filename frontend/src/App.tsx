import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from './components/ui/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { CustomerLayout } from './layouts/CustomerLayout';
import { OwnerLayout } from './layouts/OwnerLayout';
import { ManagerLayout } from './layouts/ManagerLayout';
import { KitchenLayout } from './layouts/KitchenLayout';
import { WaiterLayout } from './layouts/WaiterLayout';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { CustomerPreview } from './pages/CustomerPreview';
import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { CustomerWelcomePage } from './pages/CustomerWelcomePage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { KitchenDashboard } from './pages/KitchenDashboard';
import { WaiterDashboard } from './pages/WaiterDashboard';
import { RestaurantBrandingPage } from './pages/RestaurantBrandingPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { FloorPlanPage } from './pages/FloorPlanPage';

export const App: React.FC = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Main Portal & Design System */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />

        {/* Customer Mobile Welcome & Session Joining (/q/:token) */}
        <Route path="/q/:token" element={<CustomerWelcomePage />} />

        {/* Customer Mobile Menu Shell (Public QR Dining) */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerMenuPage />} />
          <Route path="preview" element={<CustomerPreview />} />
        </Route>

        {/* Owner Console (Protected: OWNER only) */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OwnerDashboard />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="tables" element={<FloorPlanPage />} />
          <Route path="floor" element={<FloorPlanPage />} />
          <Route path="settings" element={<RestaurantBrandingPage />} />
          <Route path="branding" element={<RestaurantBrandingPage />} />
          <Route path="*" element={<OwnerDashboard />} />
        </Route>

        {/* Manager Dashboard (Protected: OWNER, MANAGER) */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="floor" element={<FloorPlanPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="*" element={<ManagerDashboard />} />
        </Route>

        {/* Kitchen KDS (Protected: OWNER, KITCHEN) */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'KITCHEN']}>
              <KitchenLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<KitchenDashboard />} />
          <Route path="*" element={<KitchenDashboard />} />
        </Route>

        {/* Waiter Service Terminal (Protected: OWNER, WAITER) */}
        <Route
          path="/waiter"
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'WAITER']}>
              <WaiterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WaiterDashboard />} />
          <Route path="*" element={<WaiterDashboard />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
