
"use client";

import React, { useState, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import type { Task, Column } from "@/lib/types";
// Removed initial data and ID generators, they are now managed in page.tsx
// Removed Button, Plus, Dialog related imports as they are moved to page.tsx


interface KanbanBoardProps {
    columns: Column[];
    tasks: Task[];
    onDrop: (columnId: string, taskId: string) => void;
    onAddTask: (columnId: string, newTask: Omit<Task, "id" | "columnId">) => void;
    onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
    onDeleteTask: (taskId: string) => void;
    onDeleteColumn: (columnId: string) => void;
}

export function KanbanBoard({
    columns,
    tasks,
    onDrop,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onDeleteColumn,
}: KanbanBoardProps) {
  // State for tracking the currently dragged task ID remains local to the board
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

   // Global drag start/end handlers to set the currently dragged task ID
   // These could arguably live in page.tsx too, but keeping them here is fine
   // as they are closely related to the board's internal drag interactions.
  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      const cardElement = target.closest('[draggable="true"]');
      if (cardElement && event.dataTransfer) {
         // Use a more reliable way to get the taskId if possible,
         // but dataTransfer is the standard. Ensure it's set in TaskCard.
         event.dataTransfer.effectAllowed = 'move';
         // Retrieve the taskId set in TaskCard's onDragStart
         const taskId = event.dataTransfer.getData("taskId");
         if(taskId) {
            setDraggingTaskId(taskId);
         } else {
            // Fallback or error handling if taskId isn't set
            // This might happen if the drag starts unexpectedly elsewhere
            const idFromAttribute = cardElement.getAttribute('data-task-id');
            if (idFromAttribute) {
                 event.dataTransfer.setData("taskId", idFromAttribute); // Set it if possible
                 setDraggingTaskId(idFromAttribute);
            }
         }
      }
    };

    const handleDragEnd = () => {
      setDraggingTaskId(null);
    };

    // Using document level listeners to capture drag events globally within the board context
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []); // Empty dependency array means this runs once on mount


  // No need for isClient check here anymore, parent handles initial loading state
  return (
    // Ensure this container allows horizontal scrolling and fills height
    <div className="flex h-full gap-4 overflow-x-auto overflow-y-hidden p-4 bg-background">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks.filter((task) => task.columnId === column.id)}
          draggingTaskId={draggingTaskId}
          onDrop={onDrop} // Pass down the handler from props
          onAddTask={onAddTask} // Pass down the handler from props
          onEditTask={onEditTask} // Pass down the handler from props
          onDeleteTask={onDeleteTask} // Pass down the handler from props
          onDeleteColumn={onDeleteColumn} // Pass down the handler from props
        />
      ))}
       {/* "Add New Column" Button/Dialog is now removed from here and placed in page.tsx */}
    </div>
  );
}
