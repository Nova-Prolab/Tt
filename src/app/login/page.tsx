"use client";

import { useFormStatus } from 'react-dom';
import { login } from '@/app/login/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookMarked, Loader2 } from 'lucide-react';
import { useEffect, useActionState, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Iniciar Sesión
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, undefined);
    const { toast } = useToast();
    const [shaking, setShaking] = useState<string | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, name: 'username' | 'password') => {
        if (e.key === 'Backspace' && e.currentTarget.value) {
            setShaking(name);
            setTimeout(() => setShaking(null), 600);
        }
    };

    useEffect(() => {
        if (state?.error) {
            toast({
                title: 'Error de Autenticación',
                description: state.error,
                variant: 'destructive',
            });
        }
    }, [state, toast]);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[10%] left-[10%] h-32 w-32 rounded-full bg-primary/10 animate-float [animation-delay:-2s]"></div>
                <div className="absolute top-[20%] right-[15%] h-48 w-48 rounded-full bg-secondary/20 animate-float [animation-delay:-4s]"></div>
                <div className="absolute bottom-[15%] left-[25%] h-24 w-24 rounded-full bg-primary/5 animate-float"></div>
                <div className="absolute bottom-[10%] right-[5%] h-16 w-16 rounded-full bg-secondary/10 animate-float [animation-delay:-6s]"></div>
            </div>
            
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-background/50 via-background/30 to-secondary/20 backdrop-blur-sm"></div>

            <Card className="z-20 w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 ease-in-out shadow-2xl bg-card/80 backdrop-blur-md border border-white/10">
                <CardHeader className="text-center p-8">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 transition-transform duration-500 hover:scale-110 hover:rotate-6">
                        <BookMarked className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-3xl">Manhwa Scribe</CardTitle>
                    <CardDescription className="pt-2">Por favor, inicia sesión para continuar</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuario</Label>
                            <Input 
                                id="username" 
                                name="username" 
                                type="text" 
                                placeholder="usuario" 
                                required 
                                onKeyDown={(e) => handleKeyDown(e, 'username')}
                                className={cn(
                                    "transition-all duration-300 focus:shadow-lg focus:scale-[1.02] focus:border-primary bg-background/70",
                                    shaking === 'username' && 'animate-shake'
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder="••••••••" 
                                required 
                                onKeyDown={(e) => handleKeyDown(e, 'password')}
                                className={cn(
                                    "transition-all duration-300 focus:shadow-lg focus:scale-[1.02] focus:border-primary bg-background/70",
                                    shaking === 'password' && 'animate-shake'
                                )}
                            />
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
