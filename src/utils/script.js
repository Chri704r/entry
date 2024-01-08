const updateTheme = (isDark) => {
	document.documentElement.style.setProperty("--body-background-color", isDark ? "#1e1e1e" : "#fff");
	document.documentElement.style.setProperty("--text-color", isDark ? "#fff" : "#3f3f3f");
	document.documentElement.style.setProperty("--secondary-text-color", isDark ? "#b0b0b0" : "#909090");
	document.documentElement.style.setProperty("--border-color", isDark ? "#2f2f2f" : "#F5F5F5");
	document.documentElement.style.setProperty("--split-border-color", isDark ? "#3f3f3f" : "#3f3f3f");
	document.documentElement.style.setProperty("--modal-background-color", isDark ? "#373737" : "#fff");
	document.documentElement.style.setProperty("--item-background-color", isDark ? "#262626" : "#F8F8F8");
	document.documentElement.style.setProperty("--hover-background-color", isDark ? "#444444" : "#F8F8F8");
};
// ------ delete modal ------
document.querySelectorAll(".secondary-button").forEach((cancelButton) => {
	cancelButton.addEventListener("click", () => {
		const deleteContainer = cancelButton.closest(".item").querySelector("#delete-container");

		deleteContainer.classList.add("hidden");
	});
});

// ------ dropdown ------
function list(data = [], sourcePath) {
	if (data.length > 0) {
		const ul = document.createElement("ul");
		data.forEach((folder) => {
			const li = document.createElement("li");
			li.id = folder.folderName;
			const a = document.createElement("a");
			const p = document.createElement("p");
			p.textContent = folder.folderName;
			if (folder.uriPath === sourcePath) {
				p.style.color = "#747474";
				li.style.cursor = "not-allowed";
			}
			a.appendChild(p);
			if (folder.subfolders && folder.subfolders.length > 0) {
				const icon = document.createElement("span");
				icon.classList.add("codicon");
				icon.classList.add("codicon-chevron-right");
				a.appendChild(icon);
			}
			li.appendChild(a);
			listenForMouseOver(li, folder.subfolders, sourcePath);
			if (folder.uriPath !== sourcePath) {
				clickOnFolder(li, folder, sourcePath);
			}
			ul.appendChild(li);
		});
		return ul;
	}
}

function clickOnFolder(option, folder, sourcePath) {
	option.addEventListener("click", () => {
		const entryFolderPath = sourcePath.substr(0, sourcePath.lastIndexOf("entry")) + 'entry';
		const entryFolderName = 'entry.entry';
		const currentPath = sourcePath.substr(0, sourcePath.lastIndexOf("/"));
		const currentFolder = currentPath.substr(currentPath.lastIndexOf("/") + 1);
		if (currentPath === entryFolderPath && currentFolder === entryFolderName) {
			vscode.postMessage({
				command: "move",
				pathTo: folder.uriPath,
				pathFrom: sourcePath,
				destinationFolderName: currentFolder,
				destinationFolderUri: currentPath,
				webviewToRender: 'overview'
			});
		} else {
			vscode.postMessage({
				command: "move",
				pathTo: folder.uriPath,
				pathFrom: sourcePath,
				destinationFolderName: currentFolder,
				destinationFolderUri: currentPath,
				webviewToRender: 'subfolder'
			});
		}
	});
}

function listenForMouseOver(option, subfolders, sourcePath) {
	option.addEventListener(
		"mouseover",
		() => {
			if (subfolders !== undefined) {
				option.appendChild(list(subfolders, sourcePath));
			}
		},
		{ once: true }
	);
}

document.querySelectorAll(".settings-container").forEach((button) => {
	button.addEventListener("click", () => {
		button.querySelector(".dropdown").classList.toggle("hidden");
	});
});

document.addEventListener("click", (e) => {
	let isClickInside = false;
	document.querySelectorAll(".settings-container").forEach((container) => {
		if (container.contains(event.target)) {
			isClickInside = true;
		}
	});
	if (!isClickInside) {
		document.querySelectorAll(".dropdown").forEach((dropdown) => dropdown.classList.add("hidden"));
	}
});
