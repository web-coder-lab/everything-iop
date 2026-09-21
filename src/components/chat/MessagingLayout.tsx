import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { ConversationListView } from './ConversationListView';
import { ChatConversationView } from './ChatConversationView';
import { MessageSquare } from 'lucide-react';

interface MessagingLayoutProps {
  initialConversationId?: string;
}

export const MessagingLayout: React.FC<MessagingLayoutProps> = ({ initialConversationId }) => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    navigate,
  } = useAppStore();

  const selectedId = initialConversationId || activeConversationId || (conversations.length > 0 ? conversations[0].id : null);

  const handleSelect = (id: string) => {
    setActiveConversationId(id);
    navigate(`/messages/${id}`);
  };

  const handleBack = () => {
    setActiveConversationId(null);
    navigate('/messages');
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-6.5rem)] w-full">
      {/* Desktop side-by-side view */}
      <div className="hidden lg:grid grid-cols-12 gap-4 h-full">
        <div className="col-span-4 h-full">
          <ConversationListView
            onSelectConversation={handleSelect}
            activeId={selectedId}
          />
        </div>

        <div className="col-span-8 h-full">
          {selectedId ? (
            <ChatConversationView conversationId={selectedId} />
          ) : (
            <div className="h-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center p-8 text-stone-400">
              <MessageSquare className="w-12 h-12 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                Select a chat to begin messaging
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Fast, end-to-end messaging with double ticks and media sharing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile switching view */}
      <div className="lg:hidden h-full">
        {selectedId ? (
          <ChatConversationView
            conversationId={selectedId}
            onBack={handleBack}
          />
        ) : (
          <ConversationListView
            onSelectConversation={handleSelect}
            activeId={selectedId}
          />
        )}
      </div>
    </div>
  );
};
