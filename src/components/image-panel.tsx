"use client"

import React, { useState, useRef } from "react"
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
      setCrop(undefined); // Reset crop on new image
      setCompletedCrop(undefined);
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

    // Use the image's rendered dimensions directly to avoid issues with scrolling containers.
    const { naturalWidth, naturalHeight, width: renderedWidth, height: renderedHeight } = image;
    
    if (renderedWidth === 0 || renderedHeight === 0) {
        toast({
            title: "Error de Imagen",
            description: "No se pudieron determinar las dimensiones de la imagen. Inténtalo de nuevo.",
            variant: "destructive",
        });
        return;
    }

    const scaleX = naturalWidth / renderedWidth;
    const scaleY = naturalHeight / renderedHeight;
    
    canvas.width = Math.round(completedCrop.width * scaleX);
    canvas.height = Math.round(completedCrop.height * scaleY);

    ctx.drawImage(
      image,
      Math.round(completedCrop.x * scaleX),
      Math.round(completedCrop.y * scaleY),
      Math.round(completedCrop.width * scaleX),
      Math.round(completedCrop.height * scaleY),
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    const croppedImageDataUrl = canvas.toDataURL('image/png', 1.0);
    onOcr(croppedImageDataUrl, isSfx);

    // Reset state for next extraction
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
        imageSrc
          ? "overflow-y-auto bg-card p-0"
          : "items-center border-dashed bg-muted/30"
        )}>
        {imageSrc ? (
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
            {completedCrop?.width && completedCrop?.height && (
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
                    {isOcrLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <ScanText className="mr-2 h-4 w-4" />
                    )}
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
