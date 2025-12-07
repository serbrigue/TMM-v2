import React, { useState } from 'react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-xl',
        lg: 'text-3xl'
    };

    const handleMouseEnter = (index: number) => {
        if (!readonly) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const handleClick = (index: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(index);
        }
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((index) => (
                <button
                    key={index}
                    type="button"
                    className={`${sizeClasses[size]} focus:outline-none transition-colors duration-200 ${index <= (hoverRating || rating) ? 'text-tmm-yellow' : 'text-tmm-black/20'
                        } ${!readonly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(index)}
                    disabled={readonly}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

export default StarRating;
