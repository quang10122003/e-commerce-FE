import type { NextRequest } from "next/server"
import {
  handleBackendProxyRequest,
  type BackendProxyRouteContext,
} from "@/server/backend-proxy"

export const dynamic = "force-dynamic"

function handler(request: NextRequest, context: BackendProxyRouteContext) {
  return handleBackendProxyRequest(request, context)
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
}
