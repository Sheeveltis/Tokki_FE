const DOMAIN = 'http://localhost:5031'
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