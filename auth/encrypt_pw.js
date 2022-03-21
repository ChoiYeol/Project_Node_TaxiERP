 
const crypto = require("crypto");
 
// One way PW encryption
// called from login, updateUserPW, etc
async function encryptUserPW(PW) {
    const SALT = "Th1s is My S@lt!!?";

    const encPW = crypto.createHmac('sha512', SALT)
        .update(PW)
        .digest('base64');
    return encPW;
}
 
module.exports = {
    encryptUserPW
};