"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { ImagePanel } from "@/components/image-panel";
import { TranslationEditor } from "@/components/translation-editor";
import {
  provideContextualUnderstanding,
  ProvideContextualUnderstandingOutput,
} from "@/ai/flows/provide-contextual-understanding";
import {
  suggestTranslationImprovements,
  SuggestTranslationImprovementsOutput,
} from "@/ai/flows/suggest-translation-improvements";
import {
  explainPhraseContext,
  ExplainPhraseContextOutput,
} from "@/ai/flows/explain-phrase-context";
import {
  translateText,
  TranslateTextOutput,
} from "@/ai/flows/translate-text";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [manualTranslation, setManualTranslation] = useState("");
  const [aiTranslation, setAiTranslation] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [translator, setTranslator] = useState("gemini-flash");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  
  const [aiSuggestion, setAiSuggestion] =
    useState<SuggestTranslationImprovementsOutput | null>(null);
  const [aiContext, setAiContext] =
    useState<ProvideContextualUnderstandingOutput | null>(null);
  const [aiExplanation, setAiExplanation] = 
    useState<ExplainPhraseContextOutput | null>(null);

  const [isLoading, setIsLoading] = useState<
    "suggestion" | "context" | "explanation" | "translation" | null
  >(null);

  const { toast } = useToast();

  const clearAiOutputs = () => {
    setAiSuggestion(null);
    setAiContext(null);
    setAiExplanation(null);
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      // Reset all text fields on new image
      setOriginalText("");
      setManualTranslation("");
      setAiTranslation("");
      setSelectedText("");
      clearAiOutputs();
    };
    reader.readAsDataURL(file);
  };
  
  const handleOriginalTextChange = (text: string) => {
    setOriginalText(text);
    setSelectedText("");
    clearAiOutputs();
    setAiTranslation("");
  }

  // Mock OCR
  const handleOcr = () => {
    if (!imageSrc) {
      toast({
        title: "No hay Imagen",
        description: "Por favor, sube una imagen primero.",
        variant: "destructive",
      });
      return;
    }
    setOriginalText(
      "여보세요! 오늘 기분이 어때?\n이 장면은 정말 놀라워."
    );
    setSelectedText("");
    clearAiOutputs();
    setAiTranslation("");
    toast({
      title: "OCR Completado",
      description: "Texto extraído de la imagen.",
    });
  };

  const handleAiTranslate = async () => {
    if (!originalText) {
      toast({
        title: "Falta el Texto Original",
        description: "Por favor, proporciona el texto original para traducir.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("translation");
    setAiTranslation("");
    clearAiOutputs();
    try {
      const result = await translateText({
        text: originalText,
        targetLanguage: targetLanguage,
        sourceLanguage: "Korean",
        translator: translator,
      });
      setAiTranslation(result.translation);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo obtener la traducción de la IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  }

  const handleSuggestImprovement = async () => {
    if (!originalText || !manualTranslation) {
      toast({
        title: "Falta Texto",
        description: "Por favor, proporciona tanto el texto original como tu traducción.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("suggestion");
    clearAiOutputs();
    try {
      const result = await suggestTranslationImprovements({
        originalText,
        translatedText: manualTranslation,
        context: "Una conversación amistosa entre dos personajes en un entorno moderno.",
      });
      setAiSuggestion(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo obtener la sugerencia.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleGetContext = async () => {
    if (!originalText) {
      toast({
        title: "Falta Texto",
        description: "Por favor, proporciona el texto original.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("context");
    clearAiOutputs();
    try {
      const result = await provideContextualUnderstanding({
        text: originalText,
        image: imageSrc || undefined, // Pass image for better context
      });
      setAiContext(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo obtener el contexto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleExplainPhrase = async () => {
    if (!selectedText) {
      toast({
        title: "Ningún Texto Seleccionado",
        description: "Por favor, selecciona una frase del texto original para explicar.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("explanation");
    clearAiOutputs();
    try {
      const result = await explainPhraseContext({
        phrase: selectedText,
        context: originalText,
        image: imageSrc || undefined, // Pass image for better context
      });
      setAiExplanation(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo obtener la explicación.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleExport = (format: 'txt' | 'srt') => {
    let content = '';
    let mimeType = '';
    let filename = '';

    if (!originalText && !manualTranslation) {
        toast({
            title: "Nada que Exportar",
            description: "Por favor, añade algo de texto antes de exportar.",
            variant: "destructive",
        });
        return;
    }

    if (format === 'txt') {
        content = `Original:\n${originalText}\n\nTraducido:\n${manualTranslation}`;
        mimeType = 'text/plain';
        filename = 'traduccion.txt';
    } else if (format === 'srt') {
        const lines = manualTranslation.split('\n').filter(line => line.trim() !== '');
        content = lines.map((line, index) => `${index + 1}\n00:00:0${index * 2},000 --> 00:00:0${index * 2 + 1},500\n${line}\n`).join('\n');
        mimeType = 'application/x-subrip';
        filename = 'traduccion.srt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
        title: "Exportado",
        description: `Traducción exportada como ${filename}`
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header onExport={handleExport} />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
          <TranslationEditor
            originalText={originalText}
            onOriginalTextChange={handleOriginalTextChange}
            onOriginalTextSelect={setSelectedText}
            manualTranslation={manualTranslation}
            onManualTranslationChange={setManualTranslation}
            aiTranslation={aiTranslation}
            isAiTranslating={isLoading === 'translation'}
            translator={translator}
            onTranslatorChange={setTranslator}
            targetLanguage={targetLanguage}
            onTargetLanguageChange={setTargetLanguage}
            onTranslate={handleAiTranslate}
            onSuggestImprovement={handleSuggestImprovement}
            onGetContext={handleGetContext}
            onExplainPhrase={handleExplainPhrase}
            isLoading={isLoading}
            isExplainPhraseDisabled={!selectedText}
            suggestion={aiSuggestion}
            context={aiContext}
            explanation={aiExplanation}
            selectedText={selectedText}
          />
          <ImagePanel
            imageSrc={imageSrc}
            onImageUpload={handleImageUpload}
            onOcr={handleOcr}
          />
        </div>
      </main>
    </div>
  );
}
