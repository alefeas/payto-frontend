"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { FormFooterLink } from "@/components/ui/form-footer-link";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { formatPhone } from "@/lib/input-formatters";
import { Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    country: 'Argentina',
    province: '',
    city: '',
    postalCode: '',
    street: '',
    streetNumber: '',
    floor: '',
    apartment: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const totalSteps = 3;

  const provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName) {
        toast.error('El nombre es obligatorio');
        return;
      }
      if (!formData.lastName) {
        toast.error('El apellido es obligatorio');
        return;
      }
      if (!formData.email) {
        toast.error('El email es obligatorio');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Por favor ingresa un email válido');
        return;
      }
    }

    if (step === 2) {
      if (!formData.password) {
        toast.error('La contraseña es obligatoria');
        return;
      }
      if (formData.password.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      if (!/[A-Z]/.test(formData.password)) {
        toast.error('La contraseña debe contener al menos una mayúscula');
        return;
      }
      if (!/[a-z]/.test(formData.password)) {
        toast.error('La contraseña debe contener al menos una minúscula');
        return;
      }
      if (!/[0-9]/.test(formData.password)) {
        toast.error('La contraseña debe contener al menos un número');
        return;
      }
      if (!/[@$!%*#?&]/.test(formData.password)) {
        toast.error('La contraseña debe contener al menos un carácter especial (@$!%*#?&)');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const genderMap: Record<string, string> = {
      'masculino': 'male',
      'femenino': 'female',
      'otro': 'other',
      'prefiero_no_decir': 'prefer_not_to_say'
    };

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || undefined,
        date_of_birth: formData.dateOfBirth || undefined,
        gender: formData.gender ? genderMap[formData.gender] : undefined,
        country: formData.country || undefined,
        province: formData.province || undefined,
        city: formData.city || undefined,
        postal_code: formData.postalCode || undefined,
        street: formData.street || undefined,
        street_number: formData.streetNumber || undefined,
        floor: formData.floor || undefined,
        apartment: formData.apartment || undefined,
      });

      sessionStorage.setItem('pendingEmail', formData.email);
      toast.success('Código enviado a tu email');
      router.push(`/verify-account?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        const firstError = Object.values(backendErrors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(error.response?.data?.message || "Error al registrarse");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.info("Próximamente: Registro con Google");
  };

  return (
    <div className="w-full space-y-8">
      {/* Logo */}
      <div className="text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/brand/payto.png"
            alt="Payto Logo"
            width={160}
            height={160}
            className="object-contain hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              s === step ? 'bg-blue-600 text-white' :
              s < step ? 'bg-blue-100 text-blue-600' :
              'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 transition-colors ${
              s < step ? 'bg-blue-600' : 'bg-gray-200'
            }`} />}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg md:text-xl font-medium">
          {step === 1 && 'Información Personal'}
          {step === 2 && 'Seguridad'}
          {step === 3 && 'Información Adicional (Opcional)'}
        </h2>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <form className="space-y-6" onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {/* Step 1: Información Personal */}
          {step === 1 && (
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="11 1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                  maxLength={15}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <DatePicker
                  date={formData.dateOfBirth ? new Date(formData.dateOfBirth + 'T00:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      setFormData({...formData, dateOfBirth: `${year}-${month}-${day}`})
                    } else {
                      setFormData({...formData, dateOfBirth: ''})
                    }
                  }}
                  placeholder="Seleccionar fecha"
                  maxDate={new Date()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                    <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>
          )}

          {/* Step 2: Seguridad */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="h-12 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Mínimo 8 caracteres, incluye mayúscula, minúscula, número y carácter especial (@$!%*#?&)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="h-12 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dirección */}
          {step === 3 && (
            <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country}
                  readOnly
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="La Plata"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Calle</Label>
                <Input
                  id="street"
                  placeholder="Av. Corrientes"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="streetNumber">Número</Label>
                <Input
                  id="streetNumber"
                  placeholder="1234"
                  value={formData.streetNumber}
                  onChange={(e) => setFormData({...formData, streetNumber: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  placeholder="1414"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Piso</Label>
                <Input
                  id="floor"
                  placeholder="Opcional"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apartment">Departamento</Label>
                <Input
                  id="apartment"
                  placeholder="Opcional"
                  value={formData.apartment}
                  onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
            </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 text-base"
                disabled={isLoading}
              >
                Atrás
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 h-12 text-base"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : step === totalSteps ? "Registrarse" : "Siguiente"}
            </Button>
          </div>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
            o
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 text-base"
          size="lg"
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12.55C5.03 8.85 8.36 5.83 12.19 5.83C14.29 5.83 15.99 6.69 17.21 7.84L19.34 5.71C17.21 3.82 14.81 2.67 12.19 2.67C6.98 2.67 2.86 7.05 2.86 12.55C2.86 18.05 6.98 22.43 12.19 22.43C17.62 22.43 21.52 18.32 21.52 12.72C21.52 12.06 21.46 11.58 21.35 11.1Z"
              fill="#4285F4"
            />
          </svg>
          Continuar con Google
        </Button>

        <FormFooterLink
          text="¿Ya tienes una cuenta?"
          linkText="Iniciar sesión"
          href="/log-in"
        />
      </div>
    </div>
  );
}
