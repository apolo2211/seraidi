// -*- coding: utf-8 -*-
// Fichier: src/core/agent-system/agents/debug-agent.ts
// Description: Agent de débogage

import { BaseAgent } from '../base/base-agent';
import { AIService } from '../../ai/ai-service';
import { Logger } from '../../../services/logging.service';

export interface DebugResult {
    errors: Array<{
        line: number;
        type: 'error' | 'warning' | 'suggestion';
        message: string;
        suggestion: string;
    }>;
    summary: string;
}

export class DebugAgent extends BaseAgent {
    private aiService: AIService;
    
    constructor() {
        super('debug-agent', '1.0.0');
        this.aiService = new AIService();
    }
    
    async execute(input: any): Promise<DebugResult> {
        this.validateInput(input, ['code', 'language']);
        
        const { code, language } = input;
        
        Logger.debug(`Analyse du code ${language}`, { codeLength: code.length });
        
        // Analyse basique
        const basicErrors = this.basicAnalysis(code, language);
        
        // Analyse IA
        let aiResult: any = { errors: [] };
        try {
            aiResult = await this.aiService.analyzeCode(code, language, 'debug');
        } catch (error) {
            Logger.error('Erreur analyse IA', error);
        }
        
        // Fusionner les résultats avec conversion de type
        const aiErrors = (aiResult.errors || []).map((err: any) => ({
            line: err.line,
            type: this.convertType(err.type),
            message: err.message,
            suggestion: err.suggestion
        }));
        
        const allErrors = [...basicErrors, ...aiErrors];
        
        // Résumé
        const errorCount = allErrors.filter(e => e.type === 'error').length;
        const warningCount = allErrors.filter(e => e.type === 'warning').length;
        const suggestionCount = allErrors.filter(e => e.type === 'suggestion').length;
        
        const summary = `📊 ${errorCount} erreurs, ${warningCount} avertissements, ${suggestionCount} suggestions`;
        
        return {
            errors: allErrors,
            summary
        };
    }
    
    private convertType(type: string): 'error' | 'warning' | 'suggestion' {
        if (type === 'error' || type === 'warning' || type === 'suggestion') {
            return type;
        }
        return 'suggestion'; // Par défaut
    }
    
    private basicAnalysis(code: string, language: string): Array<{
        line: number;
        type: 'error' | 'warning' | 'suggestion';
        message: string;
        suggestion: string;
    }> {
        const errors: Array<{
            line: number;
            type: 'error' | 'warning' | 'suggestion';
            message: string;
            suggestion: string;
        }> = [];
        
        const lines = code.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;
            
            if (line.includes('TODO') || line.includes('FIXME')) {
                errors.push({
                    line: lineNum,
                    type: 'warning',
                    message: 'Marqueur TODO/FIXME trouvé',
                    suggestion: 'Pensez à implémenter cette partie'
                });
            }
            
            if (line.includes('console.log')) {
                errors.push({
                    line: lineNum,
                    type: 'suggestion',
                    message: 'console.log détecté',
                    suggestion: 'À retirer en production'
                });
            }
            
            if (language === 'javascript' && line.includes('var ')) {
                errors.push({
                    line: lineNum,
                    type: 'suggestion',
                    message: 'Utilisation de "var"',
                    suggestion: 'Préférez "let" ou "const"'
                });
            }
            
            // Détection de lignes trop longues
            if (line.length > 100) {
                errors.push({
                    line: lineNum,
                    type: 'suggestion',
                    message: 'Ligne trop longue',
                    suggestion: 'Essayez de couper cette ligne (max 100 caractères)'
                });
            }
            
            // Détection de points-virgules manquants (JavaScript)
            if (language === 'javascript' && line.trim() && !line.trim().endsWith(';') && 
                !line.trim().endsWith('{') && !line.trim().endsWith('}') && 
                !line.trim().startsWith('//') && !line.trim().startsWith('if') &&
                !line.trim().startsWith('for') && !line.trim().startsWith('while')) {
                errors.push({
                    line: lineNum,
                    type: 'suggestion',
                    message: 'Point-virgule manquant',
                    suggestion: 'Ajoutez un point-virgule à la fin de la ligne'
                });
            }
        }
        
        return errors;
    }
}