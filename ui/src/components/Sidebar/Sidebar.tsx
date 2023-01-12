import cn from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useLocation, useNavigate } from 'react-router';
import { FaFolder, FaFolderOpen, FaFolderPlus, FaEye, FaEyeSlash, FaArrowLeft, FaComment, FaSortAlphaDown } from 'react-icons/fa';
import { debounce } from 'lodash';

import ActivityIndicator from '@/components/Sidebar/ActivityIndicator';
import { useGroups, usePendingInvites } from '@/state/groups';
import { useIsMobile } from '@/logic/useMedia';
import MagnifyingGlass from '@/components/icons/MagnifyingGlass16Icon';
import SidebarItem from '@/components/Sidebar/SidebarItem';
import AddIcon16 from '@/components/icons/Add16Icon';
import { useBriefs, useChatState, usePendingDms, usePendingMultiDms, usePinnedGroups } from '@/state/chat';
import { hasKeys } from '@/logic/utils';
import ShipName from '@/components/ShipName';
import Avatar, { useProfileColor } from '@/components/Avatar';
import useGroupSort from '@/logic/useGroupSort';
import { useNotifications } from '@/notifications/useNotifications';
import logo from '@/assets/logo192.png';
import { useSettingsState } from '@/state/settings';
import MessagesSidebar, { selMessagesFilter } from '@/dms/MessagesSidebar';
import MenuIcon from '@/components/icons/MenuIcon';
import { GroupOrder } from './SidebarGroupSorter';
import FolderGroupList from './FolderGroupList';
import SlidersIcon from '../icons/SlidersIcon';
import GroupList from './GroupList';
import GridIcon from '../icons/GridIcon';
import { useChannelUnreadCounts } from '@/logic/useIsChannelUnread';

