
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
      const dragHandle = target.closest('.column-drag-handle'); // Check for the drag handle

      if (cardElement && event.dataTransfer) {
         // Dragging a task card
         event.dataTransfer.effectAllowed = 'move';
         const taskId = cardElement.getAttribute('data-task-id');
         if (taskId) {
              event.dataTransfer.setData("taskId", taskId);
              setDraggingTaskId(taskId);
         }
         setDraggingColumnId(null); // Not dragging a column
      } else if (columnElement && dragHandle && event.dataTransfer) {
         // Dragging a column VIA its handle
         event.dataTransfer.effectAllowed = 'move';
         const columnId = columnElement.getAttribute('data-column-id');
         if (columnId) {
             event.dataTransfer.setData("columnId", columnId);
             setDraggingColumnId(columnId);
         }
         setDraggingTaskId(null); // Not dragging a task
      } else if (columnElement && !dragHandle && event.dataTransfer) {
          // Attempting to drag column without handle - prevent it
          event.preventDefault();
          event.stopPropagation(); // Stop bubbling further
          setDraggingColumnId(null);
          setDraggingTaskId(null);
      }
    };

    const handleDragEnd = () => {
      setDraggingTaskId(null);
      setDraggingColumnId(null); // Clear both on drag end
    };

    const boardElement = document.getElementById('kanban-board-container'); // Assuming you add this ID

    if (boardElement) {
        // Use capture phase for dragstart to potentially intercept early if needed,
        // though standard bubbling should work with the handle check.
        boardElement.addEventListener("dragstart", handleDragStart, false);
        // Dragend can be on the document as it fires on the source element
        document.addEventListener("dragend", handleDragEnd);

        return () => {
          boardElement.removeEventListener("dragstart", handleDragStart, false);
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
