"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signUp } from "../lib/auth-client";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful sign in / sign up (before onClose). */
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

type Mode = "signin" | "signup";

export default function AuthModal({ open, onClose, onSuccess, title, description }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setError(null);
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await signUp.email({ email, password, name: name || email });
        if (error) throw new Error(error.message || "Sign up failed");
      } else {
        const { error } = await signIn.email({ email, password });
        if (error) throw new Error(error.message || "Sign in failed");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="dialog auth-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="auth-title" className="dialog-title">
              {mode === "signin"
                ? title || "Sign in to AI Mufti"
                : "Create your account"}
            </h2>
            <p className="dialog-desc">
              {mode === "signin"
                ? description || "Sign in to save and revisit your conversations."
                : "Create an account to keep your chat history."}
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === "signup" && (
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              )}
              <input
                type="email"
                className="auth-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <input
                type="password"
                className="auth-input"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={8}
                required
              />

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="dialog-btn primary auth-submit" disabled={loading}>
                {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="auth-switch">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  reset();
                }}
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
