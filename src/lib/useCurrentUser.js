"use client";

/**
 * useCurrentUser Hook
 * 
 * This hook fetches the current authenticated user from the API.
 * It can be used in any component to check authentication status.
 * 
 * @returns {Object} { user, loading, error, refetch }
 */

import { useState, useEffect } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches the current user from the API
   */
  const fetchUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          setUser(null);
          setError(null); // Not an error, just not logged in
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user");
        }
      } else {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError(err.message || "Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  /**
   * Refetch user data (useful after login/logout)
   */
  const refetch = () => {
    fetchUser();
  };

  return {
    user,
    loading,
    error,
    refetch,
    isAuthenticated: !!user,
  };
}

