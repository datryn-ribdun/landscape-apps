import cn from 'classnames';
import React, { ReactElement, useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useGroup } from '@/state/groups';
import MenuIcon from '../icons/MenuIcon';

export type GroupFolder = {
  folder: string,
  collapsed?: boolean,
  groups: string[]
};
export type GroupOrder = (string | GroupFolder)[];

interface GroupTileProps {
  title: string;
  folder?: string;
}

function GroupTile({ folder, title }: GroupTileProps) {
  const isInFolder = Boolean(folder);

  return (
    <div className={cn(
      'bg-white flex flex-row items-center justify-between rounded mx-2',
      isInFolder ? 'py-1' : 'py-2',
      isInFolder ? 'px-2' : 'px-3',
      isInFolder ? 'my-0' : 'my-2',
    )}>
      <div className='truncate'>{title}</div>
    </div>
  );
}

interface GroupCardProps {
  flag: string;
  index: number;
}

function GroupCard({ flag, index }: GroupCardProps) {
  const group = useGroup(flag);

  if (!group) {
    return null;
  }

  return (
    <Draggable key={flag} draggableId={flag} index={index}>
      {provided => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
        <GroupTile title={group.meta.title} />
      </div>}
    </Draggable>
  );
}

interface FolderCardProps {
  title: string;
  index: number;
  groups: string[];
  deleteFolder: (folder: string) => void;
}

function FolderCard({
  title,
  index,
  groups,
  deleteFolder
}: FolderCardProps) {
  // const { theme } = useThemeWatcher();
  const [collapsed, setCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Draggable key={title} draggableId={title} index={index}>
      {provided => (
        <div className='m-1 flex flex-col truncate rounded bg-white p-1 pb-2'
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className='flex flex-row items-center justify-between' style={{ marginLeft: '-0.25em' }}>
            <div className='flex flex-row items-center'>
              {collapsed ? (
                <FaFolder className='ml-3 mr-2 cursor-pointer' onClick={() => setCollapsed(!collapsed)} />
              ) : (
                <FaFolderOpen className='ml-3 mr-2 cursor-pointer' onClick={() => setCollapsed(!collapsed)} />
              )}
              <div className='fontweight-600'>{title}</div>
            </div>
            <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenu.Trigger
                className="default-focus flex items-center rounded-lg p-0 text-base font-semibold"
                aria-label="Folder Options">
                <MenuIcon className="h-5 w-5 text-black" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="dropdown min-w-52 text-gray-800">
                <DropdownMenu.Item
                  asChild
                  className="dropdown-item text-blue hover:bg-blue-soft hover:dark:bg-blue-900"
                >
                  <button onClick={() => deleteFolder(title)}>
                    Delete folder
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
          {!collapsed && (
            <Droppable droppableId={title}>
              {(providedProps) => (
                <div {...providedProps.droppableProps} ref={providedProps.innerRef} className='mx-1 mt-1 rounded bg-gray-100 px-1' style={{ minHeight: 60 }}>
                  {groups.map((g, i) => <GroupCard key={g} flag={g} index={i} />)}
                  {providedProps.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}

interface SidebarGroupSorterProps {
  groupOrder?: GroupOrder;
  deleteFolder: (folder: string) => void;
}

export function SidebarGroupSorter({
  groupOrder = [],
  deleteFolder
}: SidebarGroupSorterProps): ReactElement {

  return (
    <>
      <Droppable droppableId="groups">
        {provided => (
          <div className='h-full bg-gray-100' {...provided.droppableProps} ref={provided.innerRef} style={{ marginTop: -8, marginBottom: -4, overflowY: 'scroll' }}>
            {groupOrder.filter(go => go).map((entry, index) => {
              if (typeof entry === 'string') {
                return <GroupCard {...{ key: entry, flag: entry, index }} />;
              }
              if (entry && typeof entry !== 'string') {
                return (
                  <FolderCard
                    {...{ key: entry.folder, title: entry.folder, index, groups: entry.groups, deleteFolder }}
                  />
                );
              }

              return null;
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {/* {modal} */}
    </>
  );
}
