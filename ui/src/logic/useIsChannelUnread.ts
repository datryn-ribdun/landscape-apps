import _ from 'lodash';
import { ChatStore, useChatStore } from '@/chat/useChatStore';
import useAllBriefs from '@/logic/useAllBriefs';
import { useCallback } from 'react';
import { nestToFlag } from './utils';
import { useNotifications } from '@/notifications/useNotifications';

const selChats = (s: ChatStore) => s.chats;

function channelUnread(
  nest: string,
  briefs: ReturnType<typeof useAllBriefs>,
  chats: ChatStore['chats']
) {
  const [app, chFlag] = nestToFlag(nest);
  const unread = chats[chFlag]?.unread;

  if (app === 'chat') {
    return unread && !unread.seen;
  }

  return (briefs[nest]?.count ?? 0) > 0;
}

interface ChannelUnreadCount {
  scope: 'Group Channels' | 'Direct Messages' | 'All Messages';
}

export function useChannelUnreadCounts(args: ChannelUnreadCount) {
  const briefs = useAllBriefs();
  const chatKeys = Object.keys(useChatStore(selChats)).map(
    (key) => `chat/${key}`
  );

  switch (args.scope) {
    case 'All Messages':
      return _.sumBy(Object.values(briefs), 'count');
    case 'Group Channels':
      return _.sumBy(Object.values(_.pick(briefs, chatKeys)), 'count');
    case 'Direct Messages':
      return _.sumBy(Object.values(_.omit(briefs, chatKeys)), 'count');
    default:
      return _.sumBy(Object.values(briefs), 'count');
  }
}

function getChannelUnreadCount(
  nest: string,
  briefs: ReturnType<typeof useAllBriefs>,
  chats: ChatStore['chats']
) {
  const [app, chFlag] = nestToFlag(nest);
  const unread = chats[chFlag]?.unread;

  if (app === 'chat') {
    return unread?.brief?.count ?? 0;
  }

  return (briefs[nest]?.count ?? 0);
}

export function useCheckChannelUnread() {
  const briefs = useAllBriefs();
  const chats = useChatStore(selChats);

  return useCallback(
    (nest: string) => channelUnread(nest, briefs, chats),
    [briefs, chats]
  );
}

export function useCheckChannelNotification() {
  const { notifications } = useNotifications();

  return useCallback(
    (nest: string) => notifications.some((n) =>
      n.bins.some(
        (b) =>
          b.unread &&
          b.topYarn?.rope.channel &&
          b.topYarn?.wer.includes(nest)
      )
    ),
    [notifications]
  );
}

export function useCheckChannelUnreadCount() {
  const briefs = useAllBriefs();
  const chats = useChatStore(selChats);

  return useCallback(
    (nest: string) => getChannelUnreadCount(nest, briefs, chats),
    [briefs, chats]
  );
}

export default function useIsChannelUnread(nest: string) {
  const briefs = useAllBriefs();
  const chats = useChatStore(selChats);

  return {
    isChannelUnread: channelUnread(nest, briefs, chats),
    channelUnreadCount: getChannelUnreadCount(nest, briefs, chats),
  };
}
