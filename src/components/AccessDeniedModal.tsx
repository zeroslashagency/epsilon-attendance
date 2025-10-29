import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock } from 'lucide-react';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  userEmail
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="access-denied-description">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-red-600">
            Access Denied
          </DialogTitle>
          <DialogDescription id="access-denied-description" className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">You're not allowed in the attendance section</span>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                Your account <strong>{userEmail}</strong> does not have permission to access the attendance system.
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                Contact your administrator to request access to the attendance section.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-8"
          >
            OK, I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
