"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Loader2, Lightbulb, BookOpen, Info, Languages } from "lucide-react"
import type React from "react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

type LoadingState = "suggestion" | "context" | "explanation" | "translation" | null;

type TranslationEditorProps = {
  originalText: string;
  onOriginalTextChange: (text: string) => void;
  onOriginalTextSelect: (text: string) => void;
  manualTranslation: string;
  onManualTranslationChange: (text: string) => void;
  aiTranslation: string;
  isAiTranslating: boolean;
  
  // New props for integrated tools
  translator: string;
  onTranslatorChange: (value: string) => void;
  onSuggestImprovement: () => void;
  onGetContext: () => void;
  onExplainPhrase: () => void;
  onTranslate: () => void;
  isLoading: LoadingState;
  isExplainPhraseDisabled: boolean;
};

export function TranslationEditor({
  originalText,
  onOriginalTextChange,
  onOriginalTextSelect,
  manualTranslation,
  onManualTranslationChange,
  aiTranslation,
  isAiTranslating,
  translator,
  onTranslatorChange,
  onSuggestImprovement,
  onGetContext,
  onExplainPhrase,
  onTranslate,
  isLoading,
  isExplainPhraseDisabled,
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

  const getButtonContent = (buttonType: Exclude<LoadingState, null>, icon: React.ReactNode, text: string) => {
    if (isLoading === buttonType) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      );
    }
    return (
      <>
        {icon}
        {text}
      </>
    );
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Translation Editor</CardTitle>
        <CardDescription>Edit the OCR text, translate, and use AI tools to assist you.</CardDescription>
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
            className="h-64 resize-none"
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
                        className="h-64 resize-none"
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
                        className="h-64 resize-none bg-muted/50"
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
      <CardFooter className="flex flex-col items-start gap-3 border-t pt-6">
        <Label className="font-semibold">Translation Tools</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-2">
            <Select value={translator} onValueChange={onTranslatorChange} disabled={!!isLoading}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a translator" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="gemini-2.0-flash">AI (Gemini Flash)</SelectItem>
                    <SelectItem value="gemini-pro">AI (Gemini Pro)</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={onTranslate} disabled={!!isLoading} className="w-full">
                {getButtonContent("translation", <Languages className="mr-2 h-4 w-4" />, "AI Translate")}
            </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <Button variant="outline" onClick={onSuggestImprovement} disabled={!!isLoading}>
                {getButtonContent("suggestion", <Lightbulb className="mr-2 h-4 w-4" />, "Suggest")}
            </Button>
            <Button variant="outline" onClick={onExplainPhrase} disabled={!!isLoading || isExplainPhraseDisabled}>
                {getButtonContent("explanation", <Info className="mr-2 h-4 w-4" />, "Explain")}
            </Button>
            <Button variant="outline" onClick={onGetContext} disabled={!!isLoading}>
                {getButtonContent("context", <BookOpen className="mr-2 h-4 w-4" />, "Context")}
            </Button>
        </div>
    </CardFooter>
    </Card>
  )
}
