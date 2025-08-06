import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toasts.asObservable();
  private nextId = 1;

  show(message: string, type: 'success' | 'warning' | 'error' = 'success', duration: number = 3000) {
    console.log('ToastService.show called:', { message, type, duration });
    
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration
    };

    const currentToasts = this.toasts.value;
    console.log('Current toasts:', currentToasts);
    console.log('Adding new toast:', toast);
    
    this.toasts.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  remove(id: number) {
    console.log('ToastService.remove called for id:', id);
    const currentToasts = this.toasts.value;
    this.toasts.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear() {
    console.log('ToastService.clear called');
    this.toasts.next([]);
  }
} 