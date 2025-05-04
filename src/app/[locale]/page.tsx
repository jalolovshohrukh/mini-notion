
"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from 'next/navigation';
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddColumnForm } from "@/components/kanban/AddColumnForm";
import type { Task, Column, Priority } from "@/lib/types";
import { initialColumns, initialTasks } from "@/lib/initial-data"; // Adjust path if needed
import { generateTaskId, generateColumnId } from "@/lib/utils";
import { AuthContext } from "@/context/AuthContext";
import { LanguageSwitcher } from '@/components/LanguageSwitcher'; // Import LanguageSwitcher
import { useI18n } from '@/i18n/client'; // Import useI18n

// Basic HEX color format validation (e.g., #RRGGBB or #RGB)
const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/;
const validPriorities: Priority[] = ["High", "Medium", "Low"];
// Basic ISO Date string validation (YYYY-MM-DD)
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;


export default function HomePage() { // Renamed component
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  const { user, loading, logout } = useContext(AuthContext);
  const router = useRouter();
  const t = useI18n(); // Initialize i18n hook

  // Authentication Check and Redirect
  useEffect(() => {
    // Need to adjust redirect logic for locale later if login page is localized
    if (!loading && !user) {
      router.push('/login'); // Simple redirect for now
    }
  }, [user, loading, router]);


  // Load initial data or from localStorage only on the client AFTER auth check passes
  useEffect(() => {
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
                    // Translate initial column titles if needed here or load translated versions
                    setColumns(initialColumns);
                }
            } catch (error) {
                console.error("Error parsing columns from localStorage:", error);
                 // Translate initial column titles if needed here or load translated versions
                setColumns(initialColumns);
            }
        } else {
            // Translate initial column titles if needed here or load translated versions
            setColumns(initialColumns);
        }

        if (savedTasks) {
            try {
                const parsedTasks = JSON.parse(savedTasks);
                 if (Array.isArray(parsedTasks) && parsedTasks.every(task =>
                    task.id &&
                    task.title &&
                    task.columnId &&
                    (task.priority === undefined || validPriorities.includes(task.priority)) &&
                    (task.assigneeId === undefined || typeof task.assigneeId === 'string') &&
                    (task.assigneeName === undefined || typeof task.assigneeName === 'string') &&
                    (task.dueDate === undefined || (typeof task.dueDate === 'string' && isoDateRegex.test(task.dueDate)))
                 )) {
                    const tasksWithDefaults = parsedTasks.map(task => ({
                        ...task,
                        priority: task.priority || "Medium"
                    }));
                    // Translate initial task titles/descriptions if needed
                    setTasks(tasksWithDefaults);
                 } else {
                    console.warn("Invalid tasks data found in localStorage, using initial data.");
                    // Translate initial task titles/descriptions if needed
                    setTasks(initialTasks.map(task => ({ ...task, priority: task.priority || "Medium" })));
                 }
            } catch (error) {
                console.error("Error parsing tasks from localStorage:", error);
                 // Translate initial task titles/descriptions if needed
                 setTasks(initialTasks.map(task => ({ ...task, priority: task.priority || "Medium" })));
            }
        } else {
            // Translate initial task titles/descriptions if needed
            setTasks(initialTasks.map(task => ({ ...task, priority: task.priority || "Medium" })));
        }
    } else if (!user && !loading) {
         if (typeof window !== 'undefined') {
             localStorage.removeItem("kanbanTasks");
             localStorage.removeItem("kanbanColumns");
         }
    }
  }, [user, loading]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isClient && user) {
      localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
    }
  }, [tasks, isClient, user]);

  // Save columns to localStorage whenever they change
  useEffect(() => {
    if (isClient && user) {
        localStorage.setItem("kanbanColumns", JSON.stringify(columns));
    }
  }, [columns, isClient, user]);

  const handleDrop = (columnId: string, taskId: string) => {
     if (!isClient || !user) return;
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, columnId: columnId } : task
      )
    );
  };

  const handleAddTask = (columnId: string, newTaskData: Omit<Task, "id" | "columnId">) => {
     if (!isClient || !user) return;
     const newTask: Task = {
        id: generateTaskId(),
        columnId: columnId,
        title: newTaskData.title,
        description: newTaskData.description,
        priority: newTaskData.priority || "Medium",
        assigneeId: newTaskData.assigneeId,
        assigneeName: newTaskData.assigneeName,
        dueDate: newTaskData.dueDate,
     };
     setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleEditTask = (taskId: string, updatedTaskData: Omit<Task, "id" | "columnId">) => {
     if (!isClient || !user) return;
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? {
            ...task,
            title: updatedTaskData.title,
            description: updatedTaskData.description,
            priority: updatedTaskData.priority,
            assigneeId: updatedTaskData.assigneeId,
            assigneeName: updatedTaskData.assigneeName,
            dueDate: updatedTaskData.dueDate,
        } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
     if (!isClient || !user) return;
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

   const handleAddColumn = (title: string, color: string) => {
     if (!isClient || !user) return;
    const newColumn: Column = {
      id: generateColumnId(),
      title: title,
      color: color,
    };
    setColumns((prevColumns) => [...prevColumns, newColumn]);
    setIsAddColumnDialogOpen(false);
  };

  const handleDeleteColumn = (columnIdToDelete: string) => {
      if (!isClient || !user) return;
     setColumns((prevColumns) => prevColumns.filter((column) => column.id !== columnIdToDelete));
     setTasks((prevTasks) => prevTasks.filter((task) => task.columnId !== columnIdToDelete));
  };

  const handleEditColumn = (columnId: string, newTitle: string, newColor: string) => {
      if (!isClient || !user) return;
      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column.id === columnId ? { ...column, title: newTitle, color: newColor } : column
        )
      );
  };

  if (loading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {/* <p className="text-muted-foreground">{t('kanban.loading')}</p> */}
      </div>
    );
  }

  if (!user) {
     return (
         <div className="flex h-screen items-center justify-center">
            <p className="text-muted-foreground">{t('login.redirecting')}</p>
         </div>
     );
  }

  return (
    <main className="flex flex-col h-screen bg-background">
        <header className="p-4 border-b shrink-0 flex justify-between items-center">
             <h1 className="text-xl font-semibold text-foreground">{t('metadata.title')}</h1> {/* Use translated title */}
             <div className="flex items-center space-x-4"> {/* Increased spacing */}
                 <LanguageSwitcher /> {/* Add LanguageSwitcher */}
                 <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {t('kanban.addColumnButton')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <AddColumnForm onAddColumn={handleAddColumn} onClose={() => setIsAddColumnDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
                 <Button variant="outline" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" /> {t('kanban.logoutButton')}
                 </Button>
             </div>
        </header>
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
