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

const GeminiIcon = ({ size = 20 }: { size?: number }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      fill="currentColor"
      style={{ width: size, height: size }}
    >
      <path d="M953.6 512c0 244-198.2 441.6-441.6 441.6S70.4 756 70.4 512 268.6 70.4 512 70.4s441.6 197.6 441.6 441.6zM512 134.4c-208.6 0-377.6 169-377.6 377.6s169 377.6 377.6 377.6 377.6-169 377.6-377.6-169-377.6-377.6-377.6z" />
      <path d="M512 277.9c-129.2 0-234.1 104.9-234.1 234.1S382.8 746.1 512 746.1s234.1-104.9 234.1-234.1-104.9-234.1-234.1-234.1zm0 397.7c-90.3 0-163.6-73.4-163.6-163.6s73.4-163.6 163.6-163.6 163.6 73.4 163.6 163.6-73.3 163.6-163.6 163.6z" />
      <path d="M746.1 512c0-129.2-104.9-234.1-234.1-234.1-35.3 0-68.2 7.8-97.4 22.1 22.8 28.5 36.6 64.9 36.6 104.9s-13.8 76.4-36.6 104.9c29.2 14.3 62.1 22.1 97.4 22.1 129.2 0 234.1-104.9 234.1-234.1z" />
    </svg>
);

const DeepSeekIcon = ({ size = 20 }: { size?: number }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      fill="currentColor"
      style={{ width: size, height: size }}
    >
      <path d="M856.3 538.4v304.8c0 23.5-19.1 42.6-42.6 42.6H210.3c-23.5 0-42.6-19.1-42.6-42.6V538.4c0-23.5 19.1-42.6 42.6-42.6h603.4c23.5 0 42.6 19.1 42.6 42.6zM771 176.8c0 46.9-38.1 85-85 85s-85-38.1-85-85 38.1-85 85-85 85 38.1 85 85zm127.9 0c0 46.9-38.1 85-85 85s-85-38.1-85-85 38.1-85 85-85 85 38.1 85 85zM512 304.7c46.9 0 85-38.1 85-85s-38.1-85-85-85-85 38.1-85 85 38.1 85 85 85zm-213.2 0c46.9 0 85-38.1 85-85s-38.1-85-85-85-85 38.1-85 85 38.1 85 85 85zm-213.2 0c46.9 0 85-38.1 85-85s-38.1-85-85-85-85 38.1-85 85 38.1 85 85 85z" />
    </svg>
);


const translatorOptions = [
    { value: 'gemini', label: 'Gemini', icon: <GeminiIcon size={20} /> },
    { value: 'deepseek', label: 'DeepSeek', icon: <DeepSeekIcon size={20} /> }
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
