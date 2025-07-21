
"use client";

import { useState, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { Header } from "@/components/header";
import { ImagePanel } from "@/components/image-panel";
import { TranslationEditor } from "@/components/translation-editor";
import { AiAssist } from "@/components/ai-assist";
import {
  provideContextualUnderstanding,
  type ProvideContextualUnderstandingOutput,
} from "@/ai/flows/provide-contextual-understanding";
import {
  suggestTranslationImprovements,
  type SuggestTranslationImprovementsOutput,
} from "@/ai/flows/suggest-translation-improvements";
import {
  explainPhraseContext,
  type ExplainPhraseContextOutput,
} from "@/ai/flows/explain-phrase-context";
import {
  translateText,
} from "@/ai/flows/translate-text";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromImage } from "@/ai/flows/extract-text-from-image";
import { correctSpelling } from "@/ai/flows/correct-spelling";
import { analyzeTone, type AnalyzeToneOutput } from "@/ai/flows/analyze-tone";
import { translateSfx, type TranslateSfxOutput } from "@/ai/flows/translate-sfx";
import { generateAlternativeTranslations, type GenerateAlternativeTranslationsOutput } from "@/ai/flows/generate-alternative-translations";
import { analyzeFormality, type AnalyzeFormalityOutput } from "@/ai/flows/analyze-formality";
import { analyzeTranslationQuality, type AnalyzeTranslationQualityOutput } from "@/ai/flows/analyze-translation-quality";
import { summarizePanel, type SummarizePanelOutput } from "@/ai/flows/summarize-panel";
import { identifySpeakers, type IdentifySpeakersOutput } from "@/ai/flows/identify-speakers";
import { rephraseText, type RephraseTextOutput } from "@/ai/flows/rephrase-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

type Project = {
  id: string;
  name: string;
  imageSrc: string | null;
  originalText: string;
  manualTranslation: string;
  translationHistory: string[];
  currentHistoryIndex: number;
  aiTranslation: string;
  selectedText: string;
  aiSuggestion: SuggestTranslationImprovementsOutput | null;
  aiContext: ProvideContextualUnderstandingOutput | null;
  aiExplanation: ExplainPhraseContextOutput | null;
  aiTone: AnalyzeToneOutput | null;
  aiSfx: TranslateSfxOutput | null;
  aiAlternatives: GenerateAlternativeTranslationsOutput | null;
  aiFormality: AnalyzeFormalityOutput | null;
  aiQuality: AnalyzeTranslationQualityOutput | null;
  aiSummary: SummarizePanelOutput | null;
  aiSpeakers: IdentifySpeakersOutput | null;
  aiRephrasing: RephraseTextOutput | null;
};

const createNewProject = (name: string): Project => ({
  id: Date.now().toString(),
  name,
  imageSrc: null,
  originalText: "",
  manualTranslation: "",
  translationHistory: [""],
  currentHistoryIndex: 0,
  aiTranslation: "",
  selectedText: "",
  aiSuggestion: null,
  aiContext: null,
  aiExplanation: null,
  aiTone: null,
  aiSfx: null,
  aiAlternatives: null,
  aiFormality: null,
  aiQuality: null,
  aiSummary: null,
  aiSpeakers: null,
  aiRephrasing: null,
});

