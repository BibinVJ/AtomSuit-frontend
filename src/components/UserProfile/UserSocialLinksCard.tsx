import { User } from "../../types";
import { PencilIcon } from "../../icons";

interface UserSocialLinksCardProps {
  user: User | null;
  onEdit: () => void;
}

export default function UserSocialLinksCard({
  user,
  onEdit,
}: UserSocialLinksCardProps) {
  const getSocialLink = (platform: string) => {
    return user?.social_links.find((link) => link.platform === platform)?.url;
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl custom-card-bg dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Social Links
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Facebook
              </p>
              <a
                href={getSocialLink("facebook") || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                {getSocialLink("facebook") || "-"}
              </a>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                X
              </p>
              <a
                href={getSocialLink("x") || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                {getSocialLink("x") || "-"}
              </a>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                LinkedIn
              </p>
              <a
                href={getSocialLink("linkedin") || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-800 dark:text-white/90"
              >
                {getSocialLink("linkedin") || "-"}
              </a>
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="flex w-full items-center justify-center gap-2 rounded-full custom-primary-btn px-4 py-3 text-sm font-medium lg:inline-flex lg:w-auto"
        >
          <PencilIcon className="fill-current"
            width="18"
            height="18"/>
          Edit
        </button>
      </div>
    </div>
  );
}
