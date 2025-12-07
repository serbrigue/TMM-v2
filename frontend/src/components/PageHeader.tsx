import React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
    return (
        <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-bold text-tmm-black mb-4">{title}</h1>
            <p className="text-xl text-tmm-black/60 max-w-2xl mx-auto">
                {description}
            </p>
        </div>
    );
};

export default PageHeader;
