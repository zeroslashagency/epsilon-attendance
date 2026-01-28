import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader2, Camera, Paperclip, Mic, ChevronRight, X } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { AudioPlayer } from './AudioPlayer';
import { Priority, Attachment, User } from '@/types/fir';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { JollySelect, SelectItem } from "@/components/ui/select";

interface Employee {
    id: number;
    employee_name: string;
    employee_code: string;
}

interface CategoryItem {
    id: number;
    name: string;
    type: 'GOOD' | 'BAD';
}

interface FARModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'GOOD' | 'BAD' | null;
    onReportSubmitted?: () => void;
    currentUser: User | null;
}

export function FARModal({ isOpen, onClose, type, onReportSubmitted, currentUser }: FARModalProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Workflow State
    const [step, setStep] = useState<'SELECT_EMPLOYEE' | 'FILL_FORM'>('SELECT_EMPLOYEE');

    // Form Data
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>('');
    const [priority, setPriority] = useState<Priority>(Priority.Low);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            fetchCategories();
            resetForm();
        }
    }, [isOpen, type]);

    const resetForm = () => {
        setStep('SELECT_EMPLOYEE');
        setSelectedEmployeeId('');
        setTitle('');
        setDescription('');
        setAttachments([]);
        setMessage(null);
        setCategory(''); // Will be set after categories load
    };

    const fetchEmployees = async () => {
        setLoadingEmployees(true);
        const { data, error } = await supabase
            .from('employee_master')
            .select('id, employee_name, employee_code')
            .order('employee_name');

        if (error) {
            console.error('Error fetching employees:', error);
            setMessage({ type: 'error', text: 'Failed to load employees.' });
        } else {
            setEmployees(data || []);
        }
        setLoadingEmployees(false);
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('report_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
        } else {
            setCategories(data || []);
            // Set default category if available
            if (data && data.length > 0 && type) {
                const firstMatch = data.find((c: CategoryItem) => c.type === type);
                if (firstMatch) {
                    setCategory(firstMatch.name);
                }
            }
        }
    };

    const handleEmployeeSelect = (empId: string) => {
        setSelectedEmployeeId(empId);
        setStep('FILL_FORM');
        // Ensure category is set if not already
        if (!category && categories.length > 0 && type) {
            const firstMatch = categories.find(c => c.type === type);
            if (firstMatch) setCategory(firstMatch.name);
        }
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('attachments')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            setMessage({ type: 'error', text: 'Failed to upload file.' });
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const publicUrl = await uploadFile(file);

            if (publicUrl) {
                const newAtt: Attachment = {
                    id: `att_${Date.now()}`,
                    name: file.name,
                    type: file.type.startsWith('image') ? 'image' : 'document',
                    url: publicUrl
                };
                setAttachments([...attachments, newAtt]);
            }
        }
    };

    const handleAudioSave = async (file: File) => {
        const publicUrl = await uploadFile(file);

        if (publicUrl) {
            const newAtt: Attachment = {
                id: `audio_${Date.now()}`,
                name: "Voice Note",
                type: 'audio',
                url: publicUrl
            };
            setAttachments([...attachments, newAtt]);
        }
    };

    const handleSubmit = async (e?: any) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!type || !selectedEmployeeId) return;

        setSubmitting(true);
        setMessage(null);

        const { error } = await supabase
            .from('fir_activity')
            .insert([
                {
                    employee_id: parseInt(selectedEmployeeId),
                    fir_type: type,
                    title: title,
                    category: category,
                    priority: priority,
                    description: description,
                    attachments: attachments,
                    status: 'NEW',
                    created_by: currentUser?.name || 'Unknown User',
                    submitted_person_id: currentUser?.id,
                }
            ]);

        setSubmitting(false);

        if (error) {
            console.error('Error submitting FIR:', error);
            setMessage({ type: 'error', text: 'Failed to submit report. Please try again.' });
        } else {
            setMessage({ type: 'success', text: 'Report submitted successfully!' });
            if (onReportSubmitted) {
                onReportSubmitted();
            }
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    const handleClose = () => {
        onClose();
    };

    return (
        <DialogOverlay
            isOpen={isOpen}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${type === 'GOOD' ? 'text-green-600' : 'text-red-600'}`}>
                        {type === 'GOOD' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        {type === 'GOOD' ? 'Income Producing Activity' : 'Income Reducing Activity'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 py-4">
                    {step === 'SELECT_EMPLOYEE' ? (
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Select Employee</h4>
                            {loadingEmployees ? (
                                <div className="flex items-center justify-center py-10 text-muted-foreground">
                                    <Loader2 className="animate-spin mr-2" /> Loading employees...
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                    {employees.map(emp => (
                                        <Button
                                            key={emp.id}
                                            variant="outline"
                                            className="w-full justify-between h-auto py-3 px-4"
                                            onPress={() => handleEmployeeSelect(emp.id.toString())}
                                        >
                                            <div className="text-left">
                                                <div className="font-semibold text-foreground">{emp.employee_name}</div>
                                                <div className="text-xs text-muted-foreground">{emp.employee_code}</div>
                                            </div>
                                            <ChevronRight className="text-muted-foreground h-4 w-4" />
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {message && (
                                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">What happened?</Label>
                                <Input
                                    id="title"
                                    placeholder="Short title (e.g., Missed safety step)"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <JollySelect
                                    label="Category"
                                    items={filteredCategories}
                                    selectedKey={category}
                                    onSelectionChange={(key) => setCategory(key as string)}
                                >
                                    {(item) => <SelectItem id={item.name}>{item.name}</SelectItem>}
                                </JollySelect>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    placeholder="Provide details..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Evidence */}
                            <div className="space-y-2">
                                <Label>Evidence</Label>
                                <div className="space-y-2 mb-3">
                                    {attachments.map(att => (
                                        <div key={att.id} className="relative group border border-border rounded-lg p-2 bg-muted/50 flex items-center gap-3">
                                            {att.type === 'image' ? (
                                                <div className="h-12 w-12 shrink-0 bg-muted rounded overflow-hidden">
                                                    <img src={att.url} alt="thumb" className="h-full w-full object-cover" />
                                                </div>
                                            ) : att.type === 'audio' ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                                        <Mic size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        {/* Simple audio hint instead of full player for compact modal */}
                                                        <span className="text-xs font-medium">Voice Note</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 shrink-0 bg-muted rounded flex items-center justify-center">
                                                    <Paperclip size={20} className="text-muted-foreground" />
                                                </div>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onPress={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <label className="cursor-pointer">
                                        <div className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
                                            <Camera size={16} />
                                            <span>Photo</span>
                                        </div>
                                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                    {/* Audio Recorder handling might need adjustment to fit button patterns */}
                                    <div className="inline-block">
                                        <AudioRecorder onSave={handleAudioSave} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'FILL_FORM' && (
                        <Button
                            variant="ghost"
                            onPress={() => setStep('SELECT_EMPLOYEE')}
                            className="mr-auto"
                        >
                            Back
                        </Button>
                    )}
                    <Button variant="outline" onPress={handleClose}>
                        Cancel
                    </Button>
                    {step === 'FILL_FORM' && (
                        <Button
                            onPress={handleSubmit}
                            isDisabled={submitting}
                            className={type === 'GOOD' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                        >
                            {submitting ? 'Saving...' : 'Submit Report'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </DialogOverlay>
    );
}
