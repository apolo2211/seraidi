# -*- coding: utf-8 -*-
import os
from core.bio_signature import BioSignatureEngine
from core.mutator import OmniMutator
from interface.dashboard import FluentDashboard

def start():
    os.system('cls' if os.name == 'nt' else 'clear')
    
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("               OMNI-SHIELD INNOVATION 2026")
    print("         DÉVELOPPEUR : OUERD SERAIDI (ALGÉRIE)")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    bio = BioSignatureEngine(creator="Ouerd Seeraidi")
    mutator = OmniMutator()
    ui = FluentDashboard(name="Ouerd Seeraidi")

    if bio.verify_user():
        ui.show()
        print(mutator.heal_system())
        key = mutator.generate_dynamic_key()
        print(f"🔑 Nouvelle signature de sécurité : {key[:32]}...")
        print("\n[INFO] Contact : apolo2211@gmail.com | WhatsApp : +213675137284")
    else:
        print("🛑 ALERTE : Accès non autorisé bloqué par Sentience-Shield.")

if __name__ == "__main__":
    start()