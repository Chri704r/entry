import * as vscode from "vscode";
import { getWebviewOverview } from "./components/overview/overview";
import { getWebviewSubfolder } from "./components/subfolder/subfolder";
import { getWebviewNote } from "./components/note/note";
import { displayDecorators } from "./utils/displayDecorators";
import { addDecoratorToLine } from "./utils/addDecoratorToLine";
import { moveToFolder } from "./utils/moveToFolder";
import { getFolderContents, initializeFileAndFolder } from "./utils/initialize";
import { getNotes } from "./utils/getLastEditedNotes";
import { search } from "./components/search/search";
import { addFolder } from "./utils/addFolder";
import { addNote } from "./utils/addNote";
import { updateWebview } from "./utils/updateWebview";
import { saveFile } from "./utils/saveFile";
import { deleteFile } from "./utils/deleteNote";
import { renameFolder } from "./utils/renameFolder";
import { deleteFolder } from "./utils/deleteFolder";

let currentOpenFile: string;
let currentOpenFilePath: string;

export async function activate(context: vscode.ExtensionContext) {
	await initializeFileAndFolder(context);

	let disposable = vscode.commands.registerCommand("entry.entry", async () => {
		const panel = vscode.window.createWebviewPanel("entry", "entry", vscode.ViewColumn.One, {
			enableScripts: true,
		});

		const folders = await getFolderContents(context);
		const files = await getNotes(context.globalStorageUri.fsPath);

		panel.webview.html = await getWebviewOverview(panel.webview, context, folders, files);

		panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.page) {
					case "overview":
						panel.webview.html = await getWebviewOverview(panel.webview, context, folders, files);
						return;
					case "subfolder":
						const folder = { folderName: message.folderName, uriPath: message.folderPath };
						panel.webview.html = await getWebviewSubfolder(folder, panel.webview, context);
						return;
					case "note":
						currentOpenFile = message.fileName;
						currentOpenFilePath = message.filePath;
						panel.webview.html = await getWebviewNote(panel.webview, context, message.fileName, message.filePath, message.currentPage);
						return;
				}
				switch (message.command) {
					case "move":
						moveToFolder(message.pathTo, message.pathFrom);
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "search":
						panel.webview.html = await search(message.searchTerm, panel.webview, context);
						return;
					case "addFolder":
						await addFolder(message.destinationFolderName, message.destinationFolderUri, message.webviewToRender, context, panel);
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "renameFolder":
						await renameFolder(message.oldFolderPath);
						panel.webview.html = await updateWebview(message.parentFolder, message.parentPath, message.webviewToRender, panel.webview, context);
						return;
					case "addNote":
						await addNote(message.destinationFolderName, message.destinationFolderUri, message.webviewToRender, context, panel);
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "save":
						await saveFile(message.fileName, message.filePath, message.data.fileContent, context);
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						currentOpenFile = "";
						currentOpenFilePath = "";
						return;
					case "deleteFile":
						await deleteFile(
							message.fileName,
							message.filePath,
							context
						);
						panel.webview.html = await updateWebview(
							message.currentFolderName,
							message.currentFolderPath,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
					case "deleteFolder":
						await deleteFolder(
							message.folderName,
							message.folderPath,
							context
							);
							panel.webview.html = await updateWebview(
								message.currentFolderName,
								message.currentFolderPath,
								message.webviewToRender,
								panel.webview,
								context
							);
						return;
					case "comment":
						addDecoratorToLine(panel.webview, context, message.fileName, message.filePath);
						return;
					case "navigate":
						panel.webview.html = await updateWebview(
							message.destinationFolderName,
							message.destinationFolderUri,
							message.webviewToRender,
							panel.webview,
							context
						);
						return;
				}
			},
			undefined,
			context.subscriptions
		);

		vscode.window.onDidChangeActiveColorTheme(async () => {
			panel.webview.html = await getWebviewOverview(panel.webview, context, folders, files);
		});

		let addDecorator = vscode.commands.registerCommand("entry.addDecorator", () => {
			addDecoratorToLine(panel.webview, context, currentOpenFile, currentOpenFilePath);
		});

		context.subscriptions.push(addDecorator);
	});

	vscode.window.onDidChangeActiveTextEditor(() => {
		// Trigger the registered command when the active text editor changes
		// vscode.commands.executeCommand("extension.onDidChangeActiveTextEditor");
		displayDecorators(context, currentOpenFile, currentOpenFilePath);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
