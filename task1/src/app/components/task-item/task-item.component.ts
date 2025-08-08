import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-item.component.html'
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() isSelected: boolean = false;
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() taskToggled = new EventEmitter<Task>();
  @Output() taskArchived = new EventEmitter<Task>();
  @Output() taskSelectionChanged = new EventEmitter<void>();

  isEditing = false;
  editedTask: Partial<Task> = {};
  showDeleteToast = false;
  isDescriptionExpanded = false;

  constructor(private toastService: ToastService) {}

  startEdit() {
    this.isEditing = true;
    this.editedTask = {
      title: this.task.title,
      description: this.task.description,
      dueDate: this.task.dueDate,
      priority: this.task.priority
    };
  }

  saveEdit() {
    if (this.editedTask.title?.trim()) {
      // Check if any changes were made
      const titleChanged = this.editedTask.title.trim() !== this.task.title;
      const descriptionChanged = (this.editedTask.description?.trim() || '') !== (this.task.description || '');
      const dueDateChanged = this.editedTask.dueDate !== this.task.dueDate;
      const priorityChanged = this.editedTask.priority !== this.task.priority;
      
      if (!titleChanged && !descriptionChanged && !dueDateChanged && !priorityChanged) {
        // No changes made, show warning toast
        this.toastService.show('You didn\'t change anything!', 'warning');
        return;
      }
      
      const updatedTask: Task = {
        ...this.task,
        title: this.editedTask.title.trim(),
        description: this.editedTask.description?.trim() || '',
        dueDate: this.editedTask.dueDate,
        priority: this.editedTask.priority || 'Medium'
      };
      this.taskUpdated.emit(updatedTask);
      this.isEditing = false;
      
      // Show success toast when changes are saved
      this.toastService.show('Task updated successfully!', 'success');
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedTask = {};
  }

  deleteTask() {
    this.showDeleteToast = true;
  }

  confirmDelete() {
    this.taskDeleted.emit(this.task.id);
    this.showDeleteToast = false;
    
    // Show success toast when task is deleted (green color)
    this.toastService.show('Task deleted successfully!', 'success');
  }

  cancelDelete() {
    this.showDeleteToast = false;
  }

  toggleComplete() {
    const updatedTask: Task = {
      ...this.task,
      completed: !this.task.completed,
      priority: this.task.priority || 'Medium'
    };
    this.taskToggled.emit(updatedTask);
  }

  archiveTask() {
    const updatedTask: Task = {
      ...this.task,
      archived: true,
      priority: this.task.priority || 'Medium'
    };
    this.taskArchived.emit(updatedTask);
    this.toastService.show('Task archived successfully!', 'success');
  }

  unarchiveTask() {
    const updatedTask: Task = {
      ...this.task,
      archived: false,
      priority: this.task.priority || 'Medium'
    };
    this.taskArchived.emit(updatedTask);
    this.toastService.show('Task unarchived successfully!', 'success');
  }

  toggleSelection() {
    const updatedTask: Task = {
      ...this.task,
      selected: !(this.task.selected || false),
      priority: this.task.priority || 'Medium'
    };
    this.taskUpdated.emit(updatedTask);
    this.taskSelectionChanged.emit();
  }

  isOverdue(): boolean {
    if (!this.task.dueDate || this.task.completed) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  getDueDateText(): string {
    if (!this.task.dueDate) {
      return '';
    }
    const dueDate = new Date(this.task.dueDate);
    return dueDate.toLocaleDateString();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getPriorityClass(): string {
    const priority = this.task.priority || 'Medium';
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityColor(): string {
    const priority = this.task.priority || 'Medium';
    switch (priority) {
      case 'High':
        return '#dc3545';
      case 'Medium':
        return '#ffc107';
      case 'Low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  isDescriptionLong(): boolean {
    return !!(this.task.description && this.task.description.length > 120);
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }
}
