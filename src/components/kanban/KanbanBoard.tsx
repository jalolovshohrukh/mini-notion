
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
    // Use a single listener on the board container for drag start (event delegation)
    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      const cardElement = target.closest('[data-task-id]');
      const columnElement = target.closest('[data-column-id]');
      const dragHandle = target.closest('.column-drag-handle'); // Check if drag started on the handle

      // Ensure dataTransfer is available
      if (!event.dataTransfer) return;

      if (cardElement && !dragHandle) { // Check it's a task card AND not the column handle itself
         // Dragging a task card
         const taskId = cardElement.getAttribute('data-task-id');
         if (taskId) {
              event.dataTransfer.setData("taskId", taskId);
              event.dataTransfer.effectAllowed = 'move';
              setDraggingTaskId(taskId);
              setDraggingColumnId(null); // Ensure column dragging state is cleared
              // console.log('Dragging Task:', taskId);
         }
      } else if (columnElement && dragHandle) {
         // Dragging a column VIA its handle
         const columnId = columnElement.getAttribute('data-column-id');
         if (columnId) {
             event.dataTransfer.setData("columnId", columnId);
             event.dataTransfer.effectAllowed = 'move';
             setDraggingColumnId(columnId);
             setDraggingTaskId(null); // Ensure task dragging state is cleared
             // console.log('Dragging Column:', columnId);
         }
      } else if (target.closest('[data-column-id]') && !dragHandle) {
          // Prevent drag if started on column body but NOT the handle
          event.preventDefault();
          event.stopPropagation();
          setDraggingColumnId(null);
          setDraggingTaskId(null);
          // console.log('Drag prevented on column body (not handle):', target);
      }
    };

    const handleDragEnd = () => {
      // console.log('Drag End');
      setDraggingTaskId(null);
      setDraggingColumnId(null); // Clear both on drag end
    };

    // Use a more specific container if possible, but document works
    const boardContainer = document.getElementById('kanban-board-container');

    if (boardContainer) {
        // Use capture phase for dragstart to potentially intercept early if needed,
        // though standard bubbling should work with the handle check.
        boardContainer.addEventListener("dragstart", handleDragStart);
        // Dragend can be on the document as it fires on the source element
        document.addEventListener("dragend", handleDragEnd);

        return () => {
          boardContainer.removeEventListener("dragstart", handleDragStart);
          document.removeEventListener("dragend", handleDragEnd);
        };
    }
  }, []); // Empty dependency array ensures this runs once on mount


  return (
    // Add an ID for easier event listener attachment
    <div id="kanban-board-container" className="flex h-full gap-4 overflow-x-auto overflow-y-hidden p-4 bg-background">
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
