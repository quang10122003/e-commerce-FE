"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreditCard, MapPin, PackageCheck, Truck } from "lucide-react"

import { useCreateOrderMutation } from "@/client/api/backend-api"
import Container from "@/components/shared/Container"
import MainButton from "@/components/ui/main-button"
import { Input } from "@/components/ui/input"
import { useNotification } from "@/components/ui/NotificationProvider"
import { extractErrorMessage } from "@/lib/error"
import { formatCurrency } from "@/lib/format"
import { getProductInitials } from "@/lib/product-display"
import type { CheckoutCartResponse } from "@/types/cart/CheckoutCartResponse"
import type { OrderRequest } from "@/types/order/CreateOrderRequest"
import { CheckoutResponse } from "@/types/order/OrderResponse"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"

type CheckoutPageClientProps = {
  checkoutData: CheckoutCartResponse | null
  errorMessage: string | null
}

const PAYMENT_METHOD_COD = "COD"
const PAYMENT_METHOD_SEPAY = "SEPAY"

export default function CheckoutPageClient({
  checkoutData,
  errorMessage,
}: CheckoutPageClientProps) {
  
  const router = useRouter()
  const { showNotification } = useNotification()
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()

  // Lưu họ tên người nhận nhập trong form giao hàng.
  const [shippingName, setShippingName] = useState("")

  // Lưu số điện thoại người nhận nhập trong form giao hàng.
  const [shippingPhone, setShippingPhone] = useState("")

  // Lưu địa chỉ giao hàng chi tiết của đơn hàng.
  const [shippingAddress, setShippingAddress] = useState("")

  // Lưu phương thức thanh toán người dùng đang chọn.
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD_COD)

  // Lưu danh sách sản phẩm checkout đã được backend chuẩn hóa theo request.
  const checkoutItems = checkoutData?.items ?? []

  // Lưu tổng số lượng sản phẩm do backend trả về cho màn checkout.
  const totalQuantity = checkoutData?.totalQuantity ?? 0

  // Lưu tổng tiền thanh toán do backend trả về cho màn checkout.
  const displayedCheckoutTotalAmount = checkoutData?.totalAmount ?? 0
  

  // Tạo đơn hàng COD bằng API create order hiện tại.
  async function handleCreateOrderByCod() {
    // Chuẩn hóa payload tạo đơn theo OrderRequest mới của backend.
    const orderRequest: OrderRequest = {
      items: checkoutItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod,
      shippingAddress: {
        address: shippingAddress.trim(),
        fullName: shippingName.trim(),
        phone: shippingPhone.trim(),
      },
    }

    try {
      const repone = await createOrder(orderRequest).unwrap()
      // showNotification("Đặt hàng thành công. Đơn hàng của bạn đang chờ xác nhận.", {
      //   variant: "success",
      // })
      router.push(`/success_order/${repone.data?.orderCode}`)
    } catch (error) {
      showNotification(extractErrorMessage(error), {
        variant: "error",
      })
    }
  }

  // Xử lý tạo đơn SEPAY sẽ được tích hợp API thanh toán sau.
  async function handleCreateOrderBySepay() {
    const orderRequest: OrderRequest = {
      items: checkoutItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod,
      shippingAddress: {
        address: shippingAddress.trim(),
        fullName: shippingName.trim(),
        phone: shippingPhone.trim(),
      },
    }
    try{
      await createOrder(orderRequest).unwrap()

    }catch(e){

    }
  }

  // Gửi thông tin giao hàng và sản phẩm đã chọn theo phương thức thanh toán.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (checkoutItems.length === 0) {
      showNotification("Vui lòng chọn sản phẩm trong giỏ hàng trước khi thanh toán.", {
        variant: "warning",
      })
      return
    }

    // Chạy flow tạo đơn COD khi người dùng chọn thanh toán khi nhận hàng.
    if (paymentMethod === PAYMENT_METHOD_COD) {
      await handleCreateOrderByCod()
      return
    }

    // Chạy flow SEPAY tạm thời để trống chờ tích hợp.
    if (paymentMethod === PAYMENT_METHOD_SEPAY) {
      handleCreateOrderBySepay()
    }
  }

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <div className="space-y-6">
        {/* Header checkout hiển thị ngữ cảnh thanh toán đơn hàng. */}
        <div className="surface-primary px-5 py-6 sm:px-6">
          <p className="section-kicker">Checkout</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
                Thanh toán đơn hàng
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Kiểm tra sản phẩm, nhập thông tin giao hàng và xác nhận phương thức thanh toán.
              </p>
            </div>
            <div className="rounded-[12px] bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
              {totalQuantity} sản phẩm
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="surface-primary px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-950">Không thể tải dữ liệu checkout</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Vui lòng thử lại sau ít phút nữa.
            </p>
          </div>
        ) : checkoutItems.length === 0 ? (
          <div className="surface-primary px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-950">Chưa có sản phẩm để thanh toán</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Hãy quay lại giỏ hàng và chọn sản phẩm bạn muốn đặt mua.
            </p>
            <div className="mt-6">
              <Link href="/cart">
                <MainButton>Quay lại giỏ hàng</MainButton>
              </Link>
            </div>
          </div>
        ) : (
          <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Block UI thông tin giao hàng để người mua nhập dữ liệu nhận hàng. */}
              <section className="surface-primary p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="section-kicker">Shipping</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                      Thông tin nhận hàng
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Họ tên người nhận
                    <Input
                      onChange={(event) => setShippingName(event.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                      value={shippingName}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Số điện thoại
                    <Input
                      inputMode="tel"
                      onChange={(event) => setShippingPhone(event.target.value)}
                      placeholder="0901234567"
                      required
                      value={shippingPhone}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Địa chỉ giao hàng
                    <Input
                      onChange={(event) => setShippingAddress(event.target.value)}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                      required
                      value={shippingAddress}
                    />
                  </label>
                </div>
              </section>

              {/* Block UI phương thức thanh toán của đơn hàng. */}
              <section className="surface-primary p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
                    <CreditCard className="size-5" />
                  </div>
                  <div>
                    <p className="section-kicker">Payment</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                      Phương thức thanh toán
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <label className="surface-secondary flex cursor-pointer items-start gap-3 p-4">
                    <input
                      checked={paymentMethod === PAYMENT_METHOD_COD}
                      className="mt-1 size-4 rounded border-border accent-primary"
                      onChange={() => setPaymentMethod(PAYMENT_METHOD_COD)}
                      name="paymentMethod"
                      type="radio"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">
                        Thanh toán khi nhận hàng
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">
                        Bạn thanh toán trực tiếp cho nhân viên giao hàng sau khi nhận sản phẩm.
                      </span>
                    </span>
                  </label>

                  <label className="surface-secondary flex cursor-pointer items-start gap-3 p-4">
                    <input
                      checked={paymentMethod === PAYMENT_METHOD_SEPAY}
                      className="mt-1 size-4 rounded border-border accent-primary"
                      onChange={() => setPaymentMethod(PAYMENT_METHOD_SEPAY)}
                      name="paymentMethod"
                      type="radio"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">
                        Thanh toán qua QR code
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">
                        Bạn thanh toán ngay bây giờ.
                      </span>
                    </span>
                  </label>
                </div>
              </section>
            </div>

            {/* Block UI tóm tắt sản phẩm và tổng tiền trước khi đặt hàng. */}
            <aside className="surface-primary h-fit p-5 sm:p-6 lg:sticky lg:top-28">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
                  <PackageCheck className="size-5" />
                </div>
                <div>
                  <p className="section-kicker">Summary</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                    Tóm tắt đơn hàng
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {checkoutItems.map((item) => (
                  <article key={item.productId} className="surface-secondary flex gap-3 p-3">
                    <div
                      className="flex size-16 shrink-0 items-center justify-center rounded-[12px] border border-border bg-white bg-cover bg-center text-sm font-bold text-slate-600"
                      style={
                        item.thumbnail
                          ? {
                              backgroundImage: `url(${item.thumbnail})`,
                            }
                          : undefined
                      }
                    >
                      {!item.thumbnail ? getProductInitials(item.productName) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-950">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        SL: {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-950">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 grid gap-3">
                <div className="surface-secondary flex items-center justify-between p-4 text-sm">
                  <span className="text-slate-500">Tổng số lượng</span>
                  <span className="font-semibold text-slate-950">{totalQuantity}</span>
                </div>
                <div className="surface-secondary flex items-center justify-between p-4 text-sm">
                  <span className="text-slate-500">Phí vận chuyển</span>
                  <span className="font-semibold text-slate-950">Miễn phí</span>
                </div>
                <div className="rounded-[16px] border border-[#bfd2f6] bg-primary-soft p-4">
                  <p className="text-sm font-medium text-primary">Tổng thanh toán</p>
                  <p className="mt-2 text-[30px] font-bold tracking-tight text-slate-950">
                    {formatCurrency(displayedCheckoutTotalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <MainButton disabled={isCreatingOrder} fullWidth type="submit">
                  <Truck className="size-4" />
                  {isCreatingOrder ? "Đang đặt hàng" : "Đặt hàng"}
                </MainButton>
                <Link href="/cart">
                  <MainButton fullWidth type="button" variant="secondary">
                    Quay lại giỏ hàng
                  </MainButton>
                </Link>
              </div>
            </aside>
          </form>
        )}
      </div>
    </Container>
  )
}