export default function MainApp() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [translator, setTranslator] = useState("gemini");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [isLoading, setIsLoading] = useState<
    "suggestion" | "context" | "explanation" | "translation" | "ocr" | "spelling" | "tone" | "sfx" | "alternatives" | "formality" | "quality" | "summary" | "speakers" | "rephrasing" | null
  >(null);

  const { toast } = useToast();
  
  // Load projects from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('manhwaScribe-state');
      if (savedState) {
        const { projects: savedProjects, activeProjectId: savedActiveId } = JSON.parse(savedState);
        if (savedProjects && savedProjects.length > 0) {
          setProjects(savedProjects);
          setActiveProjectId(savedActiveId || savedProjects[0].id);
        } else {
          // If no projects, create a default one
          handleNewProject();
        }
      } else {
        handleNewProject();
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
      handleNewProject();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state to localStorage whenever projects or active project changes
  useEffect(() => {
    if (projects.length > 0 && activeProjectId) {
      try {
        const stateToSave = JSON.stringify({ projects, activeProjectId });
        localStorage.setItem('manhwaScribe-state', stateToSave);
      } catch (error) {
        console.error("Failed to save state to localStorage", error);
      }
    }
  }, [projects, activeProjectId]);

  const updateActiveProject = (updater: (project: Project) => Partial<Project>) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === activeProjectId ? { ...p, ...updater(p) } : p
      )
    );
  };
  
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const clearAiOutputs = () => {
    updateActiveProject(() => ({
      aiSuggestion: null,
      aiContext: null,
      aiExplanation: null,
      aiTone: null,
      aiSfx: null,
      aiAlternatives: null,
      aiFormality: null,
      aiQuality: null,
      aiSummary: null,
      aiSpeakers: null,
      aiRephrasing: null,
    }));
  };
  
  // --- Project Management Handlers ---

  const handleNewProject = () => {
    const newProject = createNewProject(`Lienzo ${projects.length + 1}`);
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const handleSwitchProject = (id: string) => {
    setActiveProjectId(id);
  };

  const handleRenameProject = () => {
    const currentName = activeProject?.name || "";
    const newName = prompt("Introduce el nuevo nombre para este lienzo:", currentName);
    if (newName && newName.trim() !== "") {
      updateActiveProject(() => ({ name: newName.trim() }));
    }
  };

  const handleDeleteProject = () => {
    if (projects.length <= 1) {
      toast({ title: "Acción no permitida", description: "No puedes eliminar el único lienzo.", variant: "destructive"});
      return;
    }
    if (!activeProject) return;
    const confirmation = confirm(`¿Estás seguro de que quieres eliminar "${activeProject.name}"? Esta acción no se puede deshacer.`);
    if (confirmation) {
      const newProjects = projects.filter(p => p.id !== activeProjectId);
      setProjects(newProjects);
      setActiveProjectId(newProjects[0].id);
      toast({ title: "Lienzo Eliminado", description: `Se ha eliminado "${activeProject.name}".`});
    }
  };


  // --- State setters that update the active project ---
  
  const setManualTranslation = (text: string, newHistoryEntry = true) => {
    updateActiveProject(p => {
      if (newHistoryEntry) {
        const newHistory = p.translationHistory.slice(0, p.currentHistoryIndex + 1);
        newHistory.push(text);
        return { 
          manualTranslation: text,
          translationHistory: newHistory,
          currentHistoryIndex: newHistory.length - 1,
        };
      }
      return { manualTranslation: text };
    });
  };

  const handleUndo = () => {
    if (!activeProject || activeProject.currentHistoryIndex <= 0) return;
    const newIndex = activeProject.currentHistoryIndex - 1;
    updateActiveProject(() => ({
      currentHistoryIndex: newIndex,
      manualTranslation: activeProject.translationHistory[newIndex],
    }));
  };
  
  const handleRedo = () => {
    if (!activeProject || activeProject.currentHistoryIndex >= activeProject.translationHistory.length - 1) return;
    const newIndex = activeProject.currentHistoryIndex + 1;
    updateActiveProject(() => ({
      currentHistoryIndex: newIndex,
      manualTranslation: activeProject.translationHistory[newIndex],
    }));
  };
  
  const canUndo = activeProject ? activeProject.currentHistoryIndex > 0 : false;
  const canRedo = activeProject ? activeProject.currentHistoryIndex < activeProject.translationHistory.length - 1 : false;
  
  const handleOriginalTextChange = (text: string) => {
    updateActiveProject(() => ({ originalText: text, selectedText: "", aiTranslation: "" }));
    clearAiOutputs();
  };
  
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateActiveProject(() => ({ imageSrc: e.target?.result as string, originalText: "", manualTranslation: "", aiTranslation: ""}));
      clearAiOutputs();
    };
    reader.readAsDataURL(file);
  };
  
  const handleClearAll = () => {
    if (!activeProject) return;
    const confirmation = confirm(`¿Estás seguro de que quieres limpiar completamente el lienzo "${activeProject.name}"?`);
    if (confirmation) {
      const newProject = createNewProject(activeProject!.name);
      setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...newProject, id: p.id } : p));
      toast({
          title: "Lienzo Limpio",
          description: "Se ha borrado toda la sesión de traducción actual.",
      });
    }
  };

  const handleOcr = async (croppedImageDataUrl: string, isSfx: boolean) => {
    if (!activeProject?.imageSrc) {
      toast({ title: "No hay Imagen", description: "Por favor, sube una imagen primero.", variant: "destructive" });
      return;
    }
    setIsLoading("ocr");
    try {
      const result = await extractTextFromImage({ imageDataUri: croppedImageDataUrl });
      let textToAppend = result.extractedText;
      if (isSfx) {
        textToAppend = `* ${textToAppend}`;
      }
      updateActiveProject(p => ({
        originalText: p.originalText.trim() ? `${p.originalText}\n\n${textToAppend}` : textToAppend
      }));
      toast({ title: "OCR Completado", description: "Texto extraído de la selección y añadido al editor." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error de OCR", description: "No se pudo extraer el texto de la imagen.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleAiTranslate = async () => {
    if (!activeProject?.originalText) {
      toast({ title: "Falta el Texto Original", description: "Por favor, proporciona el texto original para traducir.", variant: "destructive" });
      return;
    }
    setIsLoading("translation");
    updateActiveProject(() => ({ aiTranslation: "" }));
    clearAiOutputs();
    try {
      const result = await translateText({
        text: activeProject.originalText,
        targetLanguage,
        sourceLanguage: "Korean",
        translator,
      });
      updateActiveProject(() => ({ aiTranslation: result.translation }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo obtener la traducción de la IA.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleSuggestImprovement = async () => {
    if (!activeProject?.originalText || !activeProject?.manualTranslation) {
      toast({ title: "Falta Texto", description: "Por favor, proporciona tanto el texto original como tu traducción.", variant: "destructive" });
      return;
    }
    setIsLoading("suggestion");
    clearAiOutputs();
    try {
      const result = await suggestTranslationImprovements({
        originalText: activeProject.originalText,
        translatedText: activeProject.manualTranslation,
        context: "Una conversación amistosa entre dos personajes en un entorno moderno.",
      });
      updateActiveProject(() => ({ aiSuggestion: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo obtener la sugerencia.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleGetContext = async () => {
    if (!activeProject?.originalText) {
      toast({ title: "Falta Texto", description: "Por favor, proporciona el texto original.", variant: "destructive" });
      return;
    }
    setIsLoading("context");
    clearAiOutputs();
    try {
      const result = await provideContextualUnderstanding({
        text: activeProject.originalText,
        image: activeProject.imageSrc || undefined,
      });
      updateActiveProject(() => ({ aiContext: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo obtener el contexto.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleExplainPhrase = async () => {
    if (!activeProject) return;
    const textToExplain = activeProject.selectedText || activeProject.originalText;
    if (!textToExplain) {
      toast({ title: "No hay Texto para Explicar", description: "Por favor, añade texto original o selecciona una frase para obtener una explicación.", variant: "destructive" });
      return;
    }
    setIsLoading("explanation");
    clearAiOutputs();
    try {
      const result = await explainPhraseContext({
        phrase: textToExplain,
        context: activeProject.originalText,
        image: activeProject.imageSrc || undefined,
      });
      updateActiveProject(() => ({ aiExplanation: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo obtener la explicación.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleAnalyzeTone = async () => {
    if (!activeProject) return;
    const textToAnalyze = activeProject.selectedText || activeProject.originalText;
    if (!textToAnalyze) {
      toast({ title: "No hay Texto para Analizar", description: "Por favor, añade texto original o selecciona una frase.", variant: "destructive" });
      return;
    }
    setIsLoading("tone");
    clearAiOutputs();
    try {
      const result = await analyzeTone({
        text: textToAnalyze,
        language: targetLanguage,
      });
      updateActiveProject(() => ({ aiTone: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo analizar el tono.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleTranslateSfx = async () => {
    if (!activeProject?.originalText) {
      toast({ title: "No hay Texto Original", description: "Por favor, añade el texto original que contiene los SFX.", variant: "destructive" });
      return;
    }
    setIsLoading("sfx");
    clearAiOutputs();
    try {
      const result = await translateSfx({
        text: activeProject.originalText,
        language: targetLanguage,
      });
      if (result.sfxTranslations.length === 0) {
        toast({ title: "No se encontraron SFX", description: "Asegúrate de que los SFX estén en una línea propia y comiencen con un asterisco (ej. * SFX)." });
      }
      updateActiveProject(() => ({ aiSfx: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo traducir el SFX.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleGenerateAlternatives = async () => {
    if (!activeProject) return;
    const textToTranslate = activeProject.selectedText || activeProject.originalText;
    if (!textToTranslate) {
      toast({ title: "No hay Texto para Traducir", description: "Por favor, añade texto original o selecciona una frase.", variant: "destructive" });
      return;
    }
    setIsLoading("alternatives");
    clearAiOutputs();
    try {
      const result = await generateAlternativeTranslations({
        text: textToTranslate,
        targetLanguage: targetLanguage,
      });
      updateActiveProject(() => ({ aiAlternatives: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudieron generar traducciones alternativas.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleAnalyzeFormality = async () => {
    if (!activeProject) return;
    const textToAnalyze = activeProject.selectedText || activeProject.originalText;
    if (!textToAnalyze) {
      toast({ title: "No hay Texto para Analizar", description: "Por favor, añade texto original o selecciona una frase.", variant: "destructive" });
      return;
    }
    setIsLoading("formality");
    clearAiOutputs();
    try {
      const result = await analyzeFormality({
        text: textToAnalyze,
        language: targetLanguage,
      });
      updateActiveProject(() => ({ aiFormality: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo analizar la formalidad.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleAnalyzeQuality = async () => {
    if (!activeProject?.originalText || !activeProject?.manualTranslation) {
      toast({ title: "Falta Texto", description: "Por favor, proporciona el texto original y tu traducción para analizar la calidad.", variant: "destructive" });
      return;
    }
    setIsLoading("quality");
    clearAiOutputs();
    try {
      const result = await analyzeTranslationQuality({
        originalText: activeProject.originalText,
        translatedText: activeProject.manualTranslation,
        language: targetLanguage,
      });
      updateActiveProject(() => ({ aiQuality: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo analizar la calidad de la traducción.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSummarizePanel = async () => {
    if (!activeProject) return;
    const textToSummarize = activeProject.selectedText || activeProject.originalText;
    if (!textToSummarize) {
      toast({ title: "No hay Texto para Resumir", description: "Por favor, añade texto original o selecciona una frase.", variant: "destructive" });
      return;
    }
    setIsLoading("summary");
    clearAiOutputs();
    try {
      const result = await summarizePanel({
        text: textToSummarize,
        language: targetLanguage,
      });
      updateActiveProject(() => ({ aiSummary: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo generar el resumen.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleIdentifySpeakers = async () => {
    if (!activeProject) return;
    const textToAnalyze = activeProject.selectedText || activeProject.originalText;
    if (!textToAnalyze) {
      toast({ title: "No hay Diálogo para Analizar", description: "Por favor, añade el texto del diálogo.", variant: "destructive" });
      return;
    }
    setIsLoading("speakers");
    clearAiOutputs();
    try {
      const result = await identifySpeakers({
        dialogue: textToAnalyze,
        language: targetLanguage,
      });
      updateActiveProject(() => ({ aiSpeakers: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudieron identificar los interlocutores.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRephraseText = async (style: string) => {
    if (!activeProject) return;
    const textToRephrase = activeProject.selectedText || activeProject.manualTranslation;
    if (!textToRephrase) {
      toast({ title: "No hay Texto para Reformular", description: "Escribe o selecciona una traducción para reformular.", variant: "destructive" });
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
      updateActiveProject(() => ({ aiRephrasing: result }));
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo reformular el texto.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleApplySuggestion = (suggestionText: string) => {
    setManualTranslation(suggestionText);
    toast({ title: "Sugerencia Aplicada", description: "La traducción mejorada se ha copiado al editor manual." });
  };
  
  const handleApplyAlternative = (alternativeText: string) => {
    setManualTranslation(alternativeText);
    toast({ title: "Alternativa Aplicada", description: "La traducción alternativa se ha copiado al editor manual." });
  };
  
  const handleApplyRephrasing = (rephrasedText: string) => {
    setManualTranslation(rephrasedText);
    toast({ title: "Texto Reformulado Aplicado", description: "La nueva versión del texto se ha copiado al editor manual." });
  };

  const handleApplySfx = (sfxText: string) => {
    const formattedSfx = `* ${sfxText}`;
    if (!activeProject) return;
    const newText = activeProject.manualTranslation ? `${activeProject.manualTranslation}\n${formattedSfx}` : formattedSfx;
    setManualTranslation(newText);
    toast({ title: "SFX Aplicado", description: `Se ha añadido "${formattedSfx}" a tu traducción.` });
  };
  
  const handleCorrectSpelling = async () => {
    if (!activeProject?.manualTranslation) {
      toast({ title: "No hay Traducción", description: "Por favor, escribe una traducción para poder corregirla.", variant: "destructive" });
      return;
    }
    setIsLoading("spelling");
    try {
      const result = await correctSpelling({
        text: activeProject.manualTranslation,
        language: targetLanguage,
      });
      setManualTranslation(result.correctedText);
      toast({ title: "Corrección Completa", description: "Se ha corregido la ortografía de tu traducción." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error de IA", description: "No se pudo realizar la corrección ortográfica.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const handleExport = (format: 'txt' | 'srt' | 'docx') => {
    if (!activeProject || (!activeProject.originalText && !activeProject.manualTranslation)) {
      toast({ title: "Nada que Exportar", description: "Por favor, añade algo de texto antes de exportar.", variant: "destructive" });
      return;
    }
    let content = '';
    let mimeType = '';
    let filename = `traduccion_${activeProject.name.replace(/\s/g, '_')}`;

    if (format === 'txt') {
      content = `Original:\n${activeProject.originalText}\n\nTraducido:\n${activeProject.manualTranslation}`;
      mimeType = 'text/plain';
      filename += '.txt';
    } else if (format === 'srt') {
      const lines = activeProject.manualTranslation.split('\n').filter(line => line.trim() !== '');
      content = lines.map((line, index) => `${index + 1}\n00:00:0${index * 2},000 --> 00:00:0${index * 2 + 1},500\n${line}\n`).join('\n');
      mimeType = 'application/x-subrip';
      filename += '.srt';
    } else if (format === 'docx') {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ children: [new TextRun({ text: "Texto Original:", bold: true })] }),
            new Paragraph({ text: activeProject.originalText }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "Traducción:", bold: true })] }),
            new Paragraph({ text: activeProject.manualTranslation }),
          ],
        }],
      });
      Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
      toast({ title: "Exportado", description: `Traducción exportada como ${filename}.docx` });
      return;
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
    toast({ title: "Exportado", description: `Traducción exportada como ${filename}` });
  };
  
  if (!activeProject) {
    return (
      <div className="flex flex-col min-h-screen bg-secondary/30 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Cargando lienzos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header 
        onExport={handleExport}
        projects={projects.map(({ id, name }) => ({ id, name }))}
        activeProjectId={activeProjectId}
        onSwitchProject={handleSwitchProject}
        onNewProject={handleNewProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
      />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <TranslationEditor
            originalText={activeProject.originalText}
            onOriginalTextChange={handleOriginalTextChange}
            onOriginalTextSelect={(text) => updateActiveProject(() => ({ selectedText: text }))}
            manualTranslation={activeProject.manualTranslation}
            onManualTranslationChange={setManualTranslation}
            aiTranslation={activeProject.aiTranslation}
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
            onClearAll={handleClearAll}
          />
          <Tabs defaultValue="image-panel" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image-panel">Panel de Imagen</TabsTrigger>
              <TabsTrigger value="ai-assist">Asistente de IA</TabsTrigger>
            </TabsList>
            <TabsContent value="image-panel">
               <ImagePanel
                imageSrc={activeProject.imageSrc}
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
                isActionDisabled={!activeProject.originalText && !activeProject.selectedText}
                isQualityCheckDisabled={!activeProject.originalText || !activeProject.manualTranslation}
                suggestion={activeProject.aiSuggestion}
                context={activeProject.aiContext}
                explanation={activeProject.aiExplanation}
                tone={activeProject.aiTone}
                sfx={activeProject.aiSfx}
                alternatives={activeProject.aiAlternatives}
                formality={activeProject.aiFormality}
                quality={activeProject.aiQuality}
                summary={activeProject.aiSummary}
                speakers={activeProject.aiSpeakers}
                rephrasing={activeProject.aiRephrasing}
                selectedText={activeProject.selectedText || activeProject.originalText}
                originalText={activeProject.originalText}
                manualTranslation={activeProject.manualTranslation}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

    