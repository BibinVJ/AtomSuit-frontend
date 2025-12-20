'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { updateProfileImage, deleteProfileImage } from '../../services/ProfileService';
import { useAuth } from '../../hooks/useAuth';
import FileInput from '../form/input/FileInput';
import { toast } from 'sonner';
import { isApiError } from '../../utils/errors';

interface EditProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileImageModal({ isOpen, onClose }: EditProfileImageModalProps) {
  const { fetchProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (file) {
      try {
        const response = await updateProfileImage(file);
        toast.success(response.message);
        fetchProfile();
        onClose();
      } catch (error) {
        if (isApiError(error)) {
          toast.error(error.response?.data?.message);
        } else {
          toast.error('An unexpected error occurred.');
        }
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteProfileImage();
      toast.success(response.message);
      fetchProfile();
      onClose();
    } catch (error) {
      if (isApiError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Profile Image
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Upload a new profile image or delete the current one.
          </p>
        </div>
        <div className="flex flex-col">
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <FileInput ref={fileInputRef} onChange={handleFileChange} />
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={!file}>
              Upload
            </Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
