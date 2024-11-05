import crypto from 'node:crypto';

const algorithm = 'aes-256-ctr';

function genKey() {
    return crypto
        .createHash('sha256')
        .update(process.env.SECRET!)
        .digest('base64')
        .slice(0, 32);
}

export function encrypt(buffer: Buffer) {
    const key = genKey();
    const iv = crypto.createHash('md5').update(key).digest();
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const crypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, crypted]);
}

export function decrypt(buffer: Buffer) {
    const iv = buffer.slice(0, 16);
    const data = buffer.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, genKey(), iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
