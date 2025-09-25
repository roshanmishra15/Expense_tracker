import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChartLine } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const demoCredentials = {
    admin: { email: 'admin@demo.com', password: 'admin123' },
    user: { email: 'user@demo.com', password: 'user123' },
    'read-only': { email: 'readonly@demo.com', password: 'readonly123' }
  };

  const handleDemoLogin = (role: keyof typeof demoCredentials) => {
    const credentials = demoCredentials[role];
    setValue('email', credentials.email);
    setValue('password', credentials.password);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Success",
        description: "Logged in successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" data-testid="login-page">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
            <ChartLine className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">FinanceTracker</CardTitle>
          <CardDescription>Manage your finances with ease</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                data-testid="input-email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive" data-testid="error-email">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                data-testid="input-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive" data-testid="error-password">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Quick Demo Access:
            </p>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full text-sm" 
                onClick={() => handleDemoLogin('admin')}
                data-testid="button-demo-admin"
              >
                Admin Demo
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-sm" 
                onClick={() => handleDemoLogin('user')}
                data-testid="button-demo-user"
              >
                User Demo
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-sm" 
                onClick={() => handleDemoLogin('read-only')}
                data-testid="button-demo-readonly"
              >
                Read-only Demo
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-md">
            <h3 className="text-sm font-medium text-foreground mb-2">Demo Credentials:</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>Admin:</strong> admin@demo.com / admin123</div>
              <div><strong>User:</strong> user@demo.com / user123</div>
              <div><strong>Read-only:</strong> readonly@demo.com / readonly123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
