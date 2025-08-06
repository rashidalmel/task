import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = this.storageService.loadTheme();
    this.setTheme(savedTheme);
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    this.storageService.saveTheme(theme);
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  toggleTheme(): void {
    const newTheme = this.currentThemeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }

  isDarkMode(): boolean {
    return this.currentThemeSubject.value === 'dark';
  }
} 