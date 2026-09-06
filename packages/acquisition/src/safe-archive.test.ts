import AdmZip from 'adm-zip';
import { describe, expect, it } from 'vitest';
import { AcquisitionArchive } from './safe-archive.js';

function archive(...texts: string[]): Buffer {
  const zip = new AdmZip();
  texts.forEach((text, i) => zip.addFile(`${i}.csv`, Buffer.from(text)));
  return zip.toBuffer();
}

describe('bounded archive reader', () => {
  it('reads ordinary CSV entries and handles absent files', () => {
    const zip = new AcquisitionArchive(archive('model,score\na,42', 'b,9'));
    expect(zip.names()).toEqual(['0.csv', '1.csv']);
    expect(zip.text('0.csv')).toBe('model,score\na,42');
    expect(zip.text('missing.csv')).toBeUndefined();
  });

  it('rejects input bytes and entry counts before expanding', () => {
    const bytes = archive('a', 'b');
    expect(
      () => new AcquisitionArchive(bytes, { archiveBytes: bytes.length - 1 }),
    ).toThrow(/byte limit/);
    expect(() => new AcquisitionArchive(bytes, { archiveEntries: 1 })).toThrow(
      /entry limit/,
    );
  });

  it('rejects declared single-entry and total expansion', () => {
    expect(
      () =>
        new AcquisitionArchive(archive('a'.repeat(100)), { entryBytes: 99 }),
    ).toThrow(/expansion/);
    expect(
      () => new AcquisitionArchive(archive('abc', 'def'), { expandedBytes: 5 }),
    ).toThrow(/expansion/);
  });

  it('caps actual inflation even when both ZIP size headers lie', () => {
    const bytes = archive('a'.repeat(1024 * 1024));
    const central = bytes.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    bytes.writeUInt32LE(1, 22); // local uncompressed size
    bytes.writeUInt32LE(1, central + 24); // central uncompressed size
    const zip = new AcquisitionArchive(bytes, { entryBytes: 128 });
    expect(() => zip.text('0.csv')).toThrow(/larger than|limit|length/i);
  });

  it('rejects content with a forged CRC', () => {
    const bytes = archive('data');
    const central = bytes.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    bytes.writeUInt32LE(0, central + 16);
    expect(() => new AcquisitionArchive(bytes).text('0.csv')).toThrow(/CRC/);
  });

  it('charges repeated reads against the actual expansion budget', () => {
    const zip = new AcquisitionArchive(archive('abc'), { expandedBytes: 3 });
    expect(zip.text('0.csv')).toBe('abc');
    expect(() => zip.text('0.csv')).toThrow(/budget exhausted/);
  });
});
