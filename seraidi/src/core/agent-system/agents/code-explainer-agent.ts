// -*- coding: utf-8 -*-
// Fichier: src/core/agent-system/agents/code-explainer-agent.ts
// Description: Agent d'explication de code

import { BaseAgent } from '../base/base-agent';

export interface ExplainResult {
    summary: string;
    details: Array<{
        line: number;
        explanation: string;
    }>;
    complexity: string;
    suggestions: string[];
}

export class CodeExplainerAgent extends BaseAgent {
    constructor() {
        super('code-explainer-agent', '1.0.0');
    }
    
    async execute(input: any): Promise<ExplainResult> {
        this.validateInput(input, ['code', 'language']);
        
        const { code, language } = input;
        const lines: string[] = code.split('\n');
        
        // Simulation d'explication avec types explicites
        const details: Array<{line: number; explanation: string}> = [];
        
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line: string = lines[i];
            details.push({
                line: i + 1,
                explanation: `Cette ligne ${this.explainLine(line, language)}`
            });
        }
        
        return {
            summary: `Ce code ${language} contient ${lines.length} lignes. ${this.analyzeComplexity(code)}`,
            details,
            complexity: this.getComplexityLevel(code),
            suggestions: [
                'Ajouter des commentaires',
                'Utiliser des noms de variables plus explicites'
            ]
        };
    }
    
    private explainLine(line: string, language: string): string {
        if (line.includes('function') || line.includes('def')) {
            return 'déclare une fonction';
        }
        if (line.includes('if')) {
            return 'contient une condition';
        }
        if (line.includes('return')) {
            return 'retourne une valeur';
        }
        if (line.includes('for') || line.includes('while')) {
            return 'contient une boucle';
        }
        if (line.trim() === '') {
            return 'est une ligne vide';
        }
        if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
            return 'est un commentaire';
        }
        return 'est une instruction simple';
    }
    
    private analyzeComplexity(code: string): string {
        const lines = code.split('\n');
        const conditions = code.split('if').length - 1;
        const loops = (code.split('for').length - 1) + (code.split('while').length - 1);
        
        if (conditions > 5 || loops > 3) {
            return "Le code est complexe avec de nombreuses conditions et boucles.";
        } else if (conditions > 2 || loops > 1) {
            return "Le code a une complexité modérée.";
        } else {
            return "Le code est relativement simple.";
        }
    }
    
    private getComplexityLevel(code: string): string {
        const length = code.length;
        const conditions = code.split('if').length - 1;
        const loops = (code.split('for').length - 1) + (code.split('while').length - 1);
        
        const score = length / 100 + conditions * 2 + loops * 3;
        
        if (score < 5) return "Faible";
        if (score < 10) return "Moyenne";
        return "Élevée";
    }
}