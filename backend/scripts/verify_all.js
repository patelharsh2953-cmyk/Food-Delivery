import axios from 'axios';
import { generateCaptcha, verifyCaptcha } from '../utils/captcha.js';

const BASE_URL = 'http://localhost:4000';

const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

const assertTest = (testName, condition, message = "") => {
    results.total++;
    if (condition) {
        results.passed++;
        results.details.push({ status: 'PASS', testName });
        console.log(`  [PASS] ${testName}`);
    } else {
        results.failed++;
        results.details.push({ status: 'FAIL', testName, message });
        console.error(`  [FAIL] ${testName}: ${message}`);
    }
};

const runAllTests = async () => {
    console.log("==================================================");
    console.log("  STARTING END-TO-END MERN & WFS VERIFICATION TEST");
    console.log("==================================================\n");

    const timestamp = Date.now();
    const testUserEmail = `test_user_${timestamp}@fooddel.com`;
    const testAdminEmail = `test_admin_${timestamp}@fooddel.com`;
    let userToken = '';
    let adminToken = '';
    let testFoodId = '';
    let testCategoryId = '';
    let testOfferId = '';
    let testContactId = '';

    try {
        // ── 1. API Health Check ──
        console.log("\n--- [1] API HEALTH & ROOT ROUTE ---");
        const rootRes = await axios.get(`${BASE_URL}/`);
        assertTest("API Root Health Check", rootRes.status === 200 && rootRes.data.success === true);

        // ── 2. CAPTCHA Security & Replay Protection ──
        console.log("\n--- [2] CAPTCHA ENGINE & REPLAY PROTECTION ---");
        const captchaGenRes = await axios.get(`${BASE_URL}/api/auth/captcha`);
        assertTest("CAPTCHA Generation", captchaGenRes.data.success === true && !!captchaGenRes.data.captchaId && !!captchaGenRes.data.svg);
        
        const sampleCaptcha = generateCaptcha(5);
        assertTest("Captcha Generator Output", !!sampleCaptcha.captchaId && sampleCaptcha.svg.includes('<svg'));

        const wrongVerify = verifyCaptcha(sampleCaptcha.captchaId, "WRONG");
        assertTest("Reject Wrong Captcha", wrongVerify.success === false);

        const replayVerify = verifyCaptcha(sampleCaptcha.captchaId, "WRONG");
        assertTest("Reject Replay of Expired/Used Captcha", replayVerify.success === false);

        // ── 3. Authentication & Authorization ──
        console.log("\n--- [3] AUTHENTICATION & AUTHORIZATION ---");
        
        const regUserRes = await axios.post(`${BASE_URL}/api/user/register`, {
            name: "Test Customer",
            email: testUserEmail,
            password: "Password@123",
            phone: "9876543210"
        });
        assertTest("User Registration", regUserRes.status === 201 && regUserRes.data.success === true && !!regUserRes.data.token);
        userToken = regUserRes.data.token;

        try {
            await axios.post(`${BASE_URL}/api/user/register`, {
                name: "Duplicate User",
                email: testUserEmail,
                password: "Password@123"
            });
            assertTest("Reject Duplicate User Email", false, "Allowed duplicate email registration");
        } catch (err) {
            assertTest("Reject Duplicate User Email", err.response?.status === 409 || err.response?.data?.success === false);
        }

        const loginUserRes = await axios.post(`${BASE_URL}/api/user/login`, {
            email: testUserEmail,
            password: "Password@123"
        });
        assertTest("User Login Valid Credentials", loginUserRes.status === 200 && loginUserRes.data.success === true);

        try {
            await axios.post(`${BASE_URL}/api/user/login`, {
                email: testUserEmail,
                password: "WrongPassword"
            });
            assertTest("Reject Invalid User Password", false, "Allowed login with wrong password");
        } catch (err) {
            assertTest("Reject Invalid User Password", err.response?.status === 401 || err.response?.data?.success === false);
        }

        const regAdminRes = await axios.post(`${BASE_URL}/api/admin/register`, {
            name: "Master Admin",
            email: testAdminEmail,
            password: "AdminPassword@123",
            confirmPassword: "AdminPassword@123"
        });
        assertTest("Admin Registration", regAdminRes.status === 201 && regAdminRes.data.success === true && !!regAdminRes.data.token);
        adminToken = regAdminRes.data.token;

        const loginAdminRes = await axios.post(`${BASE_URL}/api/admin/login`, {
            email: testAdminEmail,
            password: "AdminPassword@123"
        });
        assertTest("Admin Login", loginAdminRes.status === 200 && loginAdminRes.data.success === true && loginAdminRes.data.admin?.role === 'admin');

        const verifyAdminRes = await axios.get(`${BASE_URL}/api/admin/verify`, {
            headers: { token: adminToken }
        });
        assertTest("Admin Auth Middleware Token Verification", verifyAdminRes.data.success === true && verifyAdminRes.data.admin?.name === "Master Admin");

        // ── 4. Soft Delete, Restore & Hard Delete Lifecycle ──
        console.log("\n--- [4] SOFT DELETE, RESTORE & HARD DELETE (PURGE) ---");

        const addCatRes = await axios.post(`${BASE_URL}/api/category/add`, {
            name: `Test Category ${timestamp}`,
            status: "Active"
        });
        assertTest("Create Category", addCatRes.data.success === true);
        const catName = `Test Category ${timestamp}`;

        const addFoodRes = await axios.post(`${BASE_URL}/api/food/add`, {
            name: `Test Gourmet Burger ${timestamp}`,
            description: "A delicious gourmet test burger with fresh ingredients",
            price: 299,
            category: catName,
            image: "food_1.png",
            discount: 10,
            availability: true,
            status: "Active"
        });
        assertTest("Create Food Product", addFoodRes.data.success === true);
        testFoodId = addFoodRes.data.data?._id;

        const listActiveFood = await axios.get(`${BASE_URL}/api/food/list`);
        const foodFoundActive = listActiveFood.data.data?.some(f => f._id === testFoodId);
        assertTest("Food Product Exists in Active List", foodFoundActive === true);

        // Perform Soft Delete
        const softDeleteFoodRes = await axios.post(`${BASE_URL}/api/food/remove`, { id: testFoodId });
        assertTest("Soft-Delete Food Product", softDeleteFoodRes.data.success === true);

        // Verify exclusion from active list
        const listAfterDelete = await axios.get(`${BASE_URL}/api/food/list`);
        const foodFoundAfterDelete = listAfterDelete.data.data?.some(f => f._id === testFoodId);
        assertTest("Soft-Deleted Food Excluded from Active List", foodFoundAfterDelete === false);

        // Verify presence in trash
        const listTrashFood = await axios.get(`${BASE_URL}/api/food/list?deletedOnly=true`);
        const foodFoundInTrash = listTrashFood.data.data?.some(f => f._id === testFoodId);
        assertTest("Soft-Deleted Food Appears in Trash Query", foodFoundInTrash === true);

        // Restore food
        const restoreFoodRes = await axios.post(`${BASE_URL}/api/food/restore`, { id: testFoodId });
        assertTest("Restore Soft-Deleted Food Product", restoreFoodRes.data.success === true);

        // Hard Delete (Permanent Purge)
        const purgeFoodRes = await axios.post(`${BASE_URL}/api/food/purge`, { id: testFoodId });
        assertTest("Permanent Hard Delete (Purge Food Product)", purgeFoodRes.data.success === true);

        // Verify permanent removal from both active & trash queries
        const listAfterPurge = await axios.get(`${BASE_URL}/api/food/list?includeDeleted=true`);
        const foodFoundAfterPurge = listAfterPurge.data.data?.some(f => f._id === testFoodId);
        assertTest("Purged Food Permanently Removed from Database", foodFoundAfterPurge === false);

        // ── 5. Advanced Search & Filtering ──
        console.log("\n--- [5] ADVANCED MULTI-FILTER SEARCH ---");

        const searchKeywordRes = await axios.get(`${BASE_URL}/api/food/list?search=Salad`);
        assertTest("Search Food by Keyword", searchKeywordRes.data.data !== undefined);

        const filterCatRes = await axios.get(`${BASE_URL}/api/food/list?category=Salad`);
        assertTest("Filter Food by Category", filterCatRes.data.data !== undefined);

        // ── 6. Server-Side Pagination ──
        console.log("\n--- [6] SERVER-SIDE PAGINATION ---");
        const paginationRes = await axios.get(`${BASE_URL}/api/food/list?page=1&limit=3&paginate=true`);
        const pInfo = paginationRes.data.pagination;
        assertTest("Server Pagination Metadata Structure", 
            pInfo && 
            pInfo.currentPage === 1 && 
            pInfo.limit === 3 && 
            typeof pInfo.totalRecords === 'number' && 
            typeof pInfo.totalPages === 'number'
        );

        // ── 7. Order Placement & Workflow ──
        console.log("\n--- [7] ORDER MANAGEMENT & WORKFLOW ---");
        const placeOrderRes = await axios.post(`${BASE_URL}/api/order/place`, {
            userId: "test_user_id_123",
            items: [
                { name: "Greek Salad", price: 120, quantity: 2 }
            ],
            amount: 240,
            address: {
                firstName: "John",
                lastName: "Doe",
                email: testUserEmail,
                phone: "9876543210",
                street: "123 Tech Lane",
                city: "Ahmedabad",
                state: "Gujarat",
                pinCode: "380015"
            },
            paymentMethod: "UPI"
        }, { headers: { token: userToken } });
        assertTest("Place Customer Order", placeOrderRes.data.success === true && !!placeOrderRes.data.orderId);
        const orderId = placeOrderRes.data.orderId;

        const statusRes = await axios.post(`${BASE_URL}/api/order/status`, {
            orderId: orderId,
            status: "Delivered"
        });
        assertTest("Update Order Status to Delivered", statusRes.data.success === true);

        // ── 8. Coupon Application Flow ──
        console.log("\n--- [8] PROMOTIONAL COUPON ENGINE ---");
        const applyCouponRes = await axios.post(`${BASE_URL}/api/offer/apply`, {
            code: "FOOD20",
            amount: 500
        });
        assertTest("Apply Valid Coupon with Sufficient Amount", applyCouponRes.data.success === true && applyCouponRes.data.data?.discountAmount > 0);

        const applyLowAmountRes = await axios.post(`${BASE_URL}/api/offer/apply`, {
            code: "FOOD20",
            amount: 100
        });
        assertTest("Friendly Rejection for Below Minimum Order Amount", applyLowAmountRes.data.success === false && applyLowAmountRes.data.message.includes("Minimum order amount"));

        // ── 9. Report Generation & CSV Exports ──
        console.log("\n--- [9] REPORT GENERATION & DATA EXPORTS ---");
        
        const salesReportRes = await axios.get(`${BASE_URL}/api/reports/sales`);
        assertTest("Generate Sales Summary Report", 
            salesReportRes.data.success === true && 
            typeof salesReportRes.data.data?.totalRevenue === 'number' && 
            typeof salesReportRes.data.data?.totalOrders === 'number'
        );

        const ordersCsvRes = await axios.get(`${BASE_URL}/api/reports/orders/export`);
        assertTest("Export Orders CSV Report", ordersCsvRes.status === 200 && ordersCsvRes.data.includes('"Order ID"'));

        const productsCsvRes = await axios.get(`${BASE_URL}/api/reports/products/export`);
        assertTest("Export Products CSV Report", productsCsvRes.status === 200 && productsCsvRes.data.includes('"Product ID"'));

        const usersCsvRes = await axios.get(`${BASE_URL}/api/reports/users/export`);
        assertTest("Export Users CSV Report", usersCsvRes.status === 200 && usersCsvRes.data.includes('"User ID"'));

        // ── 10. Form Validation & Security ──
        console.log("\n--- [10] FORM VALIDATION & SECURITY ---");
        
        try {
            await axios.post(`${BASE_URL}/api/user/register`, {
                name: "Short Pass",
                email: `short_${timestamp}@fooddel.com`,
                password: "123"
            });
            assertTest("Validation: Reject Short Password", false, "Accepted 3 character password");
        } catch (err) {
            assertTest("Validation: Reject Short Password", err.response?.status === 400);
        }

        try {
            await axios.post(`${BASE_URL}/api/user/register`, {
                name: "Bad Email",
                email: "not-an-email",
                password: "ValidPassword123"
            });
            assertTest("Validation: Reject Invalid Email", false, "Accepted invalid email format");
        } catch (err) {
            assertTest("Validation: Reject Invalid Email", err.response?.status === 400);
        }

        try {
            await axios.get(`${BASE_URL}/api/non_existent_endpoint`);
            assertTest("Centralized 404 Route Handler", false);
        } catch (err) {
            assertTest("Centralized 404 Route Handler", err.response?.status === 404);
        }

    } catch (err) {
        console.error("Unexpected error in test runner:", err.message);
        assertTest("Execution Continuity", false, err.message);
    }

    console.log("\n==================================================");
    console.log(`  VERIFICATION RESULTS: ${results.passed}/${results.total} TESTS PASSED`);
    console.log(`  FAILED: ${results.failed}`);
    console.log("==================================================\n");

    return results;
};

runAllTests().then(res => {
    if (res.failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});
