
'use server';
 
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
 
const schema = z.object({
  username: z.string().min(1, { message: 'El usuario es requerido.' }),
  password: z.string().min(1, { message: 'La contraseña es requerida.' }),
});

export type LoginState = {
    error?: string;
    success?: boolean;
};
 
export async function login(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
      return { error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const { username, password } = parsed.data;
  
  const storedUsername = process.env.LOGIN_USERNAME || 'admin';
  const storedPassword = process.env.LOGIN_PASSWORD || 'password';
 
  if (username === storedUsername && password === storedPassword) {
    const session = { isLoggedIn: true };
    cookies().set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
 
  return { error: 'Usuario o contraseña incorrectos.' };
}

export async function logout() {
  cookies().delete('session');
  redirect('/login');
}
