import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.component.html'
})
export class AddTaskComponent {
  @Output() taskAdded = new EventEmitter<Task>();
  
  newTask: Partial<Task> = {
    title: '',
    description: '',
    completed: false,
    dueDate: undefined,
    priority: 'Medium'
  };

  addTask() {
    if (this.newTask.title?.trim()) {
      const task: Task = {
        id: Date.now(), // Simple ID generation
        title: this.newTask.title.trim(),
        description: this.newTask.description?.trim() || '',
        completed: false,
        createdAt: new Date(),
        dueDate: this.newTask.dueDate,
        priority: this.newTask.priority || 'Medium'
      };
      
      this.taskAdded.emit(task);
      this.resetForm();
    }
  }

  private resetForm() {
    this.newTask = {
      title: '',
      description: '',
      completed: false,
      dueDate: undefined,
      priority: 'Medium'
    };
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
