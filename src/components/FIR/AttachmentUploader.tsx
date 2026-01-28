import React from 'react';
import { Camera, Mic, Paperclip, X } from './Icons';
import { AudioPlayer } from './AudioPlayer';
import { AudioRecorder } from './AudioRecorder';
import { Attachment } from '@/types/fir';

interface AttachmentUploaderProps {
    attachments: Attachment[];
    onRemove: (id: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAudioSave: (file: File) => void;
}

export function AttachmentUploader({
    attachments,
    onRemove,
    onFileUpload,
    onAudioSave
}: AttachmentUploaderProps) {
    return (
        <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Evidence
            </label>

            {/* Attachment List */}
            {attachments.length > 0 && (
                <div className="space-y-2 mb-3">
                    {attachments.map(att => (
                        <AttachmentItem
                            key={att.id}
                            attachment={att}
                            onRemove={() => onRemove(att.id)}
                        />
                    ))}
                </div>
            )}

            {/* Upload Buttons */}
            <div className="flex gap-2">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/70 rounded-lg text-foreground text-sm transition">
                    <Camera size={16} />
                    <span>Photo</span>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={onFileUpload}
                    />
                </label>

                <AudioRecorder onSave={onAudioSave} />
            </div>
        </div>
    );
}

// Individual Attachment Item
interface AttachmentItemProps {
    attachment: Attachment;
    onRemove: () => void;
}

function AttachmentItem({ attachment, onRemove }: AttachmentItemProps) {
    return (
        <div className="relative group border border-border rounded-lg p-2 bg-muted/30 flex items-center gap-3">
            {attachment.type === 'image' ? (
                <div className="h-12 w-12 shrink-0 bg-muted rounded overflow-hidden">
                    <img src={attachment.url} alt="thumb" className="h-full w-full object-cover" />
                </div>
            ) : attachment.type === 'audio' ? (
                <div className="flex items-center gap-2 w-full">
                    <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Mic size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <AudioPlayer src={attachment.url} />
                    </div>
                </div>
            ) : (
                <div className="h-12 w-12 shrink-0 bg-muted rounded flex items-center justify-center">
                    <Paperclip size={20} className="text-muted-foreground" />
                </div>
            )}

            {/* Delete Button */}
            <button
                type="button"
                onClick={onRemove}
                className="ml-auto p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition"
                title="Delete attachment"
            >
                <X size={16} />
            </button>
        </div>
    );
}
