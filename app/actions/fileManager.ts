"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { FolderItem, FileItem, StorageStats } from "@/app/file-manager/types";

const BUCKET_NAME = "file-manager";

function getAdminStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Resolves the authenticated user and validates that they are an admin
 * or member of the active store. Access is denied if unauthorized.
 */
export async function getStoreContext(targetStoreId?: string): Promise<{
  success: boolean;
  storeId?: string;
  userId?: string;
  role?: string;
  isAdmin?: boolean;
  isMember?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated. Please log in." };
    }

    // 1. Fetch user record from public.users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id, store_id, role")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData) {
      return { success: false, error: "User profile not found." };
    }

    // Determine target store: explicit or assigned
    let storeIdToVerify = targetStoreId || userData.store_id;

    // If storeId is missing from user record, check if user is a store owner in public.stores
    if (!storeIdToVerify) {
      const { data: ownedStore } = await supabase
        .from("stores")
        .select("store_id")
        .eq("user_id", user.id)
        .single();

      if (ownedStore?.store_id) {
        storeIdToVerify = ownedStore.store_id;
      }
    }

    if (!storeIdToVerify) {
      return {
        success: false,
        error: "No store assigned to this account. Please join or register a store.",
      };
    }

    // 2. Fetch store details to check ownership and co-admin status
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("store_id, user_id, co_admins")
      .eq("store_id", storeIdToVerify)
      .single();

    if (storeError || !storeData) {
      return { success: false, error: "Store not found or inaccessible." };
    }

    const isSystemAdmin = userData.role === "admin";
    const isStoreOwner = storeData.user_id === user.id;
    const isCoAdmin =
      Array.isArray(storeData.co_admins) && storeData.co_admins.includes(user.id);
    const isStoreMember = userData.store_id === storeIdToVerify;

    const hasAccess = isSystemAdmin || isStoreOwner || isCoAdmin || isStoreMember;

    if (!hasAccess) {
      return {
        success: false,
        error: "Unauthorized: Only admins and members of this store can manage or access its files.",
      };
    }

    return {
      success: true,
      storeId: storeIdToVerify,
      userId: user.id,
      role: userData.role || "member",
      isAdmin: isSystemAdmin || isStoreOwner || isCoAdmin,
      isMember: isStoreMember,
    };
  } catch (err: any) {
    console.error("Failed to get store context:", err);
    return { success: false, error: err.message || "Failed to get store context" };
  }
}

/**
 * Ensures bucket exists and public folder .keep exists for the store.
 */
async function ensureStoreInitialized(storeId: string) {
  const admin = getAdminStorageClient();
  try {
    // Check if public/.keep exists; if not, upload it
    const { data: files } = await admin.storage
      .from(BUCKET_NAME)
      .list(`${storeId}/public`);

    if (!files || files.length === 0) {
      await admin.storage
        .from(BUCKET_NAME)
        .upload(`${storeId}/public/.keep`, Buffer.from(""), { upsert: true });
    }
  } catch (e) {
    console.warn("Could not auto-initialize public folder:", e);
  }
}

/**
 * Lists all folders for the store, with counts of files inside each folder.
 */
