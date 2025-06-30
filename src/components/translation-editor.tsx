
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type React from "react"

type TranslationEditorProps = {
  originalText: string;
  onOriginalTextChange: (text: string) => void;
  onOriginalTextSelect: (text: string) => void;
  translatedText: string;
  onTranslatedTextChange: (text: string) => void;
};

export function TranslationEditor({
  originalText,
  onOriginalTextChange,
  onOriginalTextSelect,
  translatedText,
  onTranslatedTextChange,
}: TranslationEditorProps) {

  const handleOriginalTextSelect = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const selection = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    onOriginalTextSelect(selection);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translation Editor</CardTitle>
        <CardDescription>Edit the OCR text and write your translation.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="original-text">Original Text (from OCR)</Label>
          <Textarea
            id="original-text"
            placeholder="Text from image will appear here..."
            value={originalText}
            onChange={(e) => onOriginalTextChange(e.target.value)}
            onSelect={handleOriginalTextSelect}
            className="h-48 resize-none"
            aria-label="Original Text"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="translated-text">Your Translation</Label>
          <Textarea
            id="translated-text"
            placeholder="Enter your translation here..."
            value={translatedText}
            onChange={(e) => onTranslatedTextChange(e.target.value)}
            className="h-48 resize-none"
            aria-label="Your Translation"
          />
        </div>
      </CardContent>
    </Card>
  )
}
