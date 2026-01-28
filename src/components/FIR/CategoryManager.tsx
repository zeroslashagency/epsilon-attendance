import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Plus, Trash2, Loader2 } from 'lucide-react';

interface CategoryItem {
    id: number;
    name: string;
    type: 'GOOD' | 'BAD';
}

export function CategoryManager() {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [activeTab, setActiveTab] = useState<'GOOD' | 'BAD'>('GOOD');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('report_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setAdding(true);
        const { error } = await supabase
            .from('report_categories')
            .insert([{ name: newCategory.trim(), type: activeTab }]);

        if (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category');
        } else {
            setNewCategory('');
            fetchCategories();
        }
        setAdding(false);
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        const { error } = await supabase
            .from('report_categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        } else {
            fetchCategories();
        }
    };

    const filteredCategories = categories.filter(c => c.type === activeTab);

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Category Management</h1>
                <p className="text-muted-foreground">Manage the list of available categories for reports.</p>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('GOOD')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${activeTab === 'GOOD' ? 'bg-green-500/10 text-green-600 border-b-2 border-green-500' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        <CheckCircle size={18} />
                        Positive Categories
                    </button>
                    <button
                        onClick={() => setActiveTab('BAD')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${activeTab === 'BAD' ? 'bg-destructive/10 text-destructive border-b-2 border-destructive' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        <XCircle size={18} />
                        Negative Categories
                    </button>
                </div>

                <div className="p-6">
                    {/* Add New Form */}
                    <form onSubmit={handleAddCategory} className="flex gap-3 mb-8">
                        <input
                            type="text"
                            placeholder={`Add new ${activeTab === 'GOOD' ? 'positive' : 'negative'} category...`}
                            className="flex-1 px-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={adding || !newCategory.trim()}
                            className={`px-6 py-2 text-white font-medium rounded-lg shadow-sm transition-all flex items-center gap-2
                ${activeTab === 'GOOD' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
                ${(adding || !newCategory.trim()) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                        >
                            {adding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            Add
                        </button>
                    </form>

                    {/* List */}
                    {loading ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <Loader2 className="animate-spin mx-auto mb-2" />
                            Loading categories...
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                            No categories found. Add one above!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredCategories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg group hover:border-primary/50 transition-colors">
                                    <span className="font-medium text-foreground">{cat.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete category"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
