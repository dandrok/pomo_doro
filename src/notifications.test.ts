/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exec } from "child_process";
import { playSound, sendNotification, notifyUser } from "./notifications";

vi.mock("child_process", () => {
  const mockExec = vi.fn();
  return {
    exec: mockExec,
    default: {
      exec: mockExec,
    },
  };
});

describe("notifications", () => {
  let originalPlatform: string;
  let stdoutWriteMock: any;

  beforeEach(() => {
    originalPlatform = process.platform;
    stdoutWriteMock = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
    });
    stdoutWriteMock.mockRestore();
  });

  const setPlatform = (platform: string) => {
    Object.defineProperty(process, "platform", {
      value: platform,
      configurable: true,
    });
  };

  describe("sendNotification", () => {
    it("should call notify-send on linux", () => {
      setPlatform("linux");
      sendNotification("Test Title", "Test Message");
      expect(exec).toHaveBeenCalledWith(
        'notify-send "Test Title" "Test Message"',
      );
    });

    it("should call osascript on darwin (macOS)", () => {
      setPlatform("darwin");
      sendNotification("Test Title", "Test Message");
      expect(exec).toHaveBeenCalledWith(
        'osascript -e \'display notification "Test Message" with title "Test Title"\'',
      );
    });

    it("should call powershell on win32 (Windows)", () => {
      setPlatform("win32");
      sendNotification("Test Title", "Test Message");
      expect(exec).toHaveBeenCalledWith(expect.stringContaining("powershell"));
      expect(exec).toHaveBeenCalledWith(expect.stringContaining("Test Title"));
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("Test Message"),
      );
    });
  });

  describe("playSound", () => {
    it("should call paplay/aplay on linux", () => {
      setPlatform("linux");
      playSound();
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining(
          "paplay /usr/share/sounds/freedesktop/stereo/complete.oga",
        ),
        expect.any(Function),
      );
    });

    it("should call afplay on darwin (macOS)", () => {
      setPlatform("darwin");
      playSound();
      expect(exec).toHaveBeenCalledWith(
        "afplay /System/Library/Sounds/Glass.aiff",
        expect.any(Function),
      );
    });

    it("should call powershell sound player on win32 (Windows)", () => {
      setPlatform("win32");
      playSound();
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("powershell"),
        expect.any(Function),
      );
    });

    it("should fallback to terminal bell if audio command fails on linux", () => {
      setPlatform("linux");
      vi.mocked(exec).mockImplementation((_cmd: any, callback: any) => {
        if (callback && typeof callback === "function") {
          callback(new Error("failed"), "", "");
        }
        return {} as any;
      });

      playSound();
      expect(stdoutWriteMock).toHaveBeenCalledWith("\u0007");
    });
  });

  describe("notifyUser", () => {
    it("should trigger both sendNotification and playSound", () => {
      setPlatform("linux");
      notifyUser("Work Done!", "Take a break.");
      expect(exec).toHaveBeenCalledWith(
        'notify-send "Work Done!" "Take a break."',
      );
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining(
          "paplay /usr/share/sounds/freedesktop/stereo/complete.oga",
        ),
        expect.any(Function),
      );
    });
  });
});
