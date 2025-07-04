'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (
    username === process.env.APP_USER &&
    password === process.env.APP_PASSWORD
  ) {
    cookies().set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
    });
    redirect('/');
  } else {
    return { error: 'Usuario o contraseña incorrectos.' };
  }
}

export async function logout() {
    cookies().set('auth', '', { expires: new Date(0) });
    redirect('/login');
}
