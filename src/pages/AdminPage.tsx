import React, { useEffect, useState } from 'react';
import {
  Check,
  FolderUp,
  ImagePlus,
  Lock,
  LogOut,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { BRAND_ASSETS } from '../data/defaultStore';
import {
  AvailabilityStatus,
  ContactInquiry,
  SAREE_CATEGORIES,
  SareeCategory,
  SareeProduct,
  SiteSettings,
  StoreData,
} from '../types';
import { formatINR } from '../utils/whatsapp';
import { SareeImage } from '../components/SareeImage';

interface AdminPageProps {
  store: StoreData;
  onStoreUpdated: (nextStore: StoreData) => void;
}

interface MatchedImportRow {
  key: string;
  name: string;
  category: SareeCategory;
  price: number;
  originalPrice?: number;
  description: string;
  mannequinFile?: File;
  mannequinPreview?: string;
  originalFile?: File;
  originalPreview?: string;
  isNewArrival: boolean;
}

const EMPTY_PRODUCT_FORM: Omit<SareeProduct, 'id'> = {
  name: '',
  category: 'Kanchipuram Silk Sarees',
  price: 0,
  originalPrice: undefined,
  image: '',
  originalImage: '',
  description: '',
  availability: 'Available',
  isNewArrival: true,
  isBestSeller: false,
  isSample: false,
  fabricDetails: 'Pure Handloom Silk',
  blouseIncluded: 'Yes · Unstitched Blouse Piece Included',
  lengthSpec: '6.3 metres (5.4m Saree + 0.9m Blouse Piece)',
  careInstructions: 'Dry clean only.',
  sku: '',
};

function normalizeStem(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/(mannequinin|mannequin|original|orig|ai|photo|img)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function prettifySareeName(filename: string): string {
  const base = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!base) return 'Vastralayam Silk Saree';
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

async function uploadImageFile(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, dataUrl }),
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || `Upload failed for ${file.name}`);
  }
  return data.url;
}

