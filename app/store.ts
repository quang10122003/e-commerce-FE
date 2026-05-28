import { configureStore } from "@reduxjs/toolkit"
import { backendApi } from "@/client/api/backend-api"
import authReducer from "@/client/session/sessionSlice"
import loginReducer from "@/client/session/loginModalSlice"
import cartSidebarReducer from "@/features/cart/cartSidebarSlice"

export const store = configureStore({
    reducer: {
        // Trạng thái UI dùng chung
        login: loginReducer,
        auth: authReducer,
        cartSidebar: cartSidebarReducer,

        // Các thao tác phía trình duyệt và widget realtime đi qua API proxy của Next.
        [backendApi.reducerPath]: backendApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(backendApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
