
"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedText, setSelectedText] = useState("");
  
  const [aiSuggestion, setAiSuggestion] =
    useState<SuggestTranslationImprovementsOutput | null>(null);
  const [aiContext, setAiContext] =
    useState<ProvideContextualUnderstandingOutput | null>(null);
  const [aiExplanation, setAiExplanation] = 
    useState<ExplainPhraseContextOutput | null>(null);

  const [isAiLoading, setIsAiLoading] = useState<
    "suggestion" | "context" | "explanation" | null
  >(null);

  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setOriginalText(""); // Reset text on new image
      setTranslatedText("");
      setSelectedText("");
      setAiSuggestion(null);
      setAiContext(null);
      setAiExplanation(null);
    };
    reader.readAsDataURL(file);
  };
  
  const handleOriginalTextChange = (text: string) => {
    setOriginalText(text);
    setSelectedText("");
    setAiExplanation(null);
  }

  // Mock OCR
  const handleOcr = () => {
    if (!imageSrc) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }
    setOriginalText(
      "여보세요! 오늘 기분이 어때?\n이 장면은 정말 놀라워."
    );
    setSelectedText("");
    setAiExplanation(null);
    toast({
      title: "OCR Complete",
      description: "Text extracted from image.",
    });
  };

  const handleSuggestImprovement = async () => {
    if (!originalText || !translatedText) {
      toast({
        title: "Missing Text",
        description: "Please provide both original and translated text.",
        variant: "destructive",
      });
      return;
    }
    setIsAiLoading("suggestion");
    setAiSuggestion(null);
    setAiContext(null);
    setAiExplanation(null);
    try {
      const result = await suggestTranslationImprovements({
        originalText,
        translatedText,
        context: "A friendly conversation between two characters in a modern setting.",
      });
      setAiSuggestion(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Error",
        description: "Failed to get suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(null);
    }
  };

  const handleGetContext = async () => {
    if (!originalText) {
      toast({
        title: "Missing Text",
        description: "Please provide the original text.",
        variant: "destructive",
      });
      return;
    }
    setIsAiLoading("context");
    setAiSuggestion(null);
    setAiContext(null);
    setAiExplanation(null);
    try {
      const result = await provideContextualUnderstanding({
        text: originalText,
      });
      setAiContext(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Error",
        description: "Failed to get context.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(null);
    }
  };

  const handleExplainPhrase = async () => {
    if (!selectedText) {
      toast({
        title: "No Text Selected",
        description: "Please select a phrase from the original text to explain.",
        variant: "destructive",
      });
      return;
    }
    setIsAiLoading("explanation");
    setAiSuggestion(null);
    setAiContext(null);
    setAiExplanation(null);
    try {
      const result = await explainPhraseContext({
        phrase: selectedText,
        context: originalText,
      });
      setAiExplanation(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Error",
        description: "Failed to get explanation.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(null);
    }
  };

  const handleExport = (format: 'txt' | 'srt') => {
    let content = '';
    let mimeType = '';
    let filename = '';

    if (!originalText && !translatedText) {
        toast({
            title: "Nothing to Export",
            description: "Please add some text before exporting.",
            variant: "destructive",
        });
        return;
    }

    if (format === 'txt') {
        content = `Original:\n${originalText}\n\nTranslated:\n${translatedText}`;
        mimeType = 'text/plain';
        filename = 'translation.txt';
    } else if (format === 'srt') {
        const lines = translatedText.split('\n').filter(line => line.trim() !== '');
        content = lines.map((line, index) => `${index + 1}\n00:00:0${index * 2},000 --> 00:00:0${index * 2 + 1},500\n${line}\n`).join('\n');
        mimeType = 'application/x-subrip';
        filename = 'translation.srt';
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
        title: "Exported",
        description: `Translation exported as ${filename}`
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onExport={handleExport} />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
          <ImagePanel
            imageSrc={imageSrc}
            onImageUpload={handleImageUpload}
            onOcr={handleOcr}
          />
          <div className="flex flex-col gap-6">
            <TranslationEditor
              originalText={originalText}
              onOriginalTextChange={handleOriginalTextChange}
              onOriginalTextSelect={setSelectedText}
              translatedText={translatedText}
              onTranslatedTextChange={setTranslatedText}
            />
            <AiAssist
              suggestion={aiSuggestion}
              context={aiContext}
              explanation={aiExplanation}
              selectedText={selectedText}
              onSuggestImprovement={handleSuggestImprovement}
              onGetContext={handleGetContext}
              onExplainPhrase={handleExplainPhrase}
              isLoading={isAiLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
