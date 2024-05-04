import { createSignal, Show } from 'solid-js';
import Coder from './Coder.jsx';

function base64ToHex(str: string) {
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : '0' + hex;
  }
  return result.toUpperCase();
}

async function encryptMessage(pubkey: string, message: string) {
  pubkey = `-----BEGIN PUBLIC KEY-----\n${pubkey}\n-----END PUBLIC KEY-----`;
  const { JSEncrypt } = await import('jsencrypt');
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(pubkey);
  return encrypt.encrypt(message);
}

export function RsaEncrypt() {
  const defPubkey = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCZLyV4gHNDUGJMZoOcYauxmNEsKrc0TlLeBEVVIIQNzG4WqjimceOj5R9ETwDeeSN3yejAKLGHgx83lyy2wBjvnbfm/nLObyWwQD/09CmpZdxoFYCH6rdDjRpwZOZ2nXSZpgkZXoOBkfNXNxnN74aXtho2dqBynTw3NFTWyQl8BQIDAQAB`;
  const [pubkey, setPubkey] = createSignal(defPubkey);
  const [phone, setPhone] = createSignal('');
  const [password, setPassword] = createSignal('');

  async function handleInput(type: 'phone' | 'password', text: string) {
    if (text.trim() === '') {
      switch (type) {
        case 'phone':
          setPhone(() => '');
          break;
        case 'password':
          setPassword(() => '');
          break;
      }
      return;
    }

    const encrypted = await encryptMessage(pubkey(), text);

    switch (type) {
      case 'phone':
        encrypted && setPhone(() => base64ToHex(encrypted));
        break;
      case 'password':
        encrypted && setPassword(() => base64ToHex(encrypted));
        break;
    }
  }

  return (
    <>
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">输入你的 pubkey （可选）</span>
        </div>
        <input
          type="text"
          placeholder="pubkey 不知道是啥不填写"
          class="input input-bordered input-primary w-full max-w-xs"
          onBlur={(e) =>
            setPubkey(() => e.currentTarget.value?.trim() || defPubkey)
          }
        />
      </label>
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">输入你的手机号</span>
        </div>
        <input
          type="text"
          placeholder="手机号"
          class="input input-bordered input-primary w-full max-w-xs"
          onBlur={(e) => handleInput('phone', e.currentTarget.value)}
        />
      </label>
      <Show when={phone()}>
        <Coder code={phone()}></Coder>
      </Show>
      <label class="form-control w-full max-w-xs ">
        <div class="label">
          <span class="label-text">输入你的登录密码</span>
        </div>
        <input
          type="text"
          placeholder="登录密码"
          class="input input-bordered input-primary w-full max-w-xs"
          onBlur={(e) => handleInput('password', e.currentTarget.value)}
        />
      </label>
      <Show when={password()}>
        <Coder code={password()}></Coder>
      </Show>
    </>
  );
}
