export function SplitPath(path: string): string[] {
    return path.indexOf("/") !== -1 ? path.split("/") : path.split("\\");
}
