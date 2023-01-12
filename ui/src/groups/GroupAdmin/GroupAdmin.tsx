import React from 'react';
import cn from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';
import { useAmAdmin, useGroup, useRouteGroup } from '../../state/groups/groups';
import GroupAvatar from '../GroupAvatar';

export default function GroupAdmin() {
  const flag = useRouteGroup();
  const group = useGroup(flag);
  const isAdmin = useAmAdmin(flag);

  return (
    <section className="flex w-full flex-col overflow-y-scroll">
      <div className="m-4 flex grow flex-col sm:my-5 sm:mx-8">
        {isAdmin ? (
          <header className="card mb-4 p-2">
            <nav>
              <ul className="flex items-center font-semibold text-gray-400">
                <li className='ml-2'>
                  <GroupAvatar size={`${'h-5 w-5'} mr-2`} {...group?.meta} />
                </li>
                <li>
                  <NavLink
                    to="../info"
                    end
                    className={({ isActive }) =>
                      cn(
                        'default-focus inline-block rounded-md p-2 hover:bg-gray-50',
                        isActive && 'text-gray-800'
                      )
                    }
                  >
                    Group Info
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="members"
                    className={({ isActive }) =>
                      cn(
                        'default-focus inline-block rounded-md p-2 hover:bg-gray-50',
                        isActive && 'text-gray-800'
                      )
                    }
                  >
                    Members
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="channels"
                    className={({ isActive }) =>
                      cn(
                        'default-focus inline-block rounded-md p-2 hover:bg-gray-50',
                        isActive && 'text-gray-800'
                      )
                    }
                  >
                    Channels
                  </NavLink>
                </li>
              </ul>
            </nav>
          </header>
        ) : null}
        <Outlet />
      </div>
    </section>
  );
}
