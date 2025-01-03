import { debounce, throttle } from 'lodash';

type AnyFunction = (...args: unknown[]) => unknown;

type DebouncedFn<T extends AnyFunction> = {
  (...args: Parameters<T>): ReturnType<T>;
  cancel: () => void;
  flush: () => ReturnType<T>;
};

export const debouncedFunction = <T extends AnyFunction>(
  func: T,
  wait: number
): DebouncedFn<T> => debounce(func, wait) as unknown as DebouncedFn<T>;

export const throttledFunction = <T extends AnyFunction>(
  func: T,
  wait: number
): DebouncedFn<T> => throttle(func, wait) as unknown as DebouncedFn<T>;

export const createDebounce = <T extends (...args: unknown[]) => Promise<unknown> | unknown>(
  func: T,
  wait: number
): (() => Promise<Awaited<ReturnType<T>>>) => {
  let timeout: NodeJS.Timeout | null = null;

  return (): Promise<Awaited<ReturnType<T>>> => {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        const result = await Promise.resolve(func());
        resolve(result as Awaited<ReturnType<T>>);
      }, wait);
    });
  };
};