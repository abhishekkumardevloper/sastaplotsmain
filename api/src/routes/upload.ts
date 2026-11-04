import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { supabaseAdmin } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimit';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Max image size in megabytes
const maxImageSizeMb = process.env.MAX_IMAGE_SIZE_MB ? parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) : 10;
const maxFileSizeBytes = maxImageSizeMb * 1024 * 1024;
const BUCKET_NAME = 'property-images';

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Configure Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeBytes,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WEBP, and GIF images are allowed.`));
    }
  },
});

/**
 * Ensures the storage bucket exists in Supabase
 */
async function ensureBucketExists(): Promise<void> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: maxFileSizeBytes,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });
    }
  } catch (err) {
    // Non-blocking if bucket already exists or permissions handled in dashboard
  }
}

// Check/create bucket on startup
ensureBucketExists().catch(console.error);

/**
 * POST /api/upload/image
 * Upload single image
 */
router.post(
  '/image',
  requireAuth,
  uploadLimiter,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const file = req.file;
      const user = req.user!;

      if (!file) {
        res.status(400).json({ success: false, error: 'No image file provided in request.' });
        return;
      }

      // Generate unique path
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const cleanName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const storagePath = `properties/${user.id}/${uuidv4()}-${cleanName}${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        res.status(500).json({ success: false, error: `Upload failed: ${uploadError.message}` });
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully.',
        data: {
          url: publicUrlData.publicUrl,
          storage_path: storagePath,
          size_bytes: file.size,
          original_name: file.originalname,
          mime_type: file.mimetype,
        },
      });
    } catch (error: any) {
      console.error('Upload exception:', error);
      res.status(500).json({ success: false, error: error.message || 'Image upload failed.' });
    }
  }
);

/**
 * POST /api/upload/images
 * Upload multiple images (up to 10 at once)
 */
router.post(
  '/images',
  requireAuth,
  uploadLimiter,
  upload.array('images', 10),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      const user = req.user!;

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'No image files provided.' });
        return;
      }

      const results = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const cleanName = path
          .basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 30);
        const storagePath = `properties/${user.id}/${uuidv4()}-${cleanName}${ext}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
          results.push({
            url: publicUrlData.publicUrl,
            storage_path: storagePath,
            size_bytes: file.size,
            original_name: file.originalname,
            mime_type: file.mimetype,
            sort_order: i,
            is_cover: i === 0,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: `${results.length} images uploaded successfully.`,
        data: results,
      });
    } catch (error: any) {
      console.error('Multi-image upload exception:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to upload images.' });
    }
  }
);

/**
 * DELETE /api/upload
 * Delete an image by storage_path
 */
router.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { storage_path } = req.body;
    const user = req.user!;

    if (!storage_path) {
      res.status(400).json({ success: false, error: 'storage_path is required in request body.' });
      return;
    }

    // Security: Only allow user to delete their own files unless admin
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isOwner = storage_path.startsWith(`properties/${user.id}/`);

    if (!isAdmin && !isOwner) {
      res.status(403).json({ success: false, error: 'You do not have permission to delete this file.' });
      return;
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([storage_path]);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    // Also remove from property_images table if referenced
    await supabaseAdmin.from('property_images').delete().eq('storage_path', storage_path);

    res.json({
      success: true,
      message: 'Image deleted successfully.',
    });
  } catch (error: any) {
    console.error('Delete image exception:', error);
    res.status(500).json({ success: false, error: 'Failed to delete image.' });
  }
});

export default router;
