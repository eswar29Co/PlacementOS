import mongoose from 'mongoose';
import { College } from '../models/College';
import dotenv from 'dotenv';

dotenv.config();

const migrateColleges = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placementos';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Update all existing colleges without approvalStatus to 'approved'
        const result = await College.updateMany(
            { approvalStatus: { $exists: false } },
            {
                $set: {
                    approvalStatus: 'approved',
                    approvedAt: new Date()
                }
            }
        );

        console.log(`Migration complete: ${result.modifiedCount} colleges updated to 'approved' status`);

        // Show all colleges with their status
        const allColleges = await College.find().select('name domain approvalStatus');
        console.log('\nAll colleges:');
        allColleges.forEach(college => {
            console.log(`- ${college.name} (${college.domain}): ${college.approvalStatus}`);
        });

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateColleges();
