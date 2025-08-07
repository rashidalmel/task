import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Task } from '../../models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskChartComponent } from '../task-chart/task-chart.component';

export type FilterType = 'all' | 'completed' | 'pending' | 'overdue' | 'archived';
export type SortType = 'date' | 'priority' | 'status' | 'title' | 'manual';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDrag, CdkDropList, TaskItemComponent, TaskChartComponent],
  templateUrl: './task-list.component.html',
  animations: [
    trigger('taskListAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger(50, [
            animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-100%)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('taskItemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('sectionAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('filterAnimation', [
      transition('* => *', [
        query('.filter-btn', [
          style({ opacity: 0, transform: 'scale(0.9)' }),
          stagger(50, [
            animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() taskToggled = new EventEmitter<Task>();
  @Output() taskArchived = new EventEmitter<Task>();
  @Output() tasksReordered = new EventEmitter<Task[]>();
  @Output() tasksBulkCompleted = new EventEmitter<Task[]>();
  @Output() tasksBulkDeleted = new EventEmitter<number[]>();

  currentFilter: FilterType = 'all';
  currentSort: SortType = 'manual';
  searchTerm: string = '';
  showDeleteConfirmation: boolean = false;
  justBulkCompleted: boolean = false;

  get filteredTasks(): Task[] {
    let filtered = [...this.tasks];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) ||
        (task.description && task.description.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    switch (this.currentFilter) {
      case 'completed':
        filtered = filtered.filter(task => task.completed && !task.archived);
        break;
      case 'pending':
        filtered = filtered.filter(task => !task.completed && !task.archived);
        break;
      case 'overdue':
        filtered = filtered.filter(task => this.isOverdue(task) && !task.archived);
        break;
      case 'archived':
        filtered = filtered.filter(task => task.archived);
        break;
      default:
        // Keep all non-archived tasks for 'all' filter
        filtered = filtered.filter(task => !task.archived);
        break;
    }

    // Apply sorting
    return this.sortTasks(filtered);
  }

  get totalTasks(): number {
    return this.tasks.filter(task => !task.archived).length;
  }

  get completedTasks(): number {
    return this.tasks.filter(task => task.completed && !task.archived).length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(task => !task.completed && !task.archived).length;
  }

  get overdueTasks(): number {
    return this.tasks.filter(task => this.isOverdue(task) && !task.archived).length;
  }

  get archivedTasks(): number {
    return this.tasks.filter(task => task.archived).length;
  }

  get filteredTasksCount(): number {
    return this.filteredTasks.length;
  }

  get selectedTasksCount(): number {
    return this.filteredTasks.filter(task => task.selected || false).length;
  }

  get hasSelectedTasks(): boolean {
    return this.filteredTasks.some(task => task.selected || false);
  }

  get allFilteredTasksSelected(): boolean {
    return this.filteredTasks.length > 0 && 
           this.filteredTasks.every(task => task.selected || false);
  }

  get canBulkComplete(): boolean {
    return this.hasSelectedTasks && this.filteredTasks.some(task => 
      task.selected || false
    );
  }

  setFilter(filter: FilterType) {
    this.currentFilter = filter;
  }

  clearSearch() {
    this.searchTerm = '';
  }

  onTaskUpdated(task: Task) {
    this.taskUpdated.emit(task);
  }

  onTaskDeleted(taskId: number) {
    this.taskDeleted.emit(taskId);
  }

  onTaskToggled(task: Task) {
    this.taskToggled.emit(task);
  }

  onTaskArchived(task: Task) {
    this.taskArchived.emit(task);
  }

  onTaskSelectionChanged() {
    // This method is called when a task's selection state changes
    // No action needed here as the UI will update automatically
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  private isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  setSort(sort: SortType) {
    this.currentSort = sort;
  }

  // Bulk action methods
  toggleTaskSelection(taskId: number) {
    // Use selection status for bulk operations
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, selected: !(task.selected || false) };
      this.taskUpdated.emit(updatedTask);
    }
  }

  toggleSelectAll() {
    if (this.hasSelectedTasks) {
      // If tasks are selected, clear all selections
      this.filteredTasks.forEach(task => {
        if (task.selected || false) {
          const updatedTask = { ...task, selected: false };
          this.taskUpdated.emit(updatedTask);
        }
      });
    } else {
      // If no tasks are selected, select all filtered tasks
      this.filteredTasks.forEach(task => {
        if (!(task.selected || false)) {
          const updatedTask = { ...task, selected: true };
          this.taskUpdated.emit(updatedTask);
        }
      });
    }
  }

  isTaskSelected(taskId: number): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    return task ? (task.selected || false) : false;
  }

  bulkCompleteTasks() {
    const tasksToComplete = this.filteredTasks.filter(task => 
      task.selected || false
    );
    
    if (tasksToComplete.length > 0) {
      // Mark selected tasks as completed
      tasksToComplete.forEach(task => {
        const updatedTask = { ...task, completed: true, selected: false };
        this.taskUpdated.emit(updatedTask);
      });
      
      this.justBulkCompleted = true;
      // Reset flag after a short delay
      setTimeout(() => {
        this.justBulkCompleted = false;
      }, 500);
    }
  }

  clearSelection() {
    if (this.hasSelectedTasks) {
      // Show custom confirmation modal
      this.showDeleteConfirmation = true;
    }
  }

  confirmBulkDelete() {
    // Delete all selected tasks
    const taskIdsToDelete = this.filteredTasks
      .filter(task => task.selected || false)
      .map(task => task.id);
    this.tasksBulkDeleted.emit(taskIdsToDelete);
    this.showDeleteConfirmation = false;
  }

  cancelBulkDelete() {
    // Just close the modal, keep selection
    this.showDeleteConfirmation = false;
  }

  private sortTasks(tasks: Task[]): Task[] {
    switch (this.currentSort) {
      case 'date':
        return tasks.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'priority':
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return tasks.sort((a, b) => 
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        );
      case 'status':
        return tasks.sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1; // Pending first, then completed
        });
      case 'title':
        return tasks.sort((a, b) => a.title.localeCompare(b.title));
      case 'manual':
        return tasks; // Return tasks in their current order (no sorting)
      default:
        return tasks;
    }
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    // Only allow drag and drop when sort is set to 'manual'
    if (this.currentSort === 'manual' && event.previousIndex !== event.currentIndex) {
      const filteredTasks = this.filteredTasks;
      const tasksCopy = [...this.tasks];
      
      // Get the actual tasks that were reordered
      const movedTask = filteredTasks[event.previousIndex];
      const targetTask = filteredTasks[event.currentIndex];
      
      // Find their positions in the original array
      const originalPrevIndex = tasksCopy.findIndex(t => t.id === movedTask.id);
      const originalNextIndex = tasksCopy.findIndex(t => t.id === targetTask.id);
      
      // Move the item in the original array
      moveItemInArray(tasksCopy, originalPrevIndex, originalNextIndex);
      
      // Emit the reordered array
      this.tasksReordered.emit(tasksCopy);
    }
  }
}