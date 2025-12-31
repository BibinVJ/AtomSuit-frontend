'use client';

import { Setting } from '../../types';
import SettingField from './SettingField';

interface Props {
  groupName: string;
  settings: Setting[];
  onUpdate: () => void;
}

export default function SettingsGroup({ settings, onUpdate }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((setting) => (
          <SettingField key={setting.id} setting={setting} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}
