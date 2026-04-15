import { Card } from "../ui/card";
import OrderCard from "./OrderCard";
import  MainButton  from '@/components/ui/main-button';

export default function ContainerOrder() {
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
                    <p className="text-red-500 text-xl font-medium md:text-2xl">4000.000đ</p>
                </div>
                <div className="flex items-center justify-center md:justify-end gap-5 md:gap-7 pb-6 flex-wrap">
                    <MainButton variant={"outline"} className="rounded-[10px] bg-red-500 text-white  min-w-20 md:min-w-30">
                        Đánh giá
                    </MainButton>
                    <MainButton variant={"outline"} className="rounded-[10px] min-w-20 md:min-w-30">
                        Hủy
                    </MainButton>
                </div>
            </Card>
        </>

    )
}