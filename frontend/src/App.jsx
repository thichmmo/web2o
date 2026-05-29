import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FacebookAccounts from './pages/FacebookAccounts';
import CreatePost from './pages/CreatePost';
import PostHistory from './pages/PostHistory';
import PostDetail from './pages/PostDetail';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import AdminPlans from './pages/admin/Plans';
import AdminPosts from './pages/admin/Posts';
import CardSettings from './pages/admin/CardSettings';
import AdminSettings from './pages/admin/Settings';
import ActivityLogs from './pages/admin/ActivityLogs';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="facebook" element={<FacebookAccounts />} />
            <Route path="posts/create" element={<CreatePost />} />
            <Route path="posts" element={<PostHistory />} />
            <Route path="posts/:postId" element={<PostDetail />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/:userId" element={<UserDetail />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="card-settings" element={<CardSettings />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>

          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
