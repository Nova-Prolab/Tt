
"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Loader2, Languages, Undo, Redo } from "lucide-react"
import type React from "react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GeminiLogo = () => (
    <svg fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      <defs>
        <linearGradient id="gemini-a" x1="129.23" x2="129.23" y1="103.14" y2="189.68" gradientUnits="userSpaceOnUse"><stop stop-color="#8E83EE"></stop><stop offset="1" stop-color="#5448C8"></stop></linearGradient>
        <linearGradient id="gemini-b" x1="126.77" x2="126.77" y1="118.3" y2="204.84" gradientUnits="userSpaceOnUse"><stop stop-color="#C6B9FF"></stop><stop offset="1" stop-color="#8E83EE"></stop></linearGradient>
        <linearGradient id="gemini-c" x1="105.74" x2="105.74" y1="102.63" y2="209.84" gradientUnits="userSpaceOnUse"><stop stop-color="#50A6FF"></stop><stop offset="1" stop-color="#1579F2"></stop></linearGradient>
        <linearGradient id="gemini-d" x1="150.26" x2="150.26" y1="87.47" y2="194.68" gradientUnits="userSpaceOnUse"><stop stop-color="#83EAF1"></stop><stop offset="1" stop-color="#3C8CE7"></stop></linearGradient>
      </defs>
      <path d="M128 256A128 128 0 1 1 128 0a128 128 0 0 1 0 256z" fill="#000" opacity="0.2"></path>
      <path d="M220.41 174.61a127.34 127.34 0 0 0-14-20.33l-50.64-50.62a36.21 36.21 0 0 0-51.15 0L54 154.28a127.24 127.24 0 0 0-14 20.33l-3.37 5.17a6.52 6.52 0 0 0 5.48 9.9h176.2a6.52 6.52 0 0 0 5.48-9.9z" fill="url(#gemini-a)"></path>
      <path d="M104.63 103.66a36.21 36.21 0 0 1 51.15 0l50.64 50.62a127.34 127.34 0 0 0 14-20.33l3.37-5.17a6.52 6.52 0 0 0-5.48-9.9H57.75a6.52 6.52 0 0 0-5.48 9.9l3.37 5.17a127.24 127.24 0 0 0 14 20.33z" fill="url(#gemini-b)"></path>
      <path d="m155.78 154.28-51.15-51.14a36.21 36.21 0 0 0-51.15 0l-17.9 17.9a127.38 127.38 0 0 0 18.67 21.65l3.37 5.17a6.52 6.52 0 0 0 5.48 9.9h59.16z" fill="url(#gemini-c)"></path>
      <path d="m100.22 103.14 51.15 51.14a36.21 36.21 0 0 0 51.15 0l17.9-17.9a127.38 127.38 0 0 0-18.67-21.65l-3.37-5.17a6.52 6.52 0 0 0-5.48-9.9H93.72z" fill="url(#gemini-d)"></path>
    </svg>
);

const DeepseekLogo = () => (
    <svg fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      <defs>
        <linearGradient id="deepseek-a" x1="512" x2="512" y1="0" y2="1024" gradientUnits="userSpaceOnUse"><stop stop-color="#247CFF"></stop><stop offset="1" stop-color="#0E58BE"></stop></linearGradient>
        <linearGradient id="deepseek-b" x1="512" x2="512" y1="192" y2="832" gradientUnits="userSpaceOnUse"><stop stop-color="#00A4FF"></stop><stop offset="1" stop-color="#0085FF"></stop></linearGradient>
        <linearGradient id="deepseek-c" x1="512" x2="512" y1="384" y2="640" gradientUnits="userSpaceOnUse"><stop stop-color="#00D1FF"></stop><stop offset="1" stop-color="#00E0FF"></stop></linearGradient>
      </defs>
      <path d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512m0-896a384 384 0 1 0 384 384A384 384 0 0 0 512 128" fill="url(#deepseek-a)"></path>
      <path d="M512 832a320 320 0 1 1 320-320 320 320 0 0 1-320 320m0-512a192 192 0 1 0 192 192A192 192 0 0 0 512 320" fill="url(#deepseek-b)"></path>
      <path d="M512 640a128 128 0 1 1 128-128 128 128 0 0 1-128 128m0-192a64 64 0 1 0 64 64 64 64 0 0 0-64-64" fill="url(#deepseek-c)"></path>
    </svg>
);


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
  onTranslate: () => void;

  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const translatorOptions = [
    { value: 'gemini', label: 'Gemini', icon: <GeminiLogo /> },
    { value: 'deepseek', label: 'DeepSeek', icon: <DeepseekLogo /> }
];

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
  onTranslate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: TranslationEditorProps) {

  const { toast } = useToast();
  const wordCount = (manualTranslation.trim() === '') ? 0 : manualTranslation.trim().split(/\s+/).length;
  const selectedTranslator = translatorOptions.find(opt => opt.value === translator);

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

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Editor de Traducción</CardTitle>
        <CardDescription>Edita el texto del OCR, traduce y organiza tu trabajo.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 flex-1 pt-2">
        <div className="grid md:grid-cols-1 gap-6">
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
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-start gap-4 border-t pt-6">
        <div className="flex items-center gap-2 flex-wrap">
            <Label htmlFor="translator-select" className="shrink-0">Traducir con:</Label>
             <Select value={translator} onValueChange={onTranslatorChange} disabled={isAiTranslating}>
                <SelectTrigger id="translator-select" className="w-auto min-w-[150px]">
                    <div className="flex items-center gap-2">
                        {selectedTranslator?.icon}
                        <SelectValue asChild>
                           <span>{selectedTranslator?.label}</span>
                        </SelectValue>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {translatorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                                {option.icon}
                                <span>{option.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Label htmlFor="target-lang-select" className="shrink-0 ml-2">a:</Label>
            <Select value={targetLanguage} onValueChange={onTargetLanguageChange} disabled={isAiTranslating}>
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
            <Button onClick={onTranslate} disabled={isAiTranslating} className="w-full sm:w-auto">
                 {isAiTranslating ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traduciendo...
                    </>
                ) : (
                    <>
                    <Languages className="mr-2 h-4 w-4" />
                    Traducir con IA
                    </>
                )}
            </Button>
        </div>
    </CardFooter>
    </Card>
  )
}
