import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, Gift, LogIn, ShoppingBasket } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';
import Loader11 from './Loader11';

const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { openSearch } = useSearch();
  const { user, loading } = useAuth();
  const [bg, setBg] = useState(0)
  const [show, setShow] = useState(false)

  const handleNavigation = (path, tab) => {
    setActiveTab(tab);
    navigate(path);
  }

  useEffect(() => {
    if (user && user?.email) {
      setShow(true)
    }
  }, [user && user?.email])

  // The search button is now hidden on mobile, so this function is not directly used by a visible button.
  // It's kept for completeness in case the search functionality is re-introduced differently.
  const handleSearchClick = () => {
    setActiveTab('search');
    openSearch();
  };
  if (loading) {
    <Loader11></Loader11>
  }

  return (
    <nav className={`${show ? "block lg:hidden" : "hidden"} mobile-bottom-nav`}>
      <div className="flex justify-around">
        <button
          onClick={() => handleNavigation('/', 'home')}
          className={`flex flex-col items-center py-1 px-2 `}
        >
          <Home
            onClick={() => setBg(0)}
            className={`${bg === 0 ? "text-orange-400" : ""} h-5 w-5`} />
          <span className="text-xs mt-1">হোম</span>
        </button>
        {
          user && user?.email ? <div className="">
            <button
              onClick={() => handleNavigation('/cart', 'cart')}
              className={`flex flex-col items-center py-1 px-2 `}
            >
              <ShoppingBasket
                onClick={() => setBg(1)}
                className={`${bg === 1 ? "text-orange-400" : ""} h-5 w-5`} />
              <span className="text-xs mt-1">কার্ট</span>
            </button>
          </div>
            : null
        }
        {/* Search button is hidden on mobile view */}
        {/* <button 
          onClick={handleSearchClick}
          className={`hidden md:flex flex-col items-center py-1 px-2 ${activeTab === 'search' ? 'text-teal-600' : 'text-gray-600'}`}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-1">অনুসন্ধান</span>
        </button> */}
        {
          user && user?.email ? <div className="">
            <button
              onClick={() => handleNavigation('/membership', 'referral')}
              className={`flex flex-col items-center py-1 px-2 `}
            >
              <Gift
                onClick={() => setBg(2)}
                className={`${bg === 2 ? "text-orange-400" : ""} h-5 w-5`} />
              <span className="text-xs mt-1">মেম্বারশিপ</span>
            </button>
          </div> : null
        }
        {
          user && user?.email ? <div className="">
            <button
              onClick={() => handleNavigation('/', '/')}
              className={`flex flex-col items-center py-1 px-2 `}
            >
              <Gift
                onClick={() => setBg(3)}
                className={`${bg === 3 ? "text-orange-400" : ""} h-5 w-5`} s />
              <span className="text-xs mt-1">পণ্য কিনুন</span>
            </button>
          </div> : null
        }
        {
          !user || !user?.email ? <div className="">
            <button
              onClick={() => handleNavigation('/signup', 'signup')}
              className={`flex flex-col items-center py-1 px-2 `}
            >
              <LogIn
                onClick={() => setBg(4)}
                className={`${bg === 4 ? "text-orange-400" : ""} h-5 w-5`} />
              <span className="text-xs mt-1">সাইন আপ</span>
            </button>
          </div> : null
        }
        {
          !user || !user?.email ? <div className="">
            <button
              onClick={() => handleNavigation('/login', 'login')}
              className={`flex flex-col items-center py-1 px-2 `}
            >
              <LogIn
                onClick={() => setBg(5)}
                className={`${bg === 5 ? "text-orange-400" : ""} h-5 w-5`} />
              <span className="text-xs mt-1">লগইন</span>
            </button>
          </div> : null
        }
      </div>
    </nav>
  );
};

export default MobileBottomNav;