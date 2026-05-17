import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manual env reading
const envContent = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(s => s.trim()))
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function scanPath(bucketId, path = '') {
  const { data, error } = await supabase.storage.from(bucketId).list(path);
  if (error) return { files: [], size: 0 };

  let totalSize = 0;
  let allFiles = [];

  for (const item of data) {
    if (item.id === null) { // It's a folder
      const sub = await scanPath(bucketId, `${path ? path + '/' : ''}${item.name}`);
      totalSize += sub.size;
      allFiles = allFiles.concat(sub.files);
    } else {
      totalSize += item.metadata?.size || 0;
      allFiles.push({
        name: `${path ? path + '/' : ''}${item.name}`,
        size: item.metadata?.size || 0,
        type: item.metadata?.mimetype
      });
    }
  }

  return { files: allFiles, size: totalSize };
}

async function runAudit() {
  const BUCKETS = ['products', 'categories', 'store-assets', 'profiles'];
  console.log('--- Supabase Recursive Storage Audit ---');
  
  let globalSize = 0;
  let globalCount = 0;

  for (const bid of BUCKETS) {
    console.log(`Scanning [${bid}]...`);
    const { files, size } = await scanPath(bid);
    
    if (files.length > 0) {
      globalSize += size;
      globalCount += files.length;
      console.log(` + Found ${files.length} files in [${bid}] totaling ${(size / 1024).toFixed(2)} KB`);
      files.slice(0, 3).forEach(f => {
        console.log(`   * ${f.name} (${(f.size / 1024).toFixed(2)} KB) - ${f.type || 'unknown'}`);
      });
    } else {
      console.log(` - [${bid}] is empty.`);
    }
  }

  console.log('\n--- Global Summary ---');
  console.log(`Total Files: ${globalCount}`);
  console.log(`Total Size: ${(globalSize / (1024 * 1024)).toFixed(4)} MB`);
  console.log(`Usage Capacity: ${((globalSize / (1024 * 1024 * 1024)) / 1 * 100).toFixed(4)}% of 1GB`);
}

runAudit();
