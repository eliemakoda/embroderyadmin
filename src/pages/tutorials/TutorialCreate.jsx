import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Save, 
  Video, 
  Image, 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  List, 
  Settings,
  Upload,
  Clock,
  Award,
  Link,
  Eye,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Play,
  User
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateTutorial() {
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [tutorial, setTutorial] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    difficulty: 'BEGINNER',
    duration: '',
    featured: false,
    isActive: true,
    productId: null,
    createdBy: userId
  });

  const [steps, setSteps] = useState([{
    stepNumber: 1,
    title: '',
    description: '',
    imageUrl: '',
    imageFile: null,
    videoUrl: '',
    tips: '',
  }]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const wizardSteps = [
    { id: 'basic', label: 'Basic Info', icon: FileText, description: 'Tutorial overview' },
    { id: 'steps', label: 'Steps', icon: List, description: 'Step-by-step instructions' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Configuration' },
    { id: 'preview', label: 'Preview', icon: Eye, description: 'Review & submit' },
  ];

  const difficultyOptions = [
    { value: 'BEGINNER', label: 'Beginner', color: 'text-success-600', bgColor: 'bg-success-50' },
    { value: 'INTERMEDIATE', label: 'Intermediate', color: 'text-warning-600', bgColor: 'bg-warning-50' },
    { value: 'ADVANCED', label: 'Advanced', color: 'text-error-600', bgColor: 'bg-error-50' },
    { value: 'EXPERT', label: 'Expert', color: 'text-primary-600', bgColor: 'bg-primary-50' },
  ];

  const handleTutorialChange = (field, value) => {
    setTutorial(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
    
    if (errors[`step_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`step_${index}_${field}`];
      setErrors(newErrors);
    }
  };

  const handleImageChange = (index, file) => {
    if (file) {
      const newSteps = [...steps];
      newSteps[index].imageFile = file;
      newSteps[index].imageUrl = URL.createObjectURL(file);
      setSteps(newSteps);
    }
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        title: '',
        description: '',
        imageUrl: '',
        imageFile: null,
        videoUrl: '',
        tips: '',
      },
    ]);
  };

  const removeStep = (index) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index);
    newSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setSteps(newSteps);
  };

  const moveStep = (index, direction) => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      newSteps.forEach((step, i) => {
        step.stepNumber = i + 1;
      });
      setSteps(newSteps);
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      if (!tutorial.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!tutorial.description.trim()) {
        newErrors.description = 'Description is required';
      }
    }

    if (currentStep === 1) {
      steps.forEach((step, index) => {
        if (!step.title.trim()) {
          newErrors[`step_${index}_title`] = 'Step title is required';
        }
        if (!step.description.trim()) {
          newErrors[`step_${index}_description`] = 'Step description is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();

      // Append tutorial data
      Object.keys(tutorial).forEach((key) => {
        if (tutorial[key] !== null && tutorial[key] !== '') {
          if (key === 'featured' || key === 'isActive') {
            formData.append(key, tutorial[key].toString());
          } else {
            formData.append(key, tutorial[key]);
          }
        }
      });

      // Prepare steps data
      const stepsData = steps.map((step) => ({
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        videoUrl: step.videoUrl || null,
        tips: step.tips || null,
      }));

      formData.append('steps', JSON.stringify(stepsData));

      // Append step images with correct field names
      steps.forEach((step, index) => {
        if (step.imageFile) {
          formData.append(`step[${index}][image]`, step.imageFile);
        }
      });

      const response = await axios.post('/tutorials/create2forall', formData);

      if (response.data.success) {
        setSuccess(true);
        
        // Reset form
        setTutorial({
          title: '',
          description: '',
          content: '',
          videoUrl: '',
          difficulty: 'BEGINNER',
          duration: '',
          featured: false,
          isActive: true,
          productId: '',
          createdBy: userId
        });
        
        setSteps([{
          stepNumber: 1,
          title: '',
          description: '',
          imageUrl: '',
          imageFile: null,
          videoUrl: '',
          tips: '',
        }]);

        setCurrentStep(0);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error creating tutorial:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to create tutorial. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
      setTutorial({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        difficulty: 'BEGINNER',
        duration: '',
        featured: false,
        isActive: true,
        productId: '',
        createdBy: userId
      });
      
      setSteps([{
        stepNumber: 1,
        title: '',
        description: '',
        imageUrl: '',
        imageFile: null,
        videoUrl: '',
        tips: '',
      }]);
      
      setErrors({});
      setCurrentStep(0);
    }
  };

  const getDifficultyInfo = (difficulty) => {
    return difficultyOptions.find(opt => opt.value === difficulty) || difficultyOptions[0];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <FileText className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-surface-900">Tutorial Basic Information</h2>
              <p className="text-surface-600 mt-2">Start with the essential details about your tutorial</p>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-3">
                  Title *
                </label>
                <input
                  type="text"
                  value={tutorial.title}
                  onChange={(e) => handleTutorialChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                    errors.title 
                      ? 'border-error-500 bg-error-50' 
                      : 'border-surface-300 focus:border-primary-500'
                  }`}
                  placeholder="Enter an engaging tutorial title..."
                />
                {errors.title && (
                  <p className="text-error-600 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-3">
                  Description *
                </label>
                <textarea
                  value={tutorial.description}
                  onChange={(e) => handleTutorialChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                    errors.description 
                      ? 'border-error-500 bg-error-50' 
                      : 'border-surface-300 focus:border-primary-500'
                  }`}
                  placeholder="Brief description of what users will learn..."
                />
                {errors.description && (
                  <p className="text-error-600 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-3">
                  Detailed Content
                  <span className="text-surface-500 font-normal ml-1">(Optional)</span>
                </label>
                <textarea
                  value={tutorial.content}
                  onChange={(e) => handleTutorialChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="Write the complete tutorial content with detailed explanations..."
                />
                <p className="text-surface-500 text-sm mt-2">
                  Provide comprehensive content for users who prefer reading detailed instructions.
                </p>
              </div>
            </div>
          </div>
        );

      case 1: // Steps
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <List className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-surface-900">Tutorial Steps</h2>
              <p className="text-surface-600 mt-2">Break down your tutorial into clear, actionable steps</p>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="bg-surface-50 border-2 border-surface-200 rounded-xl p-6 transition-all duration-200 hover:border-surface-300"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {step.stepNumber}
                      </div>
                      <h4 className="text-lg font-semibold text-surface-900">
                        Step {step.stepNumber}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {index > 0 && (
                        <button
                          onClick={() => moveStep(index, 'up')}
                          className="p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="Move up"
                        >
                          <MoveUp className="w-5 h-5" />
                        </button>
                      )}
                      {index < steps.length - 1 && (
                        <button
                          onClick={() => moveStep(index, 'down')}
                          className="p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="Move down"
                        >
                          <MoveDown className="w-5 h-5" />
                        </button>
                      )}
                      {steps.length > 1 && (
                        <button
                          onClick={() => removeStep(index)}
                          className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors duration-200"
                          title="Remove step"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-surface-900 mb-3">
                        Step Title *
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          errors[`step_${index}_title`] 
                            ? 'border-error-500 bg-error-50' 
                            : 'border-surface-300 focus:border-primary-500'
                        }`}
                        placeholder="Clear, actionable step title..."
                      />
                      {errors[`step_${index}_title`] && (
                        <p className="text-error-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {errors[`step_${index}_title`]}
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-surface-900 mb-3">
                        Description *
                      </label>
                      <textarea
                        value={step.description}
                        onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                        rows={4}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          errors[`step_${index}_description`]
                            ? 'border-error-500 bg-error-50'
                            : 'border-surface-300 focus:border-primary-500'
                        }`}
                        placeholder="Detailed instructions for this step..."
                      />
                      {errors[`step_${index}_description`] && (
                        <p className="text-error-600 text-sm mt-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {errors[`step_${index}_description`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-surface-900 mb-3">
                        Step Visual
                        <span className="text-surface-500 font-normal ml-1">(Optional)</span>
                      </label>
                      <div className="space-y-3">
                        <label className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                          step.imageFile 
                            ? 'border-success-500 bg-success-50' 
                            : 'border-surface-300 hover:border-primary-500 hover:bg-primary-50'
                        }`}>
                          <Upload className="w-8 h-8 text-surface-400 mb-2" />
                          <span className="text-sm font-medium text-surface-700">
                            {step.imageFile ? step.imageFile.name : 'Upload Step Image'}
                          </span>
                          <span className="text-xs text-surface-500 mt-1">
                            PNG, JPG, WEBP up to 5MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        {step.imageUrl && (
                          <div className="relative w-full rounded-lg overflow-hidden border-2 border-surface-200">
                            <img
                              src={step.imageUrl}
                              alt={`Step ${step.stepNumber} preview`}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-surface-900 mb-3">
                          Step Video
                          <span className="text-surface-500 font-normal ml-1">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
                          <input
                            type="url"
                            value={step.videoUrl}
                            onChange={(e) => handleStepChange(index, 'videoUrl', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-surface-900 mb-3">
                          Pro Tips
                          <span className="text-surface-500 font-normal ml-1">(Optional)</span>
                        </label>
                        <textarea
                          value={step.tips}
                          onChange={(e) => handleStepChange(index, 'tips', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                          placeholder="Helpful tips, common mistakes to avoid, or additional context..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addStep}
                className="w-full flex items-center justify-center space-x-2 px-4 py-6 border-2 border-dashed border-surface-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
              >
                <Plus className="w-6 h-6 text-surface-400" />
                <span className="text-surface-700 font-medium">Add Another Step</span>
              </button>
            </div>
          </div>
        );

      case 2: // Settings
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <Settings className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-surface-900">Tutorial Settings</h2>
              <p className="text-surface-600 mt-2">Configure your tutorial preferences and options</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-3">
                  Main Tutorial Video
                  <span className="text-surface-500 font-normal ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
                  <input
                    type="url"
                    value={tutorial.videoUrl}
                    onChange={(e) => handleTutorialChange('videoUrl', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-3">
                  <Award className="w-4 h-4 inline mr-2" />
                  Difficulty Level
                </label>
                <select
                  value={tutorial.difficulty}
                  onChange={(e) => handleTutorialChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none bg-white"
                >
                  {difficultyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={tutorial.duration}
                  onChange={(e) => handleTutorialChange('duration', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="e.g., 45"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-3">
                  <Link className="w-4 h-4 inline mr-2" />
                  Product Reference
                  <span className="text-surface-500 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={tutorial.productId}
                  onChange={(e) => handleTutorialChange('productId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="Product ID or reference"
                />
              </div>

              <div className="lg:col-span-2">
                <div className="bg-surface-50 border-2 border-surface-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-surface-900 mb-4">Tutorial Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 p-4 border-2 border-surface-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tutorial.featured}
                        onChange={(e) => handleTutorialChange('featured', e.target.checked)}
                        className="w-5 h-5 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-surface-900">Featured Tutorial</span>
                        <span className="block text-xs text-surface-500 mt-1">Highlight this tutorial on the platform</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border-2 border-surface-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tutorial.isActive}
                        onChange={(e) => handleTutorialChange('isActive', e.target.checked)}
                        className="w-5 h-5 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-surface-900">Publish Tutorial</span>
                        <span className="block text-xs text-surface-500 mt-1">Make this tutorial visible to users</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Preview
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <Eye className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-surface-900">Preview Tutorial</h2>
              <p className="text-surface-600 mt-2">Review your tutorial before publishing</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Tutorial Header */}
              <div className="bg-white rounded-2xl border-2 border-surface-200 p-8 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-surface-900 mb-3">{tutorial.title || 'Untitled Tutorial'}</h1>
                    <p className="text-surface-600 text-lg">{tutorial.description || 'No description provided'}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyInfo(tutorial.difficulty).bgColor} ${getDifficultyInfo(tutorial.difficulty).color}`}>
                    {getDifficultyInfo(tutorial.difficulty).label}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-surface-600">
                    <Clock className="w-4 h-4" />
                    <span>{tutorial.duration || 'Not specified'} min</span>
                  </div>
                  <div className="flex items-center space-x-2 text-surface-600">
                    <List className="w-4 h-4" />
                    <span>{steps.length} steps</span>
                  </div>
                  <div className="flex items-center space-x-2 text-surface-600">
                    <User className="w-4 h-4" />
                    <span>By You</span>
                  </div>
                  <div className="flex items-center space-x-2 text-surface-600">
                    <Award className="w-4 h-4" />
                    <span>{tutorial.featured ? 'Featured' : 'Standard'}</span>
                  </div>
                </div>

                {tutorial.videoUrl && (
                  <div className="mt-6 p-4 bg-surface-50 rounded-xl border-2 border-surface-200">
                    <div className="flex items-center space-x-3">
                      <Play className="w-5 h-5 text-primary-500" />
                      <span className="font-medium text-surface-900">Video Tutorial Available</span>
                      <a href={tutorial.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm">
                        View Video
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Steps Preview */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-surface-900 mb-6">Step-by-Step Instructions</h3>
                {steps.map((step, index) => (
                  <div key={index} className="bg-white rounded-xl border-2 border-surface-200 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-surface-900 mb-3">{step.title || 'Untitled Step'}</h4>
                        <p className="text-surface-600 mb-4 whitespace-pre-wrap">{step.description || 'No description provided'}</p>
                        
                        {step.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={step.imageUrl}
                              alt={`Step ${step.stepNumber}`}
                              className="rounded-lg max-w-md h-auto border-2 border-surface-200"
                            />
                          </div>
                        )}

                        {step.videoUrl && (
                          <div className="flex items-center space-x-2 text-sm text-surface-600 mb-3">
                            <Video className="w-4 h-4" />
                            <span>Step video available</span>
                          </div>
                        )}

                        {step.tips && (
                          <div className="bg-secondary-50 border-l-4 border-secondary-500 pl-4 py-2">
                            <p className="text-sm font-medium text-surface-900 mb-1">💡 Pro Tip</p>
                            <p className="text-sm text-surface-700">{step.tips}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Content */}
              {tutorial.content && (
                <div className="mt-8 bg-white rounded-xl border-2 border-surface-200 p-6">
                  <h3 className="text-xl font-bold text-surface-900 mb-4">Additional Content</h3>
                  <div className="prose max-w-none text-surface-700 whitespace-pre-wrap">
                    {tutorial.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-surface-900">Create New Tutorial</h1>
              <p className="text-surface-600 mt-2">Share your knowledge with step-by-step instructions</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-4 py-2.5 text-surface-600 hover:text-surface-800 hover:bg-surface-100 rounded-xl transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          {success && (
            <div className="bg-success-50 border-2 border-success-200 rounded-xl p-4 mb-6 animate-fade-in">
              <p className="text-success-700 font-medium flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Tutorial created successfully! Redirecting...
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : isCurrent
                        ? 'border-primary-500 bg-white text-primary-500'
                        : 'border-surface-300 bg-surface-50 text-surface-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-sm font-medium ${
                        isCurrent ? 'text-primary-600' : isCompleted ? 'text-surface-900' : 'text-surface-500'
                      }`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-surface-500">{step.description}</div>
                    </div>
                  </div>
                  
                  {index < wizardSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-primary-500' : 'bg-surface-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
          {/* Step Content */}
          <div className="p-8">
            {renderStepContent()}
          </div>

          {/* Navigation Actions */}
          <div className="border-t border-surface-200 px-8 py-6 bg-surface-50">
            {errors.submit && (
              <div className="bg-error-50 border-2 border-error-200 rounded-xl p-4 mb-4 animate-slide-down">
                <p className="text-error-700 font-medium flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-surface-500">
                Step <span className="font-semibold text-surface-700">{currentStep + 1}</span> of {wizardSteps.length}
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 px-8 py-3.5 border-2 border-surface-300 text-surface-700 font-medium rounded-xl hover:bg-surface-100 hover:border-surface-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Previous</span>
                  </button>
                )}
                
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-8 py-3.5 border-2 border-surface-300 text-surface-700 font-medium rounded-xl hover:bg-surface-100 hover:border-surface-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>

                {currentStep < wizardSteps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-success-500 text-white font-medium rounded-xl hover:bg-success-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Save className="w-5 h-5" />
                    <span>{loading ? 'Publishing...' : 'Publish Tutorial'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}