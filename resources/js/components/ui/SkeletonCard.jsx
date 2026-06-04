import React from 'react';

/**
 * Simple skeleton placeholder component.
 * Accepts optional width, height, and additional Tailwind classes.
 */
const SkeletonCard = ({ width = '100%', height = '1rem', className = '' }) => {
  return (
    <div
      className={`bg-slate-200 animate-pulse rounded ${className}`}
      style={{ width, height }}
    ></div>
  );
};

export default SkeletonCard;
