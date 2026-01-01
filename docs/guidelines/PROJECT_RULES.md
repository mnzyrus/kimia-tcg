# 🛡️ Project Guidelines & Guardrails

## 🧠 Core Directives (Keep in Mind)

### 1. Volume System Architecture
- **Three-Layer Control**:
  1. **Master Volume**: Controls global output gain.
  2. **BGM Volume**: Background music only.
  3. **SFX Volume**: Interaction sounds (UI clicks, card placements, etc.).
- **Logic**: All audio **MUST** fall into either BGM or SFX categories.
- **Formula**: `EffectiveVolume = MasterVolume * CategoryVolume`.

### 2. Workflow Rules
- **Precise Implementation**: Do not rush. Analyze, Critique, then Act.
- **Self-Critique**: Always critique your own plan and the user's idea before execution.
- **Detailed Documentation**:
  - **WHEN**: After every successful update.
  - **WHERE**: Separate files in `docs/updates/`.
  - **HOW**: "Highest detail possible" - suitable for beginners (Noobs).

### 3. File Structure
- **Canvas**: This folder (`docs/guidelines/`) serves as the long-term memory for rules.

---

*Refer to this file at the start of every session to ensure alignment.*
