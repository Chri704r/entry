import * as vscode from "vscode";

export async function scriptImport(webview: vscode.Webview, context: vscode.ExtensionContext) {
    const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out/utils", "script.js"));

    const isDark = vscode.window.activeColorTheme?.kind === vscode.ColorThemeKind.Dark;

    return `
        <script src="${script}"></script>
        <script>
	        updateTheme(${isDark});
        </script>
    `;
}