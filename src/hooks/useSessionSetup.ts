import React, { useState } from "react";
import { useInput } from "ink";
import { IS_TEST_MODE, config, DEFAULT_TAGS, DURATION_LIMITS } from "@utils";

export type Field =
  | "focus"
  | "shortBreak"
  | "longBreak"
  | "tag"
  | "description"
  | "start";

export type DurationField = "focus" | "shortBreak" | "longBreak";

const FIELDS: Field[] = [
  "focus",
  "shortBreak",
  "longBreak",
  "tag",
  "description",
  "start",
];

const isDurationField = (field: Field): field is DurationField => {
  return field === "focus" || field === "shortBreak" || field === "longBreak";
};

export type UseSessionSetupProps = {
  initialFocus: number;
  initialShortBreak: number;
  initialLongBreak: number;
  startFocusedOnStartButton: boolean;
  onStart: (
    focus: number,
    shortBreak: number,
    longBreak: number,
    tag: string,
    description: string,
  ) => void;
  onCancel: VoidFunction;
};

export const useSessionSetup = ({
  initialFocus,
  initialShortBreak,
  initialLongBreak,
  startFocusedOnStartButton,
  onStart,
  onCancel,
}: UseSessionSetupProps) => {
  const [durations, setDurations] = useState<Record<DurationField, number>>({
    focus: IS_TEST_MODE ? Math.round(initialFocus * 60) : initialFocus,
    shortBreak: IS_TEST_MODE
      ? Math.round(initialShortBreak * 60)
      : initialShortBreak,
    longBreak: IS_TEST_MODE
      ? Math.round(initialLongBreak * 60)
      : initialLongBreak,
  });

  // Load recent tags from config
  const recent = config.get("recentTags") || [];
  const baseList = [...recent, ...DEFAULT_TAGS, "[Custom...]"];
  const tagList = Array.from(new Set(baseList));

  const [tagIndex, setTagIndex] = useState(0);
  const [customTagText, setCustomTagText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");

  const [activeIdx, setActiveIdx] = useState(startFocusedOnStartButton ? 5 : 0);
  const activeField = FIELDS[activeIdx]!;

  const isCustomTagSelected = tagList[tagIndex] === "[Custom...]";
  const displayTag = isCustomTagSelected
    ? customTagText || "Type custom tag..."
    : tagList[tagIndex]!;

  const adjustDuration = (field: DurationField, increment: number) => {
    const limit = DURATION_LIMITS[field];
    setDurations((prev) => ({
      ...prev,
      [field]: Math.max(
        limit.min,
        Math.min(limit.max, prev[field] + increment),
      ),
    }));
  };

  const triggerStart = () => {
    let finalTag = tagList[tagIndex]!;
    if (isCustomTagSelected) {
      finalTag = customTagText.trim() || "General";
    }

    // Save custom tag to recent tags
    if (finalTag !== "General" && finalTag !== "[Custom...]") {
      const updatedRecent = [
        finalTag,
        ...recent.filter((t) => t !== finalTag),
      ].slice(0, 5);
      config.set("recentTags", updatedRecent);
    }

    const focusVal = IS_TEST_MODE ? durations.focus / 60 : durations.focus;
    const shortVal = IS_TEST_MODE
      ? durations.shortBreak / 60
      : durations.shortBreak;
    const longVal = IS_TEST_MODE
      ? durations.longBreak / 60
      : durations.longBreak;

    onStart(focusVal, shortVal, longVal, finalTag, descriptionText.trim());
  };

  useInput((input, key) => {
    // 1. Navigation
    if (key.upArrow) {
      setActiveIdx((prev) => (prev === 0 ? FIELDS.length - 1 : prev - 1));
      return;
    }
    if (key.downArrow) {
      setActiveIdx((prev) => (prev === FIELDS.length - 1 ? 0 : prev + 1));
      return;
    }
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      if (activeField === "start") {
        triggerStart();
      } else {
        setActiveIdx((prev) => (prev === FIELDS.length - 1 ? 0 : prev + 1));
      }
      return;
    }

    // 2. Adjusting durations or cycling tag
    if (key.leftArrow) {
      if (isDurationField(activeField)) {
        adjustDuration(activeField, -1);
      } else if (activeField === "tag") {
        setTagIndex((prev) => (prev === 0 ? tagList.length - 1 : prev - 1));
      }
      return;
    }
    if (key.rightArrow) {
      if (isDurationField(activeField)) {
        adjustDuration(activeField, 1);
      } else if (activeField === "tag") {
        setTagIndex((prev) => (prev === tagList.length - 1 ? 0 : prev + 1));
      }
      return;
    }

    // 3. Typing custom values
    const isPrintable = input.length === 1 && /^[ -~]$/.test(input);
    const handleTextInput = (
      setter: React.Dispatch<React.SetStateAction<string>>,
      maxLength: number,
    ) => {
      if (key.backspace) {
        setter((prev) => prev.slice(0, -1));
      } else if (isPrintable) {
        setter((prev) => (prev + input).slice(0, maxLength));
      }
    };

    if (activeField === "tag" && isCustomTagSelected) {
      handleTextInput(setCustomTagText, 20);
    } else if (activeField === "description") {
      handleTextInput(setDescriptionText, 50);
    }
  });

  return {
    durations,
    activeField,
    displayTag,
    descriptionText,
    isCustomTagSelected,
  };
};
