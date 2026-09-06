import AdmZip from 'adm-zip';
import { crc32, inflateRawSync } from 'node:zlib';
import {
  acquisitionLimits,
  AcquisitionLimitError,
  type AcquisitionLimits,
} from './acquisition-policy.js';

/** Bounded ZIP data reader: never extracts paths and never trusts size headers. */
export class AcquisitionArchive {
  private readonly entries = new Map<string, AdmZip.IZipEntry>();
  private readonly limits: AcquisitionLimits;
  private expanded = 0;

  constructor(bytes: Buffer, overrides: Partial<AcquisitionLimits> = {}) {
    this.limits = acquisitionLimits(overrides);
    if (bytes.length > this.limits.archiveBytes) {
      throw new AcquisitionLimitError(
        'Acquisition archive byte limit exceeded',
      );
    }
    // Central-directory metadata is parsed lazily; reject an excessive entry
    // count before constructing all entry objects (including ZIP64 archives).
    const zip = new AdmZip(bytes);
    if (zip.getEntryCount() > this.limits.archiveEntries) {
      throw new AcquisitionLimitError(
        'Acquisition archive entry limit exceeded',
      );
    }
    let declared = 0;
    for (const entry of zip.getEntries()) {
      if (this.entries.has(entry.entryName))
        throw new Error('Duplicate archive entry');
      const { size, compressedSize, flags, method } = entry.header;
      if ((flags & 1) !== 0 || ![0, 8].includes(method))
        throw new Error('Unsupported archive encoding');
      declared += size;
      if (
        !Number.isSafeInteger(size) ||
        size < 0 ||
        size > this.limits.entryBytes ||
        compressedSize > this.limits.archiveBytes ||
        declared > this.limits.expandedBytes
      ) {
        throw new AcquisitionLimitError(
          'Acquisition archive expansion limit exceeded',
        );
      }
      this.entries.set(entry.entryName, entry);
    }
  }

  names(): string[] {
    return [...this.entries.keys()];
  }

  text(name: string): string | undefined {
    const entry = this.entries.get(name);
    if (!entry) return undefined;
    if (entry.isDirectory) throw new Error('Expected archive file');
    const remaining = this.limits.expandedBytes - this.expanded;
    const limit = Math.min(this.limits.entryBytes, remaining);
    if (limit <= 0)
      throw new AcquisitionLimitError(
        'Acquisition archive expansion budget exhausted',
      );
    const compressed = entry.getCompressedData();
    if (compressed.length !== entry.header.compressedSize)
      throw new Error('Truncated archive entry');
    // maxOutputLength is enforced by zlib during inflation, even when size
    // metadata lies. Stored entries are bounded by their actual byte length.
    const data =
      entry.header.method === 8
        ? inflateRawSync(compressed, { maxOutputLength: limit })
        : compressed;
    if (data.length > limit)
      throw new AcquisitionLimitError(
        'Acquisition archive expansion limit exceeded',
      );
    this.expanded += data.length;
    if (data.length !== entry.header.size || crc32(data) !== entry.header.crc) {
      throw new Error('Archive entry size or CRC mismatch');
    }
    return data.toString('utf8');
  }
}
