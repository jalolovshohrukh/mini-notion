
"use client";

import React, { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddColumnForm } from "@/components/kanban/AddColumnForm";
import type { Task, Column } from "@/lib/types";
import { initialColumns, initialTasks } from "@/lib/initial-data";
import { generateTaskId, generateColumnId } from "@/lib/utils";

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  // Load initial data or from localStorage only on the client
  useEffect(() => {
    setIsClient(true);
    const savedTasks = localStorage.getItem("kanbanTasks");
    const savedColumns = localStorage.getItem("kanbanColumns");

    if (savedColumns) {
        try {
            const parsedColumns = JSON.parse(savedColumns);
             // Basic validation including the new color property
            if (Array.isArray(parsedColumns) && parsedColumns.every(col => col.id && col.title && typeof col.color === 'string')) {
                 setColumns(parsedColumns);
            } else {
                console.warn("Invalid or outdated columns data found in localStorage, using initial data.");
                setColumns(initialColumns);
            }
        } catch (error) {
            console.error("Error parsing columns from localStorage:", error);
            setColumns(initialColumns); // Fallback to initial data on parse error
        }
    } else {
        setColumns(initialColumns);
    }

    if (savedTasks) {
         try {
            const parsedTasks = JSON.parse(savedTasks);
             // Basic validation
             if (Array.isArray(parsedTasks) && parsedTasks.every(task => task.id && task.title && task.columnId)) {
                 setTasks(parsedTasks);
            } else {
                 console.warn("Invalid tasks data found in localStorage, using initial data.");
                 setTasks(initialTasks);
            }
        } catch (error) {
            console.error("Error parsing tasks from localStorage:", error);
            setTasks(initialTasks); // Fallback to initial data on parse error
        }
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
  };

  const handleAddTask = (columnId: string, newTaskData: Omit<Task, "id" | "columnId">) => {
     if (!isClient) return;
     const newTask: Task = {
        ...newTaskData,
        id: generateTaskId(),
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

   const handleAddColumn = (title: string, color: string) => {
    if (!isClient) return;
    const newColumn: Column = {
      id: generateColumnId(),
      title: title,
      color: color, // Store the color
    };
    setColumns((prevColumns) => [...prevColumns, newColumn]);
    setIsAddColumnDialogOpen(false);
  };

  const handleDeleteColumn = (columnIdToDelete: string) => {
     if (!isClient) return;
     setColumns((prevColumns) => prevColumns.filter((column) => column.id !== columnIdToDelete));
     setTasks((prevTasks) => prevTasks.filter((task) => task.columnId !== columnIdToDelete));
  };

   // Render placeholder or loading state until client-side hydration
  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading Kanban Board...</p>
      </div>
    );
  }


  return (
    <main className="flex flex-col h-screen bg-background">
        {/* Header with Title and Add Column Button */}
        <header className="p-4 border-b shrink-0 flex justify-between items-center">
             <h1 className="text-xl font-semibold text-foreground">TaskFlow Kanban</h1>
             <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Column
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <AddColumnForm onAddColumn={handleAddColumn} onClose={() => setIsAddColumnDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </header>
        {/* Kanban Board Area */}
        <div className="flex-1 overflow-hidden"> {/* Container for the board */}
            <KanbanBoard
                columns={columns}
                tasks={tasks}
                onDrop={handleDrop}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDeleteColumn={handleDeleteColumn}
            />
        </div>
    </main>
  );
}
