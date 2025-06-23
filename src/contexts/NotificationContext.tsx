import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
import {
  useNotifications,
  UseNotificationsReturn,
} from "@/hooks/use-notifications";

interface NotificationContextValue extends UseNotificationsReturn {
  showUnreadOnly: boolean;
  toggleUnreadFilter: () => void;
  isNotificationPanelOpen: boolean;
  openNotificationPanel: () => void;
  closeNotificationPanel: () => void;
  toggleNotificationPanel: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const notificationsState = useNotifications(
    showUnreadOnly ? { is_read: false } : undefined,
  );

  const toggleUnreadFilter = useCallback(() => {
    setShowUnreadOnly((prev) => !prev);
  }, []);

  const openNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen(true);
  }, []);

  const closeNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen(false);
  }, []);

  const toggleNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen((prev) => !prev);
  }, []);

  const value: NotificationContextValue = {
    ...notificationsState,
    showUnreadOnly,
    toggleUnreadFilter,
    isNotificationPanelOpen,
    openNotificationPanel,
    closeNotificationPanel,
    toggleNotificationPanel,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
