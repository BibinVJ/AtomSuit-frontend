"use client";

import { useRouter } from "next/navigation";
export const useGoBack = () => {
  const router = useRouter();
  
  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      router.back(); // Go back to the previous page
    } else {
      router.push("/"); // Redirect to home if no history exists
    }
  };
  
  return goBack;
};

export default useGoBack;
