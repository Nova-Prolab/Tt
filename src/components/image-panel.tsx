"use client"

import React, { useState, useRef, useEffect } from "react"
import ReactCrop, {
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { UploadCloud, ScanText, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type ImagePanelProps = {
  imageSrc: string | null;
  isOcrLoading: boolean;
  onImageUpload: (file: File) => void;
  onOcr: (croppedImageDataUrl: string, isSfx: boolean) => void;
};

export function ImagePanel({ imageSrc, isOcrLoading, onImageUpload, onOcr }: ImagePanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isSfx, setIsSfx] = useState(false);
  const [croppedImageForOcr, setCroppedImageForOcr] = useState<string | null>(null);

  useEffect(() => {
    if (!isOcrLoading && croppedImageForOcr) {
        setCroppedImageForOcr(null);
    }
  }, [isOcrLoading, croppedImageForOcr]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setCroppedImageForOcr(null);
    }
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

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        title: "Error del Navegador",
        description: "No se pudo obtener el contexto 2d del canvas.",
        variant: "destructive",
      });
      return;
    }
    
    // The definitive fix for very tall images.
    // We can't trust the browser's reported "rendered height" for tall images in scroll
    // containers. Instead, we calculate a single, reliable scale based on the width,
    // which is constrained by CSS. Since `h-auto` preserves the aspect ratio, this
    // scale is correct for both axes.
    const scale = image.naturalWidth / image.width;
    
    const sourceX = completedCrop.x * scale;
    const sourceY = completedCrop.y * scale;
    const sourceWidth = completedCrop.width * scale;
    const sourceHeight = completedCrop.height * scale;

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
    
    const croppedImageDataUrl = canvas.toDataURL('image/png', 1.0);
    
    setCroppedImageForOcr(croppedImageDataUrl);
    onOcr(croppedImageDataUrl, isSfx);

    setIsSfx(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Panel del Manhwa</CardTitle>
      </CardHeader>
      <CardContent className={cn(
        "relative flex-1 flex justify-center rounded-lg border min-h-[400px] transition-colors",
        (imageSrc && !croppedImageForOcr)
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
                        <p className="text-sm text-muted-foreground">Este proceso volverá a la imagen completa al terminar.</p>
                    </div>
                )}
            </div>
        ) : imageSrc ? (
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
                src={imageSrc}
                className="w-full h-auto"
                data-ai-hint="manhwa page"
              />
            </ReactCrop>
            {completedCrop?.width && completedCrop?.height && !isOcrLoading && (
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
      <CardFooter className="flex justify-end gap-2 pt-6">
        <Button variant="outline" onClick={handleUploadClick}>
          <UploadCloud className="mr-2 h-4 w-4" /> Subir Imagen
        </Button>
      </CardFooter>
    </Card>
  );
}
