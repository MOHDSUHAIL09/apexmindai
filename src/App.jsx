import { Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import DashboardLayout from './layouts/DashboardLayout';
import LandingLayout from './layouts/LandingLayout';

// Inner component that uses useUser
const AppRoutes = () => {
  const { isAuthenticated } = useUser();

  return (
    <Routes>
      <Route path="/*" element={<LandingLayout/>} />
      <Route path="/dashboard/*" element={<DashboardLayout/>} />
    </Routes>
  );
};

// Main App component with Provider
const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
};

export default App;