export const AdminPage: React.FC<AdminPageProps> = ({ store, onStoreUpdated }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [needsInitialSetup, setNeedsInitialSetup] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'inquiries'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<SareeProduct, 'id'>>(EMPTY_PRODUCT_FORM);
  const [showProductForm, setShowProductForm] = useState(false);
  const [uploadingField, setUploadingField] = useState<'image' | 'originalImage' | 'portrait' | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Bulk Folder Import state
  const [showFolderImporter, setShowFolderImporter] = useState(false);
  const [importRows, setImportRows] = useState<MatchedImportRow[]>([]);
  const [importMotherFile, setImportMotherFile] = useState<File | null>(null);
  const [importMotherPreview, setImportMotherPreview] = useState<string | null>(null);
  const [clearSamplesOnImport, setClearSamplesOnImport] = useState(true);
  const [importingAll, setImportingAll] = useState(false);

  const [settingsForm, setSettingsForm] = useState<SiteSettings>(store.settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  useEffect(() => {
    setSettingsForm(store.settings);
  }, [store.settings]);

  const checkSession = async () => {
    setCheckingAuth(true);
    try {
      const res = await fetch('/api/admin/session');
      const data = (await res.json()) as {
        authenticated: boolean;
        needsInitialSetup: boolean;
      };
      setAuthenticated(data.authenticated);
      setNeedsInitialSetup(data.needsInitialSetup);
      if (data.authenticated) {
        loadInquiries();
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadInquiries = async () => {
    try {
      const res = await fetch('/api/admin/inquiries');
      if (res.ok) {
        const data = (await res.json()) as { inquiries: ContactInquiry[] };
        setInquiries(data.inquiries || []);
      }
    } catch {
      // Ignore network errors silently
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const endpoint = needsInitialSetup ? '/api/admin/setup' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = (await res.json()) as { authenticated?: boolean; error?: string };
      if (!res.ok || !data.authenticated) {
        throw new Error(data.error || 'Authentication failed.');
      }
      setAuthenticated(true);
      setNeedsInitialSetup(false);
      setPasswordInput('');
      loadInquiries();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
  };

  const handleImageFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'image' | 'originalImage' | 'portrait'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(field);
    setStatusMessage(null);
    try {
      const url = await uploadImageFile(file);
      if (field === 'portrait') {
        setSettingsForm((prev) => ({ ...prev, founderPortraitUrl: url }));
        setStatusMessage('Mother branding photo uploaded. Click "Save Store Settings" to publish.');
      } else {
        setFormState((prev) => ({ ...prev, [field]: url }));
        setStatusMessage(
          field === 'image'
            ? 'Mannequin-in-store photo uploaded and ready to save.'
            : 'Original saree photo uploaded and ready to save.'
        );
      }
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      /\.(jpe?g|png|webp)$/i.test(f.name)
    );
    if (files.length === 0) return;

    const map = new Map<string, MatchedImportRow>();
    let detectedMom: File | null = null;

    for (const file of files) {
      const rel = ((file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name).toLowerCase();
      const fname = file.name.toLowerCase();

      if (
        fname.includes('mom') ||
        fname.includes('mother') ||
        fname.includes('branding') ||
        fname.includes('phoyo')
      ) {
        detectedMom = file;
        continue;
      }

      const isMannequin =
        rel.includes('mannequin') ||
        fname.includes('mannequin') ||
        rel.includes('/ai/');

      const key = normalizeStem(file.name) || file.name.toLowerCase();
      const existing = map.get(key) || {
        key,
        name: prettifySareeName(file.name),
        category: 'Kanchipuram Silk Sarees',
        price: 0,
        originalPrice: undefined,
        description: 'Authentic handpicked saree from Vastralayam Silks.',
        isNewArrival: true,
      };

      const preview = URL.createObjectURL(file);
      if (isMannequin) {
        existing.mannequinFile = file;
        existing.mannequinPreview = preview;
      } else {
        existing.originalFile = file;
        existing.originalPreview = preview;
        existing.name = prettifySareeName(file.name);
      }

      map.set(key, existing);
    }

    if (detectedMom) {
      setImportMotherFile(detectedMom);
      setImportMotherPreview(URL.createObjectURL(detectedMom));
    } else {
      setImportMotherFile(null);
      setImportMotherPreview(null);
    }

    setImportRows(Array.from(map.values()));
    setShowFolderImporter(true);
    setStatusMessage(
      `Detected ${map.size} saree ${map.size === 1 ? 'entry' : 'entries'}${
        detectedMom ? ' + updated Mother branding photo' : ''
      }. Review prices and click Import All.`
    );
  };

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportingAll(true);
    setStatusMessage(null);

    try {
      let latestStore = store;

      if (clearSamplesOnImport) {
        const clearRes = await fetch('/api/admin/samples', { method: 'DELETE' });
        const clearData = (await clearRes.json()) as { store?: StoreData };
        if (clearRes.ok && clearData.store) {
          latestStore = clearData.store;
        }
      }

      if (importMotherFile) {
        const momUrl = await uploadImageFile(importMotherFile);
        const setRes = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...latestStore.settings, founderPortraitUrl: momUrl }),
        });
        const setData = (await setRes.json()) as { store?: StoreData };
        if (setRes.ok && setData.store) {
          latestStore = setData.store;
        }
      }

      for (const row of importRows) {
        const mannequinUrl = row.mannequinFile ? await uploadImageFile(row.mannequinFile) : '';
        const originalUrl = row.originalFile ? await uploadImageFile(row.originalFile) : '';
        const primaryImage = mannequinUrl || originalUrl;
        if (!primaryImage) continue;

        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            category: row.category,
            price: Number(row.price) || 0,
            originalPrice:
              row.originalPrice && row.originalPrice > row.price
                ? Number(row.originalPrice)
                : undefined,
            image: primaryImage,
            originalImage: mannequinUrl && originalUrl ? originalUrl : undefined,
            description: row.description,
            availability: 'Available',
            isNewArrival: row.isNewArrival,
            isBestSeller: false,
            isSample: false,
            fabricDetails: 'Pure Handloom Silk',
            blouseIncluded: 'Yes · Unstitched Blouse Piece Included',
            lengthSpec: '6.3 metres (5.4m Saree + 0.9m Blouse Piece)',
            careInstructions: 'Dry clean only.',
          }),
        });
        const data = (await res.json()) as { store?: StoreData };
        if (res.ok && data.store) {
          latestStore = data.store;
        }
      }

      onStoreUpdated(latestStore);
      setShowFolderImporter(false);
      setImportRows([]);
      setImportMotherFile(null);
      setImportMotherPreview(null);
      setStatusMessage('All matched sarees and branding photo imported cleanly.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Bulk folder import failed.');
    } finally {
      setImportingAll(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    setStatusMessage(null);
    try {
      const payload = {
        ...formState,
        originalPrice:
          formState.originalPrice && formState.originalPrice > formState.price
            ? formState.originalPrice
            : undefined,
      };
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { store?: StoreData; error?: string };
      if (!res.ok || !data.store) {
        throw new Error(data.error || 'Could not save saree.');
      }
      onStoreUpdated(data.store);
      setShowProductForm(false);
      setEditingId(null);
      setFormState(EMPTY_PRODUCT_FORM);
      setStatusMessage('Catalogue updated successfully.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Error saving saree.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: SareeProduct) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });
      const data = (await res.json()) as { store?: StoreData; error?: string };
      if (res.ok && data.store) {
        onStoreUpdated(data.store);
        setStatusMessage(`Removed "${product.name}" from catalogue.`);
      }
    } catch {
      setStatusMessage('Failed to delete entry.');
    }
  };

  const handleClearSamples = async () => {
    try {
      const res = await fetch('/api/admin/samples', { method: 'DELETE' });
      const data = (await res.json()) as { store?: StoreData };
      if (res.ok && data.store) {
        onStoreUpdated(data.store);
        setStatusMessage('All sample showcase entries cleared.');
      }
    } catch {
      setStatusMessage('Failed to clear sample entries.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = (await res.json()) as { store?: StoreData; error?: string };
      if (!res.ok || !data.store) {
        throw new Error(data.error || 'Could not update settings.');
      }
      onStoreUpdated(data.store);
      setStatusMessage('Store settings & branding photo saved.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-20 text-center text-sm text-[#C5B8A5]">
        Verifying owner session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-[#161412] border border-[#C6A15B]/50 p-8">
          <div className="w-10 h-10 bg-[#0D0C0B] border border-[#C6A15B]/60 flex items-center justify-center text-[#E5C573] mb-4">
            <Lock className="w-4 h-4" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#F6EFE2]">
            {needsInitialSetup ? 'Set Owner Password' : 'Owner Catalogue Manager'}
          </h1>
          <p className="mt-2 text-sm text-[#C5B8A5] leading-relaxed">
            {needsInitialSetup
              ? 'Create a private password (at least 8 characters) to protect your Vastralayam Silks product, folder import, and discounted price manager.'
              : 'Sign in with your owner password to import your Vastralayam_silks folder, match mannequin & original photos, and update your mother’s branding photo.'}
          </p>

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="owner-password"
                className="block text-xs font-medium text-[#F6EFE2] mb-1.5"
              >
                {needsInitialSetup ? 'Choose New Owner Password' : 'Owner Password'}
              </label>
              <input
                id="owner-password"
                type="password"
                required
                minLength={needsInitialSetup ? 8 : 1}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] focus:outline-none focus:border-[#E5C573]"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-200 bg-red-950/60 border border-red-400/50 px-3 py-2">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-5 text-sm font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors cursor-pointer"
            >
              {authLoading
                ? 'Authenticating...'
                : needsInitialSetup
                ? 'Set Password & Open Manager'
                : 'Sign In to Manager'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="pb-6 border-b border-[#C6A15B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
            Authenticated Owner Portal
          </p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold text-[#F6EFE2]">
            Vastralayam Silks Catalogue Manager
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#161412] border border-[#C6A15B]/45 text-[#F6EFE2] hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs + Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-[#161412] border border-[#C6A15B]/35">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-semibold cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#C6A15B] text-[#0D0C0B]'
                : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
            }`}
          >
            Sarees & Prices ({store.products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-semibold cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#C6A15B] text-[#0D0C0B]'
                : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
            }`}
          >
            Branding, Hours & Instagram
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 text-xs font-semibold cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-[#C6A15B] text-[#0D0C0B]'
                : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
            }`}
          >
            Customer Enquiries ({inquiries.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#161412] border border-[#C6A15B] text-[#E5C573] hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors cursor-pointer">
              <FolderUp className="w-4 h-4" aria-hidden="true" />
              <span>Import Vastralayam_silks Folder</span>
              <input
                type="file"
                multiple
                onChange={handleFolderSelect}
                className="sr-only"
                {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
              />
            </label>

            {store.products.some((p) => p.isSample) && (
              <button
                type="button"
                onClick={handleClearSamples}
                className="px-4 py-2.5 text-xs font-medium bg-[#161412] border border-[#C6A15B]/50 text-[#C5B8A5] hover:text-[#F6EFE2] hover:border-[#E5C573] transition-colors cursor-pointer"
              >
                Clear Sample Entries
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormState(EMPTY_PRODUCT_FORM);
                setShowProductForm(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Single Saree</span>
            </button>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="mt-5 bg-[#161412] border border-[#C6A15B] px-4 py-3 text-xs sm:text-sm text-[#F6EFE2] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#E5C573] shrink-0" aria-hidden="true" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="mt-6 space-y-6">
          {/* BULK FOLDER IMPORTER PREVIEW */}
          {showFolderImporter && (
            <form
              onSubmit={handleBulkImportSubmit}
              className="bg-[#161412] border border-[#C6A15B] p-6 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C6A15B]/25 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#F6EFE2]">
                    Matched Sarees from Folder ({importRows.length})
                  </h2>
                  <p className="text-xs text-[#C5B8A5] mt-1">
                    Mannequin photos and original photos have been paired by filename. Set each
                    saree’s category, discounted selling price, MRP, and description below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFolderImporter(false)}
                  className="text-xs text-[#C5B8A5] hover:text-[#F6EFE2] self-start cursor-pointer"
                >
                  Cancel Import
                </button>
              </div>

              {importMotherPreview && (
                <div className="p-4 bg-[#0D0C0B] border border-[#C6A15B]/45 flex items-center gap-4">
                  <img
                    src={importMotherPreview}
                    alt="Detected mother branding photo"
                    className="w-16 h-16 object-cover border border-[#C6A15B]"
                  />
                  <div className="text-xs sm:text-sm">
                    <p className="font-semibold text-[#E5C573]">
                      Updated Mother Branding Photo Detected ({importMotherFile?.name})
                    </p>
                    <p className="text-[#C5B8A5]">
                      This will automatically update your mother’s portrait on Home and Contact.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {importRows.map((row, idx) => (
                  <div
                    key={row.key}
                    className="p-4 bg-[#0D0C0B] border border-[#C6A15B]/35 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                  >
                    <div className="lg:col-span-3 flex items-center gap-2">
                      <div className="w-20 h-16 bg-[#161412] border border-[#C6A15B]/40 overflow-hidden shrink-0">
                        {row.mannequinPreview ? (
                          <img
                            src={row.mannequinPreview}
                            alt="Mannequin"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#A39683]">
                            No Mannequin
                          </div>
                        )}
                      </div>
                      <div className="w-20 h-16 bg-[#161412] border border-[#C6A15B]/40 overflow-hidden shrink-0">
                        {row.originalPreview ? (
                          <img
                            src={row.originalPreview}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#A39683]">
                            No Original
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input
                        type="text"
                        required
                        value={row.name}
                        onChange={(e) => {
                          const next = [...importRows];
                          next[idx].name = e.target.value;
                          setImportRows(next);
                        }}
                        placeholder="Saree name"
                        className="px-3 py-2 text-xs bg-[#161412] border border-[#C6A15B]/40 text-[#F6EFE2]"
                      />
                      <select
                        value={row.category}
                        onChange={(e) => {
                          const next = [...importRows];
                          next[idx].category = e.target.value as SareeCategory;
                          setImportRows(next);
                        }}
                        className="px-3 py-2 text-xs bg-[#161412] border border-[#C6A15B]/40 text-[#F6EFE2]"
                      >
                        {SAREE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        required
                        value={row.price || ''}
                        onChange={(e) => {
                          const next = [...importRows];
                          next[idx].price = Number(e.target.value);
                          setImportRows(next);
                        }}
                        placeholder="Selling ₹ *"
                        className="px-3 py-2 text-xs bg-[#161412] border border-[#C6A15B]/40 text-[#F6EFE2] tabular-nums"
                      />
                      <input
                        type="number"
                        min={0}
                        value={row.originalPrice || ''}
                        onChange={(e) => {
                          const next = [...importRows];
                          next[idx].originalPrice = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setImportRows(next);
                        }}
                        placeholder="Original MRP ₹"
                        className="px-3 py-2 text-xs bg-[#161412] border border-[#C6A15B]/40 text-[#F6EFE2] tabular-nums"
                      />
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => {
                          const next = [...importRows];
                          next[idx].description = e.target.value;
                          setImportRows(next);
                        }}
                        placeholder="Saree description..."
                        className="sm:col-span-2 lg:col-span-4 px-3 py-2 text-xs bg-[#161412] border border-[#C6A15B]/40 text-[#F6EFE2]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#C6A15B]/25">
                <label className="inline-flex items-center gap-2 text-xs text-[#F6EFE2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearSamplesOnImport}
                    onChange={(e) => setClearSamplesOnImport(e.target.checked)}
                  />
                  <span>Automatically remove all Sample Entries when importing</span>
                </label>

                <button
                  type="submit"
                  disabled={importingAll}
                  className="px-6 py-3 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {importingAll
                    ? 'Uploading Photos & Saving Sarees...'
                    : `Upload & Publish ${importRows.length} Sarees`}
                </button>
              </div>
            </form>
          )}

          {showProductForm && (
            <form
              onSubmit={handleSaveProduct}
              className="bg-[#161412] border border-[#C6A15B]/55 p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#C6A15B]/25 pb-3">
                <h2 className="font-serif text-2xl font-semibold text-[#F6EFE2]">
                  {editingId ? 'Edit Saree Details' : 'Add Real Saree to Catalogue'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="text-xs text-[#C5B8A5] hover:text-[#F6EFE2] cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                    Saree Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g., Bridal Gold Zari Kanchipuram"
                    className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                    Category *
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({ ...formState, category: e.target.value as SareeCategory })
                    }
                    className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
                  >
                    {SAREE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                    Discounted Selling Price in ₹ *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formState.price || ''}
                    onChange={(e) =>
                      setFormState({ ...formState, price: Number(e.target.value) })
                    }
                    placeholder="18500"
                    className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                    Original / MRP Price in ₹ (Optional for discount)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formState.originalPrice || ''}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="22000"
                    className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                    Availability
                  </label>
                  <select
                    value={formState.availability}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        availability: e.target.value as AvailabilityStatus,
                      })
                    }
                    className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
                  >
                    <option value="Available">Available</option>
                    <option value="Made to Order">Made to Order</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                    Fabric & Weave
                  </label>
                  <input
                    type="text"
                    value={formState.fabricDetails}
                    onChange={(e) =>
                      setFormState({ ...formState, fabricDetails: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
                  />
                </div>
              </div>

              {/* Dual Photo Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#C6A15B]/20">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#E5C573]">
                    1. AI Mannequin-in-Store Photo URL (Primary)
                  </label>
                  <input
                    type="text"
                    value={formState.image}
                    onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                    placeholder="/uploads/saree-mannequin.jpg"
                    className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
                  />
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#0D0C0B] border border-[#C6A15B] text-[#E5C573] hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors cursor-pointer">
                    <ImagePlus className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {uploadingField === 'image'
                        ? 'Uploading Mannequin Photo...'
                        : 'Upload Mannequin Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageFileSelect(e, 'image')}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#E5C573]">
                    2. Normal Original Saree Photo URL
                  </label>
                  <input
                    type="text"
                    value={formState.originalImage || ''}
                    onChange={(e) =>
                      setFormState({ ...formState, originalImage: e.target.value })
                    }
                    placeholder="/uploads/saree-original.jpg"
                    className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
                  />
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#0D0C0B] border border-[#C6A15B] text-[#E5C573] hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors cursor-pointer">
                    <ImagePlus className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {uploadingField === 'originalImage'
                        ? 'Uploading Original Photo...'
                        : 'Upload Original Saree Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageFileSelect(e, 'originalImage')}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                  Saree Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Describe colour, zari border, pallu weave, blouse piece, and occasion..."
                  className="w-full px-3 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
                />
              </div>

              <div className="flex flex-wrap gap-6 text-xs text-[#F6EFE2]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isNewArrival}
                    onChange={(e) =>
                      setFormState({ ...formState, isNewArrival: e.target.checked })
                    }
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isBestSeller}
                    onChange={(e) =>
                      setFormState({ ...formState, isBestSeller: e.target.checked })
                    }
                  />
                  <span>Mark as Best Seller</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isSample}
                    onChange={(e) =>
                      setFormState({ ...formState, isSample: e.target.checked })
                    }
                  />
                  <span>Label as Sample Entry (uncheck for real store inventory)</span>
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors cursor-pointer"
                >
                  {savingProduct ? 'Saving...' : editingId ? 'Save Changes' : 'Add to Catalogue'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2.5 text-xs text-[#C5B8A5] hover:text-[#F6EFE2] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Product List Table */}
          <div className="bg-[#161412] border border-[#C6A15B]/35 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#C6A15B]/30 text-xs text-[#C5B8A5]">
                  <th className="py-3.5 px-4 font-medium">Saree</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Price (₹)</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C6A15B]/20 text-sm">
                {store.products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#1D1A16]">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 shrink-0 overflow-hidden border border-[#C6A15B]/35 bg-[#0D0C0B]">
                          <SareeImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-[#F6EFE2]">{product.name}</div>
                          <div className="text-xs text-[#C5B8A5]">
                            {product.isSample ? 'Sample Entry' : 'Live Store Inventory'}
                            {product.originalImage ? ' · Dual Photos' : ''}
                            {product.isNewArrival ? ' · New Arrival' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#C5B8A5]">{product.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#E5C573] tabular-nums">
                      ₹{formatINR(product.price)}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="ml-2 text-xs text-[#A39683] line-through font-normal">
                          ₹{formatINR(product.originalPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#F6EFE2]">{product.availability}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(product.id);
                          setFormState({
                            name: product.name,
                            category: product.category,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            image: product.image,
                            originalImage: product.originalImage || '',
                            description: product.description,
                            availability: product.availability,
                            isNewArrival: product.isNewArrival,
                            isBestSeller: product.isBestSeller,
                            isSample: product.isSample,
                            fabricDetails: product.fabricDetails,
                            blouseIncluded: product.blouseIncluded,
                            lengthSpec: product.lengthSpec,
                            careInstructions: product.careInstructions,
                            sku: product.sku || '',
                          });
                          setShowProductForm(true);
                        }}
                        aria-label={`Edit ${product.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#E5C573] border border-[#C6A15B]/45 hover:bg-[#C6A15B] hover:text-[#0D0C0B] mr-2 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        aria-label={`Delete ${product.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-300 border border-red-400/40 hover:bg-red-700 hover:text-white cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BRANDING, HOURS & INSTAGRAM */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="mt-6 bg-[#161412] border border-[#C6A15B]/40 p-6 sm:p-8 max-w-2xl space-y-6"
        >
          <h2 className="font-serif text-2xl font-semibold text-[#F6EFE2]">
            Branding Portrait, Instagram & Business Hours
          </h2>

          {/* Mother Portrait Uploader */}
          <div className="p-4 bg-[#0D0C0B] border border-[#C6A15B]/40 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-24 overflow-hidden border border-[#C6A15B] shrink-0">
              <SareeImage
                src={settingsForm.founderPortraitUrl || BRAND_ASSETS.founderPortrait}
                alt="Mother branding portrait"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-xs font-medium text-[#E5C573]">
                Mother’s Branding Photo (`mom_phoyo_for-branding`)
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#161412] border border-[#C6A15B] text-[#E5C573] hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors cursor-pointer">
                <ImagePlus className="w-4 h-4" aria-hidden="true" />
                <span>
                  {uploadingField === 'portrait'
                    ? 'Uploading Photo...'
                    : 'Upload Updated Mother Photo'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageFileSelect(e, 'portrait')}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={settingsForm.instagramHandle}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, instagramHandle: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={settingsForm.instagramUrl}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
              Weekday Business Hours
            </label>
            <input
              type="text"
              value={settingsForm.hoursWeekdays}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, hoursWeekdays: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
              Sunday Business Hours
            </label>
            <input
              type="text"
              value={settingsForm.hoursSunday}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, hoursSunday: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F6EFE2] mb-1">
              Catalogue Notice Banner Text
            </label>
            <textarea
              rows={2}
              value={settingsForm.announcementText}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, announcementText: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2]"
            />
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors cursor-pointer"
          >
            {savingSettings ? 'Saving...' : 'Save Store Settings'}
          </button>
        </form>
      )}

      {/* TAB 3: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="mt-6 space-y-4">
          {inquiries.length === 0 ? (
            <div className="bg-[#161412] border border-[#C6A15B]/35 p-10 text-center text-sm text-[#C5B8A5]">
              No customer contact enquiries or purchase requests recorded yet.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-[#161412] border border-[#C6A15B]/35 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#C5B8A5]">
                    <span className="font-semibold text-[#E5C573]">{inq.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{inq.phone}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(inq.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#F6EFE2]">{inq.message}</p>
                </div>
                <a
                  href={`https://wa.me/${inq.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#0D0C0B] border border-[#C6A15B]/55 text-[#E5C573] hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors shrink-0 self-start sm:self-center"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reply on WhatsApp</span>
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
