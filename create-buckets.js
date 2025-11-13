/**
 * Supabase Storage Buckets Creation Script
 * This script creates all required storage buckets for AromaSouq
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to load from environment first, then from .env file
let SUPABASE_URL = process.env.SUPABASE_URL;
let SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// If not in environment, try to read from aromasouq-api/.env file
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  try {
    const envPath = path.join(__dirname, 'aromasouq-api', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Parse .env file
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');

        if (key === 'SUPABASE_URL') {
          SUPABASE_URL = value;
        } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
          SUPABASE_SERVICE_KEY = value;
        }
      }
    });

    console.log('✅ Loaded credentials from aromasouq-api/.env file');
  } catch (error) {
    console.error('❌ Could not read aromasouq-api/.env file:', error.message);
  }
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Please ensure they are set in aromasouq-api/.env file');
  process.exit(1);
}

const API_URL = `${SUPABASE_URL}/storage/v1/bucket`;

// Bucket configurations
const BUCKETS = [
  {
    id: 'products',
    name: 'products',
    public: true,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
  },
  {
    id: 'brands',
    name: 'brands',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
  },
  {
    id: 'users',
    name: 'users',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
  },
  {
    id: 'reviews',
    name: 'reviews',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
  },
  {
    id: 'documents',
    name: 'documents',
    public: false, // Private bucket
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: ['application/pdf', 'image/jpeg', 'image/png']
  }
];

/**
 * Make HTTP request
 */
function makeRequest(url, method, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            resolve({ status: res.statusCode, error: parsed });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Create a storage bucket
 */
async function createBucket(bucket) {
  console.log(`\n📦 Creating bucket: ${bucket.name}`);
  console.log(`   - Public: ${bucket.public ? '✅' : '❌'}`);
  console.log(`   - Size limit: ${(bucket.file_size_limit / 1024 / 1024).toFixed(1)}MB`);

  try {
    const response = await makeRequest(API_URL, 'POST', bucket);

    if (response.status === 200 || response.status === 201) {
      console.log(`   ✅ Bucket '${bucket.name}' created successfully!`);
      return true;
    } else if (response.error?.message?.includes('already exists')) {
      console.log(`   ⚠️  Bucket '${bucket.name}' already exists - skipping`);
      return true;
    } else {
      console.error(`   ❌ Failed to create bucket '${bucket.name}'`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error:`, response.error);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Error creating bucket '${bucket.name}':`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Supabase Storage Buckets Creation');
  console.log('='.repeat(50));
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Creating ${BUCKETS.length} buckets...`);

  let successCount = 0;
  let failCount = 0;

  for (const bucket of BUCKETS) {
    const success = await createBucket(bucket);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Successful: ${successCount}/${BUCKETS.length}`);
  if (failCount > 0) {
    console.log(`   ❌ Failed: ${failCount}/${BUCKETS.length}`);
  }
  console.log('='.repeat(50));

  if (successCount === BUCKETS.length) {
    console.log('\n🎉 All buckets created successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify buckets in Supabase Dashboard > Storage');
    console.log('   2. Public buckets (products, brands, users, reviews) should have public read access');
    console.log('   3. Documents bucket should remain private');
    console.log('\n   You can now proceed with Railway deployment!');
  } else {
    console.log('\n⚠️  Some buckets failed to create. Please check the errors above.');
    console.log('   You may need to create them manually in the Supabase Dashboard.');
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
