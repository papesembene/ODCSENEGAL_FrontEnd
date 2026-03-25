'use client';

import React from 'react';
import { Star } from 'lucide-react';

export function Rating({ value, readOnly = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`p-1 ${!readOnly ? 'cursor-pointer' : ''}`}
          onClick={() => !readOnly && onChange?.(star)}
        >
          <Star
            className={`w-5 h-5 ${
              star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
} 