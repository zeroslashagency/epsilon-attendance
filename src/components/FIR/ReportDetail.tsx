import React, { useState } from 'react';
import {
    Report, ReportStatus, Priority,
    User, Attachment
} from '../../services/fir/types';
import {
    CheckCircle2,
    Clock, Mic, FileText, XCircle, ShieldCheck, RotateCcw,
    Camera, Paperclip, X, User as UserIcon
} from 'lucide-react';
import { USER_ROLES } from '@/config/roles';
import { reportService } from '../../services/fir/reportService';
import { AudioPlayer } from './AudioPlayer';
import { supabase } from '@/lib/supabase';
import { AudioRecorder } from './AudioRecorder';
import { MessageTimeline } from './MessageTimeline';

interface ReportDetailProps {
    report: Report;
    onUpdate: (updatedReport: Report) => void;
    currentUser: User;
}

const PriorityBadge = ({ priority }: { priority: Priority }) => {
    const colors = {
        [Priority.High]: 'bg-red-100 text-red-700 border-red-200',
        [Priority.Medium]: 'bg-orange-100 text-orange-700 border-orange-200',
        [Priority.Low]: 'bg-green-100 text-green-700 border-green-200',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colors[priority]}`}>{priority}</span>;
};

const WorkflowStepper = ({ report, currentUser }: { report: Report, currentUser: User }) => {
    // Define steps with dynamic labels
    const steps = [
        {
            id: ReportStatus.Reported,
            label: 'Submitted By',
            name: report.reporter.name
        },
        {
            id: ReportStatus.PersonResponse,
            label: 'Assigned By',
            name: report.assignedTo?.name || report.currentOwner.name
        },
        {
            id: ReportStatus.SuperAdminReview,
            label: 'Reviewed By',
            name: report.stage3?.by || 'Super Admin'
        },
        {
            id: ReportStatus.Closed,
            label: 'Closed By',
            name: report.closed_by || ''
        }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === report.status);
    const level = currentStepIndex !== -1 ? currentStepIndex + 1 : (report.status === ReportStatus.Closed ? 4 : 1);

    return (
        <div className="flex items-center w-full mb-6 overflow-x-auto pt-2">
            {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = stepNum === level;
                const isCompleted = stepNum < level || report.status === ReportStatus.Closed;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center relative z-10 min-w-[100px]">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 mb-1
                ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' :
                                    isActive ? 'bg-background border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                                {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                            </div>

                            <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                            <span className={`text-xs font-semibold truncate max-w-[90px] ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.name}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 -mt-6 transition-colors duration-300 min-w-[20px] ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export const ReportDetail: React.FC<ReportDetailProps> = ({ report, onUpdate, currentUser }) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [responseAttachments, setResponseAttachments] = useState<Attachment[]>([]);
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (file: File): Promise<string | null> => {
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('attachments')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
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
                setResponseAttachments(prev => [...prev, newAtt]);
            }
        }
    };

    const handleAudioSave = async (file: File) => {
        const publicUrl = await uploadFile(file);
        if (publicUrl) {
            const newAtt: Attachment = {
                id: `att_${Date.now()}`,
                name: 'Voice Note',
                type: 'audio',
                url: publicUrl
            };
            setResponseAttachments(prev => [...prev, newAtt]);
        }
    };

    const removeAttachment = (id: string) => {
        setResponseAttachments(prev => prev.filter(a => a.id !== id));
    };

    // Stage 2: Person Response
    const handleResponse = async (accepted: boolean) => {
        if (!accepted && !comment.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        setIsSubmitting(true);
        try {
            await reportService.submitResponse(report.id, accepted, comment, responseAttachments);
            const updated = await reportService.getReportById(report.id);
            if (updated) onUpdate(updated);
            setComment('');
            setResponseAttachments([]);
            setShowRejectInput(false);
        } catch (e) {
            console.error(e);
            alert('Failed to submit response');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Stage 3: Admin Review
    const handleAdminReview = async (decision: 'CONFIRM' | 'SEND_BACK') => {
        if (decision === 'SEND_BACK' && !comment.trim()) {
            alert('Please provide a reason for sending back.');
            return;
        }

        setIsSubmitting(true);
        try {
            await reportService.adminReview(report.id, decision, comment, currentUser);
            const updated = await reportService.getReportById(report.id);
            if (updated) onUpdate(updated);
            setComment('');
        } catch (e) {
            console.error(e);
            alert('Failed to review report');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check permissions
    const canRespond = report.status === ReportStatus.PersonResponse || report.status === ReportStatus.Reported;
    const canAdminReview = report.status === ReportStatus.SuperAdminReview && currentUser.role === USER_ROLES.SUPER_ADMIN;

    return (
        <div className="flex flex-col h-full bg-background md:rounded-l-none md:rounded-r-2xl overflow-hidden shadow-xl md:shadow-none">
            {/* Header */}
            <div className="p-6 border-b bg-background border-border sticky top-0 z-20">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-muted-foreground">{report.id.substring(0, 8)}...</span>
                            <PriorityBadge priority={report.priority} />
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded text-xs font-medium">{report.category}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground leading-tight">{report.title}</h1>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <div className={`text-sm font-bold ${report.status === ReportStatus.Closed ? 'text-status-present' : 'text-primary'
                            }`}>
                            {report.status}
                        </div>
                    </div>
                </div>

                <WorkflowStepper report={report} currentUser={currentUser} />

                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <UserIcon size={16} />
                        <span>Created By: <strong className="text-foreground">{report.reporter.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/20">

                {/* Description & Media */}
                <section className="bg-background p-5 rounded-xl shadow-sm border border-border">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{report.description}</p>

                    {report.attachments.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {report.attachments.map(att => (
                                <div
                                    key={att.id}
                                    className={`relative group rounded-lg overflow-hidden flex items-center justify-center
                                    ${att.type === 'audio'
                                            ? 'col-span-2 md:col-span-3 w-full bg-transparent p-0'
                                            : 'border border-border aspect-square bg-muted'
                                        }`}
                                >
                                    {att.type === 'image' ? (
                                        <img src={att.url} alt={att.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : att.type === 'audio' ? (
                                        <div className="w-full">
                                            <AudioPlayer src={att.url} />
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground flex flex-col items-center">
                                            <FileText size={24} className="mb-2" />
                                            <span className="text-xs">Document</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Chat / Timeline */}
                <MessageTimeline reportId={report.id} currentUser={currentUser} />

                {/* Responses & Decisions */}
                {(report.response_comment || report.final_decision || report.status === ReportStatus.Closed) && (
                    <section className="bg-background p-5 rounded-xl shadow-sm border border-border space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-1">Workflow Activity</h3>

                        {report.response_comment && (
                            <div className="p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-xs uppercase text-blue-700 dark:text-blue-400">Person Response</span>
                                </div>
                                <p className="text-sm text-foreground mt-1">{report.response_comment}</p>

                                {report.response_attachments && report.response_attachments.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {report.response_attachments.map(att => (
                                            <div key={att.id} className="relative group rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800 bg-background">
                                                {att.type === 'image' ? (
                                                    <img src={att.url} alt={att.name} className="w-full h-32 object-cover" />
                                                ) : att.type === 'audio' ? (
                                                    <div className="p-2">
                                                        <AudioPlayer src={att.url} />
                                                    </div>
                                                ) : (
                                                    <div className="p-4 flex items-center gap-2 text-muted-foreground">
                                                        <Paperclip size={16} />
                                                        <span className="text-xs truncate">{att.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {report.final_decision && (
                            <div className={`p-3 rounded-lg border ${report.final_decision === 'CONFIRMED' ? 'bg-status-present/10 border-status-present/20' : 'bg-status-high/10 border-status-high/20'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold text-xs uppercase ${report.final_decision === 'CONFIRMED' ? 'text-status-present' : 'text-status-high'}`}>
                                        Admin Decision: {report.final_decision}
                                    </span>
                                    <span className="text-xs text-muted-foreground">by {report.closed_by}</span>
                                </div>
                                {report.stage3?.notes && <p className="text-sm text-foreground mt-1">{report.stage3.notes}</p>}
                            </div>
                        )}

                        {report.status === ReportStatus.Closed && (
                            <div className="p-3 rounded-lg border bg-muted/30 border-border flex items-center justify-center">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 size={18} className="text-status-present" />
                                    <span className="font-bold text-sm uppercase tracking-wide">Ticket Closed</span>
                                    {report.closed_at && <span className="text-xs text-muted-foreground/60">• {new Date(report.closed_at).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        )}
                    </section>
                )}

            </div>

            {/* Footer Action Area - Only show if user needs to take action */}
            {report.status !== ReportStatus.Closed && (
                (report.status === ReportStatus.PersonResponse && (report.assignedTo.id === currentUser.id || report.assignedTo.name === currentUser.name)) ||
                (report.status === ReportStatus.SuperAdminReview && currentUser.role === USER_ROLES.SUPER_ADMIN) ||
                (report.status === ReportStatus.Reported && (report.assignedTo.id === currentUser.id || report.assignedTo.name === currentUser.name))
            ) && (
                    <div className="p-4 bg-background border-t border-border sticky bottom-0 z-20">
                        <div className="flex gap-2 mb-3 flex-col">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={showRejectInput ? "Reason for rejection (Required)..." : "Add a note..."}
                                className={`w-full px-3 py-2 bg-muted/30 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none h-20 transition-colors text-foreground placeholder-muted-foreground
                 ${showRejectInput ? 'border-status-absent/30 bg-status-absent/5 focus:ring-status-absent/40' : 'border-border'}`}
                            />

                            {showRejectInput && (
                                <div className="space-y-3">
                                    <div className="flex gap-2 overflow-x-auto py-2">
                                        {responseAttachments.map(att => (
                                            <div key={att.id} className="relative flex-shrink-0 w-20 h-20 bg-muted rounded-lg border border-border flex items-center justify-center group">
                                                {att.type === 'image' ? (
                                                    <img src={att.url} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <Mic size={20} className="text-muted-foreground" />
                                                )}
                                                <button
                                                    onClick={() => removeAttachment(att.id)}
                                                    className="absolute -top-2 -right-2 bg-status-absent text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <AudioRecorder onSave={handleAudioSave} />

                                        <label className="cursor-pointer p-2 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground transition-colors">
                                            <Camera size={20} />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end items-center gap-2">

                            {/* Stage 2: Person Response */}
                            {canRespond && (
                                <>
                                    {showRejectInput ? (
                                        <>
                                            <button
                                                onClick={() => setShowRejectInput(false)}
                                                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleResponse(false)}
                                                disabled={isSubmitting || !comment.trim()}
                                                className="px-4 py-2 bg-status-absent text-white hover:bg-status-absent/90 rounded-lg text-sm font-semibold shadow-md"
                                            >
                                                Confirm Reject
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setShowRejectInput(true)}
                                                disabled={isSubmitting}
                                                className="px-4 py-2 bg-status-absent/10 text-status-absent hover:bg-status-absent/20 border border-status-absent/20 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleResponse(true)}
                                                disabled={isSubmitting}
                                                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={16} /> Accept
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Stage 3: Admin Review */}
                            {canAdminReview && (
                                <>
                                    <button
                                        onClick={() => handleAdminReview('SEND_BACK')}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-status-high/10 text-status-high hover:bg-status-high/20 border border-status-high/20 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                                    >
                                        <RotateCcw size={16} /> Send Back
                                    </button>
                                    <button
                                        onClick={() => handleAdminReview('CONFIRM')}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-status-low text-white hover:bg-status-low/90 shadow-md rounded-lg text-sm font-semibold transition flex items-center gap-2"
                                    >
                                        <ShieldCheck size={16} /> Confirm & Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
};
