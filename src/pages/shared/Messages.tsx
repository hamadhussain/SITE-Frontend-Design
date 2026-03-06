import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { chatApi } from '@/services/api'
import { MessageSquare, Search, Send } from 'lucide-react'

interface Participant {
  id: number
  name: string
  profileImageUrl?: string
}

interface ChatRoom {
  id: number
  name: string
  roomType: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  participants: Participant[]
}

interface ChatMessage {
  id: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
  isDeleted: boolean
}

export default function Messages() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch chat rooms
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms().then((r) => r.data),
    refetchInterval: 15000,
  })

  const rooms: ChatRoom[] = roomsData?.content || []
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || null

  // Fetch messages for selected room
  const { data: messagesData } = useQuery({
    queryKey: ['chat-messages', selectedRoomId],
    queryFn: () =>
      chatApi.getMessages(selectedRoomId!, { size: 50 }).then((r) => r.data),
    enabled: selectedRoomId !== null,
    refetchInterval: 5000,
  })

  const messages: ChatMessage[] = messagesData?.content
    ? [...messagesData.content].reverse()
    : []

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(selectedRoomId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoomId] })
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
    },
  })

  const handleSendMessage = () => {
    const content = newMessage.trim()
    if (!content || !selectedRoomId) return
    setNewMessage('')
    sendMutation.mutate(content)
  }

  // Scroll to bottom when messages load or change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatRoomTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDays === 0) return formatTime(dateString)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.name) return room.name
    const other = room.participants?.find((p) => p.id !== user?.id)
    return other?.name || 'Chat'
  }

  const filteredRooms = rooms.filter((room) =>
    getRoomDisplayName(room).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-600">Communicate with builders and clients</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm h-[calc(100%-4rem)] flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {roomsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations yet</p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedRoomId === room.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium flex-shrink-0">
                      {getRoomDisplayName(room).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{getRoomDisplayName(room)}</h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatRoomTime(room.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {room.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {(room.unreadCount || 0) > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex-shrink-0">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-col flex-1">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                  {getRoomDisplayName(selectedRoom).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">{getRoomDisplayName(selectedRoom)}</h3>
                  <p className="text-xs text-gray-500">{selectedRoom.roomType}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && (
                        <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0 self-end">
                          {message.senderName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs font-medium mb-1 opacity-70">{message.senderName}</p>
                        )}
                        <p>{message.isDeleted ? <em className="opacity-60">Message deleted</em> : message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-foreground/70' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
