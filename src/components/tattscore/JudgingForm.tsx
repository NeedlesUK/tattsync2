import React, { useState, useEffect } from 'react';
import { Star, Save, AlertCircle, FileText } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  max_score: number;
  weight: number;
}

interface JudgingFormProps {
  entryId: number;
  entryTitle: string;
  entryImage?: string;
  artistName: string;
  categories: Category[];
  initialScores?: Record<number, { score: number; notes: string }>;
  onSubmit: (scores: Record<number, { score: number; notes: string }>) => Promise<void>;
  onCancel: () => void;
}

export function JudgingForm({
  entryId,
  entryTitle,
  entryImage,
  artistName,
  categories,
  initialScores = {},
  onSubmit,
  onCancel
}: JudgingFormProps) {
  const [scores, setScores] = useState<Record<number, { score: number; notes: string }>>(initialScores);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize scores for all categories
  useEffect(() => {
    const initializedScores = { ...scores };
    categories.forEach(category => {
      if (!initializedScores[category.id]) {
        initializedScores[category.id] = { score: 0, notes: '' };
      }
    });
    setScores(initializedScores);
  }, [categories]);

  const handleScoreChange = (categoryId: number, score: number) => {
    setScores(prev => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], score }
    }));
    
    // Clear error when user changes score
    if (errors[`category_${categoryId}`]) {
      setErrors(prev => ({
        ...prev,
        [`category_${categoryId}`]: ''
      }));
    }
  };

  const handleNotesChange = (categoryId: number, notes: string) => {
    setScores(prev => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], notes }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    categories.forEach(category => {
      if (!scores[category.id] || scores[category.id].score === 0) {
        newErrors[`category_${category.id}`] = `Please provide a score for ${category.name}`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(scores);
    } catch (error) {
      console.error('Error submitting scores:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit scores. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalScore = () => {
    let total = 0;
    let maxPossible = 0;
    
    categories.forEach(category => {
      if (scores[category.id]) {
        total += scores[category.id].score * category.weight;
        maxPossible += category.max_score * category.weight;
      }
    });
    
    return {
      total: total.toFixed(1),
      percentage: maxPossible > 0 ? ((total / maxPossible) * 100).toFixed(1) : '0'
    };
  };

  const renderStarRating = (categoryId: number, maxScore: number) => {
    const currentScore = scores[categoryId]?.score || 0;
    const stars = [];
    
    for (let i = 1; i <= maxScore; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleScoreChange(categoryId, i)}
          className={`p-1 ${i <= currentScore ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300 transition-colors`}
        >
          <Star className="w-6 h-6" fill={i <= currentScore ? 'currentColor' : 'none'} />
        </button>
      );
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 text-white font-medium">{currentScore}/{maxScore}</span>
      </div>
    );
  };

  const { total, percentage } = calculateTotalScore();

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      {/* Entry Information */}
      <div className="flex items-start space-x-6 mb-6">
        {entryImage && (
          <img
            src={entryImage}
            alt={entryTitle}
            className="w-32 h-32 object-cover rounded-lg"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{entryTitle}</h2>
          <p className="text-gray-300">By {artistName}</p>
        </div>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Judging Categories */}
      <div className="space-y-6 mb-6">
        {categories.map(category => (
          <div key={category.id} className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-medium">{category.name}</h3>
                <p className="text-gray-400 text-sm">{category.description}</p>
                {category.weight !== 1.0 && (
                  <p className="text-purple-400 text-xs mt-1">Weight: {category.weight.toFixed(1)}x</p>
                )}
              </div>
              <div className="text-right">
                {renderStarRating(category.id, category.max_score)}
                {errors[`category_${category.id}`] && (
                  <p className="text-red-400 text-xs mt-1">{errors[`category_${category.id}`]}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes (Optional)</label>
              <textarea
                value={scores[category.id]?.notes || ''}
                onChange={(e) => handleNotesChange(category.id, e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add any notes or feedback for this category"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total Score */}
      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Total Score</h3>
          <div className="text-right">
            <p className="text-purple-400 text-2xl font-bold">{total}</p>
            <p className="text-gray-300 text-sm">{percentage}%</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Scores'}</span>
        </button>
      </div>
    </div>
  );
}