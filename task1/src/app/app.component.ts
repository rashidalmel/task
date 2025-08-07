import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Task } from './models/task.model';
import { AddTaskComponent } from './components/add-task/add-task.component';
import { TaskListComponent } from './components/task-list/task-list.component';

import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ToastComponent } from './components/toast/toast.component';
import { StorageService } from './services/storage.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, AddTaskComponent, TaskListComponent, ThemeToggleComponent, ToastComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  tasks: Task[] = [];

  constructor(private storageService: StorageService, private toastService: ToastService) {}

  ngOnInit(): void {
    // Load tasks from localStorage on app initialization
    this.loadTasksFromStorage();
  }

  private loadTasksFromStorage(): void {
    if (this.storageService.isLocalStorageAvailable()) {
      const savedTasks = this.storageService.loadTasks();
      // Always use saved tasks, even if empty (don't load sample tasks)
      this.tasks = savedTasks;
      
      // Only load sample tasks if this is the first visit (no tasks saved at all)
      if (savedTasks.length === 0 && !this.storageService.hasAnyTasks()) {
        this.loadSampleTasks();
        this.saveTasksToStorage(); // Save the sample tasks
      }
    } else {
      // Fallback to sample tasks if localStorage is not available
      this.loadSampleTasks();
    }
  }

  private loadSampleTasks(): void {
    this.tasks = [
      {
        id: 1,
        title: 'Learn Angular Basics',
        description: 'Study components, modules, and data binding',
        completed: true,
        createdAt: new Date('2024-01-15'),
        priority: 'High'
      },
      {
        id: 2,
        title: 'Build Task Tracker App',
        description: 'Create a complete task management application',
        completed: false,
        createdAt: new Date('2024-01-16'),
        priority: 'High'
      },
      {
        id: 3,
        title: 'Practice TypeScript',
        description: 'Work on advanced TypeScript features and interfaces',
        completed: false,
        createdAt: new Date('2024-01-17'),
        priority: 'Medium'
      },
      {
        id: 4,
        title: 'Study Angular Services',
        description: 'Learn about dependency injection and HTTP services',
        completed: true,
        createdAt: new Date('2024-01-18'),
        priority: 'Medium'
      },
      {
        id: 5,
        title: 'Implement Routing',
        description: 'Add navigation and route guards to the application',
        completed: false,
        createdAt: new Date('2024-01-19'),
        priority: 'Low'
      }
    ];
  }

  private saveTasksToStorage(): void {
    if (this.storageService.isLocalStorageAvailable()) {
      this.storageService.saveTasks(this.tasks);
    }
  }

  onTaskAdded(task: Task) {
    this.tasks.push(task);
    this.saveTasksToStorage();
  }

  onTaskUpdated(updatedTask: Task) {
    const index = this.tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      this.saveTasksToStorage();
    }
  }

  onTaskDeleted(taskId: number) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveTasksToStorage();
  }

  onTaskToggled(toggledTask: Task) {
    const index = this.tasks.findIndex(t => t.id === toggledTask.id);
    if (index !== -1) {
      this.tasks[index] = toggledTask;
      this.saveTasksToStorage();
    }
  }

  onTaskArchived(archivedTask: Task) {
    const index = this.tasks.findIndex(t => t.id === archivedTask.id);
    if (index !== -1) {
      this.tasks[index] = archivedTask;
      this.saveTasksToStorage();
    }
  }

  onTasksReordered(reorderedTasks: Task[]) {
    this.tasks = reorderedTasks;
    this.saveTasksToStorage();
  }

  onTasksBulkCompleted(tasksToComplete: Task[]) {
    // Mark all selected tasks as completed
    tasksToComplete.forEach(task => {
      const index = this.tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        this.tasks[index] = { ...task, completed: true };
      }
    });
    this.saveTasksToStorage();
    
    // Show success toast
    const message = tasksToComplete.length === 1 
      ? 'Task completed successfully!' 
      : `${tasksToComplete.length} tasks completed successfully!`;
    this.toastService.show(message, 'success');
  }

  onTasksBulkDeleted(taskIdsToDelete: number[]) {
    // Remove all selected tasks
    this.tasks = this.tasks.filter(task => !taskIdsToDelete.includes(task.id));
    this.saveTasksToStorage();
    
    // Show success toast
    const message = taskIdsToDelete.length === 1 
      ? 'Task deleted successfully!' 
      : `${taskIdsToDelete.length} tasks deleted successfully!`;
    this.toastService.show(message, 'success');
  }
}
