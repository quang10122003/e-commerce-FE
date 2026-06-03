import Navbar from "@/components/header/Navbar"
import Footer from "@/components/footer/Footer"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
        </div>
    )
}