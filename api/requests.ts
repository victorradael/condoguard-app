import axios from 'axios';
import { setStorageItemAsync, getValueFor } from './useStorageState'

const API_URL = process.env.EXPO_PUBLIC_CONDOGUARD_API;

export const apiSignIn = async (username: string, password: string) => {
    try {
        console.log(API_URL)
        const response = await axios.post(`${API_URL}/auth/login`, {
            username,
            password,
        });

        interface LoginResponse {
            token: string;
            roles: string[];
        }

        const data = response.data as LoginResponse;

        if (data.token && data.roles) {
            await setStorageItemAsync('token', data.token);
            await setStorageItemAsync('role', data.roles.join(','));
            return data.token
        }
    } catch (error: any) {
        throw error
    }
}

const getAuthHeader = async () => {
    const token = await getValueFor("token")
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchExpenses = async () => {
    const response = await axios.get(`${API_URL}/expenses`, {
        headers: await getAuthHeader(),
    });
    return response.data;
};