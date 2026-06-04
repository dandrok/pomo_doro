import { describe, it, expect } from "vitest";
import { parseCliArgs } from "./cliParser";
import { SHORT_BREAK_TIME, LONG_BREAK_TIME } from "./constants";

describe("cliParser", () => {
  it("should return help: true when help flag is present", () => {
    expect(parseCliArgs(["-h"])).toEqual({ help: true });
    expect(parseCliArgs(["--help"])).toEqual({ help: true });
    expect(parseCliArgs(["-w", "25", "--help"])).toEqual({ help: true });
  });

  it("should return help: false and sessionConfig: undefined when no args are passed", () => {
    expect(parseCliArgs([])).toEqual({ help: false, sessionConfig: undefined });
  });

  it("should parse focus/work duration and use default break values", () => {
    expect(parseCliArgs(["-w", "45"])).toEqual({
      help: false,
      sessionConfig: {
        focus: 45,
        shortBreak: SHORT_BREAK_TIME,
        longBreak: LONG_BREAK_TIME,
        tag: undefined,
        description: undefined,
      },
    });
  });

  it("should parse work and short break duration, setting long break to 3x short break", () => {
    expect(parseCliArgs(["--work", "50", "--break", "10"])).toEqual({
      help: false,
      sessionConfig: {
        focus: 50,
        shortBreak: 10,
        longBreak: 30,
        tag: undefined,
        description: undefined,
      },
    });
  });

  it("should parse all flags, including explicit long break, tag and description", () => {
    expect(
      parseCliArgs([
        "-w",
        "50",
        "-b",
        "10",
        "-l",
        "20",
        "-t",
        "refactoring",
        "-d",
        "fixing bugs",
      ]),
    ).toEqual({
      help: false,
      sessionConfig: {
        focus: 50,
        shortBreak: 10,
        longBreak: 20,
        tag: "refactoring",
        description: "fixing bugs",
      },
    });
  });

  it("should throw validation error if custom session configurations are passed without work flag", () => {
    expect(() => parseCliArgs(["-b", "10"])).toThrow(
      "--work option is required when specifying custom session configurations.",
    );
    expect(() => parseCliArgs(["-l", "20"])).toThrow(
      "--work option is required when specifying custom session configurations.",
    );
    expect(() => parseCliArgs(["-t", "coding"])).toThrow(
      "--work option is required when specifying custom session configurations.",
    );
  });

  it("should throw error for invalid numbers or non-positive values", () => {
    expect(() => parseCliArgs(["-w", "-5"])).toThrow();
    expect(() => parseCliArgs(["-w", "abc"])).toThrow(
      "--work must be a positive number.",
    );
    expect(() => parseCliArgs(["-w", "25", "-b", "0"])).toThrow(
      "--break must be a positive number.",
    );
    expect(() => parseCliArgs(["-w", "25", "-l", "-10"])).toThrow();
  });
});
