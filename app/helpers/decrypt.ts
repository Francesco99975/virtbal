import { decrypt, decryptKey, readMessage, readPrivateKey } from "openpgp";
import { getSHA256Hash } from "./hash";

export const decryptData = async (encryptedData: string, username: string) => {
  const key = localStorage.getItem(`${username}-privkey`);

  if (!key) throw Error("Cannot decrypt data, private key not found");

  const privateKey = await readPrivateKey({ armoredKey: key });

  if (!privateKey.isDecrypted()) {
    const privateKeyDecrypted = await decryptKey({ privateKey });

    const message = await readMessage({
      armoredMessage: encryptedData, // parse armored message
    });
    const { data: decrypted } = await decrypt({
      message,
      decryptionKeys: privateKeyDecrypted,
    });

    return decrypted.toString();
  }

  const message = await readMessage({
    armoredMessage: encryptedData, // parse armored message
  });
  const { data: decrypted } = await decrypt({
    message,
    decryptionKeys: privateKey,
  });

  return decrypted.toString();
};
