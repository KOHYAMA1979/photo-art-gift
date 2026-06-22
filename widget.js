/*
 * DONくん チャットウィジェット（単独動作版）
 * 使い方: クライアントのHTMLに次の1行を貼るだけ
 *   <script src="widget.js"></script>
 *
 * 任意設定（読み込み前に window.DON_WIDGET を定義すると上書き可能）:
 *   window.DON_WIDGET = {
 *     endpoint: 'https://photo-art-gift.netlify.app/.netlify/functions/chat', // APIエンドポイント
 *     avatar:   'https://photo-art-gift.netlify.app/assets/don-icon.png'      // アバター画像URL
 *   };
 */
(function () {
  'use strict';

  if (window.__donWidgetLoaded) return;
  window.__donWidgetLoaded = true;

  var cfg = window.DON_WIDGET || {};
  var ENDPOINT = cfg.endpoint || '/.netlify/functions/chat';
  var AVATAR = cfg.avatar || 'assets/don-icon.png';

  var CSS = [
    '.cb-btn {',
    '  position: fixed;',
    '  bottom: calc(24px + env(safe-area-inset-bottom));',
    '  right: 20px;',
    '  width: 56px;',
    '  height: 56px;',
    '  border-radius: 50%;',
    '  background: #00a8e8;',
    '  border: none;',
    '  cursor: pointer;',
    '  box-shadow: 0 4px 20px rgba(0, 168, 232, 0.45);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  z-index: 9000;',
    '  transition: transform 150ms ease, box-shadow 150ms ease;',
    '}',
    '.cb-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0, 168, 232, 0.55); }',
    '.cb-btn:active { transform: scale(0.96); }',
    '.cb-btn svg { display: block; }',
    '.cb-btn .cb-icon-close { display: none; }',
    '.cb-btn.is-open .cb-icon-chat { display: none; }',
    '.cb-btn.is-open .cb-icon-close { display: block; }',
    '',
    '.cb-badge {',
    '  position: absolute;',
    '  top: -2px;',
    '  right: -2px;',
    '  width: 14px;',
    '  height: 14px;',
    '  background: #e74c3c;',
    '  border-radius: 50%;',
    '  border: 2px solid #f7f9fc;',
    '  display: none;',
    '}',
    '.cb-badge.show { display: block; }',
    '',
    '.cb-window {',
    '  position: fixed;',
    '  bottom: calc(92px + env(safe-area-inset-bottom));',
    '  right: 20px;',
    '  width: min(360px, calc(100vw - 32px));',
    '  max-height: min(520px, calc(100vh - 120px));',
    '  background: #fff;',
    '  border-radius: 16px;',
    '  box-shadow: 0 8px 40px rgba(6, 21, 44, 0.22);',
    '  display: flex;',
    '  flex-direction: column;',
    '  z-index: 8999;',
    '  overflow: hidden;',
    '  transform: translateY(16px) scale(0.97);',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1),',
    '              opacity 200ms ease;',
    '}',
    '.cb-window.is-open {',
    '  transform: translateY(0) scale(1);',
    '  opacity: 1;',
    '  pointer-events: auto;',
    '}',
    '',
    '.cb-header {',
    '  background: #06152c;',
    '  color: #fff;',
    '  padding: 14px 16px;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 10px;',
    '  flex-shrink: 0;',
    '}',
    '.cb-avatar {',
    '  width: 36px;',
    '  height: 36px;',
    '  border-radius: 50%;',
    '  background: #00a8e8;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 18px;',
    '  flex-shrink: 0;',
    '  object-fit: cover;',
    '}',
    '.cb-header-text { flex: 1; }',
    '.cb-header-name {',
    '  font-size: 0.88rem;',
    '  font-weight: 700;',
    '  line-height: 1.3;',
    '  display: flex;',
    '  align-items: baseline;',
    '  gap: 0.35em;',
    '  flex-wrap: nowrap;',
    '  white-space: nowrap;',
    '}',
    '.cb-header-char-note {',
    '  font-size: 0.62rem;',
    '  font-weight: 500;',
    '  color: #64748b;',
    '  white-space: nowrap;',
    '}',
    '.cb-header-status { font-size: 0.72rem; color: #00a8e8; }',
    '',
    '.cb-messages {',
    '  flex: 1;',
    '  overflow-y: auto;',
    '  padding: 16px;',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 12px;',
    '  scroll-behavior: smooth;',
    '}',
    '.cb-messages::-webkit-scrollbar { width: 4px; }',
    '.cb-messages::-webkit-scrollbar-track { background: transparent; }',
    '.cb-messages::-webkit-scrollbar-thumb { background: #d8e0ea; border-radius: 4px; }',
    '',
    '.cb-msg {',
    '  max-width: 85%;',
    '  font-size: 0.84rem;',
    '  line-height: 1.6;',
    '  white-space: pre-wrap;',
    '  word-break: break-word;',
    '}',
    '.cb-msg-bot {',
    '  align-self: flex-start;',
    '  background: #e8edf4;',
    '  color: #17243a;',
    '  padding: 10px 14px;',
    '  border-radius: 4px 14px 14px 14px;',
    '}',
    '.cb-msg-user {',
    '  align-self: flex-end;',
    '  background: #00a8e8;',
    '  color: #fff;',
    '  padding: 10px 14px;',
    '  border-radius: 14px 14px 4px 14px;',
    '}',
    '',
    '.cb-typing {',
    '  align-self: flex-start;',
    '  display: flex;',
    '  gap: 5px;',
    '  padding: 12px 16px;',
    '  background: #e8edf4;',
    '  border-radius: 4px 14px 14px 14px;',
    '}',
    '.cb-typing span {',
    '  width: 7px;',
    '  height: 7px;',
    '  background: #64748b;',
    '  border-radius: 50%;',
    '  animation: cb-bounce 1.2s ease-in-out infinite;',
    '}',
    '.cb-typing span:nth-child(2) { animation-delay: 0.2s; }',
    '.cb-typing span:nth-child(3) { animation-delay: 0.4s; }',
    '@keyframes cb-bounce {',
    '  0%, 60%, 100% { transform: translateY(0); }',
    '  30% { transform: translateY(-5px); }',
    '}',
    '',
    '.cb-footer {',
    '  border-top: 1px solid #d8e0ea;',
    '  padding: 10px 12px;',
    '  display: flex;',
    '  gap: 8px;',
    '  align-items: flex-end;',
    '  flex-shrink: 0;',
    '  background: #fff;',
    '}',
    '.cb-input {',
    '  flex: 1;',
    '  border: 1.5px solid #d8e0ea;',
    '  border-radius: 10px;',
    '  padding: 9px 12px;',
    '  font-size: 0.84rem;',
    '  font-family: "Noto Sans JP", sans-serif;',
    '  color: #17243a;',
    '  resize: none;',
    '  outline: none;',
    '  max-height: 100px;',
    '  line-height: 1.5;',
    '  transition: border-color 150ms;',
    '}',
    '.cb-input:focus { border-color: #00a8e8; }',
    '.cb-input::placeholder { color: #aab6c8; }',
    '.cb-send {',
    '  width: 38px;',
    '  height: 38px;',
    '  border-radius: 50%;',
    '  background: #00a8e8;',
    '  border: none;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  flex-shrink: 0;',
    '  transition: background 150ms, transform 100ms;',
    '}',
    '.cb-send:hover { background: #0097d4; }',
    '.cb-send:active { transform: scale(0.93); }',
    '.cb-send:disabled { background: #aab6c8; cursor: default; }'
  ].join('\n');

  var HTML = [
    '<button class="cb-btn" id="cbBtn" aria-label="DONくんに相談する" aria-expanded="false">',
    '  <span class="cb-badge" id="cbBadge" aria-hidden="true"></span>',
    '  <svg class="cb-icon-chat" width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '    <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#fff"/>',
    '  </svg>',
    '  <svg class="cb-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '    <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>',
    '  </svg>',
    '</button>',
    '',
    '<div class="cb-window" id="cbWindow" role="dialog" aria-label="DONくんへの相談チャット" aria-modal="true">',
    '  <div class="cb-header">',
    '    <img class="cb-avatar" src="' + AVATAR + '" alt="DONくん" width="36" height="36" decoding="async">',
    '    <div class="cb-header-text">',
    '      <div class="cb-header-name">DONくん<span class="cb-header-char-note">※オリジナルキャラクター</span></div>',
    '      <div class="cb-header-status">KOHYAMA AI Creative</div>',
    '    </div>',
    '  </div>',
    '  <div class="cb-messages" id="cbMessages" aria-live="polite" aria-label="チャットメッセージ"></div>',
    '  <div class="cb-footer">',
    '    <textarea class="cb-input" id="cbInput" placeholder="メッセージを入力..." rows="1" aria-label="メッセージ入力"></textarea>',
    '    <button class="cb-send" id="cbSend" aria-label="送信" disabled>',
    '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    '      </svg>',
    '    </button>',
    '  </div>',
    '</div>'
  ].join('\n');

  function init() {
    var style = document.createElement('style');
    style.id = 'cb-widget-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    var container = document.createElement('div');
    container.id = 'cb-widget-root';
    container.innerHTML = HTML;
    document.body.appendChild(container);

    var btn = document.getElementById('cbBtn');
    var win = document.getElementById('cbWindow');
    var msgs = document.getElementById('cbMessages');
    var input = document.getElementById('cbInput');
    var send = document.getElementById('cbSend');
    var badge = document.getElementById('cbBadge');

    var history = [];
    var isOpen = false;
    var firstOpen = true;

    function toggleChat() {
      isOpen = !isOpen;
      btn.classList.toggle('is-open', isOpen);
      win.classList.toggle('is-open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      badge.classList.remove('show');
      if (isOpen) {
        if (firstOpen) {
          firstOpen = false;
          appendBotMsg('こんにちは！KOHYAMA AI Creativeへようこそ✨\nAIイラストやキャラクター制作についてお気軽にご質問ください。');
        }
        setTimeout(function () { input.focus(); }, 220);
      }
    }

    btn.addEventListener('click', toggleChat);

    function appendBotMsg(text) {
      var el = document.createElement('div');
      el.className = 'cb-msg cb-msg-bot';
      el.textContent = text;
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function appendUserMsg(text) {
      var el = document.createElement('div');
      el.className = 'cb-msg cb-msg-user';
      el.textContent = text;
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
      var el = document.createElement('div');
      el.className = 'cb-typing';
      el.id = 'cbTyping';
      el.innerHTML = '<span></span><span></span><span></span>';
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function removeTyping() {
      var el = document.getElementById('cbTyping');
      if (el) el.remove();
    }

    async function sendMessage() {
      var text = input.value.trim();
      if (!text) return;

      appendUserMsg(text);
      history.push({ role: 'user', content: text });
      input.value = '';
      input.style.height = 'auto';
      send.disabled = true;
      showTyping();

      try {
        var res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });

        removeTyping();

        if (!res.ok) throw new Error('server error');

        var data = await res.json();
        history.push({ role: 'assistant', content: data.reply });
        appendBotMsg(data.reply);
      } catch (e) {
        removeTyping();
        appendBotMsg('申し訳ございません、通信エラーが発生しました。\n少し経ってから再度お試しいただくか、メール（info@digital2026.net）にてご連絡ください。');
      }
    }

    send.addEventListener('click', sendMessage);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!send.disabled) sendMessage();
      }
    });

    input.addEventListener('input', function () {
      send.disabled = input.value.trim() === '';
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });

    setTimeout(function () {
      if (!isOpen) badge.classList.add('show');
    }, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
