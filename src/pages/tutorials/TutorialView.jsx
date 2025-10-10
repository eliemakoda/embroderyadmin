import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard as Edit3, Trash2, Eye, Clock, Star, Play, User, Calendar, ExternalLink } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

export default function TutorialView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const { toast } = useToast();

  // Mock tutorial data
  const mockTutorial = {
    id: '1',
    title: 'French Knot Embroidery Basics',
    slug: 'french-knot-embroidery-basics',
    description: 'Learn the fundamental technique of creating beautiful French knots in embroidery. This comprehensive tutorial will guide you through each step of the process.',
    content: `French knots are one of the most versatile and beautiful stitches in embroidery. They can be used to create texture, fill areas, or add delicate details to your work.

In this tutorial, you'll learn:
- How to properly prepare your materials
- The correct needle threading technique
- Step-by-step knot creation process
- Common mistakes to avoid
- Advanced tips for professional results

French knots might seem tricky at first, but with practice, they become second nature. The key is maintaining consistent tension and following the proper technique.`,
    videoUrl: 'https://www.youtube.com/watch?v=example',
    difficulty: 'BEGINNER',
    duration: 45,
    featured: true,
    isActive: true,
    viewCount: 1234,
    productId: 'prod-123',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    steps: [
      {
        id: '1',
        stepNumber: 1,
        title: 'Preparing your materials',
        description: 'Gather all necessary materials including embroidery floss, needle, fabric, and embroidery hoop. Choose colors that complement your design and ensure your fabric is properly hooped.',
        imageUrl: 'https://images.pexels.com/photos/6444235/pexels-photo-6444235.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
        videoUrl: '',
        tips: 'Use a hoop that is slightly larger than your design area for better tension control.'
      },
      {
        id: '2',
        stepNumber: 2,
        title: 'Threading the needle and anchoring',
        description: 'Cut a comfortable length of embroidery floss (about 18 inches) and thread your needle. Tie a small knot at the end or use the waste knot technique for a cleaner finish.',
        imageUrl: 'https://images.pexels.com/photos/6984989/pexels-photo-6984989.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
        videoUrl: '',
        tips: 'Avoid making the thread too long as it may tangle or wear out from repeated pulling through the fabric.'
      },
      {
        id: '3',
        stepNumber: 3,
        title: 'Creating the French knot',
        description: 'Bring the needle up through the fabric. Wrap the thread around the needle 1-3 times (depending on desired knot size). Insert the needle very close to but not in the same hole where you came up.',
        imageUrl: 'https://images.pexels.com/photos/7395224/pexels-photo-7395224.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
        videoUrl: 'https://www.youtube.com/watch?v=step3',
        tips: 'Keep tension consistent while wrapping and pulling the needle through. Practice makes perfect!'
      }
    ],
    admin: { 
      id: '1',
      name: 'Sarah Mitchell',
      email: 'sarah@embcraft.com'
    },
    product: {
      id: 'prod-123',
      name: 'Beginner Embroidery Kit',
      slug: 'beginner-embroidery-kit'
    }
  };

  useEffect(() => {
    loadTutorial();
  }, [id]);

  const loadTutorial = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTutorial(mockTutorial);
    } catch (error) {
      toast.error('Failed to load tutorial');
      navigate('/admin/tutorials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Tutorial deleted successfully');
      navigate('/admin/tutorials');
    } catch (error) {
      toast.error('Failed to delete tutorial');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      BEGINNER: 'bg-success-100 text-success-700',
      INTERMEDIATE: 'bg-warning-100 text-warning-700',
      ADVANCED: 'bg-error-100 text-error-700',
      EXPERT: 'bg-primary-100 text-primary-700'
    };
    return colors[difficulty] || 'bg-surface-100 text-surface-700';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="h-4 bg-surface-300 rounded w-32"></div>
                <div className="h-8 bg-surface-300 rounded w-96"></div>
                <div className="h-4 bg-surface-300 rounded w-64"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-9 w-20 bg-surface-300 rounded"></div>
                <div className="h-9 w-20 bg-surface-300 rounded"></div>
              </div>
            </div>
            <div className="h-64 bg-surface-300 rounded-lg"></div>
            <div className="h-48 bg-surface-300 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tutorial) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-surface-900 mb-4">Tutorial not found</h1>
          <p className="text-surface-600 mb-6">The tutorial you're looking for doesn't exist or has been removed.</p>
          <Link to="/tutorials">
            <Button>Back to Tutorials</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <Link to="/tutorials">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tutorials
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-surface-900">{tutorial.title}</h1>
              {tutorial.featured && (
                <Star className="w-5 h-5 text-warning-500 fill-current" />
              )}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                tutorial.isActive 
                  ? 'bg-success-100 text-success-700' 
                  : 'bg-surface-100 text-surface-700'
              }`}>
                {tutorial.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-surface-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                {tutorial.difficulty}
              </span>
              {tutorial.duration && (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {tutorial.duration} minutes
                </span>
              )}
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {tutorial.viewCount.toLocaleString()} views
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {tutorial.admin.name}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(tutorial.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link to={`/tutorials/${tutorial.id}/edit`}>
              <Button variant="outline">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              onClick={() => setDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tutorial Overview */}
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-3">Description</h2>
              <p className="text-surface-600 leading-relaxed">{tutorial.description}</p>
            </div>
            
            {tutorial.content && (
              <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-3">Full Content</h2>
                <div className="text-surface-600 leading-relaxed whitespace-pre-line">
                  {tutorial.content}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surface-200">
              {tutorial.videoUrl && (
                <div>
                  <h3 className="text-md font-medium text-surface-900 mb-2">Tutorial Video</h3>
                  <a
                    href={tutorial.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch on YouTube
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
              
              {tutorial.product && (
                <div>
                  <h3 className="text-md font-medium text-surface-900 mb-2">Related Product</h3>
                  <Link
                    to={`/products/${tutorial.product.id}`}
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {tutorial.product.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Tutorial Steps */}
        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-6">
            Tutorial Steps ({tutorial.steps.length} steps)
          </h2>
          <div className="space-y-6">
            {tutorial.steps.map((step) => (
              <div key={step.id} className="border border-surface-200 rounded-lg p-6 bg-surface-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white text-sm font-semibold rounded-full">
                        {step.stepNumber}
                      </span>
                      <h3 className="text-lg font-medium text-surface-900">{step.title}</h3>
                    </div>
                    
                    <p className="text-surface-600 leading-relaxed pl-11">
                      {step.description}
                    </p>
                    
                    {step.tips && (
                      <div className="pl-11">
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-primary-900 mb-2">💡 Pro Tip</h4>
                          <p className="text-sm text-primary-800">{step.tips}</p>
                        </div>
                      </div>
                    )}
                    
                    {step.videoUrl && (
                      <div className="pl-11">
                        <a
                          href={step.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary-600 hover:text-primary-700 transition-colors text-sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch step video
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {step.imageUrl && (
                    <div className="lg:col-span-1">
                      <img
                        src={step.imageUrl}
                        alt={step.title}
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Metadata */}
        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-surface-600">Tutorial ID:</span>
                <span className="text-surface-900 font-mono">{tutorial.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Slug:</span>
                <span className="text-surface-900 font-mono">{tutorial.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Created by:</span>
                <span className="text-surface-900">{tutorial.admin.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Status:</span>
                <span className={`font-medium ${tutorial.isActive ? 'text-success-600' : 'text-surface-600'}`}>
                  {tutorial.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-surface-600">Created:</span>
                <span className="text-surface-900">{formatDate(tutorial.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Last updated:</span>
                <span className="text-surface-900">{formatDate(tutorial.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Total views:</span>
                <span className="text-surface-900">{tutorial.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Featured:</span>
                <span className={`font-medium ${tutorial.featured ? 'text-warning-600' : 'text-surface-600'}`}>
                  {tutorial.featured ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Tutorial"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600">
            Are you sure you want to delete "{tutorial.title}"? This action cannot be undone and will also remove all associated tutorial steps.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete Tutorial
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}