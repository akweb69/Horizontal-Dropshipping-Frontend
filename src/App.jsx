
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import AboutUsPage from '@/pages/AboutUsPage';
import ContactPage from '@/pages/ContactPage';
import ReferralPage from '@/pages/ReferralPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import WishlistPage from '@/pages/WishlistPage';
import { Toaster } from '@/components/ui/toaster';
import OurStoryPage from '@/pages/OurStoryPage';
import CareersPage from '@/pages/CareersPage';
import PressPage from '@/pages/PressPage';
import ReturnPolicyPage from '@/pages/ReturnPolicyPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TrackOrderPage from '@/pages/TrackOrderPage';
import SupportPage from '@/pages/SupportPage';
import MembershipPage from '@/pages/MembershipPage';
import SearchModal from '@/components/SearchModal';
import PrivateRoute from '@/components/PrivateRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import MyProductsPage from '@/pages/dashboard/MyProductsPage';
import ConnectStorePage from '@/pages/dashboard/ConnectStorePage';
import BillingPage from '@/pages/dashboard/BillingPage';
import AccountSettingsPage from '@/pages/dashboard/AccountSettingsPage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import ReferralDashboardPage from '@/pages/dashboard/ReferralDashboardPage';
import OrderTrackingDashboardPage from '@/pages/dashboard/OrderTrackingDashboardPage';
import AdminRoute from '@/components/AdminRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import ManageCategoriesPage from '@/pages/admin/ManageCategoriesPage';
import ManageProductsPage from '@/pages/admin/ManageProductsPage';
import ManageUsersPage from '@/pages/admin/ManageUsersPage';
import ManageOrdersPage from '@/pages/admin/ManageOrdersPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import ManageHomepagePage from '@/pages/admin/ManageHomepagePage';
import CategoryProduct from './pages/CategoryProduct';
import CartPage from './components/layout/CartPage';
import ManagePackage from './pages/admin/ManagePackage';
import ManageWithdraw from './pages/admin/ManageWithdraw';
import Billing from './pages/admin/Billing';
import WebsiteData from './pages/admin/WebsiteData';
import ProductDetails from './components/layout/ProductDetails';
import ManagePackageData from './pages/admin/ManagePackageData';
import SeeUser from './components/layout/SeeUser';
import ManagePromodata from './pages/admin/ManagePromodata';
import ManageContactUs from './pages/admin/ManageContactUs';
import ClassRequest from './components/layout/ClassRequest';
import ManageClassRequest from './pages/admin/ManageClassRequest';
import ManageRefferWithDraw from './pages/admin/ManageRefferWithDraw';
import LavUttolon from './pages/admin/LavUttolon';
import Amader from './pages/Amader';
import Kivabe from './pages/Kivabe';
import Keno from './pages/Keno';
import ManageTeligramGroup from './pages/admin/ManageTeligramGroup';
import JoinTeligram from './pages/JoinTeligram';
import ManageHisab from './components/layout/ManageHisab';
import NotFoundPage404 from './components/layout/NotFoundPage404';

function App() {

  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products/:category" element={<CategoryProduct />} />
          <Route path="about" element={<AboutUsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="referral" element={<ReferralPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="our-story" element={<OurStoryPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="press" element={<PressPage />} />
          <Route path="return-policy" element={<ReturnPolicyPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="track-order" element={<TrackOrderPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="amader-sompare" element={<Amader />} />
          <Route path="kivabe" element={<Kivabe />} />
          <Route path="keno" element={<Keno />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="my-products" element={<MyProductsPage />} />
          <Route path="connect-store" element={<ConnectStorePage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="referral-program" element={<ReferralDashboardPage />} />
          <Route path="order-tracking" element={<OrderTrackingDashboardPage />} />
          <Route path="settings" element={<AccountSettingsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="class-requests" element={<ClassRequest />} />
          <Route path="joingroup" element={<JoinTeligram />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<ManageProductsPage />} />
          <Route path="categories" element={<ManageCategoriesPage />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route path="orders" element={<ManageOrdersPage />} />
          <Route path="homepage" element={<ManageHomepagePage />} />
          <Route path="packages" element={<ManagePackage />} />
          <Route path="withdraw" element={<ManageWithdraw />} />
          <Route path="billing" element={<Billing />} />
          <Route path="webdata" element={<WebsiteData />} />
          <Route path="packagesdata" element={<ManagePackageData />} />
          <Route path="seeusers" element={<SeeUser />} />
          <Route path="promodata" element={<ManagePromodata />} />
          <Route path="requestdata" element={<ManageContactUs />} />
          <Route path="classrequestdata" element={<ManageClassRequest />} />
          <Route path="reffer_withdraw" element={<ManageRefferWithDraw />} />
          <Route path="profit_withdraw" element={<LavUttolon />} />
          <Route path="group" element={<ManageTeligramGroup />} />
          <Route path="admin_order" element={<ManageHisab />} />
        </Route>
        {/* ❌ Catch-all route for 404 */}
        <Route path="*" element={<NotFoundPage404 />} />
      </Routes>
      <Toaster />
      <SearchModal />
    </>
  );
}

export default App;
