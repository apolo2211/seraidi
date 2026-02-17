// -*- coding: utf-8 -*-
// Fichier: src/core/agent-system/agent-orchestrator.ts
// Description: Orchestrateur des agents

import { BaseAgent } from './base/base-agent';
import { Logger } from '../../services/logging.service';

export class AgentOrchestrator {
    private agents: Map<string, BaseAgent> = new Map();
    
    /**
     * Enregistre un agent
     */
    registerAgent(name: string, agent: BaseAgent): void {
        this.agents.set(name, agent);
        Logger.info(`✅ Agent enregistré: ${name} (v${agent.getVersion()})`);
    }
    
    /**
     * Exécute un agent
     */
    async executeAgent(agentName: string, input: any): Promise<any> {
        const agent = this.agents.get(agentName);
        
        if (!agent) {
            throw new Error(`Agent "${agentName}" non trouvé`);
        }
        
        Logger.debug(`🚀 Exécution agent: ${agentName}`, { input });
        
        try {
            const startTime = Date.now();
            const result = await agent.execute(input);
            const duration = Date.now() - startTime;
            
            Logger.debug(`✅ Agent ${agentName} terminé en ${duration}ms`);
            return result;
            
        } catch (error) {
            Logger.error(`❌ Erreur agent ${agentName}`, error);
            throw error;
        }
    }
    
    /**
     * Liste les agents disponibles
     */
    listAgents(): string[] {
        return Array.from(this.agents.keys());
    }
    
    /**
     * Récupère un agent
     */
    getAgent(name: string): BaseAgent | undefined {
        return this.agents.get(name);
    }
}