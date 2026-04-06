import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/features/auth/authSlice"
import { loginApi } from "@/features/auth/loginApi"
import loginReducer from "../features/auth/loginSlice"
import { tokenApi } from "@/features/auth/tokenApi"
import { categoryApi } from "@/features/category/categoryApi"
import { productsApi } from "@/features/product/productApi"

export const store = configureStore({
    reducer: {
        // Global UI State
        login: loginReducer,
        auth: authReducer,

        // Server State (RTK Query)
        [productsApi.reducerPath]: productsApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [loginApi.reducerPath]: loginApi.reducer,
        [tokenApi.reducerPath]: tokenApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(productsApi.middleware)
            .concat(categoryApi.middleware)
            .concat(loginApi.middleware)
            .concat(tokenApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
