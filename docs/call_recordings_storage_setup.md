# Supabase Storage Bucket Setup for Call Recordings

## Creating the Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** > **Buckets**
3. Click **New bucket**
4. Configure:
   - **Name**: `call-recordings`
   - **Public**: ❌ (Private bucket - files accessible only to authenticated users)
   - **File size limit**: 50 MB (or adjust as needed)
   - **Allowed MIME types**: `audio/mp4, audio/m4a, audio/mpeg`

## Storage Policies

After creating the bucket, add these RLS policies:

### Policy 1: Users can upload their own recordings

```sql
CREATE POLICY "Users can upload call recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'call-recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 2: Users can view their own recordings

```sql
CREATE POLICY "Users can view their own call recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'call-recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 3: Users can delete their own recordings

```sql
CREATE POLICY "Users can delete their own call recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'call-recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## File Naming Convention

Files are stored with the following structure:
```
call-recordings/
  └── {user_id}/
      └── call_{timestamp}_{phone_number}.m4a
```

Example:
```
call-recordings/123e4567-e89b-12d3-a456-426614174000/call_20260107_142530_+919876543210.m4a
```

## Manual Setup via Supabase Dashboard

1. **Create Bucket**:
   - Storage → New bucket → Name: `call-recordings`
   - Uncheck "Public bucket"
   - Save

2. **Add Policies**:
   - Click on the `call-recordings` bucket
   - Go to "Policies" tab
   - Click "New policy"
   - Choose "Custom policy"
   - Copy and paste each policy above
   - Save each policy

## Testing

After setup, test with:
```dart
final file = File('/path/to/test.m4a');
final bytes = await file.readAsBytes();

await Supabase.instance.client.storage
  .from('call-recordings')
  .uploadBinary('call_test.m4a', bytes);
```
