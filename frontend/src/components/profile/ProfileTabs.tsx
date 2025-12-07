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
        <div className="flex overflow-x-auto border-b border-tmm-pink/20 scrollbar-hide">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'border-b-2 border-tmm-pink text-tmm-black bg-tmm-pink/10'
                        : 'text-tmm-black/60 hover:text-tmm-black hover:bg-tmm-pink/5'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default ProfileTabs;
