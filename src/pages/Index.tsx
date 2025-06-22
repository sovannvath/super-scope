import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Index: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-metallic-background via-white to-metallic-light">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-metallic-primary to-metallic-secondary rounded-full mb-4 shadow-lg">
          <span className="text-white font-bold text-xl">EC</span>
        </div>
        <h1 className="text-2xl font-semibold text-metallic-primary flex items-center justify-center gap-3 mb-4">
          <Loader2 className="animate-spin h-6 w-6" />
          EcommerceHub
        </h1>
        <p className="text-metallic-tertiary">
          Loading your personalized experience...
        </p>
      </div>
    </div>
  );
};

export default Index;
