import Container from "@/components/shared/Container"

export default function ChatPage() {
  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <section className="surface-primary px-5 py-6 sm:px-6">
        <p className="section-kicker">Chat</p>
        <div className="mt-2 space-y-2">
          <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
            Trung tâm chat
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Khu vực chat sẽ hiển thị nội dung trao đổi và hỗ trợ khách hàng tại đây.
          </p>
        </div>
      </section>
    </Container>
  )
}
