export default function Loading() {
  return (
    <div className="surface-secondary flex min-h-40 w-full items-center justify-center gap-3 p-6 text-slate-500">
      <div
        aria-label="Dang tai du lieu"
        className="size-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-primary"
      />
      <p className="text-sm font-medium">Dang tai du lieu</p>
    </div>
  )
}
