import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as signalR from '@microsoft/signalr';
import { NOTIFICATION_HUB } from '../../../provider/api/hubConstants';

export const useNotificationSignalR = (token, onNotificationReceived) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    // Disable SignalR on Mobile
    if (Platform.OS !== 'web') {
      return;
    }

    if (!token) {
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
        startedRef.current = false;
      }
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(NOTIFICATION_HUB.HUB_URL, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })

      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [token]);

  useEffect(() => {
    if (!connection) return;

    if (startedRef.current || connection.state !== signalR.HubConnectionState.Disconnected) {
      return;
    }

    connection.on(NOTIFICATION_HUB.EVENTS.RECEIVE_NOTIFICATION, (notification, unreadCount) => {
      if (onNotificationReceived) {
        onNotificationReceived(notification, unreadCount);
      }
    });


    startedRef.current = true;
    connection.start()
      .then(() => {
        console.log('SignalR Connected to NotificationHub');
        setIsConnected(true);
      })
      .catch((err) => {
        console.error('NotificationHub connection failed: ', err);
        startedRef.current = false;
      });

    return () => {
      connection.off(NOTIFICATION_HUB.EVENTS.RECEIVE_NOTIFICATION);
      startedRef.current = false;
    };
  }, [connection, onNotificationReceived]);

  return { isConnected };
};
