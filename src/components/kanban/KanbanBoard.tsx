"use client";

import React, { useState, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import type { Task, Column } from "@/lib/types";
import { initialColumns, initialTasks } from "@/lib/initial-data";

// Helper function to generate unique IDs (client-side)
const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load initial data or from localStorage only on the client
  useEffect(() => {
    setIsClient(true);
    const savedTasks = localStorage.getItem("kanbanTasks");
    const savedColumns = localStorage.getItem("kanbanColumns"); // If columns are dynamic

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(initialTasks);
    }

    // Assuming columns are static for now, but could load saved columns here too
    setColumns(initialColumns);

  }, []);

  // Save tasks to localStorage whenever they change (client-side only)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
    }
  }, [tasks, isClient]);


  const handleDrop = (columnId: string, taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, columnId: columnId } : task
      )
    );
    setDraggingTaskId(null); // Reset dragging state after drop
  };

  const handleAddTask = (columnId: string, newTaskData: Omit<Task, "id" | "columnId">) => {
     if (!isClient) return; // Prevent adding tasks on server render
     const newTask: Task = {
        ...newTaskData,
        id: generateId(), // Generate ID client-side
        columnId: columnId,
     };
     setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleEditTask = (taskId: string, updatedTaskData: Omit<Task, "id" | "columnId">) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedTaskData } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };


  // Global drag start handler to set the currently dragged task ID
  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      // Check if the drag started on a TaskCard (or its child)
      const cardElement = target.closest('[draggable="true"]');
      if (cardElement && event.dataTransfer) {
         const taskId = event.dataTransfer.getData("taskId");
         if(taskId) { // Ensure taskId was set correctly in TaskCard
            setDraggingTaskId(taskId);
         }
      }
    };

    const handleDragEnd = () => {
      // Reset dragging state when drag ends (dropped or cancelled)
      setDraggingTaskId(null);
    };

    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  // Render placeholder or loading state until client-side hydration
  if (!isClient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading Kanban Board...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto p-4 bg-background">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks.filter((task) => task.columnId === column.id)}
          draggingTaskId={draggingTaskId}
          onDrop={handleDrop}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      ))}
    </div>
  );
}
