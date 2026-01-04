"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function ChatListItem({ chat, isActive, onSelect, onDelete }: ChatListItemProps) {
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://digital-mufti-backend.onrender.com";
  const userId = user?.id || "guest";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setShowMenu(false);
  };

  const handleEdit = async () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const saveTitle = async () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      try {
        await fetch(`${API_URL}/api/chats/${chat.id}/title`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, title: editTitle.trim() }),
        });
      } catch (error) {
        console.error("Failed to update title:", error);
      }
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditTitle(chat.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(chat.title);
    }
  };

  return (
    <div className={`chat-list-item ${isActive ? "active" : ""}`} onClick={onSelect}>
      {isEditing ? (
        <input
          type="text"
          className="chat-title-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <div className="chat-item-content">
            <span className="chat-title">{chat.title}</span>
            <span className="chat-date">{formatDate(chat.updated_at)}</span>
          </div>

          <div className="chat-item-actions">
            <button
              className="chat-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              aria-label="Chat options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>

            {showMenu && (
              <div className="chat-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleEdit}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2 2 2 2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Rename
                </button>
                <button onClick={handleDelete} className="delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="menu-backdrop"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
