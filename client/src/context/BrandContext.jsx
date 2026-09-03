import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
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
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await api.get('/api/brands');
            
            if (response.data?.success) {
                const fetchedBrands = response.data.brands || [];
                setBrands(fetchedBrands);
                // If there's no active brand, but we have brands, select the first one by default
                if (fetchedBrands.length > 0) {
                    const savedActiveBrandId = localStorage.getItem("activeBrandId");
                    const found = fetchedBrands.find(b => b.id === savedActiveBrandId);
                    if (found) {
                        setActiveBrand(found);
                    } else {
                        setActiveBrand(fetchedBrands[0]);
                        localStorage.setItem("activeBrandId", fetchedBrands[0].id);
                    }
                } else {
                    setActiveBrand(null);
                    localStorage.removeItem("activeBrandId");
                }
            }
        } catch (error) {
            if (error.response?.status === 401) {
                // Token is expired or invalid
                localStorage.removeItem("zynora_token");
                localStorage.removeItem("zynora_user");
                localStorage.removeItem("activeBrandId");
                setBrands([]);
                setActiveBrand(null);
            } else {
                console.error("Error fetching brands:", error.message || error);
            }
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
