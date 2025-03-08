import * as argon2 from 'argon2';

export class HashingHelper {
  static async hashData(data: string): Promise<string> {
    try {
      return await argon2.hash(data, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB RAM
        timeCost: 4, // 4 loops
        parallelism: 2,
      });
    } catch (error) {
      throw new Error('Error hashing data');
    }
  }

  static async compareData(
    plainData: string,
    hashedData: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedData, plainData);
    } catch (error) {
      throw new Error('Error comparing data');
    }
  }
}
