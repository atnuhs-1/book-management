// src/components/ui/GlassUI.tsx
// グラスモーフィズムデザインの基盤コンポーネント群

import React from "react";

// ✅ 基本的なグラスカードコンポーネント
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "hover" | "active";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  onClick,
  variant = "default",
}) => {
  const baseClasses =
    "bg-white/30 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl";
  const variantClasses = {
    default: "",
    hover:
      "hover:shadow-2xl hover:-translate-y-1 hover:bg-white/40 transition-all duration-500",
    active: "bg-white/50 shadow-2xl border-white/40",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};  

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

// ✅ グラデーション背景コンポーネント
interface GlassBackgroundProps {
  children: React.ReactNode;
  variant?: "blue" | "purple" | "multi";
}

export const GlassBackground: React.FC<GlassBackgroundProps> = ({
  children,
  variant = "blue",
}) => {
  const backgroundClasses = {
    blue: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
    purple: "bg-gradient-to-br from-purple-50 to-blue-100",
    multi: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
  };

  return (
    <div
      className={`min-h-screen ${backgroundClasses[variant]} relative overflow-hidden`}
    >
      {/* 浮遊する装飾要素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-pink-200/30 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {children}
    </div>
  );
};

// ✅ グラスボタンコンポーネント
interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
}) => {
  const baseClasses =
    "font-medium transition-all duration-300 rounded-xl backdrop-blur-xl shadow-xl";

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-white/30 border border-white/20 hover:bg-white/40 text-gray-800",
    secondary:
      "bg-gray-200/30 border border-gray-200/20 hover:bg-gray-200/40 text-gray-700",
    outline:
      "bg-transparent border-2 border-white/40 hover:bg-white/20 text-gray-800",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "hover:shadow-2xl hover:-translate-y-0.5";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
          読み込み中...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// ✅ グラス入力フィールドコンポーネント
interface GlassInputProps {
  label?: string; 
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
  icon?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
  error,
  icon,
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-white">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-2 ${
            icon ? "pl-10" : ""
          } bg-white/30 backdrop-blur-xl border border-white/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 ${
            error ? "border-red-300 focus:border-red-500" : ""
          }`}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};


// ✅ グラス統計カードコンポーネント
interface GlassStatCardProps {
  title: string;
  value: number | string;
  icon?: string;
  gradient?: string;
  onClick?: () => void;
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({
  title,
  value,
  icon,
  gradient = "from-blue-400/30 to-blue-500/30",
  onClick,
}) => {
  return (
    <GlassCard
      variant={onClick ? "hover" : "default"}
      className={`p-6 text-center ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div
        className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} backdrop-blur-sm rounded-2xl mb-4 shadow-xl`}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-light text-gray-800 mb-2">{value}</div>
      <div className="text-gray-600 text-sm">{title}</div>
    </GlassCard>
  );
};

// ✅ ローディングコンポーネント
export const GlassLoading: React.FC<{ message?: string }> = ({
  message = "読み込み中...",
}) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// ✅ エラー表示コンポーネント
interface GlassErrorProps {
  message: string;
  onRetry?: () => void;
}

export const GlassError: React.FC<GlassErrorProps> = ({ message, onRetry }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center">
        <span className="text-red-400 mr-2 text-xl">❌</span>
        <div className="flex-1">
          <p className="text-red-800 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 hover:text-red-800 text-sm underline mt-1"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

// ✅ 空状態表示コンポーネント
interface GlassEmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const GlassEmptyState: React.FC<GlassEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-xl font-light text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {actionLabel && onAction && (
        <GlassButton onClick={onAction} variant="primary">
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
};

// ✅ グラスナビゲーションアイテム
interface GlassNavItemProps {
  id: string;
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const GlassNavItem: React.FC<GlassNavItemProps> = ({
  id,
  label,
  emoji,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
        isActive
          ? "bg-white/40 backdrop-blur-xl text-gray-800 shadow-lg border border-white/30"
          : "text-gray-600 hover:text-gray-800 hover:bg-white/20"
      }`}
    >
      <span className="mr-2">{emoji}</span>
      {label}
    </button>
  );
};

// ✅ モバイル用タブナビゲーション
interface GlassMobileTabProps {
  id: string;
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const GlassMobileTab: React.FC<GlassMobileTabProps> = ({
  id,
  label,
  emoji,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-white/40 backdrop-blur-xl text-gray-800 shadow-lg border border-white/30"
          : "text-gray-600 hover:text-gray-800 hover:bg-white/20"
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

interface GlassFABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const GlassFAB: React.FC<GlassFABProps> = ({
  onClick,
  icon,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-0 flex items-center justify-center ${className}`}
    >
      {icon || <span className="text-xl font-bold">+</span>}
    </button>
  );
};
