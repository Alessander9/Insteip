import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'insteip-theme';
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Forzar modo claro (light mode) por defecto
    try {
      localStorage.removeItem(this.THEME_KEY);
    } catch {}
    this.isDarkMode.set(false);
    this.applyTheme(false);
  }

  toggleTheme(): void {
    // Deshabilitado: mantener modo claro
    this.isDarkMode.set(false);
    this.applyTheme(false);
  }

  private applyTheme(isDark: boolean): void {
    const root = document.documentElement;
    root.classList.remove('dark');
  }
}

