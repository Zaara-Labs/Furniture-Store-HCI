import { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account - FABRIQUÉ',
  description: 'Create a FABRIQUÉ account to shop furniture, save favorites, and check out faster.',
};

export default function SignupPage() {
  return (
    <AuthLayout 
      heading="Create an account" 
      subheading="Join FABRIQUÉ to discover elegant furniture for your home."
      linkText="Already have an account? Sign in"
      linkHref="/auth/login"
    >
      <SignupForm />
    </AuthLayout>
  );
}
