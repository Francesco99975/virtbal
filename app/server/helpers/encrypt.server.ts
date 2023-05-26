import { Key, createMessage, encrypt } from "openpgp";

export const encryptData = async (data: string, encryptionKey: Key) => {
  const encrypted = await encrypt({
    message: await createMessage({ text: data }), // input as Message object
    encryptionKeys: encryptionKey,
  });

  return encrypted;
};
