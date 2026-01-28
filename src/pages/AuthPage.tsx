import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentView, setCurrentView] = useState<'login' | 'forgot' | 'reset'>('login')
  const [resetLoading, setResetLoading] = useState(false)
  const { login, isAuthenticated, resetPassword, updatePassword } = useAuth()
  const navigate = useNavigate()

  // Interactive Logo Particles Component (Embedded for Epsilon)
  function EpsilonLogoParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const isTouchingRef = useRef(false);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load the actual Epsilon logo SVG
      const img = new window.Image();
      img.onload = () => {
        initParticles();
      };
      img.src = '/Epsilologo.svg';

      const updateCanvasSize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };

      updateCanvasSize();

      let particles: {
        x: number;
        y: number;
        baseX: number;
        baseY: number;
        size: number;
        color: string;
        scatteredColor: string;
        life: number;
      }[] = [];

      let textImageData: ImageData | null = null;

      function createTextImage() {
        if (!ctx || !canvas || !img.complete) return 0;

        ctx.fillStyle = 'white';
        ctx.save();
        
        // Center the logo - make it bigger
        const logoSize = Math.min(canvas.width * 0.75, canvas.height * 0.75, 400);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 60; // Move up to make room for text
        
        // Draw the actual Epsilon logo SVG
        ctx.drawImage(
          img,
          centerX - logoSize / 2,
          centerY - logoSize / 2,
          logoSize,
          logoSize
        );

        // Draw the "Epsilon" text below the logo - make it bigger and clearer
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Use white color with slight glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        
        const textY = centerY + logoSize / 2 + 100; // Position below logo
        ctx.strokeText('Epsilon', centerX, textY); // Draw stroke first
        ctx.fillText('Epsilon', centerX, textY); // Then draw fill

        textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        return logoSize / 400; // Return scale factor
      }

      function createParticle(scale: number) {
        if (!ctx || !canvas || !textImageData) return null;

        const data = textImageData.data;

        for (let attempt = 0; attempt < 100; attempt++) {
          const x = Math.floor(Math.random() * canvas.width);
          const y = Math.floor(Math.random() * canvas.height);

          if (data[(y * canvas.width + x) * 4 + 3] > 128) {
            // Determine if this particle is from the logo or text based on position
            const isTextParticle = y > canvas.height / 2 + 120; // Text is positioned lower
            
            return {
              x: x,
              y: y,
              baseX: x,
              baseY: y,
              size: isTextParticle ? Math.random() * 2 + 1.5 : Math.random() * 2.5 + 0.5,
              color: 'white', 
              scatteredColor: isTextParticle ? '#22c55e' : '#22c55e', // Green for both
              life: Math.random() * 120 + 60
            };
          }
        }

        return null;
      }

      function createInitialParticles(scale: number) {
        if (!canvas) return;
        
        const baseParticleCount = 8000; // Increased for better logo + text coverage
        const particleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (800 * 600)));
        for (let i = 0; i < particleCount; i++) {
          const particle = createParticle(scale);
          if (particle) particles.push(particle);
        }
      }

      function initParticles() {
        if (!img.complete) return;
        
        const scale = createTextImage();
        particles = [];
        createInitialParticles(scale);
        animate(scale);
      }

      let animationFrameId: number;

      function animate(scale: number) {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { x: mouseX, y: mouseY } = mousePositionRef.current;
        const maxDistance = 150;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance && (isTouchingRef.current || !('ontouchstart' in window))) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);
            const moveX = Math.cos(angle) * force * 40;
            const moveY = Math.sin(angle) * force * 40;
            p.x = p.baseX - moveX;
            p.y = p.baseY - moveY;
            
            ctx.fillStyle = p.scatteredColor;
          } else {
            p.x += (p.baseX - p.x) * 0.08;
            p.y += (p.baseY - p.y) * 0.08;
            ctx.fillStyle = 'white'; 
          }

          ctx.fillRect(p.x, p.y, p.size, p.size);

          p.life--;
          if (p.life <= 0) {
            const newParticle = createParticle(scale);
            if (newParticle) {
              particles[i] = newParticle;
            } else {
              particles.splice(i, 1);
              i--;
            }
          }
        }

        const baseParticleCount = 8000;
        const targetParticleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (800 * 600)));
        while (particles.length < targetParticleCount) {
          const newParticle = createParticle(scale);
          if (newParticle) particles.push(newParticle);
        }

        animationFrameId = requestAnimationFrame(() => animate(scale));
      }

      const handleResize = () => {
        updateCanvasSize();
        if (img.complete) {
          initParticles();
        }
      };

      const handleMove = (x: number, y: number) => {
        const rect = canvas.getBoundingClientRect();
        mousePositionRef.current = { 
          x: x - rect.left, 
          y: y - rect.top 
        };
      };

      const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          e.preventDefault();
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const handleTouchStart = () => {
        isTouchingRef.current = true;
      };

      const handleTouchEnd = () => {
        isTouchingRef.current = false;
        mousePositionRef.current = { x: 0, y: 0 };
      };

      const handleMouseLeave = () => {
        if (!('ontouchstart' in window)) {
          mousePositionRef.current = { x: 0, y: 0 };
        }
      };

      window.addEventListener('resize', handleResize);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleTouchEnd);
        cancelAnimationFrame(animationFrameId);
      };
    }, []);

    return (
      <div className="relative w-full h-full bg-black flex flex-col items-center justify-center">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full absolute top-0 left-0 touch-none"
          aria-label="Interactive Epsilon logo particle effect"
        />
        {/* Grid pattern overlay - bigger dots */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(34, 197, 94, 0.3) 2px, transparent 2px),
              radial-gradient(circle, rgba(34, 197, 94, 0.3) 2px, transparent 2px)
            `,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        />
      </div>
    );
  }

  // Redirect if already authenticated and check for reset parameters
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
    
    // Check URL parameters for password reset
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    
    if (urlParams.get('reset') === 'true' || hashParams.has('access_token')) {
      setCurrentView('reset')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await login(email, password)
      navigate("/")
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setError("")
    setSuccess("")

    try {
      await resetPassword(email)
      setSuccess("Password reset email sent! Check your inbox.")
      setCurrentView('login')
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to send reset email")
    } finally {
      setResetLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setResetLoading(false)
      return
    }

    try {
      await updatePassword(newPassword)
      setSuccess("Password updated successfully! You can now login with your new password.")
      setCurrentView('login')
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to update password")
    } finally {
      setResetLoading(false)
    }
  }

  if (isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4" style={{
      backgroundImage: `
        radial-gradient(circle at 1px 1px, hsl(var(--foreground)/.1) 1px, transparent 0)
      `,
      backgroundSize: '20px 20px'
    }}>
      {/* Main Login Card */}
      <div className="w-full max-w-4xl bg-card rounded-2xl shadow-2xl overflow-hidden flex min-h-[600px] border border-border" style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Left Panel - Interactive Logo Particles */}
        <div className="w-2/5 bg-black relative hidden md:block">
          <EpsilonLogoParticles />
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-3/5 bg-slate-950 p-8 md:p-12 flex flex-col justify-center relative">
          {/* Sign In Button (Top Right) */}
          <Button
            variant="outline"
            className="absolute top-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground border-primary rounded-full px-6 py-2 text-sm font-medium"
          >
            Sign In
          </Button>

          {/* Main Content */}
          <div className="max-w-md w-full mx-auto relative z-10">
            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-8">
              {currentView === 'login' && 'Sign In'}
              {currentView === 'forgot' && 'Reset Password'}
              {currentView === 'reset' && 'Set New Password'}
            </h1>

            {/* Messages */}
            {error && (
              <Alert className="border-destructive/50 bg-destructive/10 rounded-lg mb-6 shadow-lg">
                <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-500/50 bg-green-500/10 rounded-lg mb-6 shadow-lg">
                <AlertDescription className="text-green-400 text-sm">{success}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {currentView === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="h-12 bg-transparent border-0 border-b border-slate-700 rounded-none px-0 text-white placeholder:text-slate-600 focus:border-primary focus:ring-0 focus:outline-none"
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-12 bg-transparent border-0 border-b border-slate-700 rounded-none px-0 pr-12 text-white placeholder:text-slate-600 focus:border-primary focus:ring-0 focus:outline-none"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      isDisabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                    disabled={loading}
                    onClick={() => setCurrentView('forgot')}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full transition-all duration-200 hover:shadow-lg mt-8"
                  isDisabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "SIGN IN"
                  )}
                </Button>
              </form>
            )}

            {/* Forgot Password Form */}
            {currentView === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="h-12 bg-transparent border-0 border-b border-slate-700 rounded-none px-0 text-white placeholder:text-slate-600 focus:border-primary focus:ring-0 focus:outline-none"
                    disabled={resetLoading}
                  />
                </div>

                {/* Send Reset Email Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full transition-all duration-200 hover:shadow-lg mt-8"
                  isDisabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "SEND RESET EMAIL"
                  )}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                    onClick={() => setCurrentView('login')}
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Set New Password Form */}
            {currentView === 'reset' && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                      className="h-12 bg-transparent border-0 border-b border-slate-700 rounded-none px-0 pr-12 text-white placeholder:text-slate-600 focus:border-primary focus:ring-0 focus:outline-none"
                      disabled={resetLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:text-white"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      isDisabled={resetLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                      className="h-12 bg-transparent border-0 border-b border-slate-700 rounded-none px-0 pr-12 text-white placeholder:text-slate-600 focus:border-primary focus:ring-0 focus:outline-none"
                      disabled={resetLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      isDisabled={resetLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Set Password Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full transition-all duration-200 hover:shadow-lg mt-8"
                  isDisabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting...
                    </>
                  ) : (
                    "SET NEW PASSWORD"
                  )}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                    onClick={() => setCurrentView('login')}
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Footer */}
            <div className="mt-8 flex justify-between items-center">
              <span className="text-sm text-slate-500">I'm already a member</span>
              <Button
                variant="outline"
                className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary rounded-full px-6 py-2 text-sm font-bold"
              >
                SIGN IN
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
