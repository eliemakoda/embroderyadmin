import { useState } from 'react';
import { Scissors, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: 'xxxxx@xxxx.com',
    password: 'xxxx'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const Nav = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier) {
      newErrors.identifier = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.identifier)) {
      newErrors.identifier = 'L\'email est invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.identifier, formData.password);
    
    if (result.success) {
      toast.success('Bienvenue ! Connexion réussie.');
      Nav('/admin/dashboard');
    } else {
      toast.error(result.error || 'Échec de la connexion. Veuillez réessayer.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* En-tête */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-surface-900">
            Bon Retour
          </h2>
          <p className="mt-2 text-sm text-surface-600">
            Connectez-vous à votre tableau de bord administrateur
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-surface-50 shadow-xl rounded-2xl px-8 py-10 border border-surface-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Adresse email"
                type="email"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                error={errors.identifier}
                required
                autoComplete="email"
                placeholder="admin@broderie.cm"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  autoComplete="current-password"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-surface-400 hover:text-surface-600 transition-colors z-10"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-surface-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-secondary[500] hover:from-rose-broderie hover:to-violet-broderie text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </div>

            {/* Identifiants de démonstration - Décommentez si nécessaire */}
            {/* <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-xs font-medium text-primary-800 mb-2">Identifiants de démonstration :</p>
              <div className="text-xs text-primary-700 space-y-1">
                <p><strong>Email :</strong> superadmin@embroidery.com</p>
                <p><strong>Mot de passe :</strong> password</p>
              </div>
            </div> */}
          </form>
        </div>

        {/* Pied de page */}
        <div className="text-center">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} Emako Tech. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}