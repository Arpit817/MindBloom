import Sidebar from "@/components/layout/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation";

export default function ProtectedLayout({ children }) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="md:pl-[260px] flex flex-col flex-1 min-h-dvh">
        <main className="flex-1 pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
