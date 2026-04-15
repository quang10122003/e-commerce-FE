import Image from "next/image";
import { Card, CardContent } from "../ui/card";
export default function OrderCard() {
    return (
        <Card className="p-4 rounded-none">
            <div className="border-b pb-2 flex justify-between">
                <div className="flex gap-3">
                    {/* icon */}
                    <div className="bg-red-500 inline-flex items-center px-3  rounded">
                        <svg
                            // className="size-3.5"
                            viewBox="0 0 24 11"
                            width="23"
                            height="10"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-label="Mall"
                        >
                            <title>Mall</title>
                            <g fill="#fff" fillRule="evenodd">
                                <path d="M19.615 7.143V1.805a.805.805 0 0 0-1.611 0v5.377H18c0 1.438.634 2.36 1.902 2.77V9.95c.09.032.19.05.293.05.444 0 .805-.334.805-.746a.748.748 0 0 0-.498-.69v-.002c-.59-.22-.885-.694-.885-1.42h-.002zm3 0V1.805a.805.805 0 0 0-1.611 0v5.377H21c0 1.438.634 2.36 1.902 2.77V9.95c.09.032.19.05.293.05.444 0 .805-.334.805-.746a.748.748 0 0 0-.498-.69v-.002c-.59-.22-.885-.694-.885-1.42h-.002zm-7.491-2.985c.01-.366.37-.726.813-.726.45 0 .814.37.814.742v5.058c0 .37-.364.73-.813.73-.395 0-.725-.278-.798-.598a3.166 3.166 0 0 1-1.964.68c-1.77 0-3.268-1.456-3.268-3.254 0-1.797 1.497-3.328 3.268-3.328a3.1 3.1 0 0 1 1.948.696zm-.146 2.594a1.8 1.8 0 1 0-3.6 0 1.8 1.8 0 1 0 3.6 0z" />
                                <path
                                    d="M.078 1.563A.733.733 0 0 1 .565.89c.423-.15.832.16 1.008.52.512 1.056 1.57 1.88 2.99 1.9s2.158-.85 2.71-1.882c.19-.356.626-.74 1.13-.537.342.138.477.4.472.65a.68.68 0 0 1 .004.08v7.63a.75.75 0 0 1-1.5 0V3.67c-.763.72-1.677 1.18-2.842 1.16a4.856 4.856 0 0 1-2.965-1.096V9.25a.75.75 0 0 1-1.5 0V1.648c0-.03.002-.057.005-.085z"
                                    fillRule="nonzero"
                                />
                            </g>
                        </svg>
                    </div>
                    <h1 className="text-base md:text-xl font-bold text-gray-900">Tên danh mục</h1>
                </div>
                <div className="uppercase text-red-500 font-medium">
                    status
                </div>
            </div>
            <CardContent>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">

                    {/* Row trên: ảnh + text (cả mobile lẫn desktop) */}
                    <div className="flex items-start gap-3 md:flex-1 md:min-w-0">

                        {/* Ảnh */}
                        <div className="relative shrink-0 w-16 h-16 md:w-30 md:h-30 rounded-lg bg-gray-100 overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
                                alt=""
                                fill
                            />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 mx-4">
                            <p className=" font-normal text-[13px] md:text-[15px] text-gray-900 leading-snug line-clamp-2">
                                [MUA 2 GIẢM 42%] Combo 2 Gel bí đao rửa mặt giảm dầu và mụn Cocoon 310ml
                            </p>
                            <p className="text-xs md:text-sm text-gray-400 mt-1 ">x1</p>
                        </div>

                        {/* Giá — chỉ hiện trên desktop, nằm cùng hàng */}
                        <div className="hidden md:block shrink-0 text-right">
                            <span className="text-[15px] font-semibold text-red-600">347.000đ</span>
                        </div>

                    </div>

                    {/* Row dưới: giá — chỉ hiện trên mobile */}
                    <div className="flex justify-end items-center pt-2 border-t border-gray-100 md:hidden">
                        <span className="text-[15px] font-semibold text-red-600">347.000đ</span>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}