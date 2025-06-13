import * as crypto from 'crypto';

export class CryptoHelper {
  private static secretKey = process.env.HMAC_SECRET_KEY;

  /**
   * Generates a random string (e.g., for Refresh Tokens).
   * @param length The desired length of the string.
   */
  static generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hashes a string using HMAC-SHA256.
   * @param data The string to be hashed.
   */
  static hashData(data: string): string {
    const hmac = crypto.createHmac(
      'sha256',
      process.env.HMAC_SECRET_KEY as string,
    );
    hmac.update(data);
    return hmac.digest('hex');
  }

  // /**
  //  * Compares a string with a hash.
  //  * @param data The original string.
  //  * @param hash The hash to compare against.
  //  */
  // static async compareHash(data: string, hash: string): Promise<boolean> {
  //   return await bcrypt.compare(data, hash);
  // }
}
