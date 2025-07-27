// src/pages/PrivacyPage.tsx

import { Link } from "react-router-dom";

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              📚 Book Management PWA
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            プライバシーポリシー
          </h2>
          <p className="text-gray-600">最終更新日：2024年12月27日</p>
        </div>

        {/* プライバシーポリシー本文 */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* 基本方針 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🔒 基本方針
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                書籍管理PWA（以下「当サービス」）は、ユーザーの個人情報の保護を重要視し、個人情報保護法および関連法令を遵守し、適切な個人情報の取扱いを行います。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  🎯 私たちの約束
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• お客様の個人情報を適切に保護します</li>
                  <li>• 必要最小限の情報のみ収集します</li>
                  <li>• 透明性のある情報管理を行います</li>
                  <li>• お客様の権利を尊重します</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 第1条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第1条（収集する個人情報）
            </h3>
            <div className="text-gray-700 space-y-4">
              <p>当サービスでは、以下の個人情報を収集します：</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    📝 登録情報
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• メールアドレス</li>
                    <li>• ユーザー名</li>
                    <li>• パスワード（暗号化保存）</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                  <h4 className="font-medium text-purple-900 mb-2">
                    📚 サービス利用情報
                  </h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• 登録した書籍情報</li>
                    <li>• 読書進捗データ</li>
                    <li>• アプリ設定情報</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                  <h4 className="font-medium text-orange-900 mb-2">
                    💻 技術情報
                  </h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• IPアドレス</li>
                    <li>• ブラウザ情報</li>
                    <li>• デバイス情報</li>
                    <li>• アクセスログ</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="font-medium text-red-900 mb-2">📱 位置情報</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• 収集しません</li>
                    <li>• 将来機能で明示的同意時のみ</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第2条（個人情報の利用目的）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>収集した個人情報は、以下の目的で利用します：</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    🚀 サービス提供
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ユーザー認証</li>
                    <li>• 書籍データの管理</li>
                    <li>• カスタマイズ機能の提供</li>
                    <li>• 読書統計の表示</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    📞 サポート
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• お問い合わせ対応</li>
                    <li>• 技術サポート</li>
                    <li>• 重要な通知の送信</li>
                    <li>• セキュリティ関連の連絡</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    🔧 改善・開発
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• サービス品質の向上</li>
                    <li>• 新機能の開発</li>
                    <li>• バグの修正</li>
                    <li>• 利用傾向の分析</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    🛡️ セキュリティ
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 不正利用の防止</li>
                    <li>• セキュリティ事故の調査</li>
                    <li>• 規約違反の対応</li>
                    <li>• システムの安全性確保</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第3条（個人情報の第三者提供）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当サービスは、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
                <li>
                  公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合
                </li>
                <li>
                  国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合
                </li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-medium text-yellow-900 mb-2">
                  🤝 外部サービス連携
                </h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p>以下の外部サービスと連携する場合があります：</p>
                  <ul className="space-y-1">
                    <li>
                      • <strong>Google Books API</strong>:
                      書籍情報の取得（ISBN、タイトル等）
                    </li>
                    <li>
                      • <strong>クラウドストレージ</strong>:
                      データバックアップ（将来機能）
                    </li>
                    <li>
                      • <strong>分析ツール</strong>: 匿名化された利用統計
                    </li>
                  </ul>
                  <p className="text-xs">
                    ※ これらの連携時も個人を特定できる情報は送信しません
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第4条（個人情報の保存期間）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>個人情報の保存期間は以下の通りです：</p>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      📝 アカウント情報
                    </h5>
                    <p className="text-gray-600">アカウント削除まで保存</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      📚 書籍データ
                    </h5>
                    <p className="text-gray-600">ユーザーが削除するまで保存</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      📊 利用ログ
                    </h5>
                    <p className="text-gray-600">最大2年間</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      🗑️ 削除済みデータ
                    </h5>
                    <p className="text-gray-600">30日後に完全削除</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第5条（個人情報の安全管理）
            </h3>
            <div className="text-gray-700 space-y-4">
              <p>
                当サービスは、個人情報の漏洩、滅失、毀損の防止その他の安全管理のために、必要かつ適切な措置を講じます：
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    🔐 技術的措置
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• SSL/TLS暗号化通信</li>
                    <li>• パスワードのハッシュ化</li>
                    <li>• JWT認証トークン</li>
                    <li>• ファイアウォール設置</li>
                    <li>• 定期的なセキュリティ更新</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    👥 組織的措置
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• アクセス権限の制限</li>
                    <li>• 開発チーム内での情報共有制限</li>
                    <li>• セキュリティ教育の実施</li>
                    <li>• インシデント対応手順の整備</li>
                    <li>• 定期的なセキュリティ監査</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="font-medium text-red-900 mb-2">
                  🚨 セキュリティインシデント対応
                </h4>
                <p className="text-sm text-red-800">
                  万が一セキュリティインシデントが発生した場合は、速やかに影響範囲を調査し、
                  必要に応じて関係当局への報告およびユーザーへの通知を行います。
                </p>
              </div>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第6条（ユーザーの権利）
            </h3>
            <div className="text-gray-700 space-y-4">
              <p>ユーザーは、自己の個人情報について以下の権利を有します：</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                  <h4 className="font-medium text-purple-900 mb-2">
                    👀 開示・確認権
                  </h4>
                  <p className="text-sm text-purple-800 mb-2">
                    保有する個人情報の開示を求めることができます
                  </p>
                  <p className="text-xs text-purple-600">
                    設定画面から確認可能
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                  <h4 className="font-medium text-orange-900 mb-2">
                    ✏️ 訂正・追加権
                  </h4>
                  <p className="text-sm text-orange-800 mb-2">
                    個人情報の訂正・追加を求めることができます
                  </p>
                  <p className="text-xs text-orange-600">
                    設定画面から変更可能
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="font-medium text-red-900 mb-2">🗑️ 削除権</h4>
                  <p className="text-sm text-red-800 mb-2">
                    個人情報の削除を求めることができます
                  </p>
                  <p className="text-xs text-red-600">
                    アカウント削除機能から実行
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    📤 データポータビリティ権
                  </h4>
                  <p className="text-sm text-gray-800 mb-2">
                    個人情報の移行を求めることができます
                  </p>
                  <p className="text-xs text-gray-600">
                    エクスポート機能で対応
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  📞 権利行使の方法
                </h4>
                <p className="text-sm text-blue-800 mb-2">
                  上記の権利を行使される場合は、以下の方法でご連絡ください：
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• アプリ内設定画面からの操作</li>
                  <li>• サポートメール: privacy@book-management-pwa.com</li>
                  <li>• お問い合わせフォーム</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第7条（Cookie等の利用）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当サービスでは、以下の技術を使用してユーザーの利便性向上を図っています：
              </p>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    🍪 ローカルストレージ
                  </h4>
                  <div className="text-sm text-green-800 space-y-2">
                    <p>
                      <strong>目的:</strong> ログイン状態の維持、設定の保存
                    </p>
                    <p>
                      <strong>保存期間:</strong> ユーザーが削除するまで
                    </p>
                    <p>
                      <strong>無効化:</strong> ブラウザ設定から削除可能
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    🔑 JWT トークン
                  </h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      <strong>目的:</strong> 認証状態の管理
                    </p>
                    <p>
                      <strong>保存期間:</strong> 30分（自動更新）
                    </p>
                    <p>
                      <strong>暗号化:</strong> HS256アルゴリズム使用
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第8条（プライバシーポリシーの変更）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当サービスは、法令の変更やサービスの改善に伴い、本プライバシーポリシーを変更する場合があります。
              </p>
              <p>
                重要な変更の場合は、ユーザーに事前に通知します。変更後も当サービスを継続してご利用いただく場合は、変更後のプライバシーポリシーに同意したものとみなします。
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-medium text-yellow-900 mb-2">
                  📢 変更通知方法
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• アプリ内通知</li>
                  <li>• 登録メールアドレスへの通知</li>
                  <li>• 公式ウェブサイトでの告知</li>
                  <li>• アプリ起動時のポップアップ表示</li>
                </ul>
              </div>
            </div>
          </section>

          {/* お問い合わせ */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📞 お問い合わせ窓口
            </h3>
            <div className="bg-gray-50 rounded-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    💌 一般的なお問い合わせ
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📧 メール: support@book-management-pwa.com</p>
                    <p>⏰ 対応時間: 平日 9:00-18:00</p>
                    <p>📱 アプリ内お問い合わせフォーム</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    🔒 プライバシー関連
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📧 メール: privacy@book-management-pwa.com</p>
                    <p>⏰ 対応時間: 平日 9:00-18:00</p>
                    <p>📞 緊急時: 03-XXXX-XXXX</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 お問い合わせ時にご準備いただく情報
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• ユーザー名（アカウントの特定のため）</li>
                  <li>• 登録メールアドレス</li>
                  <li>• お問い合わせ内容の詳細</li>
                  <li>• 関連するスクリーンショット（該当する場合）</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 戻るボタン */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium mr-4"
            >
              ✅ 内容を理解して新規登録
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              📋 利用規約を確認
            </Link>
            <div className="mt-4">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                ← ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
