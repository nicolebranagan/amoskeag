// config.js
module.exports = {
  jwt: {
    /* Secret key; please replace with your own value.
     * This value is from the default jwt-simple documentation.
     */
    secret: Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex'),
    session: {
      session: false
    }
  },
  bcrypt: {
    rounds: 10
  }
};