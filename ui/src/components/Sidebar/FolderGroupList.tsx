import cn from 'classnames';
import React, { useCallback, useEffect, useMemo } from 'react';
import { uniq } from 'lodash';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-beautiful-dnd';
import { useIsMobile } from '@/logic/useMedia';
import { useGangList, useGroupsInitialized } from '@/state/groups/groups';
import { useSettingsState } from '@/state/settings';
import { Group } from '@/types/groups';
import GroupListPlaceholder from './GroupListPlaceholder';
import { GroupOrder, SidebarGroupSorter } from './SidebarGroupSorter';
import { DraggableGroupItem, GangItem, GroupItem, GroupItemContainer, selOrderedPins } from './GroupListChildren';
import SidebarFolder from './SidebarFolder';

interface GroupListProps {
  className?: string;
  pinned?: boolean;
  groups: [string, Group][];
  pinnedGroups: [string, Group][];
  organizing: boolean;
  focusUnread: boolean;
  groupOrder: GroupOrder;
  saveGroupOrder: (groupOrder: GroupOrder) => void;
}

export default function FolderGroupList({
  className,
  pinned = false,
  groups,
  pinnedGroups,
  organizing,
  focusUnread,
  groupOrder,
  saveGroupOrder,
}: GroupListProps) {
  const isMobile = useIsMobile();
  const gangs = useGangList();
  const initialized = useGroupsInitialized();
  const { order, loaded } = useSettingsState(selOrderedPins);

  useEffect(() => {
    const hasKeys = order && !!order.length;
    const pinnedKeys = Object.keys(pinnedGroups);
    const hasPinnedKeys = pinnedKeys.length > 0;

    if (!loaded) {
      return;
    }

    // Correct order state, fill if none, remove duplicates, and remove
    // old uninstalled app keys
    if (!hasKeys && hasPinnedKeys) {
      useSettingsState
        .getState()
        .putEntry('groups', 'orderedGroupPins', pinnedKeys);
    } else if (order.length < pinnedKeys.length) {
      useSettingsState
        .getState()
        .putEntry('groups', 'orderedGroupPins', uniq(order.concat(pinnedKeys)));
    } else if (order.length > pinnedKeys.length && hasPinnedKeys) {
      useSettingsState
        .getState()
        .putEntry(
          'groups',
          'orderedGroupPins',
          uniq(order.filter((key: string) => key in pinnedGroups).concat(pinnedKeys))
        );
    }
  }, [pinnedGroups, order, loaded]);

  const groupList = groups
    .filter(
      ([flag, _group]) => !pinnedGroups.map(([f, _]) => f).includes(flag)
    )
    .map(([flag]) => flag);

  const fullGroupList = useMemo(() => {
    const sortedGroups = groupOrder.reduce((acc: string[], cur) => {
      if (cur && typeof cur !== 'string') {
        return acc.concat(cur.groups);
      }
      if (typeof cur === 'string') {
        return acc.concat([cur]);
      }
      return acc;
    }, []);

    const missingGroups: GroupOrder = groupList.filter(g => !sortedGroups.includes(g) && !pinnedGroups.find(([n]) => n === g));
    // if (!sortedGroups.includes('My Channels')) {
    //   missingGroups.push('My Channels');
    // }
    // if (!sortedGroups.includes('My Apps')) {
    //   missingGroups.push('My Apps');
    // }

    return missingGroups.concat(groupOrder);
  }, [groupList, groupOrder, pinnedGroups]);

  const handleDragAndDrop = useCallback(({ source, destination }) => {
    if (!destination)
      return;
    // Do nothing if trying to put a folder inside a folder
    if (source.droppableId === 'groups' && destination.droppableId !== 'groups' && typeof fullGroupList[source.index] !== 'string')
      return;

    const items = Array.from(fullGroupList);
    let reorderedItem;
    if (source.droppableId === 'groups') {
      reorderedItem = items.splice(source.index, 1)[0]; // eslint-disable-line prefer-destructuring
    } else {
      const folder = items.find(go => go && typeof go !== 'string' && go.folder === source.droppableId);

      if (typeof folder !== 'string') {
        reorderedItem = folder?.groups.splice(source.index, 1)[0]; // eslint-disable-line prefer-destructuring
      } else {
        return;
      }
    }

    if (!reorderedItem)
      return;
      
    if (destination.droppableId === 'groups') {
      items.splice(destination.index, 0, reorderedItem);
    } else {
      const folder = items.find(go => go && typeof go !== 'string' && go.folder === destination.droppableId);

      if (typeof folder !== 'string') {
        folder?.groups.splice(destination.index, 0, reorderedItem as string);
      } else {
        return;
      }
    }

    saveGroupOrder(items);
  }, [fullGroupList, saveGroupOrder]);

  const deleteFolder = useCallback((folder: string) => {
    if (window.confirm('Are you sure you want to delete this folder? The groups will be moved to the bottom of the main list.')) {
      let deezGroups: string[] = [];
      const newOrder = fullGroupList.filter((go) => {
        if (go && typeof go !== 'string' && go.folder === folder) {
          deezGroups = go.groups;
          return false;
        }
        return true;
      });
      newOrder.concat(deezGroups);
      saveGroupOrder(newOrder);
    }
  }, [fullGroupList, saveGroupOrder]);

  const toggleCollapse = useCallback((folder: string) => () => {
    const newOrder = fullGroupList.map((go) => {
      if (go && typeof go !== 'string' && go.folder === folder) {
        return { ...go, collapsed: !go.collapsed };
      }
      return go;
    });
    saveGroupOrder(newOrder);
  }, [fullGroupList, saveGroupOrder]);

  if (!initialized) {
    return <GroupListPlaceholder count={groups.length || 5} />;
  }

  if (organizing) {
    const groupsToSort = fullGroupList.length ? fullGroupList : ['My Channels', 'My Apps'].concat(groupList);
    return <DragDropContext onDragEnd={handleDragAndDrop}>
      <SidebarGroupSorter {...{ groupOrder: groupsToSort, deleteFolder }} />
    </DragDropContext>;
  }

  return pinned ? null: (
    <ul className={cn('h-full space-y-1 p-2', className)}>
      {gangs.map((flag) => (
        <GangItem key={flag} flag={flag} />
      ))}
      {fullGroupList.map((go) => {
        if (typeof go === 'string') {
          if (go === 'My Channels' || go === 'My Apps')
            return null;
          // if (go === 'My Channels') {
          //   return <SidebarGroup key={go} />;
          // } else if (go === 'My Apps') {
          //   return <MyApps key={go} {...props} />;
          // }

          if (!go || pinnedGroups.map(([f, _]) => f).includes(go))
            return null;

          return <GroupItem key={go} flag={go} focusUnread={focusUnread} />;
        }
        if (go?.folder)
          return <SidebarFolder key={go.folder} toggleCollapse={toggleCollapse(go.folder)} folder={go} focusUnread={focusUnread} />;

        return null;
      })}

      {/* {groups
        .filter(
          ([flag, _group]) => !pinnedGroups.map(([f, _]) => f).includes(flag)
        )
        .map(([flag]) => (
          <GroupItem key={flag} flag={flag} />
        ))} */}
    </ul>
  );
}
