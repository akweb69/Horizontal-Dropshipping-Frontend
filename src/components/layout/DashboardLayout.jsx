import React, { useEffect, useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Package, FileText, Settings, LifeBuoy, Menu, X, LogOut, User, BarChart2, Gift, Truck,
  Plus,
  Home,
  Loader2,
  Users
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { toast } from 'react-toastify'; // Assuming react-toastify is installed for error notifications
import Loader11 from './Loader11';

// Centralized axios instance (create a separate api.js file or inline here)
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [classData, setClassData] = useState(user.subscription.plan);
  const [loading, setLoading] = useState(false);
  const [matchedPackage, setMatchedPackage] = useState(null);
  const [websiteLogo, setWebsiteLogo] = useState('');

  useEffect(() => {
    setLoading(true);
    setClassData(user.subscription.plan);
    api.get('/manage-package')
      .then(res => {
        const data = res?.data;
        const pkg = data.find(p => p?.name === user.subscription.plan);
        setMatchedPackage(pkg);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load package data');
        setLoading(false);
      });
  }, [user?.email, user.subscription.plan]);

  useEffect(() => {
    api.get('/website-logo')
      .then(res => {
        setWebsiteLogo(res.data.logo);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load logo');
      });
  }, []);

  const initialNavItems = [
    { icon: Home, label: 'হোম পেজে ফিরে যান', path: '/' },
    { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', path: '/dashboard' },
    { icon: Package, label: 'আমার পণ্য', path: '/dashboard/my-products' },
    { icon: Truck, label: 'অর্ডার ট্র্যাকিং', path: '/dashboard/order-tracking' },
    // { icon: BarChart2, label: 'অ্যানালিটিক্স', path: '/dashboard/analytics' },
    { icon: Gift, label: 'রেফারেল প্রোগ্রাম', path: '/dashboard/referral-program' },
    { icon: Plus, label: 'ওইথড্র ম্যানেজমেন্ট', path: '/dashboard/connect-store' },
    { icon: FileText, label: 'বিলিং ও সাবস্ক্রিপশন', path: '/dashboard/billing' },
    { icon: Settings, label: 'অ্যাকাউন্ট সেটিংস', path: '/dashboard/settings' },
    { icon: LifeBuoy, label: 'সহায়তা কেন্দ্র', path: '/dashboard/support' },
    { icon: LifeBuoy, label: 'গিফট কালেক্ট করুন', path: '/dashboard/gift_collect' },
    { icon: Users, label: 'গ্রপে যুক্ত হন', path: '/dashboard/joingroup' },
  ];

  const navItems = useMemo(() => {
    const items = [...initialNavItems];
    if (matchedPackage?.canDoClass) {
      items.push({ icon: LifeBuoy, label: 'ক্লাসের অনুরোধ', path: '/dashboard/class-requests' });
    }
    return items;
  }, [matchedPackage]);

  if (loading) {
    <Loader11></Loader11>
  }

  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <NavLink to="/" className="text-2xl font-bold text-primary">
            {websiteLogo ? (
              <img src={websiteLogo} alt="Logo" className="h-8 md:h-12 max-w-[250px] w-full" />
            ) : (
              'ড্যাশবোর্ড'
            )}
          </NavLink>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)} aria-label="Close sidebar">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-col p-4 overflow-y-auto h-[calc(100vh-112px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'bg-orange-500 text-black'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-red-500/10 hover:text-red-600" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            লগ আউট
          </Button>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

const DashboardHeader = ({ setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    api.get(`/users/${user?.email}`)
      .then((response) => {
        setUserName(response?.data?.name || 'User');
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to load user data');
      });
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-sm border-b md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(true)} aria-label="Open sidebar">
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex-1"></div>
      <div className="md:ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-orange-500">
              <div className="flex items-center justify-center w-full h-full bg-primary/20 rounded-full text-orange-500 font-bold">
                {userName?.charAt(0).toUpperCase() || <User />}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:bg-red-500/10 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>লগ আউট</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="md:pl-64">
        <DashboardHeader setIsOpen={setIsSidebarOpen} />
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;