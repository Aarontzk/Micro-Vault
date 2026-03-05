// test-bcrypt.mjs
import bcrypt from 'bcryptjs';

const hash = '$2b$10$XB13UyJu2./9klqGQZssreZvYTly4mmxkI.WB/0017lam10UHXgre';
const password = 'NewStrongAdminPass123!';

const result = await bcrypt.compare(password, hash);
console.log('Match:', result);