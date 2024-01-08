import * as vscode from 'vscode';
import * as fse from 'fs-extra';

interface Folders {
	folderName: string;
	uriPath: string;
}

export async function deleteFile(fileName: string, filePath: string, context: vscode.ExtensionContext): Promise<void> {
    try {
            if (await fse.pathExists(filePath)) {
                fse.unlink(filePath);
                vscode.window.showInformationMessage(`File deleted successfully.`);
            } else {
                vscode.window.showErrorMessage(`File not found.`);
            }

        } catch (error: any) {
        vscode.window.showErrorMessage(`Error deleting file: ${error.message}`);
    }
}
