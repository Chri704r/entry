import * as vscode from "vscode";
import { getAllFolderContents } from "../../utils/getAllFolders";
import { getContentInFolder } from "../../utils/initialize";
import { displayFolders } from "../../utils/displayFolders";
import { searchInput } from "../search/searchInput";
import { displayNotes } from "../../utils/displayNotes";
import { renderAddButtons } from "../../utils/renderAddButtons";
import { header } from "../../utils/header";
import { scriptImport } from "../../utils/scriptImport";

interface Folder {
	folderName: string;
	uriPath: string;
}

export async function getWebviewSubfolder(folderData: any, webview: vscode.Webview, context: vscode.ExtensionContext) {
	const allFolders = await getAllFolderContents(context);
	const folderContent = await getContentInFolder(folderData);

	const folderContentsHTML = await displayFolders(folderContent.folders);
	const notesHTML = await displayNotes(folderContent.files);
	const htmlBreadcrumb = await clickBreadcrumb(folderData, context);
	const addButtonsHtml = await renderAddButtons();

    const htmlHeader = await header(webview, context);
    const scriptHtml = await scriptImport(webview, context);

	return `<!DOCTYPE html>
    <html lang="en">
        ${htmlHeader}

        <body>
            <div class="folder-title-container">
                <div class="back-button">
                    <span class="codicon codicon-chevron-left"></span>
                </div>
                <h1 class="subfolder-header">${folderData.folderName}</h1> 
            </div>
            <div class="breadcrumb-container">${htmlBreadcrumb}</div>     
            ${searchInput()}
            <h2>Folders</h2>
            <div id="folders-container" class="container">
                ${folderContentsHTML}
            </div> 
            <h2>Files</h2>
            <div id="folders-container" class="container">
                ${notesHTML}
            </div> 

            <div id="delete-container" class="hidden">
                <div id="delete-wrapper">
                    <div id="delete-modal">
                        <p>Are you sure you want to delete?</p>
                        <p>Once you click delete you will not be able to get it back.</p>
                        <div id="button-container">
                            <button class="secondary-button">Cancel</button>
                            <button id="delete-button-perm">
                                <p>Delete</p>
                                <span class="codicon codicon-trash"></span>
                            </button>
                        </div>
                    </div>
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

                document.querySelectorAll(".breadcrumb").forEach((crumb) => {
                    crumb.addEventListener("click", () => {
                        const folderName = crumb.getAttribute('data-folder-name');
                        const path = crumb.getAttribute('folder-path');
                        if(folderName == "Overview"){
                            vscode.postMessage({
                                command: 'navigate',
                                destinationFolderName: folderName,
                                destinationFolderUri: path,
                                webviewToRender: 'overview'
                            });
                        } else {
                            vscode.postMessage({
                                command: 'navigate',
                                destinationFolderName: folderName,
                                destinationFolderUri: path,
                                webviewToRender: 'subfolder'
                            });
                        }
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
                            currentPage: 'subfolder'
                        });
                    });
                });

            document.querySelector("#add-folder-button").addEventListener("click", () => {
                    const currentFolder = ${JSON.stringify(folderData.folderName)};
                    const currentUri = ${JSON.stringify(folderData.uriPath)};
                    vscode.postMessage({
                        command: "addFolder",
                        destinationFolderName: currentFolder,
                        destinationFolderUri: currentUri,
                        webviewToRender: 'subfolder',
                    });
            });

            document.querySelector("#add-note-button").addEventListener("click", () => {
                    const currentFolder = ${JSON.stringify(folderData.folderName)};
                    const currentUri = ${JSON.stringify(folderData.uriPath)};
                    vscode.postMessage({
                        command: "addNote",
                        destinationFolderName: currentFolder,
                        destinationFolderUri: currentUri,
                        webviewToRender: 'subfolder',
                    });
            });

            document.querySelector(".back-button").addEventListener("click", ()=>{
                const uri = ${JSON.stringify(folderData.uriPath)};
                const replaceBackslash = uri.replace(/[\/\\\\]/g, "/");
                const lastSlashIndex = Math.max(replaceBackslash.lastIndexOf("/"));
                const parentUri = replaceBackslash.substr(0, lastSlashIndex);
                const parentFolder = parentUri.substr(parentUri.lastIndexOf("/") + 1);
                if(parentFolder == "entry.entry"){
                    vscode.postMessage({
                        command: 'navigate',
                        destinationFolderName: parentFolder,
                        destinationFolderUri: parentUri,
                        webviewToRender: 'overview'
                    });
                } else{
                    vscode.postMessage({
                        command: 'navigate',
                        destinationFolderName: parentFolder,
                        destinationFolderUri: parentUri,
                        webviewToRender: 'subfolder'
                    });
                }
            });

                document.querySelectorAll(".move").forEach((moveButton)=>{
                    moveButton.addEventListener("mouseover", (button)=>{
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
                                webviewToRender: 'subfolder'
                            });
                        });
                    });
                
                document.querySelectorAll(".delete-button").forEach((deleteButton) => {
                    deleteButton.addEventListener("click", () => {
                        const folderName = deleteButton.getAttribute("data-folder-name");
                        const folderPath = deleteButton.getAttribute("data-folder-path");
                
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
                                        currentFolderName: ${JSON.stringify(folderData.folderName)},
                                        currentFolderPath: ${JSON.stringify(folderData.uriPath)},
                                        webviewToRender: 'subfolder'

                                    });                            
                                } else {
                                    vscode.postMessage({
                                        command: 'deleteFile',
                                        fileName: deleteButton.getAttribute("data-file-name"),
                                        filePath: deleteButton.getAttribute("data-file-path"),
                                        currentFolderName: ${JSON.stringify(folderData.folderName)},
                                        currentFolderPath: ${JSON.stringify(folderData.uriPath)},
                                        webviewToRender: 'subfolder'
                                    }); 
                                }
                            });
                        }
                    });
                });
            </script>
            ${scriptHtml}
        </body>
    </html>
    `;
}

async function clickBreadcrumb(folderData: Folder, context: vscode.ExtensionContext) {
	const globalStorageMainUri = context.globalStorageUri.fsPath;
	const breadcrumb = folderData.uriPath.replace(globalStorageMainUri, "Overview");
	const breadcrumbFolders = breadcrumb.split("/");
	let pathmaker = globalStorageMainUri;

	return breadcrumbFolders
		.map((folder: string) => {
			pathmaker = pathmaker + "/" + folder;
			return `<p class="breadcrumb" data-folder-name="${folder}" folder-path="${pathmaker.replace("Overview/", "")}">${folder}/</p>`;
		})
		.join("");
}
