export function searchInput(searchTerm: string) {
	return `<div class="search-container">
                <span class="codicon codicon-search"></span>
                ${
									searchTerm !== ""
										? `<input class="search-input" type="text" value=${searchTerm}>`
										: '<input class="search-input" type="text" placeholder="Search...">'
								}
            </div> 
            <script>
            const vscode = acquireVsCodeApi();
            document.querySelector(".search-input").addEventListener("keypress", function (e) {
                if (e.key === "Enter") {
                    const value = document.querySelector(".search-input").value;
                    vscode.postMessage({
                        command: "search",
                        searchTerm: value,
                    });
                }
            });
            </script>`;
}