export async function listFolders(): Promise<{
  success: boolean;
  folders: FolderItem[];
  error?: string;
}> {
  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) {
    return { success: false, folders: [], error: ctx.error };
  }

  const { storeId } = ctx;
  const admin = getAdminStorageClient();

  try {
    await ensureStoreInitialized(storeId);

    // List top-level items under storeId
    const { data: rootItems, error: listError } = await admin.storage
      .from(BUCKET_NAME)
      .list(storeId, {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) throw listError;

    // Folder items typically have id === null or are directory names
    const folderNames = new Set<string>();
    folderNames.add("public"); // Always ensure public folder exists

    (rootItems || []).forEach((item) => {
      if (item.name && item.name !== ".keep" && !item.name.includes(".")) {
        folderNames.add(item.name);
      }
    });

    // Get file counts for each folder
    const folderList: FolderItem[] = [];

    for (const folder of Array.from(folderNames)) {
      const { data: files } = await admin.storage
        .from(BUCKET_NAME)
        .list(`${storeId}/${folder}`, { limit: 1000 });

      const realFiles = (files || []).filter((f) => f.name !== ".keep");
      const isPublic = folder === "public";

      folderList.push({
        id: folder,
        name: folder,
        displayName: isPublic
          ? "public"
          : folder
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
        fileCount: realFiles.length,
        isPublic,
      });
    }

    // Sort: public first, then alphabetical
    folderList.sort((a, b) => {
      if (a.isPublic) return -1;
      if (b.isPublic) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    return { success: true, folders: folderList };
  } catch (err: any) {
    console.error("Failed to list folders:", err);
    return { success: false, folders: [], error: err.message || "Failed to list folders" };
  }
}

/**
 * Creates a new folder for the current store.
 */
export async function createFolder(folderName: string): Promise<{
  success: boolean;
  folder?: FolderItem;
  error?: string;
}> {
  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) {
    return { success: false, error: ctx.error };
  }

  const cleanName = folderName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!cleanName) {
    return { success: false, error: "Invalid folder name" };
  }

  if (cleanName === "public") {
    return { success: false, error: "The folder 'public' already exists by default" };
  }

  const { storeId } = ctx;
  const admin = getAdminStorageClient();

  try {
    const { error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(`${storeId}/${cleanName}/.keep`, Buffer.from(""), {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const newFolder: FolderItem = {
      id: cleanName,
      name: cleanName,
      displayName: cleanName.replace(/[-_]/g, " "),
      fileCount: 0,
      isPublic: false,
      createdAt: new Date().toISOString(),
    };

    return { success: true, folder: newFolder };
  } catch (err: any) {
    console.error("Failed to create folder:", err);
    return { success: false, error: err.message || "Failed to create folder" };
  }
}

/**
 * Renames a folder by moving its files.
 */
export async function renameFolder(
  oldName: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  if (oldName === "public") {
    return { success: false, error: "Cannot rename the default public folder" };
  }

  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) {
    return { success: false, error: ctx.error };
  }

  const cleanNewName = newName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!cleanNewName || cleanNewName === oldName) {
    return { success: false, error: "Invalid or identical folder name" };
  }

  const { storeId } = ctx;
  const admin = getAdminStorageClient();

  try {
    // 1. List all files in old folder
    const { data: files, error: listErr } = await admin.storage
      .from(BUCKET_NAME)
      .list(`${storeId}/${oldName}`, { limit: 1000 });

    if (listErr) throw listErr;

    // 2. Create placeholder in new folder
    await admin.storage
      .from(BUCKET_NAME)
      .upload(`${storeId}/${cleanNewName}/.keep`, Buffer.from(""), {
        upsert: true,
      });

    // 3. Move every file
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.name === ".keep") continue;
        const fromPath = `${storeId}/${oldName}/${file.name}`;
        const toPath = `${storeId}/${cleanNewName}/${file.name}`;
        await admin.storage.from(BUCKET_NAME).move(fromPath, toPath);
      }
    }

    // 4. Remove old folder files and placeholder
    const oldPaths = (files || []).map((f) => `${storeId}/${oldName}/${f.name}`);
    if (oldPaths.length > 0) {
      await admin.storage.from(BUCKET_NAME).remove(oldPaths);
    }
    await admin.storage.from(BUCKET_NAME).remove([`${storeId}/${oldName}/.keep`]);

    return { success: true };
  } catch (err: any) {
    console.error("Failed to rename folder:", err);
    return { success: false, error: err.message || "Failed to rename folder" };
  }
}

/**
 * Deletes a folder and optionally moves its files to public.
 */
export async function deleteFolder(
  folderName: string,
  moveFilesToPublic: boolean = true
): Promise<{ success: boolean; error?: string }> {
  if (folderName === "public") {
    return { success: false, error: "Cannot delete the default public folder" };
  }

  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) {
    return { success: false, error: ctx.error };
  }

  const { storeId } = ctx;
  const admin = getAdminStorageClient();

  try {
    const { data: files, error: listErr } = await admin.storage
      .from(BUCKET_NAME)
      .list(`${storeId}/${folderName}`, { limit: 1000 });

    if (listErr) throw listErr;

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.name === ".keep") continue;
        if (moveFilesToPublic) {
          const fromPath = `${storeId}/${folderName}/${file.name}`;
          const toPath = `${storeId}/public/${file.name}`;
          await admin.storage.from(BUCKET_NAME).move(fromPath, toPath);
        } else {
          await admin.storage
            .from(BUCKET_NAME)
            .remove([`${storeId}/${folderName}/${file.name}`]);
        }
      }
    }

    // Clean up .keep file to remove the directory
    await admin.storage
      .from(BUCKET_NAME)
      .remove([`${storeId}/${folderName}/.keep`]);

    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete folder:", err);
    return { success: false, error: err.message || "Failed to delete folder" };
  }
}

/**
 * Lists all files inside a given folder.
 */
export async function listFolderFiles(folderName: string = "public"): Promise<{
  success: boolean;
  files: FileItem[];
  error?: string;
}> {
  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) {
    return { success: false, files: [], error: ctx.error };
  }

  const { storeId } = ctx;
  const admin = getAdminStorageClient();

  try {
    const { data: items, error: listErr } = await admin.storage
      .from(BUCKET_NAME)
      .list(`${storeId}/${folderName}`, {
        limit: 500,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listErr) throw listErr;

    const files: FileItem[] = [];

    for (const item of items || []) {
      if (item.name === ".keep") continue;

      const path = `${storeId}/${folderName}/${item.name}`;
      const {
        data: { publicUrl },
      } = admin.storage.from(BUCKET_NAME).getPublicUrl(path);

      files.push({
        id: item.id || `${folderName}_${item.name}`,
        name: item.name,
        folder: folderName,
        size: item.metadata?.size || 0,
        mimetype: item.metadata?.mimetype || "image/webp",
        url: publicUrl,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      });
    }

    return { success: true, files };
  } catch (err: any) {
    console.error(`Failed to list files in ${folderName}:`, err);
    return { success: false, files: [], error: err.message || "Failed to list files" };
  }
}

