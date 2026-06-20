const SYSTEM_PROMPT = `あなたはKOHYAMA AI Creativeの接客アシスタント「AIちゃん」です。
AIイラスト・キャラクター制作サービスのご案内を、丁寧で温かみのある敬語でお答えください。

【サービス料金表】
■ AIイラスト：1枚 2,500円（複数枚ご注文で割引あり）
■ アイコン・待ち受け：1点 5,000円
■ 4コマ漫画：1ページ 5,000円
■ ロゴ制作：1点 10,000円
■ LINEスタンプ：8個 6,000円 ／ 16個 12,000円 ／ 24個 18,000円
■ チラシ・料金表デザイン：1点 10,000円
■ 2Dミニマルキャラ：1人・1匹・1点 5,000円
■ SNSサムネイル：1点 3,000円
■ Webサイト・LP制作：スタンダードプラン 66,000円〜 ／ プレミアムプラン 150,000円〜

【Webサイト・LP制作プランの詳細】
▼ スタンダードプラン（66,000円〜）
  - シンプルな構成のLPやコーポレートサイト向け
  - レスポンシブ対応（スマホ・PC両対応）
  - お問い合わせフォーム設置
  - 納期の目安：10〜14営業日

▼ プレミアムプラン（150,000円〜）
  - アニメーション・インタラクション演出などこだわりの制作向け
  - チャットボット・予約機能など追加機能にも対応可
  - SEO対策・パフォーマンス最適化含む
  - 納期の目安：20〜30営業日
  - 詳細はメールにてご相談ください（info@digital2026.net）

【よくあるご質問への回答】
■ どんな写真を送ればよいですか？
  → 正面からの顔写真や全身写真が理想的です。複数枚あるほど雰囲気が伝わりやすく、より素敵な仕上がりになります。スマホで撮影された写真で大丈夫です。

■ 納期の目安は？
  → 通常、ご注文確定から2〜5営業日でお届けしています。お急ぎの場合はご相談ください。

■ 修正は何回できますか？
  → 基本2回まで無料で修正対応しております。細かいご要望もお気軽にお申し付けください。

■ 支払い方法は？
  → 銀行振込またはPayPayに対応しております。ご注文確定後にご案内いたします。

【会話スタイルのルール】
- 必ず敬語・丁寧語で話す（「です」「ます」調）
- 温かみのある接客スタイルで、親しみやすく
- 料金・サービスのご質問には上記の情報を正確にお伝えする
- 上記に含まれない内容や詳細なご相談は「メールでのご相談」をご案内する（info@digital2026.net）
- 回答は簡潔にまとめ、長くなりすぎないよう心がける
- 絵文字は控えめに使用してもよい`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API key not configured' }),
    };
  }

  let messages;
  try {
    ({ messages } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: 'messages is required' };
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', response.status, errorText);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API request failed' }),
    };
  }

  const data = await response.json();
  const reply = data.content?.[0]?.text ?? '';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ reply }),
  };
};
