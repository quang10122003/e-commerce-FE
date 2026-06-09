"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useGetQrMutation } from "@/client/api/backend-api";
import { extractErrorMessage } from "@/lib/error";
import { usePaymentSocket, PaymentNotification } from "@/client/socket/payment/usePaymentSocket";

export default function QrPage() {
    const { orderCode } = useParams<{ orderCode: string }>();

    const [getQr, { data, isLoading, error }] = useGetQrMutation();
    const [remaining, setRemaining] = useState<number | null>(null);
    const [amountMismatch, setAmountMismatch] = useState(false);
    const [paidLate, setPaidLate] = useState(false);
    // Khách chuyển khoản lại cho đơn đã thanh toán trước đó.
    const [duplicatePayment, setDuplicatePayment] = useState(false);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Lấy QR khi mount ────────────────────────────────────────────────────────
    useEffect(() => {
        if (orderCode) getQr({ orderCode });
    }, [getQr, orderCode]);

    const qrData = data?.data;
    const errorMessage = error ? extractErrorMessage(error) : null;

    // ── Countdown ────────────────────────────────────────────────────────────────
    const expiredTime = useMemo(() => {
        if (!qrData?.expiredAt) return null;
        return new Date(qrData.expiredAt).getTime();
    }, [qrData]);

    useEffect(() => {
        if (!expiredTime) return;

        tickRef.current = setInterval(() => {
            const diff = expiredTime - Date.now();
            setRemaining(diff > 0 ? diff : 0);
        }, 0);

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

    const isExpired = expiredTime !== null && remaining !== null && remaining === 0;

    const formatTime = (ms: number) => {
        const total = Math.floor(ms / 1000);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleReset = () => {
        setRemaining(null);
        setAmountMismatch(false);
        getQr({ orderCode });
    };

    // ── WebSocket ────────────────────────────────────────────────────────────────
    usePaymentSocket({
        orderCode,

        onSuccess: (data: PaymentNotification) => {
            if (window.opener) {
                window.opener.location.href = `/success_order/${data.orderId}`;
                window.close();
                return;
            }

            window.location.href = `/success_order/${data.orderId}`;
        },

        onAmountMismatch: () => {
            setAmountMismatch(true);
        },

        onPaidLate: () => {
            setPaidLate(true);
        },

        // Đơn đã thanh toán trước đó, khách chuyển lại — hiển thị cảnh báo để liên hệ admin hoàn tiền.
        onDuplicatePayment: () => {
            setDuplicatePayment(true);
        },
    });

    // ── Render ───────────────────────────────────────────────────────────────────

    // PAID_LATE — thanh toán muộn, đơn có thể bị hủy
    if (paidLate) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md text-center">
                <h2 className="text-xl font-bold text-yellow-600">Thanh toán quá hạn</h2>
                <p className="text-sm text-gray-500">Đơn hàng có thể bị hủy. Vui lòng liên hệ admin để hoàn trả giao dịch.</p>
                <button
                    onClick={() => {
                        if (window.opener) {
                            window.opener.location.href = "/chat";
                            window.close();
                        }
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Chat với admin
                </button>
            </div>
        </div>
    );

    // DUPLICATE_PAYMENT — đơn đã được thanh toán, khách chuyển khoản lại
    if (duplicatePayment) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md text-center">
                <h2 className="text-xl font-bold text-yellow-600">Giao dịch trùng lặp</h2>
                <p className="text-sm text-gray-500">Đơn hàng này đã được thanh toán trước đó. Vui lòng liên hệ admin để được hỗ trợ hoàn tiền.</p>
                <button
                    onClick={() => {
                        if (window.opener) {
                            window.opener.location.href = "/chat";
                            window.close();
                        }
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Chat với admin
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md">

                {isLoading && <p>Đang tạo QR...</p>}

                {/* Lỗi từ backend */}
                {!isLoading && errorMessage && (
                    <div className="text-center">
                        <p className="text-red-500 font-semibold">{errorMessage}</p>
                    </div>
                )}

                {/* QR hợp lệ */}
                {!isLoading && !errorMessage && qrData && (
                    <>
                        {/* AMOUNT_MISMATCH — ẩn QR, hiện thông báo + nút reset */}
                        {amountMismatch ? (
                            <div className="text-center">
                                <p className="text-yellow-600 font-semibold">Số tiền chuyển khoản không khớp</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Vui lòng tạo lại QR và chuyển đúng số tiền, vui lòng liên hệ lại với admin để hoàn lại tiền cho giao dịch vừa rồi.
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Tạo lại QR
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* QR image — ẩn khi hết hạn */}
                                {!isExpired && (
                                    <Image src={qrData.url} alt="QR Code" width={250} height={250} />
                                )}

                                {/* Countdown */}
                                {!isExpired && remaining !== null && (
                                    <p className="text-lg font-medium">
                                        Hết hạn sau: {formatTime(remaining)}
                                    </p>
                                )}

                                {/* Hết hạn */}
                                {isExpired && (
                                    <div className="text-center">
                                        <p className="text-red-500 font-semibold">QR đã hết hạn</p>
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
                    </>
                )}
            </div>
        </div>
    );
}
