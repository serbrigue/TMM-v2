import React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
    return (
        <div className="text-center mb-16">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {description}
            </p>
        </div>
    );
};

export default PageHeader;
