const bcrypt = require('bcryptjs');

const password = 'Admin@123456';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nRun this SQL to update admin password:');
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@thichcuu.com';`);
