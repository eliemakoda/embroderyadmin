import { 
  Home, 
  BookOpen, 
  Image, 
  ShoppingBag, 
  Users, 
  Settings, 
  HelpCircle,
  Palette,
  Scissors,
  X,
  User2,
  PhoneMissed
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Tableau de bord', href: '/admin/dashboard', icon: Home },
  { name: 'Tutoriels', href: '/admin/tutorials', icon: BookOpen },
  { name: 'Galerie', href: '/admin/gallery', icon: Image },
  { name: 'Produits', href: '/admin/products', icon: ShoppingBag },
  { name: 'Catégories', href: '/admin/categories', icon: Palette },
  { name: 'Services', href: '/admin/services', icon: Scissors },
  { name: 'Équipe', href: '/admin/team', icon: Users },
  // { name: 'Utilisateurs', href: '/admin/users', icon: User2 },
  { name: 'Nous contacter', href: '/admin/contact-us', icon: PhoneMissed },
  // { name: 'Paramètres', href: '/settings', icon: Settings },
  // { name: 'Aide', href: '/help', icon: HelpCircle },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar - now fixed and positioned properly */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-30">
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full bg-surface-50 border-r border-surface-300 shadow-lg">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6">
                <div className="flex items-center space-x-3">
                
                  <div>
                    <p className="text-xs text-surface-600">Tableau de bord administrateur</p>
                  </div>
                </div>
              </div>
              <nav className="mt-8 flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                          : 'text-surface-700 hover:bg-primary-50 hover:text-primary-700'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 transition-colors ${
                          isActive ? 'text-white' : 'text-surface-500 group-hover:text-primary-600'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full bg-surface-50 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-900">Monchoix</h1>
                <p className="text-xs text-surface-600">Tableau de bord administrateur</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-200 transition-colors"
            >
              <X className="w-5 h-5 text-surface-600" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                      : 'text-surface-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-white' : 'text-surface-500 group-hover:text-primary-600'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}