import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Save, Video, Image, AlertCircle, ArrowLeft, Loader } from 'lucide-react';
import axios from 'axios';

export default function UpdateTutorial() {
  const [tutorial, setTutorial] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    difficulty: 'BEGINNER',
    duration: '',
    featured: false,
    isActive: true,
    productId: '',
  });

  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [tutorialId, setTutorialId] = useState('');

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
      setTutorialId(id);
      fetchTutorial(id);
    } else {
      setFetching(false);
      setErrors({ fetch: 'No tutorial ID provided' });
    }
  }, []);

  const fetchTutorial = async (id) => {
    setFetching(true);
    try {
      const response = await axios.get(`/tutorials/${id}`);

      if (response.data.success) {
        const data = response.data.data;
        
        setTutorial({
          title: data.title,
          description: data.description,
          content: data.content || '',
          videoUrl: data.videoUrl || '',
          difficulty: data.difficulty,
          duration: data.duration || '',
          featured: data.featured,
          isActive: data.isActive,
          productId: data.productId || '',
        });

        const fetchedSteps = data.steps.map(step => ({
          id: step.id,
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          imageUrl: step.imageUrl??"",
          imageFile: null,
          videoUrl: step.videoUrl || '',
          tips: step.tips || '',
          existingImageUrl: step.imageUrl,
        }));

        setSteps(fetchedSteps.length > 0 ? fetchedSteps : [
          {
            stepNumber: 1,
            title: '',
            description: '',
            imageUrl: '',
            imageFile: null,
            videoUrl: '',
            tips: '',
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching tutorial:', error);
      setErrors({ 
        fetch: error.response?.data?.message || 'Failed to fetch tutorial data' 
      });
    } finally {
      setFetching(false);
    }
  };

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
      newSteps[index].hasNewImage = true;
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
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();

      Object.keys(tutorial).forEach((key) => {
        if (tutorial[key] !== null && tutorial[key] !== '') {
          formData.append(key, tutorial[key]);
        }
      });

      const stepsData = steps.map((step) => ({
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        videoUrl: step.videoUrl || null,
        tips: step.tips || null,
        imageUrl: step.hasNewImage ? null : step.existingImageUrl,
      }));

      formData.append('steps', JSON.stringify(stepsData));

      steps.forEach((step, index) => {
        if (step.imageFile) {
          formData.append(`step[${index}][image]`, step.imageFile);
        }
      });

      const response = await axios.put(`/tutorials/${tutorialId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        await fetchTutorial(tutorialId);
      }
    } catch (error) {
      console.error('Error updating tutorial:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to update tutorial. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading tutorial data...</p>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Error</h2>
          <p className="text-gray-600 text-center mb-6">{errors.fetch}</p>
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Update Tutorial</h1>
              <p className="text-gray-600 mt-2">Edit tutorial information and steps</p>
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
              ✓ Tutorial updated successfully!
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Tutorial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={tutorial.title}
                  onChange={(e) => handleTutorialChange('title', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed tutorial content..."
                />
              </div>

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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Link to a product"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tutorial.featured}
                    onChange={(e) => handleTutorialChange('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">Tutorial Steps</h3>
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
                  className="bg-gray-50 p-5 rounded-lg border-2 border-gray-200"
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
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                            {step.imageFile ? step.imageFile.name : step.hasNewImage ? 'Choose new image' : 'Change image'}
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
                            {step.hasNewImage && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                New
                              </div>
                            )}
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional tips or notes for this step..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => window.history.back()}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Updating...' : 'Update Tutorial'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}