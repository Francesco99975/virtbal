import { generateKey } from "openpgp";
import { getSHA256Hash } from "./hash";

export const generateKeys = async (username: string, password?: string) => {
  const { privateKey, publicKey, revocationCertificate } = await generateKey({
    type: "ecc", // Type of the key, defaults to ECC
    curve: "curve25519", // ECC curve name, defaults to curve25519
    userIDs: [{ name: username }], // you can pass multiple user IDs
    // passphrase: await getSHA256Hash(password), // protects the private key
    format: "armored", // output key format, defaults to 'armored' (other options: 'binary' or 'object')
  });

  localStorage.setItem(`${username}-privkey`, privateKey);
  localStorage.setItem(`${username}-revoke`, revocationCertificate);

  return publicKey;
};
