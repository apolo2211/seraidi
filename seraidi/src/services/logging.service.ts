// -*- coding: utf-8 -*-
// Fichier: src/services/logging.service.ts
// Description: Service de journalisation

export class Logger {
    private static outputChannel: vscode.OutputChannel | undefined;
    
    private static getChannel(): vscode.OutputChannel {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('SERAIDI');
        }
        return this.outputChannel;
    }
    
    static info(message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[INFO ${timestamp}] ${message}`;
        console.log(logMessage);
        this.getChannel().appendLine(logMessage);
    }
    
    static warn(message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[WARN ${timestamp}] ${message}`;
        console.warn(logMessage);
        this.getChannel().appendLine(logMessage);
    }
    
    static error(message: string, error?: any): void {
        const timestamp = new Date().toISOString();
        const errorDetail = error ? `\n${JSON.stringify(error, null, 2)}` : '';
        const logMessage = `[ERROR ${timestamp}] ${message}${errorDetail}`;
        console.error(logMessage);
        this.getChannel().appendLine(logMessage);
    }
    
    static debug(message: string, data?: any): void {
        const timestamp = new Date().toISOString();
        const dataDetail = data ? `\n${JSON.stringify(data, null, 2)}` : '';
        const logMessage = `[DEBUG ${timestamp}] ${message}${dataDetail}`;
        console.debug(logMessage);
        this.getChannel().appendLine(logMessage);
    }
    
    static show(): void {
        this.getChannel().show();
    }
}

// Import nécessaire pour le type
import * as vscode from 'vscode';