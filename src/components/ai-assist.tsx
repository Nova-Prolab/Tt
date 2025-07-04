
"use client"

import { Lightbulb, BookOpen, Info, Loader2, Wand2, Check, Sparkles, Drama, Copy, ClipboardList, Handshake, BarChartHorizontal, ChevronDown, FileText, Users, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProvideContextualUnderstandingOutput } from "@/ai/flows/provide-contextual-understanding"
import type { SuggestTranslationImprovementsOutput } from "@/ai/flows/suggest-translation-improvements"
import type { ExplainPhraseContextOutput } from "@/ai/flows/explain-phrase-context"
import type { AnalyzeToneOutput } from "@/ai/flows/analyze-tone"
import type { TranslateSfxOutput } from "@/ai/flows/translate-sfx"
import type { GenerateAlternativeTranslationsOutput } from "@/ai/flows/generate-alternative-translations"
import type { AnalyzeFormalityOutput } from "@/ai/flows/analyze-formality"
import type { AnalyzeTranslationQualityOutput } from "@/ai/flows/analyze-translation-quality"
import type { SummarizePanelOutput } from "@/ai/flows/summarize-panel"
import type { IdentifySpeakersOutput } from "@/ai/flows/identify-speakers"
import type { RephraseTextOutput } from "@/ai/flows/rephrase-text"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

type LoadingState = "suggestion" | "context" | "explanation" | "translation" | "ocr" | "spelling" | "tone" | "sfx" | "alternatives" | "formality" | "quality" | "summary" | "speakers" | "rephrasing" | null;

type AiAssistProps = {
  onSuggestImprovement: () => void;
  onGetContext: () => void;
  onExplainPhrase: () => void;
  onCorrectSpelling: () => void;
  onAnalyzeTone: () => void;
  onTranslateSfx: () => void;
  onGenerateAlternatives: () => void;
  onAnalyzeFormality: () => void;
  onAnalyzeQuality: () => void;
  onSummarizePanel: () => void;
  onIdentifySpeakers: () => void;
  onRephraseText: (style: string) => void;
  onApplySuggestion: (suggestion: string) => void;
  onApplySfx: (sfx: string) => void;
  onApplyAlternative: (alternative: string) => void;
  onApplyRephrasing: (rephrasedText: string) => void;
  isLoading: LoadingState;
  isActionDisabled: boolean;
  isQualityCheckDisabled: boolean;

  suggestion: SuggestTranslationImprovementsOutput | null;
  context: ProvideContextualUnderstandingOutput | null;
  explanation: ExplainPhraseContextOutput | null;
  tone: AnalyzeToneOutput | null;
  sfx: TranslateSfxOutput | null;
  alternatives: GenerateAlternativeTranslationsOutput | null;
  formality: AnalyzeFormalityOutput | null;
  quality: AnalyzeTranslationQualityOutput | null;
  summary: SummarizePanelOutput | null;
  speakers: IdentifySpeakersOutput | null;
  rephrasing: RephraseTextOutput | null;
  selectedText: string;
  originalText: string;
  manualTranslation: string;
}

