/**
 * Gerenciador de Caminhos de Armazenamento Padronizado (Storage Path Manager)
 * Organização de arquivos no Supabase Storage / S3 para Multi-Tenant Enterprise
 */

export interface StoragePathParams {
  companyId: string;
  assetId?: string;
  versionNumber?: number;
  filename: string;
  type: 'stl' | '3mf' | 'gcode' | 'render' | 'thumb' | 'certificate' | 'export';
}

export function buildStoragePath({
  companyId,
  assetId,
  versionNumber = 1,
  filename,
  type,
}: StoragePathParams): string {
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
  const safeAssetFolder = assetId || 'general';

  switch (type) {
    case 'stl':
      return `${companyId}/assets/stl/${safeAssetFolder}/v${versionNumber}/${sanitizedFilename}`;
    case '3mf':
      return `${companyId}/assets/3mf/${safeAssetFolder}/v${versionNumber}/${sanitizedFilename}`;
    case 'gcode':
      return `${companyId}/assets/gcode/${safeAssetFolder}/v${versionNumber}/${sanitizedFilename}`;
    case 'thumb':
    case 'render':
      return `${companyId}/assets/thumbs/${safeAssetFolder}/${sanitizedFilename}`;
    case 'certificate':
      return `${companyId}/certificates/${sanitizedFilename}`;
    case 'export':
      return `${companyId}/exports/${sanitizedFilename}`;
    default:
      return `${companyId}/misc/${sanitizedFilename}`;
  }
}