/**
 * Uploads pre-compressed image files into the specified folder.
 */
export async function uploadFiles(
  folderName: string = "public",
  formData: FormData
): Promise<{
  success: boolean;
  uploadedFiles: FileItem[];
  error?: string;
}> {
  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) {
    return { success: false, uploadedFiles: [], error: ctx.error };
  }

  const { storeId } = ctx;
  const admin = getAdminStorageClient();
  const rawFiles = formData.getAll("files");

  if (!rawFiles || rawFiles.length === 0) {
    return { success: false, uploadedFiles: [], error: "No files provided" };
  }

  const uploadedFiles: FileItem[] = [];

  try {
    for (const item of rawFiles) {
      if (!(item instanceof File)) continue;

      const file = item as File;
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .toLowerCase();
      const uniqueName = `${Date.now()}_${cleanFileName}`;
      const filePath = `${storeId}/${folderName}/${uniqueName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await admin.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: file.type || "image/webp",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload error for ${file.name}:`, uploadError);
        continue;
      }

      const {
        data: { publicUrl },
      } = admin.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);

      uploadedFiles.push({
        id: uploadData.id || `${folderName}_${uniqueName}`,
        name: uniqueName,
        folder: folderName,
        size: file.size,
        mimetype: file.type || "image/webp",
        url: publicUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true, uploadedFiles };
  } catch (err: any) {
    console.error("Failed to upload files:", err);
    return {
      success: false,
      uploadedFiles,
      error: err.message || "Failed to upload files",
    };
  }
}

/**
 * Moves a file from one folder to another.
 */
export async function moveFile(
  fileName: string,
  fromFolder: string,
  toFolder: string
): Promise<{ success: boolean; error?: string }> {
  if (fromFolder === toFolder) return { success: true };

  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) {
    return { success: false, error: ctx.error };
  }

  const { storeId } = ctx;
  const admin = getAdminStorageClient();

  try {
    const fromPath = `${storeId}/${fromFolder}/${fileName}`;
    const toPath = `${storeId}/${toFolder}/${fileName}`;

    const { error: moveErr } = await admin.storage
      .from(BUCKET_NAME)
      .move(fromPath, toPath);

    if (moveErr) throw moveErr;

    return { success: true };
  } catch (err: any) {
    console.error(`Failed to move ${fileName} from ${fromFolder} to ${toFolder}:`, err);
    return { success: false, error: err.message || "Failed to move file" };
  }
}

/**
 * Batch-moves multiple files from one folder to another.
 */
export async function moveMultipleFiles(
  fileNames: string[],
  fromFolder: string,
  toFolder: string
): Promise<{ success: boolean; movedCount: number; error?: string }> {
  if (fromFolder === toFolder || fileNames.length === 0) {
    return { success: true, movedCount: 0 };
  }

  let movedCount = 0;
  for (const name of fileNames) {
    const res = await moveFile(name, fromFolder, toFolder);
    if (res.success) movedCount++;
  }

  return { success: true, movedCount };
}

/**
 * Deletes multiple files from a specified folder.
 */
export async function deleteFiles(
  folderName: string,
  fileNames: string[]
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (fileNames.length === 0) return { success: true, deletedCount: 0 };

  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) {
    return { success: false, deletedCount: 0, error: ctx.error };
  }

  const { storeId } = ctx;
  const admin = getAdminStorageClient();

  try {
    const paths = fileNames.map((name) => `${storeId}/${folderName}/${name}`);
    const { error: delErr } = await admin.storage
      .from(BUCKET_NAME)
      .remove(paths);

    if (delErr) throw delErr;

    return { success: true, deletedCount: fileNames.length };
  } catch (err: any) {
    console.error("Failed to delete files:", err);
    return { success: false, deletedCount: 0, error: err.message || "Failed to delete files" };
  }
}

/**
 * Returns overall storage statistics for the store's file manager.
 */
export async function getStorageStats(): Promise<{
  success: boolean;
  stats?: StorageStats;
  error?: string;
}> {
  const folderRes = await listFolders();
  if (!folderRes.success) return { success: false, error: folderRes.error };

  const ctx = await getStoreContext();
  if (!ctx.success || !ctx.storeId) return { success: false, error: ctx.error };

  const { storeId } = ctx;
  const admin = getAdminStorageClient();

  let totalFiles = 0;
  let totalBytes = 0;

  for (const folder of folderRes.folders) {
    const { data: files } = await admin.storage
      .from(BUCKET_NAME)
      .list(`${storeId}/${folder.name}`, { limit: 1000 });

    for (const f of files || []) {
      if (f.name === ".keep") continue;
      totalFiles++;
      totalBytes += f.metadata?.size || 0;
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return {
    success: true,
    stats: {
      totalFiles,
      totalSize: totalBytes,
      totalFolders: folderRes.folders.length,
      formattedTotalSize: formatSize(totalBytes),
    },
  };
}
