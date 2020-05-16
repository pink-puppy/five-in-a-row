import crypto from 'crypto';
const SECRET = 'puppy and kitten';
export default {
    create(name: string) {
        return crypto.createHash('sha256').update(name + SECRET).digest('base64');
    },

    check(name: string, token: string) {
        return this.create(name) === token;
    }
}