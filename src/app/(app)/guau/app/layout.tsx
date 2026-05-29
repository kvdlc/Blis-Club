import AppNav from "@/components/AppNav";
import DogBotFAB from "@/components/DogBotFAB";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:pl-56">
      <AppNav />
      <main className="pb-20 md:pb-6 px-4 pt-4 max-w-4xl mx-auto">
        {children}
      </main>
      <DogBotFAB />
    </div>
  );
}
