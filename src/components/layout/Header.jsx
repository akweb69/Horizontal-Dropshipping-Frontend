import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Heart, ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const Header = () => {
  const { openSearch } = useSearch();
  const { isAuthenticated, user, logout, loveData, setLoveData, loading, cartData, setCartData } = useAuth();
  const navigate = useNavigate();
  const [runningLogo, setRunningLogo] = useState('');

  useEffect(() => {
    // load love data
    axios.get(`${import.meta.env.VITE_BASE_URL}/love`)
      .then(res => {
        console.log(res.data);
        console.log(user?.email);
        setLoveData(res.data.filter(item => item.email === user?.email));
      })
      .catch(err => {
        console.log(err);
      })
    // load cart data
    axios.get(`${import.meta.env.VITE_BASE_URL}/cart`)
      .then(res => {
        setCartData(res.data.filter(item => item.email === user?.email));
      })
      .catch(err => {
        console.log(err);
      })
    // load logo
    axios.get(`${import.meta.env.VITE_BASE_URL}/website-logo`)
      .then(res => {
        setRunningLogo(res.data.logo);
      })
      .catch(err => {
        console.log(err);
      })
  }, [user?.email])


  const showToast = () => {
    navigate('/cart');
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClasses = "text-gray-600 hover:text-red-500 font-medium transition-colors";
  const activeLinkClasses = "text-red-500";

  const renderUserActions = () => {
    if (isAuthenticated) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200">
              <div className="flex items-center justify-center w-full h-full text-primary font-bold">
                {user?.storeInfo?.shopImage ? (
                  <img
                    src={user.storeInfo.shopImage}
                    alt="Shop"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase() || <User />}</span>
                )}

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
            <DropdownMenuItem asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>ড্যাশবোর্ড</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>লগ আউট</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <Link to="/login" className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
        <User className="text-gray-600 w-5 h-5" />
      </Link>
    );
  };


  return (
    <>
      <header className="hidden md:block bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" onClick={scrollToTop} className="text-3xl font-extrabold tracking-tight">
                {/* <span className="text-gray-900">Lets</span>
                <span className="text-red-500">Drop</span>
                <span className="text-gray-900">ship</span> */}
                <img
                  className='max-h-16'
                  src={runningLogo} alt="" />
              </Link>
            </div>

            <nav className="flex space-x-6">
              <NavLink to="/" onClick={scrollToTop} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>হোম</NavLink>
              <NavLink to="/about" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>আমাদের সম্পর্কে</NavLink>
              <NavLink to="/contact" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>যোগাযোগ</NavLink>
              <NavLink to="/membership" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>মেম্বারশিপ</NavLink>
            </nav>

            <div className="flex items-center space-x-4">
              <button onClick={openSearch} className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <FontAwesomeIcon icon={faSearch} className="text-gray-600 w-5 h-5" />
              </button>
              <Link to="/wishlist" className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors relative">
                <Heart className="text-gray-600 w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{loveData?.length || 0}</span>
              </Link>
              <button onClick={showToast} className="relative flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <ShoppingCart className="text-gray-600 w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{cartData?.length || 0}</span>
              </button>
              {renderUserActions()}
            </div>
          </div>
        </div>
      </header>

      <header className="md:hidden bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={scrollToTop} className="text-2xl font-extrabold tracking-tight">
              <span className="text-gray-900">Lets</span>
              <span className="text-red-500">Drop</span>
              <span className="text-gray-900">ship</span>
            </Link>
            <div className="flex items-center space-x-3">
              <button onClick={openSearch} className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <FontAwesomeIcon icon={faSearch} className="text-gray-600 w-5 h-5" />
              </button>
              <Link to="/wishlist" className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <Heart className="text-gray-600 w-5 h-5" />
              </Link>
              <button onClick={showToast} className="relative flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <ShoppingCart className="text-gray-600 w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
              </button>
              {renderUserActions()}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;