import { useEffect, useCallback, useReducer } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];


function useAsyncState<T>(initialValue: [boolean, T | null] = [true, null]): UseStateHook<T> {
    return useReducer(
        (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action], initialValue
    ) as UseStateHook<T>
}

export async function setStorageItemAsync(key: string, value: string | null) {
    if (Platform.OS === 'web') {
        try {
            if (value === null) {
                localStorage.removeItem(key)
            } else {
                localStorage.setItem(key, value)
            }
        } catch (error) {
            console.error('Local Storage is unavailable', error)
        }
    } else {
        if (value == null) {
            await SecureStore.deleteItemAsync(key)
        } else {
            await SecureStore.setItem(key, value)
        }
    }
}

export function useStorageState(key: string): UseStateHook<string> {
    const [state, setState] = useAsyncState<string>();

    useEffect(() => {
        if (Platform.OS === 'web') {
            try {
                if (typeof localStorage !== 'undefined') {
                    setState(localStorage.getItem(key))
                }
            } catch (error) {
                console.error('Local Storage is Unavailable', error)
            }
        } else {
            SecureStore.getItemAsync(key).then(value => {
                setState(value)
            })
        }
    }, [key])

    const setValue = useCallback((value: string | null) => {
        setState(value)
        setStorageItemAsync(key, value)
    }, [key])

    return [state, setValue]
}

export async function getValueFor(key: string) {
    try {
        if (Platform.OS === 'web') {
            const result = await localStorage.getItem(key);
            if (result) {
                return result
            } else {
                alert('No values stored under that key.');
            }
        } else {
            const result = await SecureStore.getItemAsync(key);
            if (result) {
                return result
            } else {
                alert('No values stored under that key.');
            }
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
    }
}