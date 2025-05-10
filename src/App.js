import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/ui/Header';
import Box from './components/ui/Box';
import AutoPartsTransition from './components/ui/AutoPartsTransition';
import TypeListBox from './components/ui/TypeListBox';
import Partners from './components/ui/Partners';
import Footer from './components/ui/Footer';
import Auth from './components/pages/Auth';
import Registration from './components/pages/Registration';
import Profile from './components/pages/Profile';
import ProductCategorySelection from './components/pages/ProductCategorySelection';
import Catalog from './components/pages/Catalog';
import ProductPage from './components/pages/ProductPage';
import CartPage from './components/pages/CartPage';
import AutoParts from "./components/pages/AutoParts";
import { CartProvider } from './components/contexts/CartContext';
import { NotificationProvider } from './components/contexts/NotificationContext';
import ResetPassword from "./components/pages/ResetPassword";
import AboutPage from "./components/pages/AboutPage";
import ScrollToTop from './components/ui/ScrollToTop';
import PartForm from "./components/pages/PartForm";

function App() {
    return (
        <div className="App">
            <NotificationProvider>
                <CartProvider>
                    <Router>
                        <ScrollToTop />
                        <Header />
                        <Routes>
                            <Route path="/" element={
                                <>
                                    <Box />
                                    <AutoPartsTransition />
                                    <TypeListBox />
                                    <Partners />
                                </>
                            } />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/registration" element={<Registration />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/catalog" element={<ProductCategorySelection />} />
                            <Route path="/catalog/:category" element={<Catalog />} />
                            <Route path="/product/:partId" element={<ProductPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/autoparts" element={<AutoParts />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/add-part" element={<PartForm />} />
                            <Route path="/edit-part/:partId" element={<PartForm />} />
                        </Routes>
                        <Footer />
                    </Router>
                </CartProvider>
            </NotificationProvider>
        </div>
    );
}

export default App;
