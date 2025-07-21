
"use client";

import { useState } from "react";
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { Header } from "@/components/header";
import { ImagePanel } from "@/components/image-panel";
import { TranslationEditor } from "@/components/translation-editor";
import { AiAssist } from "@/components/ai-assist";
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
} from "@/ai/flows/translate-text";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromImage } from "@/ai/flows/extract-text-from-image";
import { correctSpelling } from "@/ai/flows/correct-spelling";
import { analyzeTone, AnalyzeToneOutput } from "@/ai/flows/analyze-tone";
import { translateSfx, TranslateSfxOutput } from "@/ai/flows/translate-sfx";
import { generateAlternativeTranslations, GenerateAlternativeTranslationsOutput } from "@/ai/flows/generate-alternative-translations";
import { analyzeFormality, AnalyzeFormalityOutput } from "@/ai/flows/analyze-formality";
import { analyzeTranslationQuality, AnalyzeTranslationQualityOutput } from "@/ai/flows/analyze-translation-quality";
import { summarizePanel, SummarizePanelOutput } from "@/ai/flows/summarize-panel";
import { identifySpeakers, IdentifySpeakersOutput } from "@/ai/flows/identify-speakers";
import { rephraseText, RephraseTextOutput } from "@/ai/flows/rephrase-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MainApp() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  
  // Undo/Redo state for manual translation
  const [manualTranslation, _setManualTranslation] = useState("");
  const [translationHistory, setTranslationHistory] = useState<string[]>([""]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const [aiTranslation, setAiTranslation] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [translator, setTranslator] = useState("gemini");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  
  const [aiSuggestion, setAiSuggestion] =
    useState<SuggestTranslationImprovementsOutput | null>(null);
  const [aiContext, setAiContext] =
    useState<ProvideContextualUnderstandingOutput | null>(null);
  const [aiExplanation, setAiExplanation] = 
    useState<ExplainPhraseContextOutput | null>(null);
  const [aiTone, setAiTone] = useState<AnalyzeToneOutput | null>(null);
  const [aiSfx, setAiSfx] = useState<TranslateSfxOutput | null>(null);
  const [aiAlternatives, setAiAlternatives] = useState<GenerateAlternativeTranslationsOutput | null>(null);
  const [aiFormality, setAiFormality] = useState<AnalyzeFormalityOutput | null>(null);
  const [aiQuality, setAiQuality] = useState<AnalyzeTranslationQualityOutput | null>(null);
  const [aiSummary, setAiSummary] = useState<SummarizePanelOutput | null>(null);
  const [aiSpeakers, setAiSpeakers] = useState<IdentifySpeakersOutput | null>(null);
  const [aiRephrasing, setAiRephrasing] = useState<RephraseTextOutput | null>(null);

  const [isLoading, setIsLoading] = useState<
    "suggestion" | "context" | "explanation" | "translation" | "ocr" | "spelling" | "tone" | "sfx" | "alternatives" | "formality" | "quality" | "summary" | "speakers" | "rephrasing" | null
  >(null);

  const { toast } = useToast();

  const setManualTranslation = (text: string) => {
    // Only add to history if the text is different from the current history entry
    if (translationHistory[currentHistoryIndex] !== text) {
        const newHistory = translationHistory.slice(0, currentHistoryIndex + 1);
        newHistory.push(text);
        setTranslationHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    }
    _setManualTranslation(text);
  };
  
  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      _setManualTranslation(translationHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < translationHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      _setManualTranslation(translationHistory[newIndex]);
    }
  };
  
  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < translationHistory.length - 1;


  const clearAiOutputs = () => {
    setAiSuggestion(null);
    setAiContext(null);
    setAiExplanation(null);
    setAiTone(null);
    setAiSfx(null);
    setAiAlternatives(null);
    setAiFormality(null);
    setAiQuality(null);
    setAiSummary(null);
    setAiSpeakers(null);
    setAiRephrasing(null);
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleOriginalTextChange = (text: string) => {
    setOriginalText(text);
    setSelectedText("");
    clearAiOutputs();
    setAiTranslation("");
  }

  const handleOcr = async (croppedImageDataUrl: string, isSfx: boolean) => {
    if (!imageSrc) {
      toast({
        title: "No hay Imagen",
        description: "Por favor, sube una imagen primero.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("ocr");
    try {
      const result = await extractTextFromImage({ imageDataUri: croppedImageDataUrl });
      let textToAppend = result.extractedText;

      // The correct format for AI detection is "* SFX_TEXT" on its own line.
      if (isSfx) {
        textToAppend = `* ${textToAppend}`;
      }
      
      setOriginalText(prev => (prev.trim() ? prev + "\n\n" + textToAppend : textToAppend));

      toast({
        title: "OCR Completado",
        description: "Texto extraído de la selección y añadido al editor.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de OCR",
        description: "No se pudo extraer el texto de la imagen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
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
        image: imageSrc || undefined,
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
    const textToExplain = selectedText || originalText;
    if (!textToExplain) {
      toast({
        title: "No hay Texto para Explicar",
        description: "Por favor, añade texto original o selecciona una frase para obtener una explicación.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("explanation");
    clearAiOutputs();
    try {
      const result = await explainPhraseContext({
        phrase: textToExplain,
        context: originalText,
        image: imageSrc || undefined,
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

  const handleAnalyzeTone = async () => {
    const textToAnalyze = selectedText || originalText;
    if (!textToAnalyze) {
      toast({
        title: "No hay Texto para Analizar",
        description: "Por favor, añade texto original o selecciona una frase.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("tone");
    clearAiOutputs();
    try {
      const result = await analyzeTone({
        text: textToAnalyze,
        language: targetLanguage,
      });
      setAiTone(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo analizar el tono.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleTranslateSfx = async () => {
    if (!originalText) {
      toast({
        title: "No hay Texto Original",
        description: "Por favor, añade el texto original que contiene los SFX.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("sfx");
    clearAiOutputs();
    try {
      const result = await translateSfx({
        text: originalText,
        language: targetLanguage,
      });
      if (result.sfxTranslations.length === 0) {
        toast({
            title: "No se encontraron SFX",
            description: "Asegúrate de que los SFX estén en una línea propia y comiencen con un asterisco (ej. * SFX).",
        });
      }
      setAiSfx(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo traducir el SFX.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleGenerateAlternatives = async () => {
    const textToTranslate = selectedText || originalText;
    if (!textToTranslate) {
      toast({
        title: "No hay Texto para Traducir",
        description: "Por favor, añade texto original o selecciona una frase.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("alternatives");
    clearAiOutputs();
    try {
      const result = await generateAlternativeTranslations({
        text: textToTranslate,
        targetLanguage: targetLanguage,
      });
      setAiAlternatives(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudieron generar traducciones alternativas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleAnalyzeFormality = async () => {
    const textToAnalyze = selectedText || originalText;
    if (!textToAnalyze) {
      toast({
        title: "No hay Texto para Analizar",
        description: "Por favor, añade texto original o selecciona una frase.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("formality");
    clearAiOutputs();
    try {
      const result = await analyzeFormality({
        text: textToAnalyze,
        language: targetLanguage,
      });
      setAiFormality(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo analizar la formalidad.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleAnalyzeQuality = async () => {
    if (!originalText || !manualTranslation) {
      toast({
        title: "Falta Texto",
        description: "Por favor, proporciona el texto original y tu traducción para analizar la calidad.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("quality");
    clearAiOutputs();
    try {
      const result = await analyzeTranslationQuality({
        originalText,
        translatedText: manualTranslation,
        language: targetLanguage,
      });
      setAiQuality(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo analizar la calidad de la traducción.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSummarizePanel = async () => {
    const textToSummarize = selectedText || originalText;
    if (!textToSummarize) {
      toast({
        title: "No hay Texto para Resumir",
        description: "Por favor, añade texto original o selecciona una frase.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("summary");
    clearAiOutputs();
    try {
      const result = await summarizePanel({
        text: textToSummarize,
        language: targetLanguage,
      });
      setAiSummary(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo generar el resumen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleIdentifySpeakers = async () => {
    const textToAnalyze = selectedText || originalText;
    if (!textToAnalyze) {
      toast({
        title: "No hay Diálogo para Analizar",
        description: "Por favor, añade el texto del diálogo.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("speakers");
    clearAiOutputs();
    try {
      const result = await identifySpeakers({
        dialogue: textToAnalyze,
        language: targetLanguage,
      });
      setAiSpeakers(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudieron identificar los interlocutores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRephraseText = async (style: string) => {
    const textToRephrase = selectedText || manualTranslation;
    if (!textToRephrase) {
      toast({
        title: "No hay Texto para Reformular",
        description: "Escribe o selecciona una traducción para reformular.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("rephrasing");
    clearAiOutputs();
    try {
      const result = await rephraseText({
        text: textToRephrase,
        style: style,
        language: targetLanguage,
      });
      setAiRephrasing(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo reformular el texto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleApplySuggestion = (suggestionText: string) => {
    setManualTranslation(suggestionText);
    toast({
      title: "Sugerencia Aplicada",
      description: "La traducción mejorada se ha copiado al editor manual.",
    });
  };

  const handleApplyAlternative = (alternativeText: string) => {
    setManualTranslation(alternativeText);
    toast({
        title: "Alternativa Aplicada",
        description: "La traducción alternativa se ha copiado al editor manual.",
    });
  };

  const handleApplyRephrasing = (rephrasedText: string) => {
    setManualTranslation(rephrasedText);
    toast({
        title: "Texto Reformulado Aplicado",
        description: "La nueva versión del texto se ha copiado al editor manual.",
    });
  };

  const handleApplySfx = (sfxText: string) => {
    const formattedSfx = `* ${sfxText}`;
    
    // Adds a space if there is existing text.
    const newText = manualTranslation ? `${manualTranslation}\n${formattedSfx}` : formattedSfx;
    setManualTranslation(newText);
    toast({
      title: "SFX Aplicado",
      description: `Se ha añadido "${formattedSfx}" a tu traducción.`,
    });
  };

  const handleCorrectSpelling = async () => {
    if (!manualTranslation) {
      toast({
        title: "No hay Traducción",
        description: "Por favor, escribe una traducción para poder corregirla.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading("spelling");
    try {
      const result = await correctSpelling({
        text: manualTranslation,
        language: targetLanguage,
      });
      setManualTranslation(result.correctedText);
      toast({
        title: "Corrección Completa",
        description: "Se ha corregido la ortografía de tu traducción.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de IA",
        description: "No se pudo realizar la corrección ortográfica.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };


  const handleExport = (format: 'txt' | 'srt' | 'docx') => {
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
    } else if (format === 'docx') {
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "Texto Original:", bold: true })],
                    }),
                    new Paragraph({
                        text: originalText,
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        children: [new TextRun({ text: "Traducción:", bold: true })],
                    }),
                    new Paragraph({
                        text: manualTranslation,
                    }),
                ],
            }],
        });

        Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'traduccion.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        filename = 'traduccion.docx';
    }

    if (format !== 'docx') {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    toast({
        title: "Exportado",
        description: `Traducción exportada como ${filename}`
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header onExport={handleExport} />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          <Tabs defaultValue="image-panel" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image-panel">Panel de Imagen</TabsTrigger>
              <TabsTrigger value="ai-assist">Asistente de IA</TabsTrigger>
            </TabsList>
            <TabsContent value="image-panel">
               <ImagePanel
                imageSrc={imageSrc}
                onImageUpload={handleImageUpload}
                onOcr={handleOcr}
                isOcrLoading={isLoading === 'ocr'}
              />
            </TabsContent>
            <TabsContent value="ai-assist">
                <AiAssist
                onSuggestImprovement={handleSuggestImprovement}
                onGetContext={handleGetContext}
                onExplainPhrase={handleExplainPhrase}
                onCorrectSpelling={handleCorrectSpelling}
                onAnalyzeTone={handleAnalyzeTone}
                onTranslateSfx={handleTranslateSfx}
                onGenerateAlternatives={handleGenerateAlternatives}
                onAnalyzeFormality={handleAnalyzeFormality}
                onAnalyzeQuality={handleAnalyzeQuality}
                onSummarizePanel={handleSummarizePanel}
                onIdentifySpeakers={handleIdentifySpeakers}
                onRephraseText={handleRephraseText}
                onApplySuggestion={handleApplySuggestion}
                onApplySfx={handleApplySfx}
                onApplyAlternative={handleApplyAlternative}
                onApplyRephrasing={handleApplyRephrasing}
                isLoading={isLoading}
                isActionDisabled={!originalText && !selectedText}
                isQualityCheckDisabled={!originalText || !manualTranslation}
                suggestion={aiSuggestion}
                context={aiContext}
                explanation={aiExplanation}
                tone={aiTone}
                sfx={aiSfx}
                alternatives={aiAlternatives}
                formality={aiFormality}
                quality={aiQuality}
                summary={aiSummary}
                speakers={aiSpeakers}
                rephrasing={aiRephrasing}
                selectedText={selectedText || originalText}
                originalText={originalText}
                manualTranslation={manualTranslation}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
