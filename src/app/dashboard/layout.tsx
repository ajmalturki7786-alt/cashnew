'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  BookUser,
} from 'lucide-react';
import { useAuthStore, useBusinessStore } from '@/store';
import { businessService } from '@/services/business';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/cashbook', icon: BarChart3 },
  { name: 'Parties', href: '/dashboard/parties', icon: BookUser },
  { name: 'Team', href: '/dashboard/staff', icon: Users },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { 
    businesses, 
    currentBusiness, 
    setBusinesses, 
    setCurrentBusiness,
    setLoading 
  } = useBusinessStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const data = await businessService.getBusinesses();
        setBusinesses(data);
        
        // Always validate current business against fetched list
        if (data.length > 0) {
          const currentInList = currentBusiness && data.find(b => b.id === currentBusiness.id);
          if (!currentInList) {
            // Current business is invalid, use first from list
            setCurrentBusiness(data[0]);
          }
        } else {
          setCurrentBusiness(null);
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
        setCurrentBusiness(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [isHydrated, isAuthenticated]);

  const handleLogout = () => {
    logout();
    setCurrentBusiness(null);
    setBusinesses([]);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const handleBusinessChange = (business: typeof currentBusiness) => {
    setCurrentBusiness(business);
    setBusinessDropdownOpen(false);
    toast.success(`Switched to ${business?.name}`);
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">₹</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Cash Manager</span>
        </div>
      </div>
      
      {/* Business selector */}
      <div className="px-3 py-3 border-b">
        <div className="relative">
          <button
            onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <span className="truncate font-semibold">
                {currentBusiness?.name || 'Select Business'}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${businessDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {businessDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border">
              <div className="py-1 max-h-60 overflow-y-auto">
                {businesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => handleBusinessChange(business)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      currentBusiness?.id === business.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    {business.name}
                  </button>
                ))}
                {businesses.length === 0 && (
                  <p className="px-4 py-2 text-sm text-gray-500">No businesses found</p>
                )}
                <Link
                  href="/dashboard/businesses/new"
                  onClick={() => setBusinessDropdownOpen(false)}
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 border-t font-medium"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Business
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {user?.firstName?.charAt(0).toUpperCase() || user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Close button on overlay - positioned to the right of sidebar */}
          <button
            type="button"
            className="absolute left-64 top-4 ml-2 flex items-center justify-center h-10 w-10 rounded-full bg-gray-800 bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button inside sidebar header for better accessibility */}
        <div className="absolute top-3 right-3">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex items-center h-16 bg-white border-b px-4 lg:hidden">
          <button
            type="button"
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">₹</span>
            </div>
            <span className="font-bold text-gray-800">Cash Manager</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
