"use client"

import React, { useState, useRef, useEffect } from "react"
import ReactCrop, {
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { UploadCloud, ScanText, Loader2, Sparkles, Scissors, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type ImagePanelProps = {
  imageSrc: string | null;
  isOcrLoading: boolean;
  onImageUpload: (file: File) => void;
  onOcr: (croppedImageDataUrl: string, isSfx: boolean) => void;
};

// Helper function to perform the crop on a canvas
function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2d context');
    return null;
  }

  // This is the robust scaling logic.
  // It calculates a single, reliable scale based on the rendered width,
  // which is correct. Since aspect ratio is preserved, this scale works for both axes.
  const scale = image.naturalWidth / image.width;
  
  const sourceX = crop.x * scale;
  const sourceY = crop.y * scale;
  const sourceWidth = crop.width * scale;
  const sourceHeight = crop.height * scale;

  canvas.width = Math.floor(sourceWidth);
  canvas.height = Math.floor(sourceHeight);

  ctx.drawImage(
    image,
    Math.floor(sourceX),
    Math.floor(sourceY),
    Math.floor(sourceWidth),
    Math.floor(sourceHeight),
    0,
    0,
    canvas.width,
    canvas.height
  );
  
  return canvas.toDataURL('image/png', 1.0);
}


export function ImagePanel({ imageSrc, isOcrLoading, onImageUpload, onOcr }: ImagePanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [currentChunkSrc, setCurrentChunkSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isSfx, setIsSfx] = useState(false);
  const [croppedImageForOcr, setCroppedImageForOcr] = useState<string | null>(null);

  // When a new image is uploaded (imageSrc prop changes), reset the chunking state.
  useEffect(() => {
    setCurrentChunkSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [imageSrc]);
  
  useEffect(() => {
    if (!isOcrLoading && croppedImageForOcr) {
        setCroppedImageForOcr(null);
    }
  }, [isOcrLoading, croppedImageForOcr]);

  const displayedImageSrc = currentChunkSrc || imageSrc;
  const inChunkingMode = !!currentChunkSrc;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleCropSection = () => {
    const image = imgRef.current;
    if (!image || !completedCrop || !completedCrop.width || !completedCrop.height) {
      toast({
        title: "Error de Recorte",
        description: "Por favor, selecciona un área de la imagen completa para continuar.",
        variant: "destructive",
      });
      return;
    }
    const croppedChunk = getCroppedImg(image, completedCrop);
    if (croppedChunk) {
        setCurrentChunkSrc(croppedChunk);
        setCrop(undefined);
        setCompletedCrop(undefined);
    } else {
        toast({
            title: "Error al Recortar",
            description: "No se pudo procesar la sección de la imagen.",
            variant: "destructive",
        });
    }
  };

  const handleBackToFullImage = () => {
    setCurrentChunkSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };


  const handleExtractText = () => {
    const image = imgRef.current;
    if (!image || !completedCrop || !completedCrop.width || !completedCrop.height) {
      toast({
        title: "Error de Recorte",
        description: "Asegúrate de que la imagen se ha cargado y has seleccionado un área para recortar.",
        variant: "destructive",
      });
      return;
    }
    
    const croppedImageDataUrl = getCroppedImg(image, completedCrop);
    
    if (croppedImageDataUrl) {
      setCroppedImageForOcr(croppedImageDataUrl);
      onOcr(croppedImageDataUrl, isSfx);

      setIsSfx(false);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } else {
        toast({
            title: "Error al Extraer",
            description: "No se pudo procesar el recorte para OCR.",
            variant: "destructive",
        });
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Panel del Manhwa</CardTitle>
        { !inChunkingMode && imageSrc && <CardDescription>Para imágenes muy grandes, selecciona una sección y haz clic en "Recortar Sección".</CardDescription> }
        { inChunkingMode && <CardDescription>Ahora selecciona el texto dentro de esta sección para hacer el OCR.</CardDescription> }
      </CardHeader>
      <CardContent className={cn(
        "relative flex-1 flex justify-center rounded-lg border min-h-[400px] transition-colors",
        (displayedImageSrc && !croppedImageForOcr)
          ? "overflow-y-auto bg-card p-0"
          : "items-center border-dashed bg-muted/30"
        )}>
        {croppedImageForOcr ? (
            <div className="flex justify-center items-center w-full h-full p-4">
                 <img
                    src={croppedImageForOcr}
                    alt="Recorte para OCR"
                    className="max-w-full max-h-full object-contain"
                />
                {isOcrLoading && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 font-semibold">Extrayendo texto del recorte...</p>
                        <p className="text-sm text-muted-foreground">Este proceso volverá a la sección de la imagen al terminar.</p>
                    </div>
                )}
            </div>
        ) : displayedImageSrc ? (
          <>
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined}
            >
              <img
                ref={imgRef}
                alt="Panel del Manhwa para recortar"
                src={displayedImageSrc}
                className="w-full h-auto"
                data-ai-hint="manhwa page"
              />
            </ReactCrop>
            {inChunkingMode && completedCrop?.width && completedCrop?.height && !isOcrLoading && (
              <div
                className="absolute z-10 flex items-center gap-2 animate-in fade-in"
                style={{
                  top: `${completedCrop.y + completedCrop.height + 8}px`,
                  left: `${completedCrop.x + completedCrop.width / 2}px`,
                  transform: 'translateX(-50%)',
                }}
              >
                <Button
                    onClick={() => setIsSfx(!isSfx)}
                    variant={isSfx ? "default" : "secondary"}
                    size="icon"
                    title="Marcar como Onomatopeya (SFX)"
                >
                    <Sparkles className="h-4 w-4" />
                    <span className="sr-only">Marcar como SFX</span>
                </Button>
                <Button
                    onClick={handleExtractText}
                    disabled={isOcrLoading}
                >
                    <ScanText className="mr-2 h-4 w-4" />
                    Extraer Texto
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground p-8 flex flex-col items-center">
            <UploadCloud className="mx-auto h-12 w-12" />
            <p className="mt-4 font-bold text-lg">Sube una imagen</p>
            <p className="mt-1 text-sm">Arrastra y suelta o haz clic para seleccionar un archivo.</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-6">
        <div>
           {inChunkingMode && (
                <Button variant="outline" onClick={handleBackToFullImage}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Imagen Completa
                </Button>
            )}
        </div>
        <div className="flex justify-end gap-2">
            {!inChunkingMode && completedCrop?.width && completedCrop.height ? (
                 <Button onClick={handleCropSection}>
                    <Scissors className="mr-2 h-4 w-4" /> Recortar Sección para OCR
                 </Button>
            ) : null }
            <Button variant="outline" onClick={handleUploadClick}>
            <UploadCloud className="mr-2 h-4 w-4" /> Subir Imagen
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
