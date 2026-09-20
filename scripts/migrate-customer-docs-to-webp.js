const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const BUCKET_NAME = 'customer-documents';
const MAX_DIM = 1280; // Optimized dimension for document legibility and ~76-90KB target
const WEBP_QUALITY = 70;
const WEBP_EFFORT = 4;

// Parse CLI args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const customerLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

async function migrate() {
  console.log('=====================================================');
  console.log('  MIGRATE CUSTOMER-DOCUMENTS TO WEBP');
  console.log(`  Settings: Max ${MAX_DIM}px, WebP Q=${WEBP_QUALITY}, Effort=${WEBP_EFFORT}`);
  console.log(`  Dry Run: ${isDryRun ? 'YES (no storage or DB writes)' : 'NO (live migration)'}`);
  if (customerLimit) console.log(`  Customer Limit: ${customerLimit}`);
  console.log('=====================================================\n');

  // 1. Fetch customers with documents (with pagination to handle > 1,000 rows)
  console.log('Fetching customers with documents from database...');
  let allCustomers = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    let query = supabase
      .from('customers')
      .select('id, full_name, documents, document_metadata')
      .not('documents', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (customerLimit) {
      query = query.limit(customerLimit);
    }

    const { data: pageData, error: fetchErr } = await query;
    if (fetchErr) {
      console.error('Failed to fetch customers:', fetchErr.message);
      process.exit(1);
    }

    if (!pageData || pageData.length === 0) break;
    allCustomers = allCustomers.concat(pageData);

    if (customerLimit || pageData.length < pageSize) break;
    page++;
  }

  const eligibleCustomers = allCustomers.filter(
    c => Array.isArray(c.documents) && c.documents.length > 0
  );

  console.log(`Found ${eligibleCustomers.length} total customers with documents across all pages.\n`);

  let totalDocsProcessed = 0;
  let totalDocsConverted = 0;
  let totalDocsSkipped = 0;
  let totalErrors = 0;
  let totalOriginalBytes = 0;
  let totalCompressedBytes = 0;
  let customersUpdated = 0;

  const BATCH_SIZE = 8;

  for (let i = 0; i < eligibleCustomers.length; i += BATCH_SIZE) {
    const chunk = eligibleCustomers.slice(i, i + BATCH_SIZE);

    await Promise.all(
      chunk.map(async (customer) => {
        const docs = customer.documents || [];
        const urlMap = {};
        const oldPathsToDelete = [];
        let customerHasUpdates = false;

        for (const docUrl of docs) {
          totalDocsProcessed++;

          // If not a customer-documents URL or already webp, skip
          if (!docUrl.includes(`/${BUCKET_NAME}/`)) {
            totalDocsSkipped++;
            continue;
          }

          const cleanUrl = docUrl.split('?')[0];
          const ext = cleanUrl.split('.').pop().toLowerCase();
          if (ext === 'webp') {
            totalDocsSkipped++;
            continue;
          }

          try {
            const urlObj = new URL(cleanUrl);
            const oldStoragePath = urlObj.pathname.split(`/${BUCKET_NAME}/`)[1];
            if (!oldStoragePath) {
              totalDocsSkipped++;
              continue;
            }

            // 1. Download original
            const { data: fileData, error: dlErr } = await supabase.storage
              .from(BUCKET_NAME)
              .download(oldStoragePath);

            if (dlErr || !fileData) {
              console.error(`  [!] Error downloading ${oldStoragePath}:`, dlErr?.message || 'Empty file');
              totalErrors++;
              continue;
            }

            const arrayBuf = await fileData.arrayBuffer();
            const inputBuf = Buffer.from(arrayBuf);
            totalOriginalBytes += inputBuf.length;

            // 2. Convert to WebP using Sharp
            const compressedBuf = await sharp(inputBuf)
              .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
              .toBuffer();

            totalCompressedBytes += compressedBuf.length;

            // 3. Formulate new WebP storage path
            const basePath = oldStoragePath.replace(/\.[^/.]+$/, '');
            const newStoragePath = `${basePath}.webp`;

            if (!isDryRun) {
              // 4. Upload WebP
              const { error: upErr } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(newStoragePath, compressedBuf, {
                  contentType: 'image/webp',
                  cacheControl: '3600',
                  upsert: true,
                });

              if (upErr) {
                console.error(`  [!] Upload failed for ${newStoragePath}:`, upErr.message);
                totalErrors++;
                continue;
              }

              // 5. Derive new public URL
              const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(newStoragePath);

              const newPublicUrl = urlData.publicUrl;
              urlMap[docUrl] = newPublicUrl;
              urlMap[cleanUrl] = newPublicUrl;
              oldPathsToDelete.push(oldStoragePath);
              customerHasUpdates = true;
              totalDocsConverted++;
            } else {
              // Dry run recording
              const fakeNewPublicUrl = cleanUrl.replace(/\.[^/.]+$/, '.webp');
              urlMap[docUrl] = fakeNewPublicUrl;
              urlMap[cleanUrl] = fakeNewPublicUrl;
              customerHasUpdates = true;
              totalDocsConverted++;
            }
          } catch (docErr) {
            console.error(`  [!] Exception on doc ${docUrl}:`, docErr.message);
            totalErrors++;
          }
        }

        // Update customer record in database if updates were made
        if (customerHasUpdates && !isDryRun) {
          try {
            const newDocs = docs.map(u => urlMap[u] || urlMap[u.split('?')[0]] || u);

            // Update document_metadata
            const currentMeta = customer.document_metadata || {};
            const oldFileNames = currentMeta.fileNames || {};
            const newFileNames = {};

            for (const [oldUrl, displayName] of Object.entries(oldFileNames)) {
              const matchedNew = urlMap[oldUrl] || urlMap[oldUrl.split('?')[0]];
              if (matchedNew) {
                const newName = typeof displayName === 'string'
                  ? displayName.replace(/\.(jpe?g|png)$/i, '.webp')
                  : displayName;
                newFileNames[matchedNew] = newName;
              } else {
                newFileNames[oldUrl] = displayName;
              }
            }

            const newMetadata = {
              ...currentMeta,
              fileNames: newFileNames,
            };

            const { error: dbErr } = await supabase
              .from('customers')
              .update({
                documents: newDocs,
                document_metadata: newMetadata,
              })
              .eq('id', customer.id);

            if (dbErr) {
              console.error(`  [!] DB update failed for customer ${customer.id} (${customer.full_name}):`, dbErr.message);
              totalErrors++;
            } else {
              customersUpdated++;
              // Clean up old storage files only after DB update succeeds
              if (oldPathsToDelete.length > 0) {
                const { error: rmErr } = await supabase.storage
                  .from(BUCKET_NAME)
                  .remove(oldPathsToDelete);
                if (rmErr) {
                  console.warn(`  [?] Warning: could not delete old files for ${customer.id}:`, rmErr.message);
                }
              }
            }
          } catch (custErr) {
            console.error(`  [!] Customer record exception for ${customer.id}:`, custErr.message);
            totalErrors++;
          }
        } else if (customerHasUpdates && isDryRun) {
          customersUpdated++;
        }
      })
    );

    const currentProcessed = Math.min(i + BATCH_SIZE, eligibleCustomers.length);
    const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(1);
    const compMB = (totalCompressedBytes / (1024 * 1024)).toFixed(1);
    const percent = Math.round((currentProcessed / eligibleCustomers.length) * 100);
    process.stdout.write(
      `Customers: ${currentProcessed}/${eligibleCustomers.length} (${percent}%) | Docs Converted: ${totalDocsConverted} | ${origMB}MB -> ${compMB}MB\r`
    );
  }

  console.log('\n\n=====================================================');
  console.log('  MIGRATION SUMMARY');
  console.log('=====================================================');
  console.log(`Customers Processed: ${eligibleCustomers.length}`);
  console.log(`Customers Updated:   ${customersUpdated}`);
  console.log(`Documents Checked:   ${totalDocsProcessed}`);
  console.log(`Documents Converted: ${totalDocsConverted}`);
  console.log(`Documents Skipped:   ${totalDocsSkipped} (already webp or non-matching)`);
  console.log(`Errors:              ${totalErrors}`);
  
  if (totalOriginalBytes > 0) {
    const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
    const compMB = (totalCompressedBytes / (1024 * 1024)).toFixed(2);
    const savedMB = ((totalOriginalBytes - totalCompressedBytes) / (1024 * 1024)).toFixed(2);
    const savingsPct = (((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100).toFixed(1);
    const avgKB = (totalCompressedBytes / totalDocsConverted / 1024).toFixed(1);

    console.log(`Original Size:       ${origMB} MB`);
    console.log(`Compressed WebP:     ${compMB} MB`);
    console.log(`Storage Saved:       ${savedMB} MB (${savingsPct}% reduction)`);
    console.log(`Average WebP Size:   ${avgKB} KB per image`);
  }
  console.log('=====================================================\n');
}

migrate().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
