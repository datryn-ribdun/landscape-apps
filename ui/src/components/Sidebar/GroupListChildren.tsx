import cn from 'classnames';
import React, { PropsWithChildren, useState } from 'react';
import { uniq, without } from 'lodash';
import { useDrag, useDrop } from 'react-dnd';
import * as Popover from '@radix-ui/react-popover';
import { useIsMobile } from '@/logic/useMedia';
import { useGang, useGroup, useGroupState } from '@/state/groups/groups';
import { SettingsState, useSettingsState } from '@/state/settings';
import GroupAvatar from '@/groups/GroupAvatar';
import GroupActions from '@/groups/GroupActions';
import SidebarItem from './SidebarItem';
import CaretRightIcon from '../icons/CaretRightIcon';
import CaretDownIcon from '../icons/CaretDownIcon';
import ChannelList from '@/groups/GroupSidebar/ChannelList';
import useIsGroupUnread from '@/logic/useIsGroupUnread';

const dragTypes = {
  GROUP: 'group',
};

export const selOrderedPins = (s: SettingsState) => ({
  order: s.groups.orderedGroupPins,
  loaded: s.loaded,
});

export function DraggableGroupItem({ flag }: { flag: string }) {
  const group = useGroup(flag);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: dragTypes.GROUP,
    item: { flag },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={cn(
        'absolute w-full',
        isDragging ? 'opacity-0' : 'opacity-100'
      )}
    >
      <SidebarItem
        div
        icon={<GroupAvatar size="h-6 w-6" {...group?.meta} />}
        actions={<GroupActions flag={flag} />}
        to={`/groups/${flag}`}
      >
        {group?.meta.title}
      </SidebarItem>
    </div>
  );
}

export function GroupItem({ flag, focusUnread = false }: { flag: string; focusUnread?: boolean; }) {
  const isMobile = useIsMobile();
  const group = useGroup(flag);
  const [expanded, setExpanded] = useState(false);
  const { getUnreadCount } = useIsGroupUnread();
  const { unreadCount } = getUnreadCount(flag);

  const expandGroup = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };

  if (!group || (focusUnread && unreadCount === 0)) {
    return null;
  }

  const caretClasses = "h-5 w-5 -ml-1";
  const caretIcon = <div className="p-2" style={{ margin: '-0.5em', marginRight: '-1em' }} onClick={expandGroup}>
    {expanded ?
    <CaretDownIcon className={caretClasses} /> :
    <CaretRightIcon className={caretClasses} />}
  </div>;

  return (
    <div className=''>
      <SidebarItem
        icon={caretIcon}
        actions={<GroupActions flag={flag} />}
        to={`/groups/${flag}`}
        onClick={(e) => {
          // navPrimary('group', flag);
          if (expanded) {
            e.preventDefault();
            e.stopPropagation();
          }
          setExpanded(!expanded);
        }}
      >
        <div className="flex flex-row items-center">
          <GroupAvatar size='h-6 w-6 mr-2' {...group?.meta} />
          {group?.meta.title}
        </div>
      </SidebarItem>
      {expanded && (
        <ChannelList className="pl-6" flag={flag} focusUnread={focusUnread} />
      )}
    </div>
  );
}

export function GroupItemContainer({
  flag,
  children,
}: PropsWithChildren<{ flag: string }>) {
  const { order } = useSettingsState(selOrderedPins);
  const [{ isOver }, drop] = useDrop<
    { flag: string },
    undefined,
    { isOver: boolean }
  >(
    () => ({
      accept: dragTypes.GROUP,
      drop: ({ flag: itemFlag }) => {
        if (!itemFlag || itemFlag === flag) {
          return undefined;
        }
        // [1, 2, 3, 4] 1 -> 3
        // [2, 3, 4]
        const beforeSlot = order.indexOf(itemFlag) < order.indexOf(flag);
        const orderWithoutOriginal = without(order, itemFlag);
        const slicePoint = orderWithoutOriginal.indexOf(flag);
        // [2, 3] [4]
        const left = orderWithoutOriginal.slice(
          0,
          beforeSlot ? slicePoint + 1 : slicePoint
        );
        const right = orderWithoutOriginal.slice(slicePoint);
        // concat([2, 3], [1], [4])
        const newOrder = uniq(left.concat([itemFlag], right));
        // [2, 3, 1, 4]
        useSettingsState
          .getState()
          .putEntry('groups', 'orderedGroupPins', newOrder);

        return undefined;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [flag]
  );

  return (
    <li
      ref={drop}
      className={cn(
        'relative flex h-16 w-full ring-4 sm:h-10',
        isOver && 'ring-blue-500',
        !isOver && 'ring-transparent'
      )}
    >
      {children}
    </li>
  );
}

// Gang is a pending group invite
export function GangItem(props: { flag: string }) {
  const { flag } = props;
  const { preview, claim } = useGang(flag);
  const isMobile = useIsMobile();

  if (!claim) {
    return null;
  }

  const requested = claim.progress === 'knocking';
  const handleCancel = async () => {
    if (requested) {
      await useGroupState.getState().rescind(flag);
    } else {
      await useGroupState.getState().reject(flag);
    }
  };

  return (
    <Popover.Root>
      <Popover.Anchor>
        <Popover.Trigger asChild>
          <SidebarItem
            icon={
              <GroupAvatar
                {...preview?.meta}
                size="h-6 w-6"
                className="opacity-60"
              />
            }
          >
            <span className="inline-block w-full truncate opacity-60">
              {preview ? preview.meta.title : flag}
            </span>
          </SidebarItem>
        </Popover.Trigger>
      </Popover.Anchor>
      <Popover.Content
        side={isMobile ? 'top' : 'right'}
        sideOffset={isMobile ? 0 : 16}
      >
        <div className="flex w-[200px] flex-col space-y-4 rounded-lg bg-white p-4 leading-5 drop-shadow-lg">
          {requested ? (
            <>
              <span>You've requested to join this group.</span>
              <span>
                An admin will have to approve your request and then you'll
                receive an invitation to join.
              </span>
            </>
          ) : (
            <>
              <span>You are currently joining this group.</span>
              <span>
                It may take a few minutes depending on the host&apos;s and your
                connection.
              </span>
            </>
          )}
          <div className="flex">
            <Popover.Close>
              <button
                className="small-button bg-gray-50 text-gray-800"
                onClick={handleCancel}
              >
                {requested ? 'Cancel Request' : 'Cancel Join'}
              </button>
            </Popover.Close>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
