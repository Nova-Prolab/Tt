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

  const handleExtractText = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop || !completedCrop.width || !completedCrop.height) {
      toast({
        title: "No hay selección",
        description: "Por favor, selecciona un área en la imagen para extraer texto.",
        variant: "destructive",
      });
      return;
    }

    // Se crea un canvas para dibujar la imagen recortada.
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
    
    // La clave está en calcular la escala entre la imagen original (naturalWidth/Height)
    // y la imagen mostrada en pantalla (clientWidth/Height).
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;

    // Se ajusta el tamaño del canvas para que coincida con el tamaño del recorte en la resolución original.
    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    // Se dibuja la porción recortada de la imagen original en el canvas.
    // Las coordenadas del recorte (completedCrop) se multiplican por la escala para
    // encontrar la posición correcta en la imagen de alta resolución.
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
    
    // Se convierte el canvas a un Data URL en formato PNG para preservar la calidad,
    // lo cual es crucial para un buen resultado de OCR.
    const croppedImageDataUrl = canvas.toDataURL('image/png');
    onOcr(croppedImageDataUrl);
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Panel del Manhwa</CardTitle>
        <CardDescription>Sube una imagen grande, explórala con el scroll, selecciona un área y extrae su texto sin pérdida de calidad.</CardDescription>
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
