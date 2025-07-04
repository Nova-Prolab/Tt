"use client"

import React, { useState, useRef } from "react"
import ReactCrop, {
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { UploadCloud, ScanText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type ImagePanelProps = {
  imageSrc: string | null;
  isOcrLoading: boolean;
  onImageUpload: (file: File) => void;
  onOcr: (croppedImageDataUrl: string) => void;
};

export function ImagePanel({ imageSrc, isOcrLoading, onImageUpload, onOcr }: ImagePanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

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

    // Solución definitiva: Usar getBoundingClientRect para obtener las dimensiones renderizadas precisas,
    // lo cual es más fiable que .width/.height para imágenes escaladas en diseños complejos.
    const { width: renderedWidth, height: renderedHeight } = image.getBoundingClientRect();
    const { naturalWidth, naturalHeight } = image;
    
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
    
    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    const croppedImageDataUrl = canvas.toDataURL('image/png', 1.0);
    onOcr(croppedImageDataUrl);
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Panel del Manhwa</CardTitle>
      </CardHeader>
      <CardContent className={cn(
        "flex-1 flex justify-center rounded-lg border min-h-[400px] transition-colors",
        imageSrc
          ? "overflow-y-auto bg-card p-0"
          : "items-center border-dashed bg-muted/30"
        )}>
        {imageSrc ? (
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
        <Button onClick={handleExtractText} disabled={!completedCrop || !imageSrc || isOcrLoading}>
          {isOcrLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ScanText className="mr-2 h-4 w-4" />
          )}
          Extraer Texto de Selección
        </Button>
      </CardFooter>
    </Card>
  );
}
