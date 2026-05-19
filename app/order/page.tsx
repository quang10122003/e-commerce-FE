import OrderClient from "@/components/order/OrderClient";
import { serverPrivateFetch } from "@/server/backend-fetch";
import type { OrderResponse, OrderStatus } from "@/types/order/OrderResponse";

type OrderPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const VALID_ORDER_STATUS = new Set<OrderStatus>(["PENDING", "SHIPPING", "COMPLETED", "CANCELLED"]);

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSelectedStatus(params: Record<string, string | string[] | undefined>) {
  const status = readSearchParam(params.status);

  return status && VALID_ORDER_STATUS.has(status as OrderStatus) ? status : "All";
}

async function getOrderInitialData() {
  const response = await serverPrivateFetch<OrderResponse[]>("/orders/me").catch(() => null);

  return {
    errorMessage: response?.data ? null : "Khong the tai don hang.",
    orders: response?.data ?? [],
  };
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const params = await searchParams;
  const selectedStatus = parseSelectedStatus(params);
  const { errorMessage, orders } = await getOrderInitialData();

  return(
    <OrderClient errorMessage={errorMessage} orders={orders} selectedStatus={selectedStatus}/>
  )
}
