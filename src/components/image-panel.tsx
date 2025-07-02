"use client"

import { UploadCloud, Scissors, ScanText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type ImagePanelProps = {
  imageSrc: string | null;
  onImageUpload: (file: File) => void;
  onOcr: () => void;
};

export function ImagePanel({ imageSrc, onImageUpload, onOcr }: ImagePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };
  
  const handleCrop = () => {
    toast({
      title: "Herramienta de Recorte",
      description: "¡Recorte preciso próximamente!",
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Panel del Manhwa</CardTitle>
        <CardDescription>Sube, recorta y extrae el texto de tu panel.</CardDescription>
      </CardHeader>
      <CardContent className={cn(
        "flex-1 flex items-center justify-center rounded-lg overflow-hidden border aspect-[2/3] min-h-[400px] transition-colors",
        !imageSrc ? "border-dashed bg-muted/30" : "bg-card"
        )}>
        {imageSrc ? (
          <div className="relative w-full h-full">
             <Image
                src={imageSrc}
                alt="Panel del Manhwa"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'contain' }}
                data-ai-hint="manhwa page"
              />
          </div>
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
          <UploadCloud className="mr-2 h-4 w-4" /> Subir
        </Button>
        <Button variant="outline" onClick={handleCrop} disabled={!imageSrc}>
          <Scissors className="mr-2 h-4 w-4" /> Recortar
        </Button>
        <Button onClick={onOcr} disabled={!imageSrc}>
          <ScanText className="mr-2 h-4 w-4" /> Extraer Texto
        </Button>
      </CardFooter>
    </Card>
  );
}
