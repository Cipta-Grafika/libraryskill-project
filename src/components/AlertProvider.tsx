"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";
import "../styles/alert.css";

export type AlertType = "success" | "error" | "warning" | "info" | "prompt";

export interface AlertOptions {
  type?: AlertType;
  title?: string;
  message: string;
  defaultValue?: string; // used for prompt
}

interface AlertContextValue {
  showAlert: (options: AlertOptions) => Promise<void>;
  showPrompt: (options: AlertOptions) => Promise<string | null>;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

interface ActiveModal extends AlertOptions {
  id: number;
  resolveAlert?: () => void;
  resolvePrompt?: (value: string | null) => void;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ActiveModal[]>([]);
  const idCounter = useRef(0);
  const [inputValue, setInputValue] = useState("");

  const showAlert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      const id = ++idCounter.current;
      setModals((prev) => [
        ...prev,
        {
          ...options,
          id,
          type: options.type || "info",
          resolveAlert: resolve,
        },
      ]);
    });
  }, []);

  const showPrompt = useCallback((options: AlertOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      const id = ++idCounter.current;
      setInputValue(options.defaultValue || "");
      setModals((prev) => [
        ...prev,
        {
          ...options,
          id,
          type: "prompt",
          resolvePrompt: resolve,
        },
      ]);
    });
  }, []);

  const closeModal = (id: number, promptValue: string | null = null) => {
    setModals((prev) => {
      const modal = prev.find((m) => m.id === id);
      if (modal) {
        if (modal.resolveAlert) modal.resolveAlert();
        if (modal.resolvePrompt) modal.resolvePrompt(promptValue);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showPrompt }}>
      {children}
      {modals.length > 0 && (
        <div className="alert-overlay">
          {modals.map((modal) => {
            const isPrompt = modal.type === "prompt";
            
            const iconMap = {
              success: <CheckCircle className="alert-icon alert-icon-success" />,
              error: <XCircle className="alert-icon alert-icon-error" />,
              warning: <AlertTriangle className="alert-icon alert-icon-warning" />,
              info: <Info className="alert-icon alert-icon-info" />,
              prompt: <Info className="alert-icon alert-icon-info" />
            };

            const typeClass = modal.type || "info";

            return (
              <div key={modal.id} className="alert-modal">
                <div className={`alert-header alert-header-${typeClass}`}>
                  <div className="alert-title-container">
                    {iconMap[typeClass]}
                    <h3 className="alert-title">{modal.title || (isPrompt ? "Input Required" : "Alert")}</h3>
                  </div>
                  <button onClick={() => closeModal(modal.id, null)} className="alert-close-btn">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="alert-body">
                  <p className="alert-message">{modal.message}</p>
                  
                  {isPrompt && (
                    <input
                      type="text"
                      className="alert-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") closeModal(modal.id, inputValue);
                      }}
                      autoFocus
                    />
                  )}
                </div>

                <div className="alert-footer">
                  {isPrompt && (
                    <button onClick={() => closeModal(modal.id, null)} className="alert-btn alert-btn-cancel">
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => closeModal(modal.id, isPrompt ? inputValue : null)}
                    className="alert-btn alert-btn-primary"
                  >
                    OK
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AlertContext.Provider>
  );
}
