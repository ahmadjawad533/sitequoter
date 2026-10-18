"use client";

import * as React from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";

interface VoiceNotesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function VoiceNotesInput({
  value,
  onChange,
  placeholder = "Type notes or tap mic to dictate...",
  disabled = false,
}: VoiceNotesInputProps) {
  const handleTranscript = React.useCallback(
    (newText: string) => {
      // Append transcript with a space or newline
      onChange(value ? `${value.trim()} ${newText}` : newText);
    },
    [value, onChange]
  );

  const {
    isListening,
    isSupported,
    error: speechError,
    toggleListening,
  } = useVoiceDictation({
    onTranscript: handleTranscript,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="job-notes" className="text-sm font-semibold text-[#111827]">
          Notes & observations
        </label>
        {isSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] ${
              isListening
                ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] animate-pulse"
                : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
            }`}
            aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
          >
            {isListening ? (
              <>
                <MicOff className="h-3.5 w-3.5 text-[#DC2626]" />
                <span>Listening (tap to stop)</span>
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5 text-[#1D4ED8]" />
                <span>Tap mic to dictate</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative">
        <Textarea
          id="job-notes"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={`min-h-[100px] ${
            isListening ? "border-[#DC2626] ring-1 ring-[#DC2626]" : ""
          }`}
        />
      </div>

      {/* Voice Status or Error Note */}
      {speechError && (
        <div className="flex items-center gap-1.5 text-xs text-[#DC2626] mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {!isSupported && (
        <p className="text-[11px] text-[#6B7280]">
          Voice dictation is not available in this browser. You can type notes directly.
        </p>
      )}
    </div>
  );
}
