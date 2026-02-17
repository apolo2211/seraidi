// -*- coding: utf-8 -*-
// Fichier: src/core/agent-system/base/base-agent.ts
// Description: Classe de base pour tous les agents

export abstract class BaseAgent {
    constructor(
        protected name: string,
        protected version: string
    ) {}
    
    /**
     * Exécute l'agent
     */
    abstract execute(input: any): Promise<any>;
    
    /**
     * Récupère le nom de l'agent
     */
    getName(): string {
        return this.name;
    }
    
    /**
     * Récupère la version
     */
    getVersion(): string {
        return this.version;
    }
    
    /**
     * Valide l'entrée
     */
    protected validateInput(input: any, requiredFields: string[]): void {
        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Champ requis manquant: ${field}`);
            }
        }
    }
}