import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const algorithm = 'aes-256-cbc';

if (!process.env.KEY) {
  console.error('Environment variable KEY is not defined.');
  process.exit(1);
}
const key = Buffer.from(process.env.KEY, 'hex');
const iv = Buffer.from('0000000000000000'); // Static IV

// Get the password from command-line arguments
const password = process.argv[2];
if (!password) {
  console.error('Please provide a password as a command-line argument.');
  process.exit(1);
}

const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(password);
encrypted = Buffer.concat([encrypted, cipher.final()]);

const encryptedPassword = iv.toString('hex') + ':' + encrypted.toString('hex');
console.log('Encrypted:', encryptedPassword);
// fs.writeFileSync(
//   '.env',
//   `PASSWORD=${encryptedPassword}\nKEY=${key.toString('hex')}\n`,
// );
