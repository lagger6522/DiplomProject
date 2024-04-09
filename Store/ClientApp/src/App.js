import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import SearchResultPage from './components/SearchResultPage';
import ProductPage from './components/ProductPage';
import OrderFormPage from './components/user/OrderFormPage';
import MyOrdersPage from './components/user/MyOrdersPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import { ALayout } from './components/administrator/ALayout';
import { MLayout } from './components/manager/MLayout';
import AdminPage from "./components/administrator/AdminPage";
import ManagerPage from "./components/manager/ManagerPage";

import './custom.css';

export default function App() {
    const location = useLocation();

    const isAdminPage = location.pathname === "/administrator/AdminPage";
    const isManagerPage = location.pathname === "/manager/ManagerPage";

    if (isAdminPage) {
        return <ALayout><AdminPage /></ALayout>;
    }

    if (isManagerPage) {
        return <MLayout><ManagerPage /></MLayout>;
    }

    return (
        <Layout>
            <Routes>
                {AppRoutes.map((route, index) => {
                    const { element, ...rest } = route;
                    return <Route key={index} {...rest} element={element} />;
                })}
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/order-form" element={<OrderFormPage />} />
                <Route path="/search-results" element={<SearchResultPage />} />
                <Route path="/products/:subcategoryId" element={<ProductPage />} />
                <Route path="/product-details/:productId" element={<ProductDetailsPage />} />
            </Routes>
        </Layout>
    );
}
