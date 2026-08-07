import api from "../utils/axios";

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/api/me");
        if (response.data?.user) {
            try {
                const coinsRes = await api.get("/api/billing/coins");
                if (coinsRes.data?.success) {
                    response.data.user.interviewCoin = coinsRes.data.data.interviewCoins;
                }
            } catch (coinError) {
                console.error("Failed to fetch coins", coinError);
                response.data.user.interviewCoin = 0;
            }
        }
        return response.data;
    } catch (error: any) {
        console.log(error.response?.data || error.message);
        return null;
    }
};

