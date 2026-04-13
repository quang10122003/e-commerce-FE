import Container from "@/components/shared/Container"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Container className="py-12">
      <div className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
          Product Detail
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Sản phẩm #{id}</h1>
        <p className="mt-4 text-slate-500">
          Phần chi tiết sản phẩm chưa được chuyển đổi vì repo hiện chưa có API/detail UI tương ứng.
        </p>
      </div>
    </Container>
  )
}
