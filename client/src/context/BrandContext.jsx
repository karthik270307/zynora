import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const BrandContext = createContext();

export const useBrand = () => useContext(BrandContext);

export const BrandProvider = ({ children }) => {
    const [brands, setBrands] = useState([]);
    const [activeBrand, setActiveBrand] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("zynora_token");
            if (!token) return;

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/brands`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setBrands(response.data.brands);
                // If there's no active brand, but we have brands, select the first one by default
                if (response.data.brands.length > 0) {
                    const savedActiveBrandId = localStorage.getItem("activeBrandId");
                    const found = response.data.brands.find(b => b.id === savedActiveBrandId);
                    if (found) {
                        setActiveBrand(found);
                    } else {
                        setActiveBrand(response.data.brands[0]);
                        localStorage.setItem("activeBrandId", response.data.brands[0].id);
                    }
                } else {
                    setActiveBrand(null);
                    localStorage.removeItem("activeBrandId");
                }
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("zynora_token");
        if (token) {
            fetchBrands();
        } else {
            setLoading(false);
        }
    }, []);

    const changeActiveBrand = (brandId) => {
        const brand = brands.find(b => b.id === brandId);
        if (brand) {
            setActiveBrand(brand);
            localStorage.setItem("activeBrandId", brand.id);
            toast.success(`Active brand set to ${brand.brand_name}`);
        }
    };

    const refreshBrands = () => {
        fetchBrands();
    };

    return (
        <BrandContext.Provider value={{ brands, activeBrand, loading, changeActiveBrand, refreshBrands }}>
            {children}
        </BrandContext.Provider>
    );
};
