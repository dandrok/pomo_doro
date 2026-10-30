/**
 * Orchestrates the application lifecycle:
 * 1. Takes over screen (alternate buffer)
 * 2. Mounts the Ink instance
 * 3. Waits until application exit
 * 4. Releases screen in finally block before disposal/error reporting
 */

export type MountedApp = {
  readonly waitUntilExit: () => Promise<unknown>;
};

export type AppRun<T extends MountedApp> = {
  readonly takeOver: () => VoidFunction;
  readonly mount: () => T;
  readonly dispose?: () => Promise<void> | void;
};

export const runWithScreen = async <T extends MountedApp>(
  app: AppRun<T>,
): Promise<void> => {
  const releaseScreen = app.takeOver();
  try {
    await app.mount().waitUntilExit();
  } finally {
    releaseScreen();
    await app.dispose?.();
  }
};
