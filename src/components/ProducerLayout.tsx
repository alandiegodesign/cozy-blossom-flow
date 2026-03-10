import { FixedProducerSidebar } from '@/components/ProducerSidebar';

export default function ProducerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <FixedProducerSidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
