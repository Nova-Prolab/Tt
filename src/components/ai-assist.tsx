
"use client"

import { Lightbulb, BookOpen, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProvideContextualUnderstandingOutput } from "@/ai/flows/provide-contextual-understanding"
import type { SuggestTranslationImprovementsOutput } from "@/ai/flows/suggest-translation-improvements"
import type { ExplainPhraseContextOutput } from "@/ai/flows/explain-phrase-context"
import { Separator } from "@/components/ui/separator"

type AiAssistProps = {
  suggestion: SuggestTranslationImprovementsOutput | null;
  context: ProvideContextualUnderstandingOutput | null;
  explanation: ExplainPhraseContextOutput | null;
  selectedText: string;
  onSuggestImprovement: () => void;
  onGetContext: () => void;
  onExplainPhrase: () => void;
  isLoading: "suggestion" | "context" | "explanation" | null;
}

export function AiAssist({
  suggestion,
  context,
  explanation,
  selectedText,
  onSuggestImprovement,
  onGetContext,
  onExplainPhrase,
  isLoading,
}: AiAssistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>
          Get help with translations and cultural context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[150px]">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && !suggestion && !context && !explanation && (
          <div className="text-center text-sm text-muted-foreground p-8 flex items-center justify-center h-full">
            AI suggestions will appear here. Select a phrase to explain it.
          </div>
        )}
        {suggestion && !isLoading && (
          <div className="space-y-2 p-1">
            <h4 className="font-semibold text-sm">Improved Translation</h4>
            <p className="text-base p-3 bg-muted rounded-md font-medium">{suggestion.improvedTranslation}</p>
            <h4 className="font-semibold pt-2 text-sm">Explanation</h4>
            <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
          </div>
        )}
        {context && !isLoading && (
          <div className="space-y-2 p-1">
            <h4 className="font-semibold text-sm">Contextual Understanding</h4>
            <p className="text-sm text-muted-foreground">{context.contextualUnderstanding}</p>
          </div>
        )}
        {explanation && !isLoading && (
          <div className="space-y-2 p-1">
            <h4 className="font-semibold text-sm">Explanation for: <span className="italic">"{selectedText}"</span></h4>
            <p className="text-sm text-muted-foreground">{explanation.explanation}</p>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-end gap-2 pt-6">
        <Button
          variant="outline"
          onClick={onExplainPhrase}
          disabled={!!isLoading || !selectedText}
        >
          {isLoading === 'explanation' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Info className="mr-2 h-4 w-4" />
          )}
          Explain Phrase
        </Button>
        <Button
          variant="outline"
          onClick={onSuggestImprovement}
          disabled={!!isLoading}
        >
          {isLoading === 'suggestion' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Suggest Improvement
        </Button>
        <Button onClick={onGetContext} disabled={!!isLoading}>
          {isLoading === 'context' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BookOpen className="mr-2 h-4 w-4" />
          )}
          Get Context
        </Button>
      </CardFooter>
    </Card>
  )
}
