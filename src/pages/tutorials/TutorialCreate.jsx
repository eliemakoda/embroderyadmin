import React, { useState } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Save, Video, Image, AlertCircle, ArrowLeft, FileText, List, Settings } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateTutorial() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
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

  const [steps, setSteps] = useState([
    {
      stepNumber: 1,
      title: '',
      description: '',
      imageUrl: '',
      imageFile: null,
      videoUrl: '',
      tips: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'steps', label: 'Steps', icon: List },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTutorialChange = (field, value) => {
    setTutorial((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
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

  const validate = () => {
    const newErrors = {};

    if (!tutorial.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!tutorial.description.trim()) {
      newErrors.description = 'Description is required';
    }

    steps.forEach((step, index) => {
      if (!step.title.trim()) {
        newErrors[`step_${index}_title`] = 'Step title is required';
      }
      if (!step.description.trim()) {
        newErrors[`step_${index}_description`] = 'Step description is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setActiveTab('basic');
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
        
        setSteps([
          {
            stepNumber: 1,
            title: '',
            description: '',
            imageUrl: '',
            imageFile: null,
            videoUrl: '',
            tips: '',
          },
        ]);

        setTimeout(() => setSuccess(false), 5000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      setSteps([
        {
          stepNumber: 1,
          title: '',
          description: '',
          imageUrl: '',
          imageFile: null,
          videoUrl: '',
          tips: '',
        },
      ]);
      
      setErrors({});
      setActiveTab('basic');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={tutorial.title}
                  onChange={(e) => handleTutorialChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter tutorial title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={tutorial.description}
                  onChange={(e) => handleTutorialChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of the tutorial"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Content (Optional)
                </label>
                <textarea
                  value={tutorial.content}
                  onChange={(e) => handleTutorialChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed tutorial content..."
                />
              </div>
            </div>
          </div>
        );

      case 'steps':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">Tutorial Steps</h3>
              <button
                onClick={addStep}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Step {step.stepNumber}
                    </h4>
                    <div className="flex space-x-2">
                      {index > 0 && (
                        <button
                          onClick={() => moveStep(index, 'up')}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Move up"
                        >
                          <MoveUp className="w-5 h-5" />
                        </button>
                      )}
                      {index < steps.length - 1 && (
                        <button
                          onClick={() => moveStep(index, 'down')}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Move down"
                        >
                          <MoveDown className="w-5 h-5" />
                        </button>
                      )}
                      {steps.length > 1 && (
                        <button
                          onClick={() => removeStep(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove step"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Step Title *
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`step_${index}_title`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Step title"
                      />
                      {errors[`step_${index}_title`] && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors[`step_${index}_title`]}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={step.description}
                        onChange={(e) =>
                          handleStepChange(index, 'description', e.target.value)
                        }
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`step_${index}_description`]
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Describe this step in detail..."
                      />
                      {errors[`step_${index}_description`] && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors[`step_${index}_description`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Step Image
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                          <Image className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {step.imageFile ? step.imageFile.name : 'Choose image'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageChange(index, e.target.files[0])
                            }
                            className="hidden"
                          />
                        </label>
                        {step.imageUrl && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden">
                            <img
                              src={step.imageUrl}
                              alt={`Step ${step.stepNumber} preview`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL (Optional)
                      </label>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url"
                          value={step.videoUrl}
                          onChange={(e) =>
                            handleStepChange(index, 'videoUrl', e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tips (Optional)
                      </label>
                      <textarea
                        value={step.tips}
                        onChange={(e) => handleStepChange(index, 'tips', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional tips or notes for this step..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL (Optional)
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={tutorial.videoUrl}
                    onChange={(e) => handleTutorialChange('videoUrl', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={tutorial.difficulty}
                  onChange={(e) => handleTutorialChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={tutorial.duration}
                  onChange={(e) => handleTutorialChange('duration', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 30"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID (Optional)
                </label>
                <input
                  type="text"
                  value={tutorial.productId}
                  onChange={(e) => handleTutorialChange('productId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Link to a product"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tutorial.featured}
                      onChange={(e) => handleTutorialChange('featured', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Tutorial</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tutorial.isActive}
                      onChange={(e) => handleTutorialChange('isActive', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Create New Tutorial</h1>
              <p className="text-gray-600 mt-2">Add a new tutorial with step-by-step instructions</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 font-medium">
              ✓ Tutorial created successfully!
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-theory">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Step {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Creating...' : 'Create Tutorial'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
