import { respData, respErr } from '@/shared/lib/resp';
import { ChatStatus, findChatById, getChats, getChatsCount } from '@/shared/models/chat';
import {
  getChatMessages,
  getChatMessagesCount,
} from '@/shared/models/chat_message';
import { getUserInfo } from '@/shared/models/user';

export async function POST(req: Request) {
  try {
    let { chatId, page, limit } = await req.json();
    if (!chatId) {
      return respErr('chatId is required');
    }

    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 30;
    }

    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    // SEC-10：校验 chat 归属，防止 IDOR 读取他人聊天记录
    const chat = await findChatById(chatId);
    if (!chat) {
      return respErr('chat not found');
    }

    if (chat.userId !== user.id) {
      return respErr('no permission to access this chat');
    }

    const messages = await getChatMessages({
      chatId,
      userId: user.id,
      page,
      limit,
    });
    const total = await getChatMessagesCount({
      chatId,
      userId: user.id,
    });

    return respData({
      list: messages,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (e: any) {
    console.log('get chat messages failed:', e);
    return respErr(`get chat messages failed: ${e.message}`);
  }
}
