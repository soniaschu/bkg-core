// BKG Plan Engine Core - File System Utilities

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export async function ensureDir(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}

export async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function writeJsonFile<T>(path: string, data: T): Promise<void> {
  await ensureDir(dirname(path));
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(path, content, 'utf-8');
}

export async function readFile(path: string): Promise<string | null> {
  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function writeFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path));
  await fs.writeFile(path, content, 'utf-8');
}

export async function listFiles(dir: string, pattern?: RegExp): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    if (pattern) {
      return files.filter(f => pattern.test(f));
    }
    return files;
  } catch {
    return [];
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function removeFile(path: string): Promise<void> {
  try {
    await fs.unlink(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export function getDirname(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}