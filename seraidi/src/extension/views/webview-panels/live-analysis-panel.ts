// -*- coding: utf-8 -*-
// Fichier: src/extension/views/webview-panels/live-analysis-panel.ts
// Description: Panneau d'analyse en direct

import * as vscode from 'vscode';

export class LiveAnalysisPanel {
    public static currentPanel: LiveAnalysisPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getHtml();
        
        // Gérer les messages du webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'fixAll':
                        vscode.window.showInformationMessage('Fonctionnalité à venir : Correction automatique');
                        break;
                    case 'optimize':
                        vscode.window.showInformationMessage('Fonctionnalité à venir : Optimisation');
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow() {
        if (LiveAnalysisPanel.currentPanel) {
            LiveAnalysisPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'liveAnalysis',
            '📊 Analyse en direct - SERAIDI',
            vscode.ViewColumn.Beside,
            { 
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        LiveAnalysisPanel.currentPanel = new LiveAnalysisPanel(panel);
    }

    private _getHtml(): string {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            padding: 20px;
            background: #1e1e1e;
            color: #d4d4d4;
            line-height: 1.6;
        }
        h1 {
            color: #007acc;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
        }
        .metric {
            background: #2d2d2d;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #007acc;
        }
        .metric h3 {
            margin-top: 0;
            color: #007acc;
        }
        .good { color: #4ec9b0; font-weight: bold; }
        .warning { color: #dcdcaa; font-weight: bold; }
        .error { color: #f48771; font-weight: bold; }
        .chart-container {
            background: #252526;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
        }
        .chart {
            height: 20px;
            background: #3e3e42;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .bar {
            height: 100%;
            background: linear-gradient(90deg, #007acc, #4ec9b0);
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 15px 0;
        }
        .stat-box {
            background: #252526;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
        }
        button {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            font-size: 14px;
            transition: background 0.3s;
        }
        button:hover {
            background: #005a9e;
        }
        button.primary {
            background: #4ec9b0;
            color: #1e1e1e;
        }
        button.primary:hover {
            background: #3aa88d;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #6e6e6e;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>📊 Analyse en direct</h1>
    
    <div class="metric">
        <h3>Qualité du code</h3>
        <div class="chart-container">
            <div class="chart">
                <div class="bar" style="width: 75%;"></div>
            </div>
            <p>Score de qualité: <span class="good">75%</span> - Bon</p>
        </div>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <div class="stat-value error">0</div>
            <div>Erreurs</div>
        </div>
        <div class="stat-box">
            <div class="stat-value warning">3</div>
            <div>Avertissements</div>
        </div>
        <div class="stat-box">
            <div class="stat-value good">5</div>
            <div>Suggestions</div>
        </div>
    </div>
    
    <div class="metric">
        <h3>Métriques</h3>
        <p>📏 Complexité cyclomatique: <span class="warning">8</span> (modérée)</p>
        <p>🔧 Maintenabilité: <span class="good">Bonne</span></p>
        <p>⚡ Performance: <span class="good">Optimale</span></p>
        <p>🔒 Sécurité: <span class="warning">2 alertes</span></p>
    </div>
    
    <div class="metric">
        <h3>Actions rapides</h3>
        <button class="primary" onclick="sendCommand('fixAll')">
            🔧 Corriger automatiquement
        </button>
        <button onclick="sendCommand('optimize')">
            ⚡ Optimiser le code
        </button>
        <button onclick="sendCommand('document')">
            📝 Générer documentation
        </button>
        <button onclick="sendCommand('refactor')">
            🔨 Suggérer refactoring
        </button>
    </div>
    
    <div class="footer">
        SERAIDI v1.0.0 - Analyse en temps réel
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function sendCommand(command) {
            vscode.postMessage({ command: command });
            
            // Feedback visuel
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '✓ Envoyé !';
            button.style.opacity = '0.7';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.opacity = '1';
            }, 1000);
        }
        
        // Simuler des mises à jour en direct
        setInterval(() => {
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => {
                const newWidth = 70 + Math.random() * 10;
                bar.style.width = newWidth + '%';
            });
        }, 5000);
    </script>
</body>
</html>`;
    }

    public dispose() {
        LiveAnalysisPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}