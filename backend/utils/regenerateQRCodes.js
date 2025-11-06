import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/user.js';
import { generateProfileQRCode } from '../helpers/qrCodeHelper.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Regenerate QR codes for all users with the new branded design
 * This script updates all existing QR codes to include the Linkit logo
 */
async function regenerateAllQRCodes() {
  try {
    console.log('🚀 Starting QR code regeneration process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to process`);
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    console.log(`🌐 Using base URL: ${baseUrl}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each user
    for (const user of users) {
      try {
        console.log(`\n🔄 Processing user: ${user.username}`);
        
        // Generate new QR code with logo
        const newQRCode = await generateProfileQRCode(user.username, baseUrl);
        
        if (newQRCode && newQRCode.startsWith('data:image')) {
          // Update user with new QR code
          user.qrCodeUrl = newQRCode;
          await user.save();
          
          successCount++;
          console.log(`✅ Successfully regenerated QR code for ${user.username} (${newQRCode.length} chars)`);
        } else {
          errorCount++;
          console.error(`❌ Invalid QR code generated for ${user.username}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing user ${user.username}:`, error.message);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📈 REGENERATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully regenerated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${users.length}`);
    console.log('='.repeat(50));
    
    // Disconnect
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    console.log('🎉 QR code regeneration complete!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
regenerateAllQRCodes();

