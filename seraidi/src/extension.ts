// -*- coding: utf-8 -*-
// Fichier: src/extension.ts
// Description: Point d'entrée principal de l'extension SERAIDI

import * as vscode from 'vscode';
import { AgentOrchestrator } from './core/agent-system/agent-orchestrator';
import { DebugAgent } from './core/agent-system/agents/debug-agent';
import { TestGeneratorAgent } from './core/agent-system/agents/test-generator-agent';
import { CodeExplainerAgent } from './core/agent-system/agents/code-explainer-agent';
import { TranslatorAgent } from './core/agent-system/agents/translator-agent';
import { SidebarProvider } from './extension/views/sidebar/sidebar-provider';
import { Logger } from './services/logging.service';
import { LiveAnalysisPanel } from './extension/views/webview-panels/live-analysis-panel';

let orchestrator: AgentOrchestrator;

/**
 * Fonction d'activation appelée par VSCode
 */
export async function activate(context: vscode.ExtensionContext) {
    Logger.info('🚀 SERAIDI est en cours d\'activation...');
    
    try {
        // Initialisation du système d'agents
        orchestrator = new AgentOrchestrator();
        
        // Enregistrement des agents spécialisés
        orchestrator.registerAgent('debug', new DebugAgent());
        orchestrator.registerAgent('test', new TestGeneratorAgent());
        orchestrator.registerAgent('explain', new CodeExplainerAgent());
        orchestrator.registerAgent('translate', new TranslatorAgent());
        
        // Initialisation de la sidebar
        const sidebarProvider = new SidebarProvider(context);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('seraidi-sidebar', sidebarProvider)
        );
        
        // Enregistrement des commandes
        context.subscriptions.push(
            vscode.commands.registerCommand('seraidi.debugCode', handleDebugCommand),
            vscode.commands.registerCommand('seraidi.generateTests', handleTestCommand),
            vscode.commands.registerCommand('seraidi.explainCode', handleExplainCommand),
            vscode.commands.registerCommand('seraidi.translateCode', handleTranslateCommand)
        );
        
        // Barre d'état
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.text = "$(rocket) SERAIDI";
        statusBarItem.tooltip = "SERAIDI - Assistant Code Intelligent";
        statusBarItem.command = 'seraidi.showSidebar';
        statusBarItem.show();
        context.subscriptions.push(statusBarItem);
        
        Logger.info('✅ SERAIDI activé avec succès !');
        vscode.window.showInformationMessage('SERAIDI est prêt !');
        
    } catch (error) {
        Logger.error('❌ Erreur activation', error);
        vscode.window.showErrorMessage('Échec de l\'activation de SERAIDI');
    }
}

/**
 * Gestionnaire de débogage
 */
async function handleDebugCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('📄 Aucun fichier ouvert');
        return;
    }
    
    const code = editor.document.getText();
    const language = editor.document.languageId;
    const selection = editor.selection;
    const selectedCode = selection.isEmpty ? code : editor.document.getText(selection);
    
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "🔍 SERAIDI analyse votre code...",
        cancellable: false
    }, async (progress) => {
        progress.report({ message: "Recherche des bugs..." });
        
        const result = await orchestrator.executeAgent('debug', {
            code: selectedCode,
            language: language,
            fullContext: code,
            filePath: editor.document.fileName
        });
        
        showResultsPanel('debug', result);
    });
}

/**
 * Gestionnaire de génération de tests
 */
async function handleTestCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('📄 Aucun fichier ouvert');
        return;
    }
    
    const code = editor.document.getText();
    const language = editor.document.languageId;
    
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "🧪 SERAIDI génère des tests...",
        cancellable: false
    }, async (progress) => {
        progress.report({ message: "Analyse du code..." });
        
        const result = await orchestrator.executeAgent('test', {
            code: code,
            language: language,
            filePath: editor.document.fileName
        });
        
        showResultsPanel('test', result);
    });
}

/**
 * Gestionnaire d'explication de code
 */
async function handleExplainCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('📄 Aucun fichier ouvert');
        return;
    }
    
    const code = editor.document.getText();
    const language = editor.document.languageId;
    const selection = editor.selection;
    const selectedCode = selection.isEmpty ? code : editor.document.getText(selection);
    
    const result = await orchestrator.executeAgent('explain', {
        code: selectedCode,
        language: language,
        fullContext: code
    });
    
    showResultsPanel('explain', result);
}

/**
 * Gestionnaire de traduction
 */
async function handleTranslateCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('📄 Aucun fichier ouvert');
        return;
    }
    
    const targetLanguage = await vscode.window.showQuickPick(
        ['python', 'javascript', 'typescript', 'java', 'csharp', 'php', 'go'],
        { placeHolder: '🌍 Choisir la langue cible' }
    );
    
    if (!targetLanguage) return;
    
    const code = editor.document.getText();
    const sourceLanguage = editor.document.languageId;
    
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "🔄 SERAIDI traduit le code...",
        cancellable: false
    }, async (progress) => {
        progress.report({ message: `Traduction vers ${targetLanguage}...` });
        
        const result = await orchestrator.executeAgent('translate', {
            code: code,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage
        });
        
        showResultsPanel('translate', result);
    });
}

/**
 * Affiche les résultats dans un panneau
 */
function showResultsPanel(type: string, result: any) {
    const panel = vscode.window.createWebviewPanel(
        `seraidi-${type}`,
        `SERAIDI - ${getPanelTitle(type)}`,
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );
    
    panel.webview.html = getResultsHtml(type, result);
}

/**
 * Titre du panneau selon le type
 */
function getPanelTitle(type: string): string {
    const titles: Record<string, string> = {
        debug: 'Résultats du débogage',
        test: 'Tests générés',
        explain: 'Explication du code',
        translate: 'Code traduit'
    };
    return titles[type] || 'Résultats';
}

/**
 * Génère le HTML des résultats
 */
function getResultsHtml(type: string, result: any): string {
    const icons = {
        debug: '🔍',
        test: '🧪',
        explain: '📖',
        translate: '🔄'
    };
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SERAIDI - ${getPanelTitle(type)}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 1.5em;
            color: #007acc;
        }
        .content {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
        }
        .error { color: #d73a49; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .code-block {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Consolas', 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <span style="font-size: 2em;">${icons[type as keyof typeof icons]}</span>
        <h1>SERAIDI - ${getPanelTitle(type)}</h1>
    </div>
    <div class="content">
        <pre>${JSON.stringify(result, null, 2)}</pre>
    </div>
</body>
</html>`;
}

/**
 * Fonction de désactivation
 */
export function deactivate() {
    Logger.info('👋 SERAIDI est désactivé');
}