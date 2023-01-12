import React, { ReactNode, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { BigIntOrderedMap } from '@urbit/api';
import bigInt from 'big-integer';
import { useLocation } from 'react-router';
import { VirtuosoHandle } from 'react-virtuoso';
import ChatUnreadAlerts from '@/chat/ChatUnreadAlerts';
import { ChatWrit } from '@/types/chat';
import ChatScroller from '@/chat/ChatScroller/ChatScroller';
import { useChatInfo, useChatStore } from './useChatStore';
import { useChatKeys, useGetFirstUnreadID } from '@/state/chat';
import { useNotifications } from '@/notifications/useNotifications';
import useHarkState from '@/state/hark';

interface ChatWindowProps {
  whom: string;
  messages: BigIntOrderedMap<ChatWrit>;
  prefixedElement?: ReactNode;
  setThreadInset?: (thread: string) => void;
}

export default function ChatWindow({
  whom,
  messages,
  prefixedElement,
  setThreadInset,
}: ChatWindowProps) {
  const location = useLocation();
  const notifications = useNotifications();
  const { sawRope } = useHarkState.getState();
  const scrollerRef = useRef<VirtuosoHandle>(null);
  const scrollTo = new URLSearchParams(location.search).get('msg');
  const readTimeout = useChatInfo(whom).unread?.readTimeout;
  const [loaded, setLoaded] = useState(false);
  // "/groups/~fabnev-hinmur/escape-testing/channels/chat/~fabnev-hinmur/sandbox-1595/message/~mister-datryt-fabnev-hinmur/170.141.184.506.023.344.926.213.206.260.679.471.792"
      // console.log(notifications)

  useEffect(() => {
    notifications.notifications.forEach(n => {
      n.bins.forEach(b => {
        if (b.unread && b.topYarn.wer.includes(location.pathname)) {
          sawRope(b.topYarn.rope);
        }
      });
    });
  }, [location, notifications, sawRope]);

  useEffect(() => {
    useChatStore.getState().setCurrent(whom);
  }, [whom]);

  useEffect(
    () => () => {
      if (readTimeout !== undefined && readTimeout !== 0) {
        useChatStore.getState().read(whom);
      }
    },
    [readTimeout, whom]
  );
  const firstUnreadID = useGetFirstUnreadID(whom);
  const keys = useChatKeys({ whom, replying: false });

  useEffect(() => {
    if (!firstUnreadID || !scrollerRef.current || loaded || scrollTo) {
      return;
    }

    setLoaded(true);
    const idx = keys.findIndex((k) => k.greaterOrEquals(firstUnreadID));
    if (idx === -1) {
      return;
    }

    setTimeout(() => scrollerRef.current?.scrollToIndex({
      index: idx,
      align: 'start',
      behavior: 'auto',
    }), 100);
  }, [scrollerRef.current, firstUnreadID]); // eslint-disable-line

  return (
    <div className="relative h-full">
      <ChatUnreadAlerts whom={whom} scrollerRef={scrollerRef} />
      <div className="flex h-full w-full flex-col overflow-hidden">
        <ChatScroller
          /**
           * key=whom forces a remount for each channel switch
           * This resets the scroll position when switching channels;
           * previously, when switching between channels, the virtuoso
           * internal scroll index would remain the same. So, if one scrolled
           * far back in a long channel, then switched to a less active one,
           * the channel would be scrolled to the top.
           */
          key={whom}
          messages={messages}
          whom={whom}
          prefixedElement={prefixedElement}
          scrollTo={scrollTo ? bigInt(scrollTo) : undefined}
          scrollerRef={scrollerRef}
          setThreadInset={setThreadInset}
        />
      </div>
    </div>
  );
}
