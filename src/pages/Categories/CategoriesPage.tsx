import React from 'react';
import { CategoryManager } from '@/components/FIR/CategoryManager';
import { useAuth } from '@/hooks/useAuth';

const CategoriesPage: React.FC = () => {
    const { role } = useAuth();

    if (role !== 'Super Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <h2 className="text-xl font-bold mb-2 text-foreground">Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-muted/30">
            <CategoryManager />
        </div>
    );
};

export default CategoriesPage;
