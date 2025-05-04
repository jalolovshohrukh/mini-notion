
"use client";

import React, { useState, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import type { Task, Column } from "@/lib/types";
import { initialColumns, initialTasks } from "@/lib/initial-data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddColumnForm } from "./AddColumnForm"; // Import the new form
import { generateTaskId, generateColumnId } from "@/lib/utils"; // Import ID generators

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);


  // Load initial data or from localStorage only on the client
  useEffect(() => {
    setIsClient(true);
    const savedTasks = localStorage.getItem("kanbanTasks");
    const savedColumns = localStorage.getItem("kanbanColumns");

    if (savedColumns) {
        setColumns(JSON.parse(savedColumns));
    } else {
        setColumns(initialColumns);
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(initialTasks);
    }
  }, []);

  // Save tasks to localStorage whenever they change (client-side only)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  // Save columns to localStorage whenever they change (client-side only)
  useEffect(() => {
    if (isClient) {
        localStorage.setItem("kanbanColumns", JSON.stringify(columns));
    }
  }, [columns, isClient]);


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
        id: generateTaskId(), // Generate Task ID client-side
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
     // Optional: Also delete tasks when a column is deleted (more complex logic needed)
  };

   const handleAddColumn = (title: string) => {
    if (!isClient) return;
    const newColumn: Column = {
      id: generateColumnId(), // Generate Column ID client-side
      title: title,
    };
    setColumns((prevColumns) => [...prevColumns, newColumn]);
    setIsAddColumnDialogOpen(false); // Close dialog after adding
  };

  const handleDeleteColumn = (columnIdToDelete: string) => {
     if (!isClient) return;
     // Prevent deleting the last column maybe? Add confirmation?
     setColumns((prevColumns) => prevColumns.filter((column) => column.id !== columnIdToDelete));
     // Also delete tasks associated with this column
     setTasks((prevTasks) => prevTasks.filter((task) => task.columnId !== columnIdToDelete));
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
    <div className="flex h-full gap-4 overflow-x-auto p-4 bg-background"> {/* Removed w-full */}
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
          onDeleteColumn={handleDeleteColumn} // Pass delete handler
        />
      ))}
       {/* Button to add a new column */}
       <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
          <DialogTrigger asChild>
            <Button
                variant="outline"
                className="h-full min-w-[280px] flex-shrink-0 border-dashed border-2 hover:border-primary hover:text-primary"
             >
                <Plus className="mr-2 h-4 w-4" /> Add New Column
             </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
             <AddColumnForm onAddColumn={handleAddColumn} onClose={() => setIsAddColumnDialogOpen(false)} />
          </DialogContent>
        </Dialog>
    </div>
  );
}
