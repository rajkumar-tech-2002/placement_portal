import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

    // Check if the current route is an auth route
    const isAuthPage = ['/login'].includes(location.pathname);
    const showSidebar = user && !isAuthPage;

    // Reset sidebar on location change for mobile
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className={`
            ${isAuthPage ? 'h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'} 
            bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500 flex flex-col
        `}>
            <Toaster position="top-right" reverseOrder={false} />
            {showSidebar && (
                <>
                    <Navbar 
                        isSidebarOpen={isSidebarOpen} 
                        setIsSidebarOpen={setIsSidebarOpen}
                        isSidebarCollapsed={isSidebarCollapsed}
                        setIsSidebarCollapsed={setIsSidebarCollapsed}
                    />
                    <Sidebar 
                        isSidebarOpen={isSidebarOpen} 
                        setIsSidebarOpen={setIsSidebarOpen}
                        isSidebarCollapsed={isSidebarCollapsed}
                    />
                </>
            )}
            
            <main className={`
                ${showSidebar ? (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64') : ''} 
                ${!isAuthPage ? 'pt-16' : ''}
                ${isAuthPage ? 'h-full' : 'min-h-screen'}
                flex-1 flex flex-col transition-all duration-300 ease-in-out
            `}>
                <div className={`flex-1 ${!isAuthPage ? 'container-fluid px-4 pt-6 pb-20 md:px-8' : ''}`}>
                    <AppRoutes />
                </div>
            </main>
            {!isAuthPage && <Footer isSidebarCollapsed={isSidebarCollapsed} />}
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

export default App;
