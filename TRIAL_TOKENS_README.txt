IMPORTANT: Origin Trial Tokens Required!
==========================================

This extension requires 3 SEPARATE Origin Trial tokens.

Replace the placeholders in manifest.json with your actual tokens:
- PLACEHOLDER_TOKEN_1_FOR_PROMPT_API
- PLACEHOLDER_TOKEN_2_FOR_WRITER_API
- PLACEHOLDER_TOKEN_3_FOR_REWRITER_API

How to get tokens:
1. Visit: https://developer.chrome.com/origintrials/
2. Register 3 times (once for each API):
   - Prompt API (LanguageModel)
   - Writer API
   - Rewriter API
3. Use the same Extension ID for all 3 registrations
4. Paste all 3 tokens into the trial_tokens array in manifest.json
5. Tokens are self-describing - order doesn't matter!

Note: Summarizer API is stable and needs NO token.

For detailed instructions, see ORIGIN_TRIAL_SETUP.md
For technical details, see HOW_TOKENS_WORK.md

