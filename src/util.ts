
export function stripGzExtension(path: string): string {
	return path.replace(/\.gz$/, '');
}