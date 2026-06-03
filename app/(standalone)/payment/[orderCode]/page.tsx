"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useGetQrMutation } from "@/client/api/backend-api";
import { extractErrorMessage } from "@/lib/error";

export default function QrPage() {
    // Lấy orderCode từ dynamic route /payment/[orderCode]
    const { orderCode } = useParams<{ orderCode: string }>();

    const [getQr, { data, isLoading, error }] = useGetQrMutation();

    // null = chưa tính lần nào, tránh isExpired = true khi mới render
    const [remaining, setRemaining] = useState<number | null>(null);

    // Dùng ref để tránh gọi setRemaining synchronous trong effect
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Gọi API lấy QR khi component mount
    useEffect(() => {
        if (orderCode) {
            getQr({ orderCode });
        }
    }, [orderCode]);

    // data.data là QrRepone | null
    const qrData = data?.data;

    // Parse lỗi từ RTK Query error thành string hiển thị được
    const errorMessage = error ? extractErrorMessage(error) : null;

    // Chuyển expiredAt string thành timestamp ms, chỉ tính lại khi qrData thay đổi
    const expiredTime = useMemo(() => {
        if (!qrData?.expiredAt) return null;
        return new Date(qrData.expiredAt).getTime();
    }, [qrData]);

    // Chạy countdown mỗi giây, setState chỉ được gọi trong callback của setInterval
    useEffect(() => {
        if (!expiredTime) return;

        // Tick ngay lập tức sau 0ms — setState nằm trong callback, không synchronous
        tickRef.current = setInterval(() => {
            const diff = expiredTime - Date.now();
            setRemaining(diff > 0 ? diff : 0);
        }, 0);

        // Sau tick đầu tiên, chuyển sang interval 1 giây
        const timeout = setTimeout(() => {
            if (tickRef.current) clearInterval(tickRef.current);

            tickRef.current = setInterval(() => {
                const diff = expiredTime - Date.now();
                setRemaining(diff > 0 ? diff : 0);
            }, 1000);
        }, 50);

        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
            clearTimeout(timeout);
        };
    }, [expiredTime]);

    // Chỉ expired khi đã có expiredTime, remaining đã được tính (không null) và = 0
    const isExpired = expiredTime !== null && remaining !== null && remaining === 0;

    const formatTime = (ms: number) => {
        const total = Math.floor(ms / 1000);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleReset = () => {
        // Reset remaining về null để tránh flash "QR hết hạn" khi QR mới chưa load
        setRemaining(null);
        getQr({ orderCode });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md">

                {isLoading && <p>Đang tạo QR...</p>}

                {/* Lỗi từ backend — hiển thị thay cho QR (vd: đơn COD, order không tồn tại) */}
                {!isLoading && errorMessage && (
                    <div className="text-center">
                        <p className="text-red-500 font-semibold">{errorMessage}</p>
                    </div>
                )}

                {/* QR hợp lệ — chỉ render khi không có lỗi và có data */}
                {!isLoading && !errorMessage && qrData && (
                    <>
                        {/* Ảnh QR — ẩn khi hết hạn */}
                        {!isExpired && (
                            <Image
                                src={qrData.url}
                                alt="QR Code"
                                width={250}
                                height={250}
                            />
                        )}

                        {/* Countdown — chỉ hiện khi remaining đã được tính lần đầu */}
                        {!isExpired && remaining !== null && (
                            <p className="text-lg font-medium">
                                Hết hạn sau: {formatTime(remaining)}
                            </p>
                        )}

                        {/* Thông báo hết hạn + nút tạo lại */}
                        {isExpired && (
                            <div className="text-center">
                                <p className="text-red-500 font-semibold">
                                    QR đã hết hạn
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Tạo lại QR
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}