import os
import re

directory = 'src'

replacements = [
    (r'\bfont-bold\b', 'font-medium'),
    (r'\bfont-semibold\b', 'font-medium'),
    (r'\bfont-black\b', 'font-medium'),
    (r'border-white/10', 'border-anthropic-border-warm'),
    (r'border-white/5', 'border-anthropic-border-cream'),
]

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            new_content = content
            for pattern, repl in replacements:
                new_content = re.sub(pattern, repl, new_content)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
