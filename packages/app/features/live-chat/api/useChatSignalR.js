// src/api/useChatSignalR.js
import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { CHAT_HUB } from '../../../provider/api/hubConstants'; // Nhớ trỏ đúng đường dẫn file config của bạn

export const useChatSignalR = (token) => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Ref để tránh stale closure trong event listener
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 1. Khởi tạo Connection
  useEffect(() => {
    if (!token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB.HUB_URL, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);
  }, [token]);

  // 2. Setup Listeners & Start Connection
  const startedRef = useRef(false);

  useEffect(() => {
    if (!connection) return;

    // Tránh start lại connection khi đang Connecting/Connected (đặc biệt trong React StrictMode)
    if (startedRef.current || connection.state !== signalR.HubConnectionState.Disconnected) {
      console.log('SignalR connection already started or not disconnected. State:', connection.state);
      return;
    }

    // --- Đăng ký Events từ CHAT_HUB.EVENTS ---

    // A. Lắng nghe tin nhắn đến
    connection.on(CHAT_HUB.EVENTS.RECEIVE_MESSAGE, (...args) => {
      console.log('Msg received from hub:', args);

      let incoming = null;

      if (args.length === 1 && typeof args[0] === 'object') {
        // Trường hợp backend gửi DTO đầy đủ: { content, roomId, createdAt, senderId, senderName, ... }
        incoming = {
          ...args[0],
          timestamp: args[0].createdAt || args[0].timestamp || new Date().toISOString(),
        };
      } else {
        // Trường hợp cũ: (user, message, timestamp)
        const [user, message, timestamp] = args;
        incoming = {
          senderId: typeof user === 'object' ? user.id : null,
          senderName: typeof user === 'object' ? user.name : user,
          content: message,
          timestamp: timestamp || new Date().toISOString(),
        };
      }

      setMessages((prev) => [...prev, incoming]);
    });

    // B. Lắng nghe lỗi từ server (nếu có)
    connection.on(CHAT_HUB.EVENTS.ERROR, (errMessage) => {
      console.error("SignalR Error from server:", errMessage);
      setError(errMessage);
    });

    // --- Bắt đầu kết nối ---
    startedRef.current = true;
    connection.start()
      .then(() => {
        console.log('SignalR Connected to:', CHAT_HUB.HUB_URL);
        setIsConnected(true);
      })
      .catch((err) => console.error('Connection failed: ', err));

    // Cleanup khi unmount hoặc khi connection thay đổi
    return () => {
      startedRef.current = false;
      connection.off(CHAT_HUB.EVENTS.RECEIVE_MESSAGE);
      connection.off(CHAT_HUB.EVENTS.ERROR);
      connection.stop();
    };
  }, [connection]);

  // 3. Các hàm gọi lên Server (Invoke Methods)

  // Join Room
  const joinRoom = useCallback(async (roomId) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke(CHAT_HUB.METHODS.JOIN_ROOM, roomId);
        console.log(`Joined room: ${roomId}`);
      } catch (err) {
        console.error('JoinRoom failed:', err);
      }
    }
  }, [connection]);

  // Leave Room (Nếu cần dùng khi đóng chat)
  const leaveRoom = useCallback(async (roomId) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke(CHAT_HUB.METHODS.LEAVE_ROOM, roomId);
      } catch (err) {
        console.error('LeaveRoom failed:', err);
      }
    }
  }, [connection]);

  // Send Message
  const sendMessage = useCallback(async (roomId, message) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        // Lưu ý: Backend method 'SendMessage' thường nhận (roomId, message)
        await connection.invoke(CHAT_HUB.METHODS.SEND_MESSAGE, roomId, message);
        
        // Optimistic UI update: Hiện tin nhắn ngay lập tức cho người gửi
        setMessages((prev) => [
          ...prev, 
          { 
            content: message, 
            isFromCurrentUser: true, 
            timestamp: new Date().toISOString(),
            senderName: "Me" // Tạm thời
          }
        ]);
      } catch (err) {
        console.error('SendMessage failed:', err);
        throw err;
      }
    }
  }, [connection]);

  return {
    messages,
    setMessages,
    sendMessage,
    joinRoom,
    leaveRoom,
    isConnected,
    error
  };
};