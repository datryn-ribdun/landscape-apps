import React, { ComponentType, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { useRouteGroup, useGroup, useAmAdmin } from '@/state/groups';
import { ViewProps } from '@/types/groups';
import CaretLeft16Icon from '@/components/icons/CaretLeft16Icon';
import useHarkState from '@/state/hark';
import { Bin, DayGrouping, useNotifications } from './useNotifications';
import GroupAvatar from '@/groups/GroupAvatar';

export interface NotificationsProps {
  child: ComponentType<{ bin: Bin }>;
  title?: ViewProps['title'];
}

export function MainWrapper({
  isMobile,
  children,
}: PropsWithChildren<{ isMobile: boolean }>) {
  if (!isMobile) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between px-5 py-4">
        <h1 className="text-base font-bold">Notifications</h1>
      </header>
      <nav className="h-full flex-1 overflow-y-auto">{children}</nav>
    </>
  );
}

export function GroupWrapper({
  isMobile,
  children,
}: PropsWithChildren<{ isMobile: boolean }>) {
  if (!isMobile) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  return (
    <>
      <header className="flex-none px-2 py-1">
        <Link
          to="../"
          className="default-focus inline-flex items-center rounded-lg p-2 text-base font-semibold text-gray-800 hover:bg-gray-50"
        >
          <CaretLeft16Icon className="mr-1 h-4 w-4 text-gray-400" />
          Activity
        </Link>
      </header>
      <div className="h-full w-full flex-1 overflow-y-scroll p-2 pr-0">
        {children}
      </div>
    </>
  );
}

export default function Notifications({
  child: Notification,
  title,
}: NotificationsProps) {
  const flag = useRouteGroup();
  const group = useGroup(flag);
  const { notifications } = useNotifications(flag);
  const location = useLocation();
  const isAdmin = useAmAdmin(flag);

  const [showUnread, setShowUnread] = useState(true);

  const shownNotifications = useMemo(() => notifications.reduce((acc: DayGrouping[], g) => {
    if (g.bins.find(b => b.unread === showUnread)) {
      return acc.concat([{ ...g, bins: g.bins.filter(b => b.unread === showUnread) }]);
    }

    return acc;
  }, []), [notifications, showUnread]);

  const markAllRead = useCallback(() => {
    useHarkState.getState().sawSeam({ desk: 'groups' });
  }, []);

  return (
    <section className="h-full w-full overflow-y-auto bg-white p-6">
      <Helmet>
        <title>
          {group
            ? `${group?.meta?.title} ${title}`
            : title}
        </title>
      </Helmet>
      {group && (
        <>
          <div className={cn('flex flex-row items-center justify-between border-b-2 border-gray-50 bg-white p-3 pl-6')}>
            <div className='flex flex-row items-center'>
              <GroupAvatar size="h-12 w-12 sm:h-6 sm:w-6 mr-2" {...group?.meta} />
              <div className="text-md font-semibold">{group?.meta.title}</div>
            </div>
            {isAdmin && (
              <Link
                to={`/groups/${flag}/info/channels`}
                state={{ backgroundLocation: location }}
                className="small-button"
              >
                Manage Channels
              </Link>
            )}
          </div>
          {!Object.keys(group?.channels || {}).length && (
            <div className='text-md flex flex-row items-center p-6 pb-0'>
              Looks like you don't have any channels yet, would you like to create a
              <Link
                to={`/groups/${flag}/channels/new`}
                state={{ backgroundLocation: location }}
                className="small-button ml-2 mr-1"
              >
                New Channel
              </Link>
              ?
            </div>
          )}
        </>
      )}
      <div className='p-6 pt-4'>
        <h1 className='text-lg font-bold'>Notifications</h1>
        <div className='mt-6 flex flex-row justify-between'>
          <div className='flex flex-row'>
            <h2 className={cn(
              'my-4 mr-8 inline text-lg font-bold cursor-pointer',
              !showUnread && 'text-gray-400',
            )} onClick={() => setShowUnread(true)}>
              Unread
            </h2>
            <h2 className={cn(
              'my-4 text-lg inline font-bold cursor-pointer',
              showUnread && 'text-gray-400',
            )} onClick={() => setShowUnread(false)}>
              Read
            </h2>
          </div>
          <button className="small-button bg-blue" onClick={markAllRead}>
            Mark All as Read
          </button>
        </div>
        {shownNotifications.map((grouping) => (
          <div key={grouping.date}>
            <h2 className="mt-6 mb-4 text-lg font-bold text-gray-400">
              {grouping.date}
            </h2>
            <ul className="space-y-2">
              {grouping.bins.map((b) => (
                <li key={b.time}>
                  <Notification bin={b} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!shownNotifications.length && <h4 className='mt-4'>No Notifications</h4>}
      </div>
    </section>
  );
}
