"use client";

import { useFormStatus } from 'react-dom';
import { login } from '@/app/login/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookMarked, Loader2 } from 'lucide-react';
import { useEffect, useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/40 p-4">
            <Card className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 ease-in-out shadow-2xl">
                <CardHeader className="text-center p-8">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-transform duration-500 hover:scale-110">
                        <BookMarked className="h-10 w-10 text-primary" />
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
                                className="transition-shadow duration-300 focus:shadow-md"
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
                                className="transition-shadow duration-300 focus:shadow-md"
                            />
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
