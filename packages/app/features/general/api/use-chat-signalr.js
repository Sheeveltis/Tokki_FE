// src/api/useChatSignalR.js
import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { CHAT_HUB } from '../../../provider/api/hubConstants'; // Nhớ trỏ đúng đường dẫn file config của bạn

export const useChatSignalR = (token, initialRoomId = null) => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [roomId, setRoomId] = useState(initialRoomId);

  // Ref để theo dõi roomId hiện tại nhằm re-join khi reconnect
  const roomIdRef = useRef(roomId);
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

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
        incoming = {
          ...args[0],
          timestamp: args[0].createdAt || args[0].timestamp || new Date().toISOString(),
        };
      } else {
        const [user, message, timestamp] = args;
        incoming = {
          senderId: typeof user === 'object' ? user.id : null,
          senderName: typeof user === 'object' ? user.name : user,
          content: message,
          timestamp: timestamp || new Date().toISOString(),
        };
      }

      setMessages((prev) => {
        // 1. Kiểm tra ID trùng (ưu tiên ID từ server)
        if (incoming.id && prev.some(m => m.id?.toString() === incoming.id?.toString())) {
          return prev;
        }

        // 2. Tìm và thay thế tin nhắn tạm (temp-) của chính người gửi này
        // So sánh nội dung và senderId (chuyển về string để chính xác)
        const tempIndex = prev.findIndex(m => 
          m.id?.toString().startsWith('temp-') && 
          m.content === incoming.content && 
          m.senderId?.toString() === incoming.senderId?.toString()
        );

        if (tempIndex !== -1) {
          const newMsgs = [...prev];
          newMsgs[tempIndex] = incoming;
          return newMsgs;
        }

        // 3. Kiểm tra trùng nội dung trong thời gian ngắn (phòng trường hợp ID không ổn định)
        const isContentDuplicate = prev.some(m => 
          m.content === incoming.content && 
          m.senderId?.toString() === incoming.senderId?.toString() &&
          Math.abs(new Date(m.timestamp).getTime() - new Date(incoming.timestamp).getTime()) < 5000
        );

        if (isContentDuplicate) return prev;

        return [...prev, incoming];
      });
    });

    // C. Tự động re-join room khi reconnect thành công
    connection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected. ConnectionId:', connectionId);
      setIsConnected(true);
      if (roomIdRef.current) {
        connection.invoke(CHAT_HUB.METHODS.JOIN_ROOM, roomIdRef.current)
          .then(() => console.log('Auto re-joined room:', roomIdRef.current))
          .catch(err => console.error('Auto re-join failed:', err));
      }
    });

    connection.onreconnecting((err) => {
      console.warn('SignalR Reconnecting...', err);
      setIsConnected(false);
    });

    // B. Lắng nghe thông báo đóng phòng
    connection.on(CHAT_HUB.EVENTS.ROOM_CLOSED, (closedRoomId) => {
      console.log('SignalR: Room closed -', closedRoomId);
      if (roomIdRef.current === closedRoomId) {
        setRoomId(null);
        // Có thể gọi thêm callback nếu cần
      }
    });

    // C. Lắng nghe lỗi từ server (nếu có)
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
  const joinRoom = useCallback(async (id) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke(CHAT_HUB.METHODS.JOIN_ROOM, id);
        console.log(`Joined room: ${id}`);
        setRoomId(id); // Lưu lại roomId để re-join khi cần
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
    error,
    roomId
  };
};