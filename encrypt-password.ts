import * as dotenv from 'dotenv';
import { createCipheriv } from 'crypto';

dotenv.config({ path: `.env.stage.${process.env.STAGE}` });

const algorithm = 'aes-256-cbc';

const key = Buffer.from(process.env.KEY || '', 'hex');
if (key.length !== 32) {
  console.error('Invalid key length. The key must be 32 bytes long.');
  process.exit(1);
}

const iv = Buffer.from('0000000000000000'); // Static IV

console.log('KEY:', key.toString('hex'));

// Get the password from command-line arguments
const password = process.argv[2];
if (!password) {
  console.error('Please provide a password as a command-line argument.');
  process.exit(1);
}

const cipher = createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(password);
encrypted = Buffer.concat([encrypted, cipher.final()]);

const encryptedPassword = encrypted.toString('hex'); // Static IV
console.log('Encrypted:', encryptedPassword);
// fs.writeFileSync(
//   '.env.stage.dev',
//   `PASSWORD=${encryptedPassword}\nKEY=${key.toString('hex')}\nIV=${iv.toString('hex')}`,
// );
