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

type ImagePanelProps = {
  imageSrc: string | null;
  isOcrLoading: boolean;
  onImageUpload: (file: File) => void;
  onOcr: (croppedImageDataUrl: string) => void;
};

export function ImagePanel({ imageSrc, isOcrLoading, onImageUpload, onOcr }: ImagePanelProps) {
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
    if (!image || !completedCrop) {
        return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No se pudo obtener el contexto 2d del canvas');
    }

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
    
    const croppedImageDataUrl = canvas.toDataURL('image/jpeg');
    onOcr(croppedImageDataUrl);
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Panel del Manhwa</CardTitle>
        <CardDescription>Sube una imagen y selecciona un área para extraer su texto.</CardDescription>
      </CardHeader>
      <CardContent className={cn(
        "flex-1 flex items-center justify-center rounded-lg overflow-hidden border min-h-[400px] transition-colors",
        !imageSrc ? "border-dashed bg-muted/30" : "bg-card p-0"
        )}>
        {imageSrc ? (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={undefined} // Free crop
            className="flex items-center justify-center"
          >
            <img
              ref={imgRef}
              alt="Panel del Manhwa para recortar"
              src={imageSrc}
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
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
