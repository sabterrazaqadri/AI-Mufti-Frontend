"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSession, signOut } from "../lib/auth-client";
import { useToast } from "./ToastProvider";
import { useConfirm } from "./ConfirmProvider";
import AuthModal from "./AuthModal";
import ChatListItem from "./ChatListItem";
import { chatApi, type Chat } from "../lib/api";

interface SidebarProps {
  onSelectChat: (chatId: string | null) => void;
  currentChatId: string | null;
}

export default function Sidebar({ onSelectChat, currentChatId }: SidebarProps) {
  const { data: session, isPending } = useSession();
  const user = session?.user ?? null;
  const isLoaded = !isPending;
  const { addToast } = useToast();
  const confirm = useConfirm();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      const res = await chatApi.list();
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch chats when user is loaded / a new chat appears
  useEffect(() => {
    if (isLoaded && user) {
      fetchChats();
    } else if (isLoaded && !user) {
      setChats([]);
      setIsLoading(false);
    }
  }, [isLoaded, user, currentChatId, fetchChats]);

  const createNewChat = async () => {
    setIsCreatingChat(true);
    try {
      const res = await chatApi.create();
      if (res.ok) {
        const newChat = await res.json();
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
    const ok = await confirm({
      title: "Delete chat?",
      description: "This conversation will be permanently removed. This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;

    try {
      const res = await chatApi.remove(chatId);
      if (res.ok) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        if (currentChatId === chatId) onSelectChat(null);
        addToast({
          title: "Chat deleted",
          description: "The chat has been permanently removed.",
          type: "success",
        });
      } else {
        throw new Error(`Failed to delete chat: ${res.status}`);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      addToast({
        title: "Delete failed",
        description: "Could not delete the chat. Please try again.",
        type: "error",
      });
    }
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
                  {user.image ? (
                    <Image src={user.image} alt={user.name || "User"} width={32} height={32} />
                  ) : (
                    <span>{(user.name || user.email || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="user-name">{user.name || user.email || "User"}</span>
              </div>
              <button
                className="sign-out-btn"
                onClick={() => signOut()}
                title="Sign out"
                aria-label="Sign out"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button className="sign-in-btn" onClick={() => setShowAuth(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
