const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { NodeHttpHandler } = require('@smithy/node-http-handler');
const https = require('https');

const client = new S3Client({
  credentials: {
    accessKeyId: 'cdb9bcad2d6459c3d9c99533d11934b',
    secretAccessKey: 'b5413dc98dc5cf032ac30d53f7d8389ff4a84c47211b77c334025554a0fcca30'
  },
  endpoint: 'https://d9786595ca4817b10c795d62912615e.r2.cloudflarestorage.com',
  region: 'auto',
  forcePathStyle: true,
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  })
});

async function runTest() {
  console.log('🚀 Direct Uploading Sample Video to Cloudflare R2 Bucket (youpeak-videos)...');
  const videoKey = 'YouPeak/Videos/' + Date.now() + '_youpeak_official_demo_video.mp4';
  
  const uploadResult = await client.send(new PutObjectCommand({
    Bucket: 'youpeak-videos',
    Key: videoKey,
    Body: Buffer.from('YouPeak Live Cloudflare R2 Test Video File Payload'),
    ContentType: 'video/mp4'
  }));

  console.log('✅ UPLOAD SUCCESSFUL!');
  console.log('   ETag:', uploadResult.ETag);

  const list = await client.send(new ListObjectsV2Command({ Bucket: 'youpeak-videos' }));
  console.log('📁 Files currently in Cloudflare R2 bucket:');
  if (list.Contents) {
    list.Contents.forEach(f => {
      console.log('   📹 File Key:', f.Key, '| Size:', f.Size, 'bytes');
    });
  }

  const publicUrl = 'https://pub-9786595ca4817b10c795d62912615e.r2.dev/' + videoKey;
  console.log('🌐 Direct Cloudflare R2 CDN Public URL:', publicUrl);
}

runTest().catch(err => {
  console.error('Test Error:', err);
});
