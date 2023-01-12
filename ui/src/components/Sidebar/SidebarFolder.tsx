import React, { useEffect } from 'react';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import { GroupFolder } from './SidebarGroupSorter';
import { GroupItem } from './GroupListChildren';
import SidebarItem from './SidebarItem';
import useIsGroupUnread from '@/logic/useIsGroupUnread';
import ActivityIndicator from './ActivityIndicator';

interface SidebarFolderProps {
  folder: GroupFolder;
  focusUnread: boolean;
  toggleCollapse: () => void;
}

export default function SidebarFolder({
  folder,
  toggleCollapse,
  focusUnread,
  ...props
}: SidebarFolderProps) {
  // const { unseen } = useHarkState();
  // const { theme } = useThemeWatcher();
  const collapsed = Boolean(folder.collapsed);
  const { getUnreadCount } = useIsGroupUnread();

  const { unreadCount, hasNotification, hasGroupSelected } = folder.groups.reduce((acc, groupFlag) => {
    const groupSelected = false;
    const { unreadCount, hasNotification } = getUnreadCount(groupFlag); // eslint-disable-line

    return {
      unreadCount: acc.unreadCount + unreadCount,
      hasNotification: acc.hasNotification || hasNotification,
      hasGroupSelected: acc.hasGroupSelected || groupSelected
    };
  }, { unreadCount: 0, hasNotification: false, hasGroupSelected: false });

  useEffect(() => {
    if (hasGroupSelected && collapsed) {
      toggleCollapse();
    }
  }, [hasGroupSelected]); // eslint-disable-line

  if (focusUnread && !hasGroupSelected && unreadCount === 0) {
    return null;
  }

  const folderClasses = "h-4 w-4";
  const folderIcon = <div className="p-2" style={{ margin: '-0.5em -1em -0.5em -0.25em' }}>
    {collapsed ?
    <FaFolder className={folderClasses} /> :
    <FaFolderOpen className={folderClasses} />}
  </div>;

  return (
    <div className='position-relative'>
      <SidebarItem
        className='pl-1'
        to={''}
        title={folder.folder}
        onClick={toggleCollapse}
        icon={folderIcon}
        actions={unreadCount ? <ActivityIndicator count={unreadCount} /> : null}
      >
        <div className='display-block pl-1' style={{ fontSize: 13 }}
          onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCollapse();
          }}
        >
          {folder.folder}
        </div>
      </SidebarItem>
      {!collapsed && (
        <div className='position-relative z-0 pl-5'>
          {folder.groups.map((flag) => {
            // if (group === 'My Channels') {
            //   return <GroupItem key={group} {...props} workspace={{ type: 'home' }} />;
            // } else if (group === 'My Apps') {
            //   return <MyApps {...props} />;
            // }

            if (!flag)
              return null;

            return <GroupItem key={flag} flag={flag} focusUnread={focusUnread} />;
          })}
        </div>
      )}
    </div>
  );
}
