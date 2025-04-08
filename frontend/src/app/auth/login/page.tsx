import { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In - FABRIQUÉ',
  description: 'Sign in to your FABRIQUÉ account to access your orders, wishlist, and more.',
};

export default function LoginPage() {
  return (
    <AuthLayout 
      heading="Sign in to your account" 
      subheading="Welcome back! Enter your details to access your account."
      linkText="Don't have an account? Sign up"
      linkHref="/auth/signup"
    >
      <LoginForm />
    </AuthLayout>
  );
}
