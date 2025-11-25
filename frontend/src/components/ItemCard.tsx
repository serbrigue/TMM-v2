import React from 'react';
import { CheckCircle, PlayCircle, DollarSign } from 'lucide-react';

interface ItemCardProps {
    title: string;
    description: string;
    image?: string;
    category?: string;
    isEnrolled?: boolean;
    price: number;
    onClick: () => void;
    buttonText: string;
    metadata: React.ReactNode;
    imageOverlay?: React.ReactNode;
    showPriceIcon?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
    title,
    description,
    image,
    category,
    isEnrolled,
    price,
    onClick,
    buttonText,
    metadata,
    imageOverlay,
    showPriceIcon = false
}) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image || "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {category && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-calypso uppercase tracking-wide">
                        {category}
                    </div>
                )}
                {isEnrolled && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Inscrito
                    </div>
                )}
                {imageOverlay}
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 line-clamp-2">
                    {title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {description}
                </p>

                <div className="mb-4">
                    {metadata}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className={showPriceIcon ? "flex items-center text-lg font-bold text-gray-900" : ""}>
                        {showPriceIcon ? (
                            <>
                                <DollarSign className="w-5 h-5 text-gray-400" />
                                {price.toLocaleString('es-CL')}
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500">Precio</p>
                                <p className="text-xl font-bold text-brand-calypso">
                                    ${price.toLocaleString('es-CL')}
                                </p>
                            </>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 ${isEnrolled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-brand-calypso text-white hover:bg-opacity-90'
                            }`}
                    >
                        {isEnrolled && <PlayCircle className="w-4 h-4" />}
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
