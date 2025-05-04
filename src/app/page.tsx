
"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from 'next/navigation'; // Import useRouter
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Loader2 } from "lucide-react"; // Import LogOut and Loader2
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddColumnForm } from "@/components/kanban/AddColumnForm";
import type { Task, Column, Priority } from "@/lib/types";
import { initialColumns, initialTasks } from "@/lib/initial-data";
import { generateTaskId, generateColumnId } from "@/lib/utils";
import { AuthContext } from "@/context/AuthContext"; // Import AuthContext

// Basic HEX color format validation (e.g., #RRGGBB or #RGB)
const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/;
const validPriorities: Priority[] = ["High", "Medium", "Low"];

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  const { user, loading, logout } = useContext(AuthContext); // Get auth state and logout function
  const router = useRouter(); // Initialize router

  // Authentication Check and Redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if not authenticated and not loading
    }
  }, [user, loading, router]);


  // Load initial data or from localStorage only on the client AFTER auth check passes
  useEffect(() => {
    // Only run if authenticated and client-side
    if (user && typeof window !== 'undefined') {
        setIsClient(true);
        const savedTasks = localStorage.getItem("kanbanTasks");
        const savedColumns = localStorage.getItem("kanbanColumns");

        if (savedColumns) {
            try {
                const parsedColumns = JSON.parse(savedColumns);
                if (Array.isArray(parsedColumns) && parsedColumns.every(col => col.id && col.title && typeof col.color === 'string' && hexColorRegex.test(col.color))) {
                    setColumns(parsedColumns);
                } else {
                    console.warn("Invalid or outdated columns data found in localStorage, using initial data.");
                    setColumns(initialColumns);
                }
            } catch (error) {
                console.error("Error parsing columns from localStorage:", error);
                setColumns(initialColumns);
            }
        } else {
            setColumns(initialColumns);
        }

        if (savedTasks) {
            try {
                const parsedTasks = JSON.parse(savedTasks);
                 // Validate tasks including optional assignee fields
                 if (Array.isArray(parsedTasks) && parsedTasks.every(task =>
                    task.id &&
                    task.title &&
                    task.columnId &&
                    (task.priority === undefined || validPriorities.includes(task.priority)) &&
                    (task.assigneeId === undefined || typeof task.assigneeId === 'string') &&
                    (task.assigneeName === undefined || typeof task.assigneeName === 'string')
                 )) {
                    const tasksWithDefaults = parsedTasks.map(task => ({
                        ...task,
                        priority: task.priority || "Medium"
                        // Assignee fields are optional, keep them as they are or undefined
                    }));
                    setTasks(tasksWithDefaults);
                 } else {
                    console.warn("Invalid tasks data found in localStorage, using initial data.");
                    setTasks(initialTasks.map(task => ({ ...task, priority: task.priority || "Medium" })));
                 }
            } catch (error) {
                console.error("Error parsing tasks from localStorage:", error);
                setTasks(initialTasks.map(task => ({ ...task, priority: task.priority || "Medium" })));
            }
        } else {
            setTasks(initialTasks.map(task => ({ ...task, priority: task.priority || "Medium" })));
        }
    } else if (!user && !loading) {
        // Clear local storage if user logs out
         if (typeof window !== 'undefined') {
             localStorage.removeItem("kanbanTasks");
             localStorage.removeItem("kanbanColumns");
         }
    }
  }, [user, loading]); // Depend on user and loading state

  // Save tasks to localStorage whenever they change (client-side only and user logged in)
  useEffect(() => {
    if (isClient && user) {
      localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
    }
  }, [tasks, isClient, user]);

  // Save columns to localStorage whenever they change (client-side only and user logged in)
  useEffect(() => {
    if (isClient && user) {
        localStorage.setItem("kanbanColumns", JSON.stringify(columns));
    }
  }, [columns, isClient, user]);

  const handleDrop = (columnId: string, taskId: string) => {
     if (!isClient || !user) return; // Check auth
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, columnId: columnId } : task
      )
    );
  };

  const handleAddTask = (columnId: string, newTaskData: Omit<Task, "id" | "columnId">) => {
     if (!isClient || !user) return; // Check auth
     const newTask: Task = {
        id: generateTaskId(),
        columnId: columnId,
        title: newTaskData.title,
        description: newTaskData.description,
        priority: newTaskData.priority || "Medium",
        assigneeId: newTaskData.assigneeId, // Include assigneeId
        assigneeName: newTaskData.assigneeName, // Include assigneeName
     };
     setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleEditTask = (taskId: string, updatedTaskData: Omit<Task, "id" | "columnId">) => {
     if (!isClient || !user) return; // Check auth
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? {
            ...task, // Keep existing properties like id and columnId
            title: updatedTaskData.title,
            description: updatedTaskData.description,
            priority: updatedTaskData.priority,
            assigneeId: updatedTaskData.assigneeId, // Update assigneeId
            assigneeName: updatedTaskData.assigneeName // Update assigneeName
        } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
     if (!isClient || !user) return; // Check auth
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

   const handleAddColumn = (title: string, color: string) => {
     if (!isClient || !user) return; // Check auth
    const newColumn: Column = {
      id: generateColumnId(),
      title: title,
      color: color,
    };
    setColumns((prevColumns) => [...prevColumns, newColumn]);
    setIsAddColumnDialogOpen(false);
  };

  const handleDeleteColumn = (columnIdToDelete: string) => {
      if (!isClient || !user) return; // Check auth
     setColumns((prevColumns) => prevColumns.filter((column) => column.id !== columnIdToDelete));
     setTasks((prevTasks) => prevTasks.filter((task) => task.columnId !== columnIdToDelete));
  };

  const handleEditColumn = (columnId: string, newTitle: string, newColor: string) => {
      if (!isClient || !user) return; // Check auth
      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column.id === columnId ? { ...column, title: newTitle, color: newColor } : column
        )
      );
  };

   // Show loading indicator while checking auth or if not yet client-side
   // or if user is null but still loading (avoids flicker before redirect)
  if (loading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {/* <p className="text-muted-foreground">Loading Kanban Board...</p> */}
      </div>
    );
  }

  // If loading is finished, and there's no user, redirect effect should handle it,
  // but we can show a message or null just in case.
  if (!user) {
     return (
         <div className="flex h-screen items-center justify-center">
            <p className="text-muted-foreground">Redirecting to login...</p>
         </div>
     );
  }

  // User is authenticated and client is ready, render the board
  return (
    <main className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="p-4 border-b shrink-0 flex justify-between items-center">
             <h1 className="text-xl font-semibold text-foreground">CITY PARK</h1>
             <div className="flex items-center space-x-2">
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
                 <Button variant="outline" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                 </Button>
             </div>
        </header>
        {/* Kanban Board Area */}
        <div className="flex-1 overflow-hidden">
            <KanbanBoard
                columns={columns}
                tasks={tasks}
                onDrop={handleDrop}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDeleteColumn={handleDeleteColumn}
                onEditColumn={handleEditColumn}
            />
        </div>
    </main>
  );
}
