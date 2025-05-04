"use client";

import React, { useState, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import type { Task, Column } from "@/lib/types";

interface KanbanBoardProps {
    columns: Column[];
    tasks: Task[];
    onTaskDrop: (columnId: string, taskId: string) => void; // Renamed for clarity
    onColumnDrop: (draggedColumnId: string, targetColumnId: string) => void; // Added for column drop
    onAddTask: (columnId: string, newTask: Omit<Task, "id" | "columnId">) => void;
    onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
    onDeleteTask: (taskId: string) => void;
    onDeleteColumn: (columnId: string) => void;
    onEditColumn: (columnId: string, newTitle: string, newColor: string) => void;
}

export function KanbanBoard({
    columns,
    tasks,
    onTaskDrop,
    onColumnDrop,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onDeleteColumn,
    onEditColumn,
}: KanbanBoardProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null); // State for dragging column

   useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      const cardElement = target.closest('[data-task-id]');
      const columnElement = target.closest('[data-column-id]');

      if (cardElement && event.dataTransfer) {
         event.dataTransfer.effectAllowed = 'move';
         const taskId = cardElement.getAttribute('data-task-id');
         if (taskId) {
              event.dataTransfer.setData("taskId", taskId);
              setDraggingTaskId(taskId);
         }
         setDraggingColumnId(null); // Ensure only one type is dragged
      } else if (columnElement && target.closest('.column-drag-handle') && event.dataTransfer) { // Check if drag started from handle
         event.dataTransfer.effectAllowed = 'move';
         const columnId = columnElement.getAttribute('data-column-id');
         if (columnId) {
             event.dataTransfer.setData("columnId", columnId);
             setDraggingColumnId(columnId);
         }
         setDraggingTaskId(null); // Ensure only one type is dragged
      }
    };

    const handleDragEnd = () => {
      setDraggingTaskId(null);
      setDraggingColumnId(null); // Clear both on drag end
    };

    // Use capture phase for dragstart to ensure the handle is checked early
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);


  return (
    <div className="flex h-full gap-4 overflow-x-auto overflow-y-hidden p-4 bg-background">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column} // Pass the full column object
          tasks={tasks.filter((task) => task.columnId === column.id)}
          draggingTaskId={draggingTaskId}
          draggingColumnId={draggingColumnId} // Pass dragging column ID
          onTaskDrop={onTaskDrop} // Pass task drop handler
          onColumnDrop={onColumnDrop} // Pass column drop handler
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onDeleteColumn={onDeleteColumn}
          onEditColumn={onEditColumn}
        />
      ))}
    </div>
  );
}
