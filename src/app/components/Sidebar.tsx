"use client";

import React, { useState, useEffect } from "react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useToast } from "./ToastProvider";
import ChatListItem from "./ChatListItem";

interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  onSelectChat: (chatId: string | null) => void;
  currentChatId: string | null;
}

export default function Sidebar({ onSelectChat, currentChatId }: SidebarProps) {
  const { user, isLoaded } = useUser();
  const { addToast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://digital-mufti-backend.onrender.com";

  const userId = user?.id || "guest";

  // Fetch chats when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      fetchChats();
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [isLoaded, user, currentChatId]); // Refetch when currentChatId changes to see new titles

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chats?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    setIsCreatingChat(true);
    try {
      const res = await fetch(`${API_URL}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, title: "New Chat" }),
      });

      if (res.ok) {
        const newChat = await res.json();
        // Add to local state and select it
        setChats((prev) => [newChat, ...prev]);
        onSelectChat(newChat.id);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    // Show confirmation toast
    addToast({
      title: "Delete chat?",
      description: "This action cannot be undone.",
      type: "destructive",
      duration: 0, // Don't auto-dismiss
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch(`${API_URL}/api/chats/${chatId}?user_id=${userId}`, {
              method: "DELETE",
            });

            if (res.ok) {
              // Optimistically remove from local state
              setChats((prev) => prev.filter((chat) => chat.id !== chatId));
              // If deleted chat was selected, clear selection
              if (currentChatId === chatId) {
                onSelectChat(null);
              }
              // Show success message
              addToast({
                title: "Chat deleted",
                description: "The chat has been permanently removed.",
                type: "success"
              });
            } else {
              throw new Error(`Failed to delete chat: ${res.status}`);
            }
          } catch (error) {
            console.error("Failed to delete chat:", error);
            addToast({
              title: "Delete failed",
              description: "Could not delete the chat. Please try again.",
              type: "error"
            });
          }
        }
      },
      cancel: {
        label: "Cancel",
        onClick: () => {} // Do nothing on cancel
      }
    });
  };

  const selectChat = (chatId: string) => {
    onSelectChat(chatId);
    // Close mobile sidebar on selection
    setIsMobileOpen(false);
  };

  if (!isLoaded) {
    return (
      <aside className="sidebar loading">
        <div className="sidebar-loading">Loading...</div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button
            className="new-chat-btn"
            onClick={createNewChat}
            disabled={isCreatingChat || !user}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="chat-list">
          {isLoading ? (
            <div className="chat-list-loading">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="chat-list-empty">
              {user ? "No chats yet" : "Sign in to save chats"}
            </div>
          ) : (
            chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onSelect={() => selectChat(chat.id)}
                onDelete={() => deleteChat(chat.id)}
              />
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {isLoaded && user ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.fullName || "User"} />
                  ) : (
                    <span>{user.firstName?.[0] || "U"}</span>
                  )}
                </div>
                <span className="user-name">
                  {user.fullName || user.firstName || "User"}
                </span>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="sign-in-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Sign In</span>
              </button>
            </SignInButton>
          )}
        </div>
      </aside>
    </>
  );
}
