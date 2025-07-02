"use client"

import { Lightbulb, BookOpen, Info, Loader2, Wand2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProvideContextualUnderstandingOutput } from "@/ai/flows/provide-contextual-understanding"
import type { SuggestTranslationImprovementsOutput } from "@/ai/flows/suggest-translation-improvements"
import type { ExplainPhraseContextOutput } from "@/ai/flows/explain-phrase-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

type LoadingState = "suggestion" | "context" | "explanation" | "translation" | "ocr" | "spelling" | null;

type AiAssistProps = {
  onSuggestImprovement: () => void;
  onGetContext: () => void;
  onExplainPhrase: () => void;
  onCorrectSpelling: () => void;
  onApplySuggestion: (suggestion: string) => void;
  isLoading: LoadingState;
  isExplainPhraseDisabled: boolean;

  suggestion: SuggestTranslationImprovementsOutput | null;
  context: ProvideContextualUnderstandingOutput | null;
  explanation: ExplainPhraseContextOutput | null;
  selectedText: string;
}

export function AiAssist({
  onSuggestImprovement,
  onGetContext,
  onExplainPhrase,
  onCorrectSpelling,
  onApplySuggestion,
  isLoading,
  isExplainPhraseDisabled,
  suggestion,
  context,
  explanation,
  selectedText,
}: AiAssistProps) {
  
  const getButtonContent = (buttonType: "suggestion" | "context" | "explanation" | "spelling", icon: React.ReactNode, text: string) => {
    if (isLoading === buttonType) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
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

  const hasContent = suggestion || context || explanation;
  const isAssistantLoading = isLoading === "suggestion" || isLoading === "context" || isLoading === "explanation";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Asistente de IA</CardTitle>
        <CardDescription>
          Utiliza estas herramientas para mejorar y comprender tu traducción.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={onCorrectSpelling} disabled={!!isLoading}>
                {getButtonContent("spelling", <Wand2 className="mr-2 h-4 w-4" />, "Corregir Ortografía")}
            </Button>
            <Button variant="outline" onClick={onSuggestImprovement} disabled={!!isLoading}>
                {getButtonContent("suggestion", <Lightbulb className="mr-2 h-4 w-4" />, "Sugerir Mejora")}
            </Button>
            <Button variant="outline" onClick={onGetContext} disabled={!!isLoading}>
                {getButtonContent("context", <BookOpen className="mr-2 h-4 w-4" />, "Obtener Contexto")}
            </Button>
            <Button variant="outline" onClick={onExplainPhrase} disabled={!!isLoading || isExplainPhraseDisabled}>
                {getButtonContent("explanation", <Info className="mr-2 h-4 w-4" />, "Explicar Frase")}
            </Button>
        </div>

        <Separator/>

        <div className="min-h-[200px] rounded-lg border bg-muted/30 p-4">
          {isAssistantLoading && (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 font-semibold">Obteniendo asistencia de la IA...</p>
              <p className="text-sm text-muted-foreground">Esto puede tardar un momento.</p>
            </div>
          )}
          {!isAssistantLoading && !hasContent && (
            <div className="text-center text-sm text-muted-foreground p-8 flex flex-col items-center justify-center h-full">
               <Info className="h-10 w-10 mb-4 text-muted-foreground/50"/>
              <span className="font-medium">La asistencia de IA aparecerá aquí.</span>
              <span>Usa las herramientas de arriba para obtener ayuda.</span>
            </div>
          )}
          {hasContent && !isAssistantLoading && (
            <Accordion type="single" collapsible className="w-full" defaultValue={suggestion ? "item-1" : context ? "item-2" : "item-3"}>
              {suggestion && (
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                      Sugerencia de Mejora
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 p-1">
                      <h4 className="font-semibold text-sm">Traducción Mejorada</h4>
                      <p className="text-base p-3 bg-primary/10 border-l-4 border-primary rounded-r-md font-medium text-foreground">{suggestion.improvedTranslation}</p>
                      <h4 className="font-semibold pt-2 text-sm">Explicación</h4>
                      <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
                      <div className="pt-2">
                        <Button size="sm" onClick={() => onApplySuggestion(suggestion.improvedTranslation)}>
                            <Check className="mr-2 h-4 w-4"/>
                            Aplicar Sugerencia
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {context && (
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4 text-primary" />
                        Comprensión Contextual
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
                      Explicación de la Frase
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 p-1">
                      <h4 className="font-semibold text-sm">Explicación para: <span className="italic font-normal p-1 bg-muted rounded-sm">"{selectedText}"</span></h4>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-2">{explanation.explanation}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
