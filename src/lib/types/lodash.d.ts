declare module 'lodash' {
    export function debounce<T extends (...args: unknown[]) => unknown>(
      func: T,
      wait?: number,
      options?: {
        leading?: boolean;
        trailing?: boolean;
      }
    ): T;
  
    export function throttle<T extends (...args: unknown[]) => unknown>(
      func: T,
      wait?: number,
      options?: {
        leading?: boolean;
        trailing?: boolean;
      }
    ): T;
  }