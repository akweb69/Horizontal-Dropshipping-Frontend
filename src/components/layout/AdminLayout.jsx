
import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Package, Users, ShoppingCart, Tag, Menu, X, LogOut, User, Home,
  PackageIcon,
  DollarSignIcon,
  LucideDollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { logout, loading, user } = useAuth();
  const navigate = useNavigate();
  const [navItems, setNavItems] = useState([]);
  const navItems1 = [
    { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', path: '/admin' },
    { icon: Home, label: 'হোমপেজ ম্যানেজ করুন', path: '/admin/homepage' },
    { icon: Package, label: 'পণ্য ম্যানেজ করুন', path: '/admin/products' },
    { icon: Tag, label: 'ক্যাটাগরি ম্যানেজ করুন', path: '/admin/categories' },
    { icon: Users, label: 'ব্যবহারকারী ম্যানেজ করুন', path: '/admin/users' },
    { icon: Users, label: 'ব্যবহারকারী ড্যাশবোর্ড দেখুন  ', path: '/admin/seeusers' },
    { icon: ShoppingCart, label: 'অর্ডার ম্যানেজ করুন', path: '/admin/orders' },
    { icon: PackageIcon, label: 'প্যাকেজ অর্ডার  করুন', path: '/admin/packages' },
    { icon: PackageIcon, label: 'প্যাকেজ ম্যানেজ করুন', path: '/admin/packagesdata' },
    { icon: DollarSignIcon, label: 'ওয়াইথড্র ম্যানেজ করুন', path: '/admin/withdraw' },
    { icon: LucideDollarSign, label: 'বিলিং ম্যানেজ করুন', path: '/admin/billing' },
    { icon: User, label: 'ওয়েবসাইট ডাটা ম্যানেজ করুন', path: '/admin/webdata' },
    { icon: PackageIcon, label: 'প্রমোডাটা', path: '/admin/promodata' },

  ];
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  useEffect(() => {
    if (user.role === "admin") {
      setNavItems(navItems1);
    }
    if (user.role === "Withdraw Manager") {
      const navItems1 = [
        { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', path: '/admin' },
        { icon: DollarSignIcon, label: 'ওয়াইথড্র ম্যানেজ করুন', path: '/admin/withdraw' },
      ];
      setNavItems(navItems1);
    }
    if (user.role === "Product Manager") {
      const navItems1 = [
        { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', path: '/admin' },
        { icon: Package, label: 'পণ্য ম্যানেজ করুন', path: '/admin/products' },
        { icon: Tag, label: 'ক্যাটাগরি ম্যানেজ করুন', path: '/admin/categories' },
      ];
      setNavItems(navItems1);
    }
    if (user.role === "Order Manager") {
      const navItems1 = [
        { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', path: '/admin' },
        { icon: ShoppingCart, label: 'অর্ডার ম্যানেজ করুন', path: '/admin/orders' },
      ];
      setNavItems(navItems1);
    }
  }, [user]);



  if (loading) {
    return null;
  }
  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-900 text-white border-r border-gray-700 transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <NavLink to="/admin" className="text-2xl font-bold text-white">অ্যাডমিন প্যানেল</NavLink>
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-gray-700" onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-col p-4 overflow-y-auto h-[calc(100vh-112px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-red-500/20 hover:text-red-400" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3 text-red-400" />
            লগ আউট
          </Button>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

const AdminHeader = ({ setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/95 backdrop-blur-sm border-b md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex-1"></div>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="flex items-center justify-center w-full h-full bg-primary/20 rounded-full text-primary font-bold">
                {user?.name?.charAt(0).toUpperCase() || <User />}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
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

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="md:pl-64">
        <AdminHeader setIsOpen={setIsSidebarOpen} />
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
