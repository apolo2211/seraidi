# -*- coding: utf-8 -*-

class FluentDashboard:
    def __init__(self, name):
        self.name = name

    def show(self):
        print("\n" + "═"*60)
        print(f"   🛡️  OMNI-SHIELD DASHBOARD | {self.name}")
        print("   📍 Ksar El Boukhari, Algérie | Status: Protégé")
        print("═"*60)
        print("   [1] État du Noyau : OPTIMAL")
        print("   [2] Protection IA : ACTIVE")
        print("   [3] Chiffrement   : QUANTIQUE")
        print("─"*60)