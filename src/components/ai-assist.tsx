
"use client"

import { Lightbulb, BookOpen, Info, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProvideContextualUnderstandingOutput } from "@/ai/flows/provide-contextual-understanding"
import type { SuggestTranslationImprovementsOutput } from "@/ai/flows/suggest-translation-improvements"
import type { ExplainPhraseContextOutput } from "@/ai/flows/explain-phrase-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type AiAssistProps = {
  suggestion: SuggestTranslationImprovementsOutput | null;
  context: ProvideContextualUnderstandingOutput | null;
  explanation: ExplainPhraseContextOutput | null;
  selectedText: string;
  isLoading: "suggestion" | "context" | "explanation" | "translation" | null;
}

export function AiAssist({
  suggestion,
  context,
  explanation,
  selectedText,
  isLoading,
}: AiAssistProps) {
  const hasContent = suggestion || context || explanation;
  const isAssistantLoading = isLoading && ['suggestion', 'context', 'explanation'].includes(isLoading)

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>
          Contextual information and suggestions from AI will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[150px]">
        {isAssistantLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Getting AI assistance...</p>
          </div>
        )}
        {!isAssistantLoading && !hasContent && (
          <div className="text-center text-sm text-muted-foreground p-8 flex items-center justify-center h-full">
            Use the translation tools to get AI-powered help.
          </div>
        )}
        {hasContent && !isAssistantLoading && (
          <Accordion type="single" collapsible className="w-full" defaultValue={suggestion ? "item-1" : context ? "item-2" : "item-3"}>
            {suggestion && (
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Improvement Suggestion
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-1">
                    <h4 className="font-semibold text-sm">Improved Translation</h4>
                    <p className="text-base p-3 bg-muted rounded-md font-medium">{suggestion.improvedTranslation}</p>
                    <h4 className="font-semibold pt-2 text-sm">Explanation</h4>
                    <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {context && (
              <AccordionItem value="item-2">
                <AccordionTrigger>
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Contextual Understanding
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2 p-1">
                        <p className="text-sm text-muted-foreground">{context.contextualUnderstanding}</p>
                    </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {explanation && (
               <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Info className="mr-2 h-4 w-4" />
                    Phrase Explanation
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-1">
                    <h4 className="font-semibold text-sm">Explanation for: <span className="italic">"{selectedText}"</span></h4>
                    <p className="text-sm text-muted-foreground">{explanation.explanation}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
