// -*- coding: utf-8 -*-
// Fichier: src/extension/views/sidebar/sidebar-provider.ts
// Description: Fournisseur de la barre latérale

import * as vscode from 'vscode';
import { Logger } from '../../../services/logging.service';

export class SidebarProvider implements vscode.WebviewViewProvider {
    constructor(private context: vscode.ExtensionContext) {}
    
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };
        
        webviewView.webview.html = this.getHtml();
        
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'debug':
                    vscode.commands.executeCommand('seraidi.debugCode');
                    break;
                case 'test':
                    vscode.commands.executeCommand('seraidi.generateTests');
                    break;
                case 'explain':
                    vscode.commands.executeCommand('seraidi.explainCode');
                    break;
                case 'translate':
                    vscode.commands.executeCommand('seraidi.translateCode');
                    break;
            }
        });
    }
    
    private getHtml(): string {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            padding: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        .logo {
            text-align: center;
            font-size: 2em;
            margin-bottom: 20px;
            color: #007acc;
        }
        .button {
            display: block;
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
            text-align: left;
        }
        .button:hover {
            background: #005a9e;
        }
        .button.debug { background: #d73a49; }
        .button.debug:hover { background: #b31d2d; }
        .button.test { background: #28a745; }
        .button.test:hover { background: #1e7e34; }
        .button.explain { background: #6f42c1; }
        .button.explain:hover { background: #5936a3; }
        .button.translate { background: #fd7e14; }
        .button.translate:hover { background: #dc6b12; }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="logo">🤖 SERAIDI</div>
    
    <button class="button debug" onclick="sendCommand('debug')">
        🔍 Déboguer le code
    </button>
    
    <button class="button test" onclick="sendCommand('test')">
        🧪 Générer des tests
    </button>
    
    <button class="button explain" onclick="sendCommand('explain')">
        📖 Expliquer le code
    </button>
    
    <button class="button translate" onclick="sendCommand('translate')">
        🌍 Traduire le code
    </button>
    
    <div class="footer">
        v1.0.0 - Assistant Code Intelligent
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function sendCommand(command) {
            vscode.postMessage({ command });
        }
    </script>
</body>
</html>`;
    }
}