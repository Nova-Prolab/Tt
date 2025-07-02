"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Loader2, Lightbulb, BookOpen, Info, Languages, SpellCheck, Undo, Redo } from "lucide-react"
import type React from "react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import type { ProvideContextualUnderstandingOutput } from "@/ai/flows/provide-contextual-understanding"
import type { SuggestTranslationImprovementsOutput } from "@/ai/flows/suggest-translation-improvements"
import type { ExplainPhraseContextOutput } from "@/ai/flows/explain-phrase-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type LoadingState = "suggestion" | "context" | "explanation" | "translation" | "ocr" | "spelling" | null;

type TranslationEditorProps = {
  originalText: string;
  onOriginalTextChange: (text: string) => void;
  onOriginalTextSelect: (text: string) => void;
  manualTranslation: string;
  onManualTranslationChange: (text: string) => void;
  aiTranslation: string;
  isAiTranslating: boolean;
  
  translator: string;
  onTranslatorChange: (value: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (value: string) => void;
  onSuggestImprovement: () => void;
  onGetContext: () => void;
  onExplainPhrase: () => void;
  onCorrectSpelling: () => void;
  onTranslate: () => void;
  isLoading: LoadingState;
  isExplainPhraseDisabled: boolean;

  suggestion: SuggestTranslationImprovementsOutput | null;
  context: ProvideContextualUnderstandingOutput | null;
  explanation: ExplainPhraseContextOutput | null;
  selectedText: string;

  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  targetLanguage,
  onTargetLanguageChange,
  onSuggestImprovement,
  onGetContext,
  onExplainPhrase,
  onCorrectSpelling,
  onTranslate,
  isLoading,
  isExplainPhraseDisabled,
  suggestion,
  context,
  explanation,
  selectedText,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: TranslationEditorProps) {

  const { toast } = useToast();
  const wordCount = (manualTranslation.trim() === '') ? 0 : manualTranslation.trim().split(/\s+/).length;

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
      title: "Copiado a Traducción Manual",
      description: "Ahora puedes editar la traducción de la IA.",
    });
  };

  const getButtonContent = (buttonType: Exclude<LoadingState, null | "ocr">, icon: React.ReactNode, text: string) => {
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

  const hasAiContent = suggestion || context || explanation;
  const isAssistantLoading = isLoading === "suggestion" || isLoading === "context" || isLoading === "explanation";


  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Editor de Traducción</CardTitle>
        <CardDescription>Edita el texto del OCR, traduce y usa las herramientas de IA para asistirte.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 flex-1 pt-2">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="grid gap-2">
            <Label htmlFor="original-text">Texto Original (del OCR)</Label>
            <Textarea
                id="original-text"
                placeholder="El texto de la imagen aparecerá aquí..."
                value={originalText}
                onChange={(e) => onOriginalTextChange(e.target.value)}
                onSelect={handleOriginalTextSelect}
                className="h-48 resize-none"
                aria-label="Texto Original"
            />
            </div>
            <div className="grid gap-2">
                <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual</TabsTrigger>
                        <TabsTrigger value="ai">Traducción IA</TabsTrigger>
                    </TabsList>
                    <TabsContent value="manual" className="mt-2">
                        <Label htmlFor="translated-text">Tu Traducción</Label>
                        <Textarea
                            id="translated-text"
                            placeholder="Escribe tu traducción aquí..."
                            value={manualTranslation}
                            onChange={(e) => onManualTranslationChange(e.target.value)}
                            className="h-48 resize-none"
                            aria-label="Tu Traducción"
                        />
                         <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo}>
                                                <Undo className="h-4 w-4" />
                                                <span className="sr-only">Deshacer</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Deshacer</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo}>
                                                <Redo className="h-4 w-4" />
                                                <span className="sr-only">Rehacer</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Rehacer</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex items-center space-x-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                <span>{manualTranslation.length} car.</span>
                                <Separator orientation="vertical" className="h-3" />
                                <span>{wordCount} pal.</span>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="ai" className="mt-2">
                    <Label htmlFor="ai-translated-text">Traducción Generada por IA</Label>
                    <div className="relative">
                        <Textarea
                            id="ai-translated-text"
                            placeholder="Haz clic en 'Traducir con IA' para generar una traducción..."
                            value={aiTranslation}
                            readOnly
                            className="h-48 resize-none bg-muted/50"
                            aria-label="Traducción Generada por IA"
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
                            Copiar a Manual
                        </Button>
                    )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
        
        <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <Label className="text-muted-foreground font-normal">Asistente de IA</Label>
                <Separator className="flex-1" />
            </div>
             <div className="min-h-[150px] rounded-lg border bg-card p-4">
                {isAssistantLoading && (
                  <div className="flex flex-col items-center justify-center p-6 text-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 font-semibold">Obteniendo asistencia de la IA...</p>
                    <p className="text-sm text-muted-foreground">Esto puede tardar un momento.</p>
                  </div>
                )}
                {!isAssistantLoading && !hasAiContent && (
                  <div className="text-center text-sm text-muted-foreground p-6 flex flex-col items-center justify-center h-full">
                     <Info className="h-10 w-10 mb-4 text-muted-foreground/50"/>
                    <span className="font-medium">La asistencia de IA aparecerá aquí.</span>
                    <span>Usa las herramientas de traducción para obtener ayuda de la IA.</span>
                  </div>
                )}
                {hasAiContent && !isAssistantLoading && (
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
                            <h4 className="font-semibold text-sm">Explicación para: <span className="italic font-normal p-1 bg-muted rounded-sm">"{selectedText || originalText}"</span></h4>
                            <p className="text-sm text-muted-foreground leading-relaxed pt-2">{explanation.explanation}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                )}
            </div>
        </div>

      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
        <div className="flex items-center gap-2 flex-wrap">
            <Label htmlFor="translator-select" className="shrink-0">Traducir con:</Label>
            <Select value={translator} onValueChange={onTranslatorChange} disabled={!!isLoading}>
                <SelectTrigger id="translator-select" className="w-auto min-w-[180px]">
                    <SelectValue placeholder="Selecciona un traductor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="google-translate">Google Translate</SelectItem>
                    <SelectItem value="gemini-flash">IA (Gemini Flash)</SelectItem>
                </SelectContent>
            </Select>
            <Label htmlFor="target-lang-select" className="shrink-0 ml-2">a:</Label>
            <Select value={targetLanguage} onValueChange={onTargetLanguageChange} disabled={!!isLoading}>
              <SelectTrigger id="target-lang-select" className="w-auto min-w-[140px]">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spanish">Español</SelectItem>
                <SelectItem value="English">Inglés</SelectItem>
                <SelectItem value="Portuguese">Portugués</SelectItem>
                <SelectItem value="French">Francés</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onTranslate} disabled={!!isLoading} className="w-full sm:w-auto">
                {getButtonContent("translation", <Languages className="mr-2 h-4 w-4" />, "Traducir con IA")}
            </Button>
        </div>
        <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onCorrectSpelling} disabled={!!isLoading}>
                {getButtonContent("spelling", <SpellCheck className="mr-2 h-4 w-4" />, "Corregir")}
            </Button>
            <Button size="sm" variant="outline" onClick={onSuggestImprovement} disabled={!!isLoading}>
                {getButtonContent("suggestion", <Lightbulb className="mr-2 h-4 w-4" />, "Sugerir")}
            </Button>
            <Button size="sm" variant="outline" onClick={onExplainPhrase} disabled={!!isLoading || isExplainPhraseDisabled}>
                {getButtonContent("explanation", <Info className="mr-2 h-4 w-4" />, "Explicar")}
            </Button>
            <Button size="sm" variant="outline" onClick={onGetContext} disabled={!!isLoading}>
                {getButtonContent("context", <BookOpen className="mr-2 h-4 w-4" />, "Contexto")}
            </Button>
        </div>
    </CardFooter>
    </Card>
  )
}
