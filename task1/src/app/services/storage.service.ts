import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TASKS_KEY = 'task-tracker-tasks';
  private readonly THEME_KEY = 'task-tracker-theme';

  // Task Storage Methods
  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  loadTasks(): Task[] {
    try {
      const tasksJson = localStorage.getItem(this.TASKS_KEY);
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson);
        // Convert string dates back to Date objects and ensure all required fields exist
        return tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          priority: task.priority || 'Medium', // Default to Medium if priority doesn't exist
          archived: task.archived || false, // Default to false if archived doesn't exist
          selected: task.selected || false // Default to false if selected doesn't exist
        }));
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
    return [];
  }

  hasAnyTasks(): boolean {
    try {
      return localStorage.getItem(this.TASKS_KEY) !== null;
    } catch (error) {
      return false;
    }
  }

  clearTasks(): void {
    try {
      localStorage.removeItem(this.TASKS_KEY);
    } catch (error) {
      console.error('Error clearing tasks from localStorage:', error);
    }
  }

  // Theme Storage Methods
  saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }

  loadTheme(): 'light' | 'dark' {
    try {
      const theme = localStorage.getItem(this.THEME_KEY);
      return (theme as 'light' | 'dark') || 'light';
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      return 'light';
    }
  }

  // Utility Methods
  isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
} 