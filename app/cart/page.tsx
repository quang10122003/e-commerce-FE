export default function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
          Cart
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Trang giỏ hàng</h1>
        <p className="mt-4 text-slate-500">
          Dữ liệu store và API cho giỏ hàng được giữ nguyên, phần layout đã được đồng bộ theo cấu trúc mới.
        </p>
      </div>
    </div>
  )
}
