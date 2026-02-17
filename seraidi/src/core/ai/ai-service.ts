// -*- coding: utf-8 -*-
// Fichier: src/core/ai/ai-service.ts
// Description: Service pour les appels IA (OpenAI)

import { Logger } from '../../services/logging.service';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

// Charger les variables d'environnement
dotenv.config();

export class AIService {
    private openai: any = null; // Utiliser 'any' pour éviter les erreurs de type
    private isConfigured: boolean = false;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (apiKey && apiKey !== 'sk-ta_clé_ici_sans_espaces' && apiKey.startsWith('sk-')) {
            try {
                // Initialisation sans typage strict
                this.openai = new OpenAI({ 
                    apiKey: apiKey,
                    timeout: 30000 // 30 secondes
                });
                this.isConfigured = true;
                Logger.info('✅ OpenAI configuré avec succès !');
            } catch (error) {
                Logger.error('❌ Erreur configuration OpenAI', error);
                this.isConfigured = false;
            }
        } else {
            Logger.warn('⚠️ Pas de clé OpenAI valide - Mode simulation actif');
            Logger.warn('📝 Pour utiliser l\'IA, mets ta clé dans le fichier .env');
            this.isConfigured = false;
        }
    }

    async analyzeCode(code: string, language: string, task: 'debug' | 'test' | 'explain' | 'translate'): Promise<any> {
        // Mode simulation si pas configuré
        if (!this.isConfigured || !this.openai) {
            Logger.debug('🔧 Mode simulation actif');
            return this.getSimulatedResponse(code, language, task);
        }

        try {
            Logger.debug(`🤖 Appel OpenAI pour ${task}...`);
            
            const prompt = this.buildPrompt(code, language, task);
            
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Tu es SERAIDI, un expert en développement logiciel. Réponds en JSON valide.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1500
            });

            const result = response.choices[0]?.message?.content;
            
            if (!result) {
                throw new Error('Pas de réponse de OpenAI');
            }

            Logger.debug('✅ Réponse OpenAI reçue');
            
            // Parser la réponse JSON
            try {
                return JSON.parse(result);
            } catch (e) {
                Logger.error('❌ Erreur parsing JSON', e);
                return this.getSimulatedResponse(code, language, task);
            }

        } catch (error) {
            Logger.error('❌ Erreur appel OpenAI', error);
            return this.getSimulatedResponse(code, language, task);
        }
    }

    private buildPrompt(code: string, language: string, task: string): string {
        const prompts: Record<string, string> = {
            debug: `Analyse ce code ${language} et trouve TOUS les problèmes :
- Erreurs syntaxiques
- Bugs potentiels
- Mauvaises pratiques
- Problèmes de performance
- Suggestions d'amélioration

Code à analyser :
\`\`\`${language}
${code}
\`\`\`

Réponds avec un JSON valide formaté comme ceci :
{
  "errors": [
    {
      "line": NUMERO_LIGNE,
      "type": "error" ou "warning" ou "suggestion",
      "message": "Description du problème",
      "suggestion": "Comment le résoudre"
    }
  ],
  "summary": "Résumé global de l'analyse"
}`,

            test: `Génère des tests unitaires complets pour ce code ${language} :
- Tests nominaux
- Tests des cas limites
- Tests d'erreur

Code à tester :
\`\`\`${language}
${code}
\`\`\`

Réponds en JSON :
{
  "tests": [
    {
      "name": "nom_du_test",
      "code": "code du test",
      "description": "ce que ça teste"
    }
  ],
  "coverage": 85,
  "framework": "nom_du_framework"
}`,

            explain: `Explique ce code ${language} en détail :
- Vue d'ensemble
- Explication ligne par ligne
- Complexité
- Suggestions d'amélioration

Code :
\`\`\`${language}
${code}
\`\`\`

Réponds en JSON :
{
  "summary": "Résumé général",
  "details": [
    {
      "line": NUMERO,
      "explanation": "explication de la ligne"
    }
  ],
  "complexity": "Faible/Moyenne/Élevée",
  "suggestions": ["suggestion1", "suggestion2"]
}`,

            translate: `Traduis ce code ${language} vers un autre langage (choisis le plus approprié).

Code source :
\`\`\`${language}
${code}
\`\`\`

Réponds en JSON :
{
  "targetLanguage": "langage_cible",
  "translatedCode": "code traduit",
  "confidence": 0.95,
  "warnings": ["avertissement1", "avertissement2"]
}`
        };

        return prompts[task] || prompts.debug;
    }

    private getSimulatedResponse(code: string, language: string, task: string): any {
        const lines = code.split('\n');
        
        const simulations: Record<string, any> = {
            debug: {
                errors: [
                    {
                        line: 1,
                        type: 'suggestion',
                        message: 'Mode simulation - Configure OpenAI',
                        suggestion: 'Ajoute ta clé API dans .env'
                    }
                ],
                summary: '🔧 MODE SIMULATION - Pas de clé OpenAI trouvée'
            },
            
            test: {
                tests: [
                    {
                        name: 'test_simulation',
                        code: '// Test simulé',
                        description: 'Configure OpenAI pour de vrais tests'
                    }
                ],
                coverage: 50,
                framework: 'Simulation'
            },
            
            explain: {
                summary: 'Mode simulation - Configure OpenAI',
                details: lines.slice(0, 3).map((line, i) => ({
                    line: i + 1,
                    explanation: `Ligne ${i + 1} (simulation)`
                })),
                complexity: 'Inconnue',
                suggestions: ['Ajoute ta clé API OpenAI']
            },
            
            translate: {
                targetLanguage: language,
                translatedCode: '// Mode simulation\n' + code,
                confidence: 0.5,
                warnings: ['Configure OpenAI pour de vraies traductions']
            }
        };

        return simulations[task] || simulations.debug;
    }
}