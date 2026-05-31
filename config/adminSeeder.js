import Admin from '../models/adminModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const seedAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.warn('[ADMIN SEED] ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping seed.');
            return;
        }

        const existing = await Admin.findOne({ email });

        if (existing) {
            // Sync password: if .env password changed, update the DB record
            const isMatch = await bcrypt.compare(password, existing.password);
            if (!isMatch) {
                const hashed = await bcrypt.hash(password, 10);
                await Admin.updateOne({ email }, { password: hashed });
                console.log(`[ADMIN SEED] Admin password updated to match .env for: ${email}`);
            } else {
                console.log(`[ADMIN SEED] Admin account ready: ${email}`);
            }
            return;
        }

        const hashed = await bcrypt.hash(password, 10);

        await Admin.create({
            name: 'FashionZone Admin',
            email,
            password: hashed,
        });

        console.log('\n==================================================');
        console.log('[ADMIN SEED] Default admin account created!');
        console.log(`  Email    : ${email}`);
        console.log(`  Password : ${password}`);
        console.log('  Login at : /admin');
        console.log('==================================================\n');

    } catch (err) {
        console.error('[ADMIN SEED] Error seeding admin account:', err);
    }
};
