
"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from 'next/navigation';
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Loader2, Menu as MenuIcon } from "lucide-react"; // Added MenuIcon
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"; // Added Sheet components
import { Separator } from "@/components/ui/separator"; // Added Separator
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

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

  const handleTaskDrop = (columnId: string, taskId: string) => {
     if (!isClient || !user) return;
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, columnId: columnId } : task
      )
    );
  };

  const handleColumnDrop = (draggedColumnId: string, targetColumnId: string) => {
    if (!isClient || !user || draggedColumnId === targetColumnId) return;

    setColumns((prevColumns) => {
      const draggedIndex = prevColumns.findIndex((col) => col.id === draggedColumnId);
      const targetIndex = prevColumns.findIndex((col) => col.id === targetColumnId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return prevColumns; // Should not happen if IDs are correct
      }

      const newColumns = [...prevColumns];
      const [draggedColumn] = newColumns.splice(draggedIndex, 1);

      // Adjust target index if the dragged item was before the target
      const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex -1 : targetIndex;

      newColumns.splice(adjustedTargetIndex, 0, draggedColumn);
      return newColumns;
    });
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
    setIsMobileMenuOpen(false); // Close mobile menu after adding
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

  const triggerAddColumnDialog = () => {
    setIsAddColumnDialogOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu when dialog opens
  }

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
    <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <main className="flex flex-col h-screen bg-background">
            <header className="p-4 border-b shrink-0 flex justify-between items-center">
                 {/* Placeholder for potential left-side icon/element if needed in future */}
                 <div className="w-10 md:hidden"></div> {/* Takes up space on mobile */}
                 <div className="hidden md:block w-10"></div> {/* Takes up space on desktop */}

                 <h1 className="text-xl font-semibold text-foreground text-center flex-1">
                    {t('metadata.title')}
                 </h1>

                {/* Desktop Actions */}
                 <div className="hidden md:flex items-center space-x-4">
                     <LanguageSwitcher />
                     <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {t('kanban.addColumnButton')}
                        </Button>
                    </DialogTrigger>
                     <Button variant="outline" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" /> {t('kanban.logoutButton')}
                     </Button>
                 </div>

                 {/* Mobile Menu */}
                 <div className="md:hidden">
                     <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MenuIcon className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[280px] p-0">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle>{t('mobileMenu.title')}</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col p-4 space-y-4">
                                <LanguageSwitcher />
                                <Separator />
                                 {/* Trigger for Add Column Dialog within Sheet */}
                                <Button onClick={triggerAddColumnDialog} className="w-full justify-start">
                                    <Plus className="mr-2 h-4 w-4" /> {t('kanban.addColumnButton')}
                                </Button>
                                <Separator />
                                <Button variant="outline" onClick={logout} className="w-full justify-start">
                                    <LogOut className="mr-2 h-4 w-4" /> {t('kanban.logoutButton')}
                                </Button>
                            </div>

                        </SheetContent>
                    </Sheet>
                 </div>
            </header>
            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    columns={columns}
                    tasks={tasks}
                    onTaskDrop={handleTaskDrop}
                    onColumnDrop={handleColumnDrop}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onDeleteColumn={handleDeleteColumn}
                    onEditColumn={handleEditColumn}
                />
            </div>
            {/* Dialog Content for Add Column - Stays outside Sheet/Header */}
            <DialogContent className="sm:max-w-[425px]">
                <AddColumnForm onAddColumn={handleAddColumn} onClose={() => setIsAddColumnDialogOpen(false)} />
            </DialogContent>
        </main>
    </Dialog>
  );
}

