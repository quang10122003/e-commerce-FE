import { configureStore } from "@reduxjs/toolkit"
import { backendApi } from "@/client/api/backend-api"
import authReducer from "@/client/session/sessionSlice"
import loginReducer from "@/client/session/loginModalSlice"
import cartSidebarReducer from "@/features/cart/cartSidebarSlice"

export const store = configureStore({
    reducer: {
        // Global UI State
        login: loginReducer,
        auth: authReducer,
        cartSidebar: cartSidebarReducer,

        // Browser mutations and live widgets go through the Next API proxy.
        [backendApi.reducerPath]: backendApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(backendApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
