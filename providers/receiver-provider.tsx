"use client";

import { createContext, createRef, useContext, useRef } from "react";

export const ReceiverContext = createContext<
  React.RefObject<string> | undefined
>(undefined);

export const ReceiverProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const valueRef = useRef("");

  return (
    <ReceiverContext.Provider value={valueRef}>
      {children}
    </ReceiverContext.Provider>
  );
};

export const useReceiverRef = () => {
  const receiverRef = useContext(ReceiverContext);

  if (!receiverRef) {
    throw new Error("useReceiverRef must be used within ReceiverProvider");
  }

  return receiverRef;
};
