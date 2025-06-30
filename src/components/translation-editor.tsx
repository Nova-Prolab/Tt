
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Loader2 } from "lucide-react"
import type React from "react"
import { useToast } from "@/hooks/use-toast"


type TranslationEditorProps = {
  originalText: string;
  onOriginalTextChange: (text: string) => void;
  onOriginalTextSelect: (text: string) => void;
  manualTranslation: string;
  onManualTranslationChange: (text: string) => void;
  aiTranslation: string;
  isAiTranslating: boolean;
};

export function TranslationEditor({
  originalText,
  onOriginalTextChange,
  onOriginalTextSelect,
  manualTranslation,
  onManualTranslationChange,
  aiTranslation,
  isAiTranslating,
}: TranslationEditorProps) {

  const { toast } = useToast();

  const handleOriginalTextSelect = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const selection = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    onOriginalTextSelect(selection);
  };

  const handleCopyToManual = () => {
    onManualTranslationChange(aiTranslation);
    toast({
      title: "Copied to Manual Translation",
      description: "You can now edit the AI translation.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translation Editor</CardTitle>
        <CardDescription>Edit the OCR text and write or generate your translation.</CardDescription>
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
            className="h-56 resize-none"
            aria-label="Original Text"
          />
        </div>
        <div className="grid gap-2">
            <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                    <TabsTrigger value="ai">AI Translation</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="mt-2">
                    <Label htmlFor="translated-text">Your Translation</Label>
                    <Textarea
                        id="translated-text"
                        placeholder="Enter your translation here..."
                        value={manualTranslation}
                        onChange={(e) => onManualTranslationChange(e.target.value)}
                        className="h-[196px] resize-none"
                        aria-label="Your Translation"
                    />
                </TabsContent>
                <TabsContent value="ai" className="mt-2">
                   <Label htmlFor="ai-translated-text">AI Generated Translation</Label>
                   <div className="relative">
                    <Textarea
                        id="ai-translated-text"
                        placeholder="Click 'AI Translate' to generate a translation..."
                        value={aiTranslation}
                        readOnly
                        className="h-[196px] resize-none bg-muted/50"
                        aria-label="AI Generated Translation"
                    />
                     {isAiTranslating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}
                   </div>
                   {aiTranslation && !isAiTranslating && (
                       <Button variant="outline" size="sm" className="mt-2" onClick={handleCopyToManual}>
                           <Copy className="mr-2 h-4 w-4" />
                           Copy to Manual
                       </Button>
                   )}
                </TabsContent>
            </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
