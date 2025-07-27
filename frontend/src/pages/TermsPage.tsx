// src/pages/TermsPage.tsx

import { Link } from "react-router-dom";

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              📚 Book Management PWA
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">利用規約</h2>
          <p className="text-gray-600">最終更新日：2024年12月27日</p>
        </div>

        {/* 利用規約本文 */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* 第1条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第1条（適用）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                この利用規約（以下「本規約」）は、書籍管理PWA（以下「本サービス」）の利用に関する条件を定めるものです。
              </p>
              <p>
                ユーザーは、本サービスを利用することにより、本規約に同意したものとみなします。
              </p>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第2条（利用登録）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                本サービスの利用希望者は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
              </p>
              <p>
                当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、当社が利用登録を相当でないと判断した場合</li>
              </ul>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第3条（ユーザーIDおよびパスワードの管理）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
              </p>
              <p>
                ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。
              </p>
              <p>
                ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。
              </p>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第4条（利用料金）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>本サービスは現在無料で提供されています。</p>
              <p>
                将来的に有料プランを導入する場合は、事前にユーザーに通知し、同意を得るものとします。
              </p>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第5条（禁止事項）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>
                  本サービスの内容等、本サービスに含まれる著作権、商標権その他の知的財産権を侵害する行為
                </li>
                <li>
                  当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
                </li>
                <li>本サービスによって得られた情報を商業的に利用する行為</li>
                <li>当社のサービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>
                  違法、不正または不当な目的を持って本サービスを利用する行為
                </li>
                <li>反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第6条（本サービスの提供の停止等）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
                </li>
                <li>
                  地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
                </li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当社が本サービスの提供が困難と判断した場合</li>
              </ul>
              <p>
                当社は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
              </p>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第7条（利用制限および登録抹消）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>料金等の支払債務の不履行があった場合</li>
                <li>当社からの連絡に対し、一定期間返答がない場合</li>
                <li>
                  本サービスについて、最終の利用から一定期間利用がない場合
                </li>
                <li>
                  その他、当社が本サービスの利用を適当でないと判断した場合
                </li>
              </ul>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第8条（退会）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                ユーザーは、当社の定める退会手続きにより、本サービスから退会できるものとします。
              </p>
            </div>
          </section>

          {/* 第9条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第9条（保証の否認および免責事項）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
              </p>
              <p>
                当社は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。
              </p>
            </div>
          </section>

          {/* 第10条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第10条（サービス内容の変更等）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
              </p>
            </div>
          </section>

          {/* 第11条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第11条（利用規約の変更）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
              </p>
              <p>
                なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
              </p>
            </div>
          </section>

          {/* 第12条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第12条（個人情報の取扱い）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                当社は、本サービスの利用によって取得する個人情報については、当社のプライバシーポリシーに従い適切に取り扱うものとします。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 収集する情報
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• メールアドレス（ログイン認証用）</li>
                  <li>• ユーザー名（表示用）</li>
                  <li>• 書籍データ（登録した書籍情報）</li>
                  <li>• 利用ログ（セキュリティ確保のため）</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="font-medium text-green-900 mb-2">
                  🔒 情報の利用目的
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• サービスの提供および運営のため</li>
                  <li>• ユーザーからのお問い合わせに回答するため</li>
                  <li>• サービスの改善・開発のため</li>
                  <li>• 規約違反や不正利用の防止のため</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 第13条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第13条（通知または連絡）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。
              </p>
              <p>
                当社は、ユーザーから、当社が別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。
              </p>
            </div>
          </section>

          {/* 第14条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第14条（権利義務の譲渡の禁止）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>
                ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
              </p>
            </div>
          </section>

          {/* 第15条 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              第15条（準拠法・裁判管轄）
            </h3>
            <div className="text-gray-700 space-y-3">
              <p>本規約の解釈にあたっては、日本法を準拠法とします。</p>
              <p>
                本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
              </p>
            </div>
          </section>

          {/* お問い合わせ */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📞 お問い合わせ
            </h3>
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-gray-700 mb-2">
                本規約に関するお問い合わせは、以下の方法でご連絡ください：
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📧 メール: support@book-management-pwa.com</p>
                <p>📱 アプリ内お問い合わせフォーム</p>
                <p>💬 GitHubイシュー（開発版）</p>
              </div>
            </div>
          </section>

          {/* 同意ボタン */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ✅ 規約に同意して新規登録
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
