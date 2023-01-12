import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import ChatInput from '@/chat/ChatInput/ChatInput';
import ChatWindow from '@/chat/ChatWindow';
import Layout from '@/components/Layout/Layout';
import { ViewProps } from '@/types/groups';
import { useChatPerms, useChatState, useMessagesForChat } from '@/state/chat';
import {
  useRouteGroup,
  useVessel,
  useGroup,
  useChannel,
  useAmAdmin,
  GROUP_ADMIN,
  useGroupState,
} from '@/state/groups/groups';
import ChannelHeader from '@/channels/ChannelHeader';
import { canReadChannel } from '@/logic/utils';
import useMedia from '@/logic/useMedia';
import { bootstrapChannel } from '@/state/bootstrap';
import ThreadInset from './ChatThread/ThreadInset';

export interface ChatInsetProps {
  groupFlag: string; // ~datwet/uqteam
  chFlag: string; // ~datwet/dev-main-925
}

export default function ChatInset({ groupFlag, chFlag }: ChatInsetProps) {
  const nest = `chat/${chFlag}`;
  const [thread, setThreadInset] = useState<string | null>(null); // :idShip/:idTime

  const { join } = useGroupState.getState();
  const { joinChat } = useChatState.getState();
  const isSmall = useMedia('(max-width: 1023px)');
  const messages = useMessagesForChat(chFlag);
  const perms = useChatPerms(chFlag);
  const vessel = useVessel(groupFlag, window.our);
  const canWrite =
    perms.writers.length === 0 ||
    _.intersection(perms.writers, vessel.sects).length !== 0;
  const { sendMessage } = useChatState.getState();

  // TODO: load the channel state

  const channel = useChannel(groupFlag, nest);

  useEffect(() => {
    bootstrapChannel(groupFlag, chFlag, 'chat');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (channel && !canReadChannel(channel, vessel)) {
      console.log('SHOULD JOIN');
      join(groupFlag, false)
        .then(() => {
          joinChat(chFlag);
        })
        .catch(console.warn);
    }
  }, [channel, vessel]); // eslint-disable-line react-hooks/exhaustive-deps

  const [ship, name] = groupFlag.split('/');
  const [chShip, chName] = groupFlag.split('/');
  const [idShip, idTime] = (thread || '/').split('/');
  const isThread = thread && idShip && thread; 

  if (isSmall && isThread) {
    return (
      <ThreadInset
        groupFlag={groupFlag}
        chFlag={chFlag}
        ship={ship}
        name={name}
        chShip={chShip}
        chName={chName}
        idShip={idShip}
        idTime={idTime}
        goBack={() => setThreadInset(null)}
      />
    );
  }

  return (
    <Layout
      className="flex-1 bg-white"
      header={<ChannelHeader flag={groupFlag} nest={nest} />}
      footer={
        <div className={cn(canWrite ? 'border-t-2 border-gray-50 p-4' : '')}>
          {canWrite ? (
            <ChatInput whom={chFlag} sendMessage={sendMessage} showReply />
          ) : null}
        </div>
      }
    >
      {/* <Helmet>
        <title>
          {channel && group
            ? `${channel.meta.title} in ${group.meta.title} ${title}`
            : title}
        </title>
      </Helmet> */}
      <ChatWindow whom={chFlag} messages={messages} setThreadInset={setThreadInset} />
      {!isSmall && isThread && (
        <ThreadInset
          groupFlag={groupFlag}
          chFlag={chFlag}
          ship={ship}
          name={name}
          chShip={chShip}
          chName={chName}
          idShip={idShip}
          idTime={idTime}
          goBack={() => setThreadInset(null)}
        />
      )}
    </Layout>
  );
}
