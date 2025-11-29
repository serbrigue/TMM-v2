import React from 'react';

interface Tab {
    id: string;
    label: string;
}

interface ProfileTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'border-b-2 border-brand-calypso text-brand-calypso bg-brand-calypso/5'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default ProfileTabs;
