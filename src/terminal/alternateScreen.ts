/**
 * Terminal alternate screen buffer escape sequences (DECSET / DECRST 1049).
 *
 * Entering the alternate screen saves the cursor, switches buffers, and clears the screen.
 * Leaving restores the primary buffer, including the shell prompt and scrollback exactly
 * as it was before the client launched.
 */

export const ENTER_ALTERNATE_SCREEN = "\u001b[?1049h";
export const LEAVE_ALTERNATE_SCREEN = "\u001b[?1049l";

export type ScreenSink = {
  readonly write: (chunk: string) => unknown;
  readonly isTTY?: boolean | undefined;
};

/**
 * Enters the alternate screen buffer if the sink is an interactive TTY,
 * returning an idempotent cleanup function that restores the primary buffer.
 */
export const takeOverScreen = (sink: ScreenSink): VoidFunction => {
  if (sink.isTTY !== true) {
    return () => undefined;
  }

  sink.write(ENTER_ALTERNATE_SCREEN);
  let released = false;

  return () => {
    if (released) {
      return;
    }
    released = true;
    sink.write(LEAVE_ALTERNATE_SCREEN);
  };
};
