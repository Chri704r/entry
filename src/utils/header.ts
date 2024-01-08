import * as vscode from "vscode";

export async function header(webview: vscode.Webview, context: vscode.ExtensionContext) {
    const generalStyles = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out/style", "general.css"));
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css"));

    return `
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script href="highlight.js"></script>
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
			<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
			<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
			<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
            <link rel="stylesheet" href="${generalStyles}">
            <link rel="stylesheet" href="${codiconsUri}">
        </head>
    `;
}