"use client"

import { Lightbulb, BookOpen, Info, Loader2, Wand2, Check, Sparkles, Drama, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProvideContextualUnderstandingOutput } from "@/ai/flows/provide-contextual-understanding"
import type { SuggestTranslationImprovementsOutput } from "@/ai/flows/suggest-translation-improvements"
import type { ExplainPhraseContextOutput } from "@/ai/flows/explain-phrase-context"
import type { AnalyzeToneOutput } from "@/ai/flows/analyze-tone"
import type { TranslateSfxOutput } from "@/ai/flows/translate-sfx"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

type LoadingState = "suggestion" | "context" | "explanation" | "translation" | "ocr" | "spelling" | "tone" | "sfx" | null;

type AiAssistProps = {
  onSuggestImprovement: () => void;
  onGetContext: () => void;
  onExplainPhrase: () => void;
  onCorrectSpelling: () => void;
  onAnalyzeTone: () => void;
  onTranslateSfx: () => void;
  onApplySuggestion: (suggestion: string) => void;
  onApplySfx: (sfx: string) => void;
  isLoading: LoadingState;
  isActionDisabled: boolean;

  suggestion: SuggestTranslationImprovementsOutput | null;
  context: ProvideContextualUnderstandingOutput | null;
  explanation: ExplainPhraseContextOutput | null;
  tone: AnalyzeToneOutput | null;
  sfx: TranslateSfxOutput | null;
  selectedText: string;
  originalText: string;
}

export function AiAssist({
  onSuggestImprovement,
  onGetContext,
  onExplainPhrase,
  onCorrectSpelling,
  onAnalyzeTone,
  onTranslateSfx,
  onApplySuggestion,
  onApplySfx,
  isLoading,
  isActionDisabled,
  suggestion,
  context,
  explanation,
  tone,
  sfx,
  selectedText,
  originalText,
}: AiAssistProps) {
  const { toast } = useToast();
  
  const getButtonContent = (buttonType: "suggestion" | "context" | "explanation" | "spelling" | "tone" | "sfx", icon: React.ReactNode, text: string) => {
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

  const handleCopySfx = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "SFX Copiado",
      description: `"${text}" se ha copiado a tu portapapeles.`,
    });
  }

  const hasContent = suggestion || context || explanation || tone || sfx;
  const isAssistantLoading = isLoading === "suggestion" || isLoading === "context" || isLoading === "explanation" || isLoading === "tone" || isLoading === "sfx";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Asistente de IA</CardTitle>
        <CardDescription>
          Utiliza estas herramientas para mejorar y comprender tu traducción.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button variant="outline" onClick={onCorrectSpelling} disabled={!!isLoading}>
                {getButtonContent("spelling", <Wand2 className="mr-2 h-4 w-4" />, "Corregir")}
            </Button>
            <Button variant="outline" onClick={onSuggestImprovement} disabled={!!isLoading}>
                {getButtonContent("suggestion", <Lightbulb className="mr-2 h-4 w-4" />, "Sugerir")}
            </Button>
            <Button variant="outline" onClick={onGetContext} disabled={!!isLoading}>
                {getButtonContent("context", <BookOpen className="mr-2 h-4 w-4" />, "Contexto")}
            </Button>
            <Button variant="outline" onClick={onExplainPhrase} disabled={!!isLoading || isActionDisabled}>
                {getButtonContent("explanation", <Info className="mr-2 h-4 w-4" />, "Explicar")}
            </Button>
            <Button variant="outline" onClick={onAnalyzeTone} disabled={!!isLoading || isActionDisabled}>
                {getButtonContent("tone", <Drama className="mr-2 h-4 w-4" />, "Analizar Tono")}
            </Button>
            <Button variant="outline" onClick={onTranslateSfx} disabled={!!isLoading || !originalText}>
                {getButtonContent("sfx", <Sparkles className="mr-2 h-4 w-4" />, "Traducir SFX")}
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
            <Accordion type="single" collapsible className="w-full" defaultValue={suggestion ? "item-1" : context ? "item-2" : explanation ? "item-3" : tone ? "item-4" : sfx ? "item-5" : undefined}>
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
              {tone && (
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                      <div className="flex items-center">
                        <Drama className="mr-2 h-4 w-4 text-primary" />
                        Análisis de Tono
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-2 p-1">
                          <h4 className="font-semibold text-sm">Tono Identificado: <span className="text-base font-bold text-primary p-1 rounded-sm">{tone.tone}</span></h4>
                          <p className="text-sm text-muted-foreground leading-relaxed pt-2">{tone.explanation}</p>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {sfx && sfx.sfxTranslations.length > 0 && (
                  <AccordionItem value="item-5">
                  <AccordionTrigger>
                      <div className="flex items-center">
                        <Sparkles className="mr-2 h-4 w-4 text-primary" />
                        Sugerencias de SFX
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-4 p-1">
                          {sfx.sfxTranslations.map((sfxGroup, groupIndex) => (
                            <div key={groupIndex}>
                                <h4 className="font-semibold text-sm">Sugerencias para: <span className="italic font-normal p-1 bg-muted rounded-sm">"{sfxGroup.originalSfx}"</span></h4>
                                <ul className="space-y-2 pt-2">
                                {sfxGroup.suggestions.map((suggestion, suggestionIndex) => (
                                    <li key={suggestionIndex} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                    <span className="font-medium">{suggestion}</span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopySfx(suggestion)}>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span className="sr-only">Copiar</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onApplySfx(suggestion)}>
                                            <Check className="h-4 w-4" />
                                            <span className="sr-only">Aplicar</span>
                                        </Button>
                                    </div>
                                    </li>
                                ))}
                                </ul>
                                {groupIndex < sfx.sfxTranslations.length - 1 && <Separator className="mt-4"/>}
                            </div>
                          ))}
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
