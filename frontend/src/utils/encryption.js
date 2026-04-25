import CryptoJS from 'crypto-js';

const SECRET_SALT = "chatsphere-e2ee-salt-2024";

export const encryptMessage = (text, chatId) => {
  if (!text) return "";
  try {
    return CryptoJS.AES.encrypt(text, chatId + SECRET_SALT).toString();
  } catch (err) {
    console.error("Encryption failed:", err);
    return text;
  }
};

export const decryptMessage = (cipherText, chatId) => {
  if (!cipherText) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, chatId + SECRET_SALT);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return cipherText;
    return decryptedText;
  } catch (err) {
    return cipherText;
  }
};
