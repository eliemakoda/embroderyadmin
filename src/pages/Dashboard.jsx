import { useState, useEffect } from 'react';
import { BookOpen, Users, Eye, Heart, TrendingUp, Calendar, Award } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTutorials: 0,
    totalViews: 0,
    activeUsers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalTutorials: 47,
        totalViews: 12543,
        activeUsers: 1204,
        totalProducts: 89,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Total Tutorials',
      value: stats.totalTutorials,
      change: '+12%',
      changeType: 'positive',
      icon: BookOpen,
      color: 'primary'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: Eye,
      color: 'secondary'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: '+23%',
      changeType: 'positive',
      icon: Users,
      color: 'accent'
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      change: '+5%',
      changeType: 'positive',
      icon: Award,
      color: 'info'
    }
  ];

  const recentTutorials = [
    {
      id: 1,
      title: 'French Knot Embroidery Basics',
      author: 'Sarah Mitchell',
      views: 1234,
      status: 'Published',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Advanced Cross-Stitch Patterns',
      author: 'Emma Johnson',
      views: 856,
      status: 'Draft',
      date: '2024-01-14'
    },
    {
      id: 3,
      title: 'Ribbon Embroidery for Beginners',
      author: 'Lisa Chen',
      views: 2341,
      status: 'Published',
      date: '2024-01-13'
    }
  ];

  if (loading) {
    return (
      <>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-300 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-surface-300 rounded-lg"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dashboard Overview</h1>
          <p className="text-surface-600 mt-1">Welcome back! Here's what's happening with your embroidery platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const colorMap = {
              primary: 'primary',
              secondary: 'secondary',
              accent: 'accent',
              info: 'info'
            };
            const colorClass = colorMap[stat.color];
            
            return (
              <Card key={index} className="animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-surface-900 mt-2">{stat.value}</p>
                    <div className={`flex items-center mt-2 text-sm ${
                      stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                    }`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change} from last month
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-${colorClass}-100`}>
                    <stat.icon className={`w-6 h-6 text-${colorClass}-600`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tutorials */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Recent Tutorials</h3>
              <a href="/tutorials" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </a>
            </div>
            <div className="space-y-4">
              {recentTutorials.map((tutorial) => (
                <div key={tutorial.id} className="flex items-center justify-between p-4 bg-surface-100 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-surface-900">{tutorial.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-surface-600">
                      <span>by {tutorial.author}</span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {tutorial.views}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      tutorial.status === 'Published' 
                        ? 'bg-success-100 text-success-700' 
                        : 'bg-warning-100 text-warning-700'
                    }`}>
                      {tutorial.status}
                    </span>
                    <p className="text-xs text-surface-500 mt-1">{tutorial.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-surface-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/tutorials/create"
                className="flex flex-col items-center p-6 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors group"
              >
                <BookOpen className="w-8 h-8 text-primary-600 mb-3" />
                <span className="font-medium text-primary-900">Create Tutorial</span>
                <span className="text-xs text-primary-600 text-center mt-1">Add a new embroidery tutorial</span>
              </a>
              
              <a
                href="/gallery"
                className="flex flex-col items-center p-6 bg-secondary-50 hover:bg-secondary-100 rounded-lg border border-secondary-200 transition-colors group"
              >
                <Heart className="w-8 h-8 text-secondary-600 mb-3" />
                <span className="font-medium text-secondary-900">Manage Gallery</span>
                <span className="text-xs text-secondary-600 text-center mt-1">Upload and organize images</span>
              </a>
              
              <a
                href="/products"
                className="flex flex-col items-center p-6 bg-accent-50 hover:bg-accent-100 rounded-lg border border-accent-200 transition-colors group"
              >
                <Award className="w-8 h-8 text-accent-600 mb-3" />
                <span className="font-medium text-accent-900">Add Product</span>
                <span className="text-xs text-accent-600 text-center mt-1">List a new embroidery item</span>
              </a>
              
              <a
                href="/settings"
                className="flex flex-col items-center p-6 bg-info-50 hover:bg-info-100 rounded-lg border border-info-200 transition-colors group"
              >
                <Calendar className="w-8 h-8 text-info-600 mb-3" />
                <span className="font-medium text-info-900">View Analytics</span>
                <span className="text-xs text-info-600 text-center mt-1">Track performance metrics</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}