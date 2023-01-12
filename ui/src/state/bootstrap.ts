import api from '@/api';
import { isTalk } from '@/logic/utils';
import { useChatState } from './chat';
import useContactState from './contact';
import { useDiaryState } from './diary';
import { useGroupState } from './groups';
import useHarkState from './hark';
import { useHeapState } from './heap/heap';
import { useSettingsState } from './settings';
import { useStorage } from './storage';

export function bootstrapChannel(group: string, channel: string, type: 'chat' | 'note' | 'collection' | 'dm') {
  useGroupState.getState().start();

  if (type === 'chat') {
    useChatState.getState().start();
  } else if (type === 'note') {
    useDiaryState.getState().start();
  } else if (type === 'collection') {
    useHeapState.getState().start();
  } else if (type === 'dm') {
    useChatState.getState().fetchDms();
  }

  useHarkState.getState().start();
  useContactState.getState().initialize(api);
  const { initialize: settingsInitialize, fetchAll } =
    useSettingsState.getState();
  settingsInitialize(api);
  fetchAll();

  useStorage.getState().initialize(api);
}

export default function bootstrap() {
  useGroupState.getState().start();
  useChatState.getState().start();

  if (isTalk) {
    useChatState.getState().fetchDms();
  } else {
    useHeapState.getState().start();
    useDiaryState.getState().start();
  }

  useHarkState.getState().start();
  useContactState.getState().initialize(api);
  const { initialize: settingsInitialize, fetchAll } =
    useSettingsState.getState();
  settingsInitialize(api);
  fetchAll();

  useStorage.getState().initialize(api);
}
