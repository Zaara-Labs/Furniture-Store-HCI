'use server'

import { ID } from 'appwrite';
import { account } from '@/lib/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Authentication server actions
export async function createAccount(formData: {
  email: string;
  password: string;
  name: string;
}) {
  try {
    const { email, password, name } = formData;

    // Create the account
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    if (newAccount) {
      // Login immediately after successful signup
      await login({ email, password });
      return { success: true };
    } else {
      return {
        error: 'Failed to create account',
        success: false
      };
    }
  } catch (error: any) {
    console.error("Server action :: createAccount :: error", error);
    return {
      error: error.message || 'An error occurred during signup',
      success: false
    };
  }
}

export async function login(formData: { email: string; password: string }) {
  try {
    const { email, password } = formData;

    // Create email session
    const session = await account.createEmailPasswordSession(email, password);

    // Store session ID in an HTTP-only cookie
    const cookieStore = cookies();
    (await cookieStore).set('appwrite-session', session.$id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    return { success: true };
  } catch (error: any) {
    console.error("Server action :: login :: error", error);
    return {
      error: error.message || 'Invalid credentials',
      success: false
    };
  }
}

export async function logout() {
  try {
    // Delete the current session
    await account.deleteSession('current');

    // Clear the session cookie
    const cookieStore = cookies();
    (await cookieStore).delete('appwrite-session');

    return { success: true };
  } catch (error: any) {
    console.error("Server action :: logout :: error", error);
    return {
      error: error.message || 'Failed to logout',
      success: false
    };
  }
}

export async function getCurrentUser() {
  try {
    const user = await account.get();
    return { user, success: true };
  } catch (error) {
    return { user: null, success: false };
  }
}

// Function to check if the user is authenticated (for middleware and protected routes)
export async function isAuthenticated() {
  try {
    const user = await account.get();
    return !!user;
  } catch (error) {
    return false;
  }
}
