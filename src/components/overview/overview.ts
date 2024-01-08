import * as vscode from "vscode";
import { displayFolders } from "../../utils/displayFolders";
import { displayNotes } from "../../utils/displayNotes";
import { searchInput } from "../search/searchInput";
import { getAllFolderContents } from "../../utils/getAllFolders";
import { renderAddButtons } from "../../utils/renderAddButtons";
import { header } from "../../utils/header";
import { scriptImport } from "../../utils/scriptImport";

interface Folders {
	folderName: string;
	uriPath: string;
}

interface Files {
    dateCreated: string,
    fileName: string,
    firstLine: string,
    folderItem: {},
    lastModified: string,
    mtime: number,
    uriPath: string
}

export async function getWebviewOverview(webview: vscode.Webview, context: vscode.ExtensionContext, folders: Folders[], files: Files[]) {
	const globalStoragePath = context.globalStorageUri.fsPath;
	const allFolders = await getAllFolderContents(context);

    const notesHTML = await displayNotes(files);
	const folderContentsHTML = await displayFolders(folders);
	const addButtonsHtml = await renderAddButtons();
    const htmlHeader = await header(webview, context);
    const scriptHtml = await scriptImport(webview, context);

	return `<!DOCTYPE html>
	<html lang="en">
        ${htmlHeader}
		
		<body>
            ${searchInput()}
            <div>
                <div class="plain">
                    <h2>Last edited</h2>
                </div>
                <div id="folders-container" class="container">
                    ${notesHTML}
                </div>
            </div>
            <div>
                <div class="plain">
                    <h2>All folders</h2>
                </div>
                <div id="folders-container" class="container">
                    ${folderContentsHTML}
                </div>
            </div>

            ${addButtonsHtml}
            
            <script>
                document.querySelectorAll(".folder-item").forEach((folder) => {
                    folder.addEventListener("click", () => {
                        const folderName = folder.getAttribute('data-folder-name');
                        const path = folder.getAttribute('folder-path');
                        vscode.postMessage({
                            page: 'subfolder',
                            folderName: folderName,
                            folderPath: path
                        });
                    });
                });

                document.querySelectorAll(".file-item").forEach((file) => {
                    file.addEventListener("click", () => {
                        const noteName = file.getAttribute('data-file-name');
                        const notePath = file.getAttribute('data-file-path');
                        vscode.postMessage({
                            page: 'note',
                            fileName: noteName,
                            filePath: notePath,
                            currentPage: 'overview'
                        });
                    });
                });

            document.querySelector("#add-folder-button").addEventListener("click", () => {
                const globalStorageName = 'entry.entry';
                const globalStoragePath = ${JSON.stringify(globalStoragePath)};
                vscode.postMessage({
                    command: 'addFolder',
                    destinationFolderName: globalStorageName,
                    destinationFolderUri: globalStoragePath,
                    webviewToRender: 'overview'
                });
            });

            document.querySelector("#add-note-button").addEventListener("click", () => {
                const notesFolderPath = ${JSON.stringify(globalStoragePath)} + '/Notes';
                vscode.postMessage({
                    command: 'addNote',
                    destinationFolderUri: notesFolderPath,
                    webviewToRender: 'overview'
                });
            });
            
                document.querySelectorAll(".move").forEach((moveButton)=>{
                    moveButton.addEventListener("mouseover", (button) => {
                        const data = ${JSON.stringify(allFolders)};
                        const sourcePath = moveButton.getAttribute("value");
                        const sourceFoldername = moveButton.getAttribute("name");
                        moveButton.appendChild(list(data, sourcePath, sourceFoldername));
                    }, { once: true })
                });

                document.querySelectorAll(".rename").forEach((renameButton) => {
                    renameButton.addEventListener("click", () => {
                        const oldFolderPath = renameButton.getAttribute("value");
                        const parentPath = oldFolderPath.substr(0, oldFolderPath.lastIndexOf("/"));
                        const parentFolder = parentPath.substr(parentPath.lastIndexOf("/") + 1);
                        vscode.postMessage({
                            command: 'renameFolder',
                            oldFolderPath: oldFolderPath,
                            parentPath: parentPath,
                            parentFolder: parentFolder,
                            webviewToRender: 'overview'
                        });
                    });
                });

                document.querySelectorAll(".delete-button").forEach((deleteButton) => {
                    deleteButton.addEventListener("click", () => {
                        const folderName = deleteButton.getAttribute("data-folder-name");
                        const folderPath = deleteButton.getAttribute("data-folder-path");
                        const globalStorageName = 'entry.entry';
                        const globalStoragePath = ${JSON.stringify(globalStoragePath)};
                        
                        const deleteContainer = deleteButton.closest(".item").querySelector("#delete-container");

                        if (deleteContainer) {
                            deleteContainer.classList.remove("hidden");
                            const deleteButtonPerm = deleteContainer.querySelector("#delete-button-perm");
                
                            deleteButtonPerm.addEventListener("click", () => {
                                deleteContainer.classList.add("hidden");
                                if (folderName) {
                                    vscode.postMessage({
                                        command: 'deleteFolder',
                                        folderName: folderName,
                                        folderPath: folderPath,
                                        destinationFolderName: globalStorageName,
                                        destinationFolderUri: globalStoragePath,
                                        webviewToRender: 'overview'
                                    });                            
                                } else {
                                    vscode.postMessage({
                                        command: 'deleteFile',
                                        fileName: deleteButton.getAttribute("data-file-name"),
                                        filePath: deleteButton.getAttribute("data-file-path"),
                                        destinationFolderName: globalStorageName,
                                        destinationFolderUri: globalStoragePath,
                                        webviewToRender: 'overview'
                                    }); 
                                }
                            });
                        }
                    });
                });
            </script>
            ${scriptHtml}
		</body>
	</html>`;
}
