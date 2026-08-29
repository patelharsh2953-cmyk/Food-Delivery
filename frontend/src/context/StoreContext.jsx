import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000";
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);
    const [category_list, setCategoryList] = useState([]);
    const [offersList, setOffersList] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            try {
                await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
            } catch (err) {
                console.error("Error adding to cart:", err);
            }
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        if (token) {
            try {
                await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
            } catch (err) {
                console.error("Error removing from cart:", err);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            if (response.data && Array.isArray(response.data.data)) {
                setFoodList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    };

    const fetchCategoryList = async () => {
        try {
            const response = await axios.get(url + "/api/category/list");
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setCategoryList(response.data.data.filter(c => !c.isDeleted && c.status !== 'Inactive'));
            }
        } catch (error) {
            console.error("Error fetching category list:", error);
        }
    };

    const fetchOffersList = async () => {
        try {
            const response = await axios.get(url + "/api/offer/list");
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setOffersList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching offers list:", error);
        }
    };

    const applyCoupon = async (code) => {
        if (!code || !code.trim()) {
            return { success: false, message: "Please enter a valid coupon code." };
        }
        const subtotal = getTotalCartAmount();
        try {
            const response = await axios.post(url + "/api/offer/apply", { 
                code: code.trim().toUpperCase(), 
                amount: subtotal 
            });

            if (response.data && response.data.success) {
                setAppliedCoupon(response.data.data);
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data?.message || "Invalid coupon code." };
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Error applying coupon. Please check minimum order requirements.";
            return { success: false, message: errorMsg };
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    const getDiscountAmount = () => {
        if (!appliedCoupon) return 0;
        const subtotal = getTotalCartAmount();
        if (appliedCoupon.minAmount && subtotal < appliedCoupon.minAmount) {
            return 0;
        }
        if (appliedCoupon.discountPercent) {
            return Math.round((subtotal * appliedCoupon.discountPercent) / 100);
        }
        if (appliedCoupon.discountAmount) {
            return Math.min(appliedCoupon.discountAmount, subtotal);
        }
        return 0;
    };

    const getFinalTotalAmount = () => {
        const subtotal = getTotalCartAmount();
        if (subtotal === 0) return 0;
        const discount = getDiscountAmount();
        const deliveryFee = subtotal >= 500 ? 0 : 60;
        return Math.max(0, subtotal - discount + deliveryFee);
    };

    const loadCartData = async (userToken) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: userToken } });
            if (response.data && response.data.cartData) {
                setCartItems(response.data.cartData);
            }
        } catch (err) {
            console.error("Error loading cart data:", err);
        }
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            await fetchCategoryList();
            await fetchOffersList();
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                await loadCartData(storedToken);
            }
        }
        loadData();
    }, []);

    const contextValue = {
        food_list,
        category_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        loadCartData,
        offersList,
        fetchOffersList,
        fetchCategoryList,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        getDiscountAmount,
        getFinalTotalAmount
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;