
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>
          Contextual information and suggestions from AI will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[200px]">
        {isAssistantLoading && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 font-semibold">Getting AI assistance...</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        )}
        {!isAssistantLoading && !hasContent && (
          <div className="text-center text-sm text-muted-foreground p-8 flex flex-col items-center justify-center h-full">
             <Info className="h-10 w-10 mb-4 text-muted-foreground/50"/>
            <span className="font-medium">Nothing to see here yet.</span>
            <span>Use the translation tools to get AI-powered help.</span>
          </div>
        )}
        {hasContent && !isAssistantLoading && (
          <Accordion type="single" collapsible className="w-full" defaultValue={suggestion ? "item-1" : context ? "item-2" : "item-3"}>
            {suggestion && (
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                    Improvement Suggestion
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-1">
                    <h4 className="font-semibold text-sm">Improved Translation</h4>
                    <p className="text-base p-3 bg-primary/10 border-l-4 border-primary rounded-r-md font-medium text-primary-foreground/90">{suggestion.improvedTranslation}</p>
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
                      <BookOpen className="mr-2 h-4 w-4 text-primary" />
                      Contextual Understanding
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2 p-2 bg-muted/50 rounded-md">
                        <p className="text-sm text-muted-foreground leading-relaxed">{context.contextualUnderstanding}</p>
                    </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {explanation && (
               <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Info className="mr-2 h-4 w-4 text-primary" />
                    Phrase Explanation
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-1">
                    <h4 className="font-semibold text-sm">Explanation for: <span className="italic font-normal p-1 bg-muted rounded-sm">"{selectedText}"</span></h4>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-2">{explanation.explanation}</p>
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
