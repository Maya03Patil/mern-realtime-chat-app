import CryptoJS from 'crypto-js';

const SALTS = [
  import.meta.env.VITE_SECRET_SALT,
  "development-fallback-salt",
  "chatsphere-e2ee-salt-2024"
].filter(Boolean);

export const encryptMessage = (text, chatId) => {
  if (!text) return "";
  const activeSalt = SALTS[0] || "chatsphere-e2ee-salt-2024";
  try {
    return CryptoJS.AES.encrypt(text, chatId + activeSalt).toString();
  } catch (err) {
    console.error("Encryption failed:", err);
    return text;
  }
};

export const decryptMessage = (cipherText, chatId) => {
  if (!cipherText) return "";
  for (const salt of SALTS) {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, chatId + salt);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedText && decryptedText.length > 0) {
        return decryptedText;
      }
    } catch (err) {
    }
  }
  return cipherText;
};
