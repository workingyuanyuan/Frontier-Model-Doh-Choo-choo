import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False in the prerendered markup and while React takes it over, true from
 * then on. Lets a control prerender only what a reader of the plain HTML
 * should see, such as the selected option of a menu rather than all of them.
 */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