export default function Sidebar() {
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const groups = useGroups();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const pendingInvites = usePendingInvites();
  const [scrollTop, setScrollTop] = useState(0);
  const { markRead } = useChatState.getState();
  const { groups: { groupFolders }, putEntry } = useSettingsState.getState();
  const { messagesFilter } = useSettingsState(selMessagesFilter);
  const [showMenu, setShowMenu] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [focusUnread, setFocusUnread] = useState(false);
  const [addFolderOpen, setAddFolderOpen] = useState(false);
  const [folder, setFolder] = useState('');
  const [atTop, setAtTop] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const atTopChange = useCallback((top: boolean) => setAtTop(top), []);

  const scroll = useRef(
    debounce((scrolling: boolean) => setIsScrolling(scrolling), 200)
  );

  const dmUnreads = useChannelUnreadCounts({ scope: messagesFilter });
  const pendingInvitesCount = pendingInvites.length;
  const { count } = useNotifications();

  const { sortFn, setSortFn, sortOptions, sortGroups } = useGroupSort();
  const pinnedGroups = usePinnedGroups();
  const sortedGroups = sortGroups(groups);
  const sortedPinnedGroups = sortGroups(pinnedGroups);
  const shipColor = useProfileColor(window.our);

  const [groupOrder, setGroupOrder] = useState<GroupOrder>(JSON.parse(groupFolders));
  const focusMessages = location.pathname.includes('~landscape/messages');
  const hasFolder = Boolean(groupOrder.find(go => go && typeof go !== 'string' && 'folder' in go));
  const showDms = location.pathname.includes('/dm/');

  useEffect(() => {
    setGroupOrder(JSON.parse(groupFolders));
  }, [groupFolders]);

  // const markAllRead = useCallback(() => {
  //   if (window.confirm('Are you sure you want to clear all unread indicators?')) {
  //     Object.keys(groups).forEach(flag => {
  //       Object.keys(groups[flag].channels).forEach(nest => {
  //         useDismissChannelNotifications({
  //           nest,
  //           markRead: useHeapState.getState().markRead,
  //         });
  //       });
  //     });
  //   }
  // }, [groups, markRead]);

  const saveGroupOrder = useCallback((newOrder) => {
    putEntry('groups', 'groupFolders', JSON.stringify(newOrder));
    setGroupOrder(newOrder);
  }, [putEntry, setGroupOrder]);

  // useEffect(() => {
  //   if (!groupOrder.length && initialLoad) {
  //     saveGroupOrder(sortedGroups.map(([flag]) => flag));
  //     setInitialLoad(false);
  //   }
  // }, [groupOrder, sortedGroups, initialLoad, setInitialLoad, saveGroupOrder]);

  const collapseAllFolders = (collapsed: boolean) =>
    saveGroupOrder(
      groupOrder.map(go => (go && typeof go !== 'string') ? ({ ...go, collapsed }) : (go))
    );

  const addGroupFolder = useCallback(() => {
    if (folder && !groupOrder.find(go => go && typeof go !== 'string' && go?.folder === folder)) {
      const newOrder = Array.from(groupOrder);
      newOrder.unshift({ folder, groups: [] });
      saveGroupOrder(newOrder);
      setFolder('');
      setTimeout(() => setOrganizing(true), 1);
      setOrganizing(false);
    }
  }, [folder, groupOrder, setFolder, saveGroupOrder]);

  const groupOrderSansPinned = useMemo(() => groupOrder.map((go) => {
    if (typeof go === 'string') {
      return pinnedGroups[go] ? '' : go;
    }

    return { ...go, groups: go.groups.filter(g => !pinnedGroups[g]) };
  }).filter(go => go), [groupOrder, pinnedGroups]);

  const hideNav = isMobile && !(location.pathname === '/' || location.pathname === '/dm' || location.pathname === '/dm/');

  return (
    <nav className={cn(
      'flex h-full flex-col bg-white',
      isMobile && 'fixed',
      isMobile ? 'w-full' : 'w-64',
      hideNav && 'invisible',
    )} style={{ height: isMobile ? 'calc(100vh - 48px)' : '100vh' }}>
      <ul
        className={cn(
          'flex w-full flex-col px-2',
          scrollTop > 0 && 'bottom-shadow'
        )}
      >
        {/* <GroupsAppMenu /> */}
        {!isMobile && (
          <div className='mb-1 flex flex-row pt-2'>
            <SidebarItem
              div
              className="text-black"
              to="/"
              onClick={() => setShowMenu(false)}
              icon={<img className="h-6 w-6" src={logo} alt="Uqbar Logo" />}
            >
              EScape
            </SidebarItem>
            <SidebarItem
              div
              className="text-black"
              onClick={() => setShowMenu(!showMenu)}
              icon={<MenuIcon className="m-1 h-5 w-5" />}
            >
              Menu
            </SidebarItem>
          </div>
        )}
        {showMenu && (
          <>
            <div className='h-2' />
            <SidebarItem highlight={shipColor} icon={<Avatar size="xs" ship={window.our} />} to={'/profile/edit'}>
              <ShipName showAlias name={window.our} />
            </SidebarItem>
            <SidebarItem icon={<ActivityIndicator count={count} />} to={`/notifications`} defaultRoute>
              Notifications
            </SidebarItem>
            <SidebarItem icon={<SlidersIcon className="relative m-1 h-4 w-4" />}>
              <a href='/apps/grid/leap/system-preferences' target='_blank' className='h-full w-full t-0 b-0 r-0 l-0 absolute no-underline' />
              Settings
            </SidebarItem>
            <SidebarItem icon={<GridIcon className="relative m-1 mr-0 h-5 w-5" />}>
              <a href='/apps/grid/' className='h-full w-full t-0 b-0 r-0 l-0 absolute no-underline' />
              Grid
            </SidebarItem>
            {/* <SidebarItem to="/dm/new" icon={<AddIcon className="m-1 h-4 w-4" />}>
              New DM
            </SidebarItem> */}
            <SidebarItem
              icon={<MagnifyingGlass className="m-1 h-4 w-4" />}
              to="/find"
            >
              <div className="flex items-center">
                Find Groups
                {pendingInvitesCount > 0 ? (
                  <span className="ml-auto font-semibold text-blue">
                    {pendingInvitesCount}
                  </span>
                ) : null}
              </div>
            </SidebarItem>
            <SidebarItem
              icon={<AddIcon16 className="m-1 h-4 w-4" />}
              to="/groups/new"
              state={{ backgroundLocation: location }}
            >
              Create Group
            </SidebarItem>
          </>
        )}
        {(!focusMessages && !organizing) && (
          <div className='flex flex-row justify-between border-t-2 border-gray-50 px-2 pt-1' style={{ marginLeft: '-0.5em', marginRight: '-0.5em' }}>
            <div className='flex flex-row'>
              <button className="small-button m-1" onClick={() => setOrganizing(!organizing)}>
                <FaSortAlphaDown />
              </button>
              {hasFolder ? (
                <>
                  <button className='small-button m-1' onClick={() => collapseAllFolders(true)}>
                    <FaFolder />
                  </button>
                  <button className='small-button m-1' onClick={() => collapseAllFolders(false)}>
                    <FaFolderOpen />
                  </button>
                </>
              ) : (
                <button className="small-button m-1" onClick={() => setOrganizing(!organizing)}>
                  <FaFolderPlus />
                </button>
              )}
            </div>
            <div className='flex flex-row'>
              <button
                className={`small-${showDms ? 'secondary-' : ''}button relative m-1`}
                style={{ border: showDms ? '1px solid rgb(51,51,51)' : undefined }}
                onClick={() => navigate(showDms ? '/' : '/dm/')}
              >
                <FaComment />
                {dmUnreads > 0 && <ActivityIndicator bg='bg-blue-400' className='absolute -top-1 -right-1 h-4 w-4 rounded-full text-white' count={dmUnreads} />}
              </button>
              {/* <button className="small-button m-1" onClick={markAllRead}>
                <FaCheckCircle />
              </button> */}
              <button className="small-button m-1" onClick={() => setFocusUnread(!focusUnread)}>
                {focusUnread ? <FaEyeSlash /> : <FaEye />}
              </button>
              {isMobile && (
                <button
                  className={`small-${showMenu ? 'secondary-' : ''}button m-1`}
                  style={{ border: showMenu ? '1px solid rgb(51,51,51)' : undefined }}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MenuIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}
        {organizing && (
          <div className='flex flex-row border-t-2 border-gray-50 px-2 pt-1 pb-3' style={{ marginLeft: '-0.5em', marginRight: '-0.5em' }}>
            <button className="small-button m-1" onClick={() => setOrganizing(false)}>
              <FaArrowLeft style={{ marginRight: 8 }} />
              Back
            </button>
            <DropdownMenu.Root open={addFolderOpen} onOpenChange={setAddFolderOpen}>
              <DropdownMenu.Trigger asChild className="appearance-none">
                <button className="small-button m-1" onClick={() => setAddFolderOpen(!addFolderOpen)}>
                  <FaFolderPlus />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="dropdown min-w-52 text-gray-800">
                <DropdownMenu.Item
                  asChild
                  className="dropdown-item text-blue hover:bg-blue-soft hover:dark:bg-blue-900"
                >
                  <div className='flex flex-col items-center'>
                    <input placeholder='Folder name'
                      ref={folderInputRef}
                      onClick={(e) => e.stopPropagation()}
                      onChange={e => setFolder(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addGroupFolder();
                        }
                      }}
                      value={folder}
                      autoFocus
                      style={{ padding: '6px', marginBottom: '8px', border: '1px solid lightGray', borderRadius:'4px' }}
                    />
                    <button className='small-button' onClick={addGroupFolder}>Add Folder</button>
                  </div>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        )}
        {!organizing && hasKeys(pinnedGroups) && (
          <GroupList
            className="p-2"
            pinned
            groups={sortedGroups}
            pinnedGroups={sortedPinnedGroups}
          />
        )}
        {!organizing && !showDms &&  (
          <li className="-mx-2 mt-1 grow border-t-2 border-gray-50 pt-3 pb-2">
            <span className="ml-4 text-sm font-semibold text-gray-400">
              All Groups
            </span>
          </li>
        )}
        {/* <li className="relative p-2">
          <SidebarSorter
            sortFn={sortFn}
            setSortFn={setSortFn}
            sortOptions={sortOptions}
            isMobile={isMobile}
          />
        </li> */}
      </ul>
      {showDms ? (
        <MessagesSidebar isGroups />
      ) : isMobile ? (
        <FolderGroupList
            organizing={organizing}
            groupOrder={groupOrderSansPinned}
            focusUnread={focusUnread}
            saveGroupOrder={saveGroupOrder}
            className="flex-1 overflow-x-hidden overflow-y-scroll pr-0 pt-0"
            groups={sortedGroups}
            pinnedGroups={sortedPinnedGroups}
          />
      ) : (
        <div style={{ height: 'calc(100% - 128.5px)' }}>
          <div className={cn(!isMobile && 'h-3/4 overflow-hidden')}>
            <FolderGroupList
              organizing={organizing}
              groupOrder={groupOrderSansPinned}
              focusUnread={focusUnread}
              saveGroupOrder={saveGroupOrder}
              className="flex-1 overflow-x-hidden overflow-y-scroll pr-0 pt-0"
              groups={sortedGroups}
              pinnedGroups={sortedPinnedGroups}
            />
          </div>
          {!isMobile && <div className='h-1/4'>
            <MessagesSidebar isGroups inset />
          </div>}
        </div>
      )}
    </nav>
  );
}