export function AiAssist({
  onSuggestImprovement,
  onGetContext,
  onExplainPhrase,
  onCorrectSpelling,
  onAnalyzeTone,
  onTranslateSfx,
  onGenerateAlternatives,
  onAnalyzeFormality,
  onAnalyzeQuality,
  onSummarizePanel,
  onIdentifySpeakers,
  onRephraseText,
  onApplySuggestion,
  onApplySfx,
  onApplyAlternative,
  onApplyRephrasing,
  isLoading,
  isActionDisabled,
  isQualityCheckDisabled,
  suggestion,
  context,
  explanation,
  tone,
  sfx,
  alternatives,
  formality,
  quality,
  summary,
  speakers,
  rephrasing,
  selectedText,
  originalText,
  manualTranslation,
}: AiAssistProps) {
  const { toast } = useToast();

  const handleCopySfx = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "SFX Copiado",
      description: `"${text}" se ha copiado a tu portapapeles.`,
    });
  }

  const hasContent = suggestion || context || explanation || tone || sfx || alternatives || formality || quality || summary || speakers || rephrasing;
  const isAssistantLoading = isLoading === "suggestion" || isLoading === "context" || isLoading === "explanation" || isLoading === "tone" || isLoading === "sfx" || isLoading === "alternatives" || isLoading === "formality" || isLoading === "quality" || isLoading === "summary" || isLoading === "speakers" || isLoading === "rephrasing";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Asistente de IA</CardTitle>
        <CardDescription>
          Utiliza estas herramientas para mejorar y comprender tu traducción.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={!!isLoading}>
                        Editar y Generar
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={onCorrectSpelling} disabled={!!isLoading || !manualTranslation}>
                        <Wand2 className="mr-2 h-4 w-4"/>
                        <span>Corregir Ortografía</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSuggestImprovement} disabled={!!isLoading || isQualityCheckDisabled}>
                        <Lightbulb className="mr-2 h-4 w-4"/>
                        <span>Sugerir Mejora</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={onGenerateAlternatives} disabled={!!isLoading || isActionDisabled}>
                        <ClipboardList className="mr-2 h-4 w-4"/>
                        <span>Generar Alternativas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onTranslateSfx} disabled={!!isLoading || !originalText}>
                        <Sparkles className="mr-2 h-4 w-4"/>
                        <span>Traducir SFX</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger disabled={!!isLoading || (!selectedText && !manualTranslation)}>
                            <Repeat className="mr-2 h-4 w-4"/>
                            <span>Reformular Texto</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => onRephraseText("more formal")}>Más Formal</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRephraseText("more casual")}>Más Casual</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRephraseText("simpler")}>Más Simple</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRephraseText("more poetic")}>Más Poético</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={!!isLoading}>
                        Analizar y Calificar
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={onAnalyzeTone} disabled={!!isLoading || isActionDisabled}>
                        <Drama className="mr-2 h-4 w-4"/>
                        <span>Analizar Tono</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAnalyzeFormality} disabled={!!isLoading || isActionDisabled}>
                        <Handshake className="mr-2 h-4 w-4"/>
                        <span>Analizar Formalidad</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={onAnalyzeQuality} disabled={!!isLoading || isQualityCheckDisabled}>
                        <BarChartHorizontal className="mr-2 h-4 w-4"/>
                        <span>Analizar Calidad de Traducción</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={!!isLoading}>
                        Comprender y Explicar
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={onGetContext} disabled={!!isLoading || isActionDisabled}>
                        <BookOpen className="mr-2 h-4 w-4"/>
                        <span>Obtener Contexto del Panel</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExplainPhrase} disabled={!!isLoading || isActionDisabled}>
                        <Info className="mr-2 h-4 w-4"/>
                        <span>Explicar Frase Seleccionada</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSummarizePanel} disabled={!!isLoading || isActionDisabled}>
                        <FileText className="mr-2 h-4 w-4"/>
                        <span>Resumir Panel</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onIdentifySpeakers} disabled={!!isLoading || isActionDisabled}>
                        <Users className="mr-2 h-4 w-4"/>
                        <span>Identificar Interlocutores</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
            <Accordion type="single" collapsible className="w-full" defaultValue={suggestion ? "item-1" : context ? "item-2" : explanation ? "item-3" : tone ? "item-4" : sfx ? "item-5" : alternatives ? "item-6" : formality ? "item-7" : quality ? "item-8" : summary ? "item-9" : speakers ? "item-10" : rephrasing ? "item-11" : undefined}>
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
              {alternatives && (
                <AccordionItem value="item-6">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <ClipboardList className="mr-2 h-4 w-4 text-primary" />
                            Traducciones Alternativas
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 p-1">
                            <h4 className="font-semibold text-sm">Sugerencias para: <span className="italic font-normal p-1 bg-muted rounded-sm">"{selectedText}"</span></h4>
                            <ul className="space-y-2 pt-2">
                                {alternatives.translations.map((alt, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 pl-3 bg-primary/10 border-l-4 border-primary rounded-r-md">
                                        <span className="font-medium text-foreground">{alt}</span>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onApplyAlternative(alt)}>
                                                <Check className="h-4 w-4" />
                                                <span className="sr-only">Aplicar</span>
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AccordionContent>
                </AccordionItem>
              )}
              {formality && (
                <AccordionItem value="item-7">
                  <AccordionTrigger>
                      <div className="flex items-center">
                        <Handshake className="mr-2 h-4 w-4 text-primary" />
                        Análisis de Formalidad
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-2 p-1">
                          <h4 className="font-semibold text-sm">Nivel de Formalidad: <span className="text-base font-bold text-primary p-1 rounded-sm">{formality.formality}</span></h4>
                          <p className="text-sm text-muted-foreground leading-relaxed pt-2">{formality.explanation}</p>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {quality && (
                <AccordionItem value="item-8">
                  <AccordionTrigger>
                      <div className="flex items-center">
                        <BarChartHorizontal className="mr-2 h-4 w-4 text-primary" />
                        Análisis de Calidad
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-4 p-1">
                        <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Puntuación General</p>
                            <p className="text-5xl font-bold text-primary">{quality.overallScore}<span className="text-2xl text-muted-foreground">/100</span></p>
                            <p className="text-sm text-muted-foreground px-4">{quality.summary}</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Precisión ({quality.accuracy.score}/10)</h4>
                            <Progress value={quality.accuracy.score * 10} className="h-2" />
                            <p className="text-xs text-muted-foreground">{quality.accuracy.explanation}</p>
                        </div>
                         <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Legibilidad ({quality.readability.score}/10)</h4>
                            <Progress value={quality.readability.score * 10} className="h-2" />
                            <p className="text-xs text-muted-foreground">{quality.readability.explanation}</p>
                        </div>
                         <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Consistencia de Tono ({quality.toneConsistency.score}/10)</h4>
                            <Progress value={quality.toneConsistency.score * 10} className="h-2" />
                            <p className="text-xs text-muted-foreground">{quality.toneConsistency.explanation}</p>
                        </div>
                         <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Adaptación Cultural</h4>
                            <p className="text-xs text-muted-foreground">{quality.culturalAdaptation}</p>
                        </div>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {summary && (
                <AccordionItem value="item-9">
                  <AccordionTrigger>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        Resumen del Panel
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-2 p-2 bg-muted/50 rounded-md">
                          <p className="text-sm text-muted-foreground leading-relaxed">{summary.summary}</p>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {speakers && (
                <AccordionItem value="item-10">
                  <AccordionTrigger>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-primary" />
                        Análisis de Interlocutores
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-4 p-1">
                          <ul className="space-y-2">
                              {speakers.identifiedLines.map((line, index) => (
                                  <li key={index} className="flex gap-3 text-sm">
                                      <span className="font-bold text-primary w-24 shrink-0 text-right">{line.speaker}:</span>
                                      <span className="text-muted-foreground">{line.line}</span>
                                  </li>
                              ))}
                          </ul>
                          <Separator/>
                          <div>
                              <h4 className="font-semibold text-sm">Análisis</h4>
                              <p className="text-xs text-muted-foreground pt-1">{speakers.analysis}</p>
                          </div>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {rephrasing && (
                <AccordionItem value="item-11">
                  <AccordionTrigger>
                      <div className="flex items-center">
                        <Repeat className="mr-2 h-4 w-4 text-primary" />
                        Texto Reformulado
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 p-1">
                      <h4 className="font-semibold text-sm">Texto Reformulado</h4>
                      <p className="text-base p-3 bg-primary/10 border-l-4 border-primary rounded-r-md font-medium text-foreground">{rephrasing.rephrasedText}</p>
                      <h4 className="font-semibold pt-2 text-sm">Explicación</h4>
                      <p className="text-sm text-muted-foreground">{rephrasing.explanation}</p>
                      <div className="pt-2">
                        <Button size="sm" onClick={() => onApplyRephrasing(rephrasing.rephrasedText)}>
                            <Check className="mr-2 h-4 w-4"/>
                            Aplicar Texto
                        </Button>
                      </div>
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

    
