// src/pages/foods/RegisterFoodPage.tsx

import { GlassCard } from "../components/ui/GlassUI";

export const RegisterFoodPage = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-light text-gray-800 mb-8">食品追加</h1>

      <GlassCard className="p-8">
        <div className="text-center py-16">
          <div className="text-4xl mb-4 opacity-50">➕</div>
          <h3 className="text-xl font-light text-gray-800 mb-2">
            食品追加機能
          </h3>
          <p className="text-gray-600">新しい食品を登録する機能は開発中です</p>
        </div>
      </GlassCard>
    </div>
  );
};
