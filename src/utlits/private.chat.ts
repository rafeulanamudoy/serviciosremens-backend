import { chatService } from "../app/modules/chat/chat.service";
import { activeUsers, chatRooms } from "../socket";
import {
  ExtendedWebSocket,
  MessageTypes,
  storeAndSendPrivateMessage,
} from "./socket.helpers";
import { redisSocketService } from "./socket.redis";

export const handleJoinApp = async (
  ws: ExtendedWebSocket,
  userId: any,
  activeUsers: Map<string, ExtendedWebSocket>
): Promise<void> => {
  ws.userId = userId;
  activeUsers.set(userId, ws);
  await redisSocketService.storeUserConnection(userId);
  ws.send(
    JSON.stringify({
      type: MessageTypes.AUTH_SUCCESS,
      message: `Successfully joined`,
    })
  );
};

async function handleJoinPrivateChat(
  ws: ExtendedWebSocket,
  parsedData: any,
  chatRooms: Map<string, Set<ExtendedWebSocket>>
) {
  const { userId, user2Id } = parsedData;
  const conversation = await chatService.createConversationIntoDB(
    userId,
    user2Id
  );
  const chatroomId = conversation?.id as string;
  ws.chatroomId = chatroomId;
  ws.userId = userId;
  activeUsers.set(userId, ws);
  if (!chatRooms.has(chatroomId)) {
    chatRooms.set(chatroomId, new Set());
  }

  chatRooms.get(chatroomId)?.add(ws);

  ws.send(
    JSON.stringify({
      type: MessageTypes.JOIN_PRIVATE_CHAT,
      message: `Successfully joined the private chat with user ${user2Id}`,
      chatroomId,
    })
  );
}

async function handleSendPrivateMessage(
  ws: ExtendedWebSocket,
  parsedData: any
) {
  const { userId, receiverId, content, imageUrl } = parsedData;
  const senderSocket = activeUsers.get(userId);
  const conversationId = senderSocket?.chatroomId || ws.chatroomId;
  try {
    if (conversationId) {
      await storeAndSendPrivateMessage(
        ws,
        userId,
        receiverId,
        content,
        imageUrl,
        conversationId
      );
    } else {
      ws.send(
        JSON.stringify({
          type: MessageTypes.AUTH_FAILURE,
          message: "Conversation ID not found for sender.",
        })
      );
    }
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.AUTH_FAILURE,
        message: `Error sending private message:, ${error}`,
      })
    );
  }
}

export { handleJoinPrivateChat, handleSendPrivateMessage };
