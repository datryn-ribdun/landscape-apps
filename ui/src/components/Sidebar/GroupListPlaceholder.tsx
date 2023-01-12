import * as React from 'react';
import cn from 'classnames';
import { randomElement, randomIntInRange } from '@/logic/utils';

function GroupItemPlaceholder() {
  const background = `bg-gray-${randomElement([100, 200, 400])}`;

  return (
    <li className="relative flex w-full items-center justify-between rounded-lg">
      <div className="flex w-full flex-1 items-center space-x-3 rounded-lg p-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-sm" />
        <div
          className={cn(background, 'h-4 rounded-md')}
          style={{ width: `${randomIntInRange(50, 180)}px` }}
        />
      </div>
    </li>
  );
}

interface GroupListPlaceholderProps {
  count: number;
}

function GroupListPlaceholder({ count }: GroupListPlaceholderProps) {
  return (
    <ul className="h-full animate-pulse space-y-1 p-2">
      {new Array(count).fill(true).map((_, i) => (
        <GroupItemPlaceholder key={i} />
      ))}
    </ul>
  );
}

export default React.memo(GroupListPlaceholder);
