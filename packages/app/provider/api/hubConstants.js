import { Platform } from 'react-native'

const WEB_DOMAIN = 'https://localhost:5031'
const MOBILE_DOMAIN = 'http://10.0.2.2:5031'
const PROD_DOMAIN = 'https://tokki-be-hneqd2a3dfhmfnhq.koreacentral-01.azurewebsites.net'

// For production, you might want to check an ENV variable
// For now, let's keep the user's localhost preference for dev and the existing prod domain as fallback
const DOMAIN = Platform.OS === 'web' 
  ? (process.env.NODE_ENV === 'production' ? PROD_DOMAIN : WEB_DOMAIN)
  : MOBILE_DOMAIN

const CHAT_PREFIX = '/chatHub'
export const CHAT_BASE_URL = `${DOMAIN}${CHAT_PREFIX}`
export const CHAT_HUB = {
  HUB_URL: CHAT_BASE_URL, 

  METHODS: {
    SEND_MESSAGE: 'SendMessage', 
    JOIN_ROOM: 'JoinRoom',       
    LEAVE_ROOM: 'LeaveRoom'      
  },
  
  EVENTS: {
    RECEIVE_MESSAGE: 'ReceiveMessage', 
    ERROR: 'ErrorMessage' 
  }
};

const NOTIFICATION_PREFIX = '/notificationHub'
export const NOTIFICATION_BASE_URL = `${DOMAIN}${NOTIFICATION_PREFIX}`

export const NOTIFICATION_HUB = {
  HUB_URL: NOTIFICATION_BASE_URL,
  EVENTS: {
    RECEIVE_NOTIFICATION: 'ReceiveNotification'
  }
};
