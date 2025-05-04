import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
        {/* Header could go here */}
        {/* <header className="p-4 border-b">
             <h1 className="text-2xl font-semibold">TaskFlow Kanban</h1>
           </header> */}
      <div className="flex-1 overflow-hidden"> {/* Allow board to scroll internally */}
         <KanbanBoard />
      </div>
    </main>
  );
}
