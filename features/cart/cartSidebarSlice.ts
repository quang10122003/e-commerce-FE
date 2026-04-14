import { createSlice } from "@reduxjs/toolkit"

type CartSidebarState   ={ 
    isOpen : boolean
}
const initialState:CartSidebarState = { 
    isOpen :false
}
const cartSidebarSlice  = createSlice({
    name:'cartSidebar',
    initialState,
    reducers:{
        openCartSidebar:(state) =>{
            state.isOpen = true
        },
        closeCartSidebar:(state)=>{
            state.isOpen = false
        }
    }
})
export const { openCartSidebar, closeCartSidebar } = cartSidebarSlice.actions
export default cartSidebarSlice.reducer