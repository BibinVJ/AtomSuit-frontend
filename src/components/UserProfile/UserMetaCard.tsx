import {
  Facebook,
  Instagram,
  Linkedin,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { User } from "../../types";
import { formatKebabCase } from "../../utils/string";

interface UserMetaCardProps {
  user: User | null;
  onEditSocials: () => void;
  onEditImage: () => void;
}

export default function UserMetaCard({
  user,
  onEditSocials,
  onEditImage,
}: UserMetaCardProps) {
  const getSocialLink = (platform: string) => {
    if (!user?.social_links || !Array.isArray(user.social_links)) {
      return undefined;
    }
    return user.social_links.find((link) => link.platform === platform)?.url;
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="relative">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                src={user?.profile_image || "/images/user/default.jpg"}
                alt={user?.name || "user"}
                width={80}
                height={80}
              />
            </div>
            <button
              onClick={onEditImage}
              className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full shadow-sm hover:bg-gray-50 hover:border-brand-400 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-brand-400"
            >
              <Pencil className="w-4 h-4 text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400" />
            </button>
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user?.name}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.role ? formatKebabCase(user.role.name) : "role"}
              </p>
            </div>
          </div>

          <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
            <a
              href={getSocialLink("facebook") || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700 dark:hover:border-blue-400"
            >
              <Facebook size={20} />
            </a>

            <a
              href={getSocialLink("linkedin") || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700 dark:hover:border-blue-400"
            >
              <Linkedin size={20} />
            </a>

            <a
              href={getSocialLink("instagram") || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-pink-600 hover:bg-pink-50 hover:border-pink-300 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-pink-400 dark:hover:bg-gray-700 dark:hover:border-pink-400"
            >
              <Instagram size={20} />
            </a>

          </div>
        </div>

        <button
          onClick={onEditSocials}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 border border-brand-300 text-white px-4 py-3 text-sm font-medium hover:bg-brand-600 hover:border-brand-400 transition-colors duration-200 lg:inline-flex lg:w-auto dark:bg-brand-500 dark:border-brand-600 dark:hover:bg-brand-400 dark:hover:border-brand-500"
        >
          <Pencil size={18} />
          Edit Socials
        </button>
      </div>
    </div>
  );
}