import { OrderResponse } from "@/types/order/OrderResponse";
import { Card } from "../ui/card";
import OrderCard from "./OrderCard";
import  MainButton  from '@/components/ui/main-button';
type props ={ 
    filteredOrder:OrderResponse
}
function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value)
}
export default function ContainerOrder({ filteredOrder }:props) {
    return (
        <>
            <Card className="rounded-b-[10px] overflow-hidden">
                <OrderCard />
                <OrderCard />
            </Card>
            <Card className="bg-[#fffefb] px-10">
                <div className="flex justify-center md:justify-end items-end gap-4 py-7 ">
                    <p className="text-base">
                        Thành tiền:
                    </p>
                    <p className="text-red-500 text-xl font-medium md:text-2xl">{formatCurrency(filteredOrder.totalAmount)}đ</p>
                </div>
                <div className="flex items-center justify-center md:justify-end gap-5 md:gap-7 pb-6 flex-wrap">
                    <MainButton
                        variant="outline"
                        className="rounded-[10px] bg-red-500 text-white min-w-30 md:min-w-40 
             hover:bg-red-600 hover:text-white hover:-translate-y-1 transition-all duration-300"
                    >
                        Hủy
                    </MainButton>
                </div>
            </Card>
        </>

    )
}