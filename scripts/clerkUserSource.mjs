export default {
  key: 'simplerank',
  label: 'Simple Rank',
  description: 'Users exported from the Simple Rank database.',
  transformer: {
    Id: 'userId',
    Email: 'email',
    PasswordHash: 'password',
  },
  carries: {
    passwords: { level: 'partial', note: 'Nonempty bcrypt hashes are imported; accounts without a hash need another sign-in method.' },
    mfa: { level: 'no', note: 'MFA data is not stored in the application database.' },
    metadata: { level: 'no', note: 'Profile metadata remains in the application database.' },
  },
  defaults: { passwordHasher: 'bcrypt' },
  postTransform: (user) => {
    user.unverifiedEmailAddresses = user.email;
    delete user.email;
    if (!user.password || !String(user.password).trim()) {
      delete user.password;
      delete user.passwordHasher;
      user.passwordDropped = true;
    }
  },
};