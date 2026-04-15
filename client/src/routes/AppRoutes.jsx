import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';

import Login from '../pages/Auth/Login';
import AdminDashboard from '../pages/AdminDashboard';  
import ManageCompanies from '../pages/ManageCompanies';
import Reports from '../pages/Reports';
import StudentDetails from '../pages/Admin/StudentDetails';
import CreateUser from '../pages/Admin/CreateUser';
import EligibleStudents from '../pages/Admin/EligibleStudents';
import WillingStudents from '../pages/Admin/WillingStudents';

// Coordinator Pages
import CoordinatorDashboard from '../pages/Coordinator/CoordinatorDashboard';
import DriveExecution from '../pages/Coordinator/DriveExecution';
import DriveAttendance from '../pages/Coordinator/DriveAttendance';
import LeetCodeDetails from '../pages/Admin/LeetCodeDetails';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="companies" element={<ManageCompanies />} />
                <Route path="companies/:id/eligible-students" element={<EligibleStudents />} />
                <Route path="student-details" element={<StudentDetails />} />
                <Route path="leetcode-details" element={<LeetCodeDetails />} />
                <Route path="reports" element={<Reports />} />
                <Route path="create-user" element={<CreateUser />} />
                <Route path="companies/:id/willing-students" element={<WillingStudents />} />
            </Route>
 
            {/* Coordinator Routes */}
            <Route path="/coordinator" element={<ProtectedRoute allowedRoles={['COORDINATOR', 'ADMIN']} />}>
                <Route index element={<Navigate to="/coordinator/dashboard" replace />} />
                <Route path="dashboard" element={<CoordinatorDashboard />} />
                <Route path="drives" element={<DriveExecution />} />
                <Route path="drives/:id/attendance" element={<DriveAttendance />} />
                <Route path="leetcode-details" element={<LeetCodeDetails />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<div className="p-10 text-center animate-in fade-in duration-700 font-bold text-slate-500">Page Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;
