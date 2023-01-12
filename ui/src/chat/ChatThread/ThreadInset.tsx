import cn from 'classnames';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { VirtuosoHandle } from 'react-virtuoso';
import { useEventListener } from 'usehooks-ts';
import { useChannelFlag } from '@/hooks';
import { useChatKeys, useChatState, useGetFirstUnreadID, useReplies, useWrit } from '@/state/chat';
import { useChannel, useRouteGroup } from '@/state/groups/groups';
import ChatInput from '@/chat/ChatInput/ChatInput';
import BranchIcon from '@/components/icons/BranchIcon';
import X16Icon from '@/components/icons/X16Icon';
import ChatScroller from '@/chat/ChatScroller/ChatScroller';
import { whomIsFlag } from '@/logic/utils';

export interface ThreadInsetProps {
  chFlag: string;
  groupFlag: string;
  name: string;
  chShip: string;
  ship: string;
  chName: string;
  idShip: string;
  idTime: string;
  goBack: () => void;
}

export default function ThreadInset({
  groupFlag,
  chFlag,
  name,
  chShip,
  ship,
  chName,
  idShip,
  idTime,
  goBack,
} : ThreadInsetProps) {
  const scrollerRef = useRef<VirtuosoHandle>(null);
  const whom = chFlag || ship || '';
  const { sendMessage } = useChatState.getState();
  const channel = useChannel(groupFlag, `chat/${chFlag}`);
  const id = `${idShip}/${idTime}`;
  const maybeWrit = useWrit(whom, id);
  const replies = useReplies(whom, id);
  const [time, writ] = maybeWrit ?? [null, null];

  useEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Escape': {
        goBack();
        break;
      }
      default: {
        break;
      }
    }
  });

  if (!time || !writ)
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-400">
        No thread found
      </div>
    );

  const thread = replies.set(time, writ);

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto border-gray-50 bg-white lg:w-96 lg:border-l-2">
      <header className={'header z-40'}>
        <div className="flex h-full w-full items-center justify-between border-b-2 border-gray-50 bg-white p-4">
          <div className="flex items-center space-x-3 font-semibold">
            <div className="rounded bg-gray-50 p-1">
              <BranchIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              Thread : {whomIsFlag(whom) ? channel?.meta.title || '' : ship}
            </div>
          </div>
          <Link
            to=''
            onClick={goBack}
            aria-label="Close"
            className="icon-button h-8 w-8 bg-transparent"
          >
            <X16Icon className="h-6 w-6 text-gray-400" />
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col px-2 py-0">
        <ChatScroller
          key={idTime}
          messages={thread}
          whom={whom}
          scrollerRef={scrollerRef}
          replying
        />
      </div>
      <div className="sticky bottom-0 border-t-2 border-gray-50 bg-white p-4">
        <ChatInput whom={whom} replying={id} sendMessage={sendMessage} />
      </div>
    </div>
  );
}
