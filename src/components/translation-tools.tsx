"use client"

import { Lightbulb, BookOpen, Loader2, Info, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type LoadingState = "suggestion" | "context" | "explanation" | "translation" | null;

type TranslationToolsProps = {
  onSuggestImprovement: () => void;
  onGetContext: () => void;
  onExplainPhrase: () => void;
  onTranslate: () => void;
  isLoading: LoadingState;
  isExplainPhraseDisabled: boolean;
};

export function TranslationTools({
  onSuggestImprovement,
  onGetContext,
  onExplainPhrase,
  onTranslate,
  isLoading,
  isExplainPhraseDisabled,
}: TranslationToolsProps) {
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Translation Tools</CardTitle>
        <CardDescription>
          Use AI to translate, improve, and understand the text.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={onTranslate} disabled={!!isLoading}>
          {getButtonContent("translation", <Languages className="mr-2 h-4 w-4" />, "AI Translate")}
        </Button>
         <Button
          variant="outline"
          onClick={onSuggestImprovement}
          disabled={!!isLoading}
        >
          {getButtonContent("suggestion", <Lightbulb className="mr-2 h-4 w-4" />, "Suggest Improvement")}
        </Button>
        <Button
          variant="outline"
          onClick={onExplainPhrase}
          disabled={!!isLoading || isExplainPhraseDisabled}
        >
          {getButtonContent("explanation", <Info className="mr-2 h-4 w-4" />, "Explain Phrase")}
        </Button>
        <Button variant="outline" onClick={onGetContext} disabled={!!isLoading}>
          {getButtonContent("context", <BookOpen className="mr-2 h-4 w-4" />, "Get Context")}
        </Button>
      </CardContent>
    </Card>
  );
}
