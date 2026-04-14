import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type CartSidebarState = {
    isOpen: boolean
    totalQuantity: number
}

const initialState: CartSidebarState = {
    isOpen: false,
    totalQuantity: 0,
}

const cartSidebarSlice = createSlice({
    name: "cartSidebar",
    initialState,
    reducers: {
        openCartSidebar: (state) => {
            state.isOpen = true
        },
        closeCartSidebar: (state) => {
            state.isOpen = false
        },
        // Luu tong so luong sau khi fetch thanh cong
        setCartTotalQuantity: (state, action: PayloadAction<number>) => {
            state.totalQuantity = action.payload
        },
        // Reset ve 0 khi logout
        resetCartTotalQuantity: (state) => {
            state.totalQuantity = 0
        },
    },
})

export const {
    openCartSidebar,
    closeCartSidebar,
    setCartTotalQuantity,
    resetCartTotalQuantity,
} = cartSidebarSlice.actions

export default cartSidebarSlice.reducer