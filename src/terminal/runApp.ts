/**
 * Application lifecycle runner.
 *
 * Mounts the Ink application instance, traps POSIX termination signals (SIGTERM, SIGHUP),
 * unmounts cleanly to restore terminal state, and terminates with the standard 128 + N exit status.
 */

export type MountedApp = {
  readonly waitUntilExit: () => Promise<unknown>;
  readonly unmount: () => void;
};

export const runApp = async (
  mount: () => MountedApp,
  exitProcess: (code: number) => never = (code) => process.exit(code),
): Promise<void> => {
  let exitSignal: NodeJS.Signals | undefined;
  const instance = mount();

  const onSigTerm = (): void => {
    exitSignal = "SIGTERM";
    instance.unmount();
  };

  const onSigHup = (): void => {
    exitSignal = "SIGHUP";
    instance.unmount();
  };

  process.on("SIGTERM", onSigTerm);
  process.on("SIGHUP", onSigHup);

  try {
    await instance.waitUntilExit();
  } finally {
    process.off("SIGTERM", onSigTerm);
    process.off("SIGHUP", onSigHup);
  }

  if (exitSignal !== undefined) {
    // POSIX standard: 128 + signal number (15 for SIGTERM = 143, 1 for SIGHUP = 129)
    const signalCode = exitSignal === "SIGTERM" ? 143 : 129;
    exitProcess(signalCode);
  }
};
