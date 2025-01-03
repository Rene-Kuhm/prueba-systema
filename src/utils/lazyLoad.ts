import { lazy, ComponentType } from 'react';

type DynamicImport<T = Record<string, never>> = () => Promise<{
  default: ComponentType<T>;
}>;

const retryLoad = async <T = Record<string, never>>(fn: DynamicImport<T>, retries = 2, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const lazyLoad = <T = Record<string, never>>(
  importFn: DynamicImport<T>,
  fallback: ComponentType = () => null
) => {
  return lazy(() =>
    retryLoad<T>(importFn)
      .catch(error => {
        console.error('Failed to load component:', error);
        return { default: fallback as ComponentType<T> };
      })
  );
};
