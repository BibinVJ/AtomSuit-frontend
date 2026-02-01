'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { User } from '@/types';
import { updateSocialLinks } from '@/services/ProfileService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { isApiError } from '@/utils/errors';

interface EditSocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface SocialLinksData {
  facebook: string;
  x: string;
  linkedin: string;
}

export default function EditSocialLinksModal({ isOpen, onClose, user }: EditSocialLinksModalProps) {
  const { fetchProfile } = useAuth();
  const [formData, setFormData] = useState<SocialLinksData>({
    facebook: '',
    x: '',
    linkedin: '',
  });

  useEffect(() => {
    if (user && user.social_links && Array.isArray(user.social_links)) {
      setFormData({
        facebook: user.social_links.find((link) => link.platform === 'facebook')?.url || '',
        x: user.social_links.find((link) => link.platform === 'x')?.url || '',
        linkedin: user.social_links.find((link) => link.platform === 'linkedin')?.url || '',
      });
    } else {
      // Reset form data if user doesn't have social_links
      setFormData({
        facebook: '',
        x: '',
        linkedin: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const social_links = Object.entries(formData)
        .map(([platform, url]) => ({ platform, url }))
        .filter((link) => link.url);

      const response = await updateSocialLinks({ social_links });
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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Social Links
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your social media links.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Facebook</Label>
                <Input name="facebook" value={formData.facebook} onChange={handleChange} />
              </div>
              <div>
                <Label>X</Label>
                <Input name="x" value={formData.x} onChange={handleChange} />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input name="linkedin" value={formData.linkedin} onChange={handleChange} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
