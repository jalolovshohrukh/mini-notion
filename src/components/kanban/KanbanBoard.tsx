
"use client";

import React, { useState, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import type { Task, Column } from "@/lib/types";

interface KanbanBoardProps {
    columns: Column[];
    tasks: Task[];
    onDrop: (columnId: string, taskId: string) => void;
    onAddTask: (columnId: string, newTask: Omit<Task, "id" | "columnId">) => void;
    onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
    onDeleteTask: (taskId: string) => void;
    onDeleteColumn: (columnId: string) => void;
    onEditColumn: (columnId: string, newTitle: string, newColor: string) => void;
}

export function KanbanBoard({
    columns,
    tasks,
    onDrop,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onDeleteColumn,
    onEditColumn,
}: KanbanBoardProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

   useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      const cardElement = target.closest('[draggable="true"]');
      if (cardElement && event.dataTransfer) {
         event.dataTransfer.effectAllowed = 'move';
         const taskId = event.dataTransfer.getData("taskId");
         if(taskId) {
            setDraggingTaskId(taskId);
         } else {
            const idFromAttribute = cardElement.getAttribute('data-task-id');
            if (idFromAttribute) {
                 event.dataTransfer.setData("taskId", idFromAttribute);
                 setDraggingTaskId(idFromAttribute);
            }
         }
      }
    };

    const handleDragEnd = () => {
      setDraggingTaskId(null);
    };

    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
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
          onDrop={onDrop}
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
