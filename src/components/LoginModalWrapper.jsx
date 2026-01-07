"use client";

import { useLoginModal } from "@/contexts/LoginModalContext";
import LoginModal from "./LoginModal";

export default function LoginModalWrapper() {
  const { isOpen, closeModal } = useLoginModal();

  return <LoginModal isOpen={isOpen} onClose={closeModal} />;
}

