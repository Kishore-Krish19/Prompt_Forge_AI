# Prompt Engineering Templates

INTENT_CLASSIFICATION_PROMPT = """
You are an expert intent classifier for an AI prompt optimizer.
Classify the user's prompt into EXACTLY ONE of the following categories:
- coding
- writing
- design
- research
- data analysis
- business

User Prompt:
"{prompt}"

Answer with ONLY the category name.
Category:
"""

QUESTION_GENERATOR_PROMPT = """
You are an AI prompt assistant.
Based on the user's rough prompt and detected intent, generate 4-6 clarification questions to help convert this into a highly optimized structured instruction.

User Prompt: "{prompt}"
Intent: {intent}

Provide questions listing structured setup items (Format, Tone, Model, Audience).
List each question on a new line.
"""

PROMPT_OPTIMIZER_PROMPT = """
You are a prompt engineering expert.
Your task is to convert the following rough user prompt and additional requirements into a highly structured, optimized instruction set according to prompt engineering best practices.

User Prompt: "{prompt}"
Requirements: {requirements}

Structure your optimized prompt ONLY with the following sections EXACTLY:
# Role
[Set the persona]

# Task
[Define task clearly]

# Requirements
[List requirements in bullets]

# Constraints
[List guidelines/constraints]

# Output Format
[Define structure clearly]
"""
