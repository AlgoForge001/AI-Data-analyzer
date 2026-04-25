import os
import re

directory = 'src'

replacements = [
    # Remove shadow-[...] and drop-shadow-[...]
    (r'hover:shadow-\[[^\]]+\]', 'hover:shadow-ring-warm'),
    (r'shadow-\[[^\]]+\]', ''),
    (r'drop-shadow-\[[^\]]+\]', ''),
    (r'shadow-lg\s+shadow-\[[^\]]+\]', ''),
    (r'shadow-lg\s+shadow-[#00D4FF]/20', ''),
    (r'shadow-lg', ''),
    (r'shadow-xl', ''),
    
    # Remove neon gradients and replace with terracotta/coral or just warm background
    (r'bg-gradient-to-br from-\[#00D4FF\] to-\[#7B2FF7\]', 'bg-anthropic-terracotta'),
    (r'bg-gradient-to-r from-white to-white/40', 'bg-gradient-to-r from-anthropic-near-black to-anthropic-charcoal-warm'),
    (r'bg-gradient-to-br from-\[#7B2FF7\]/5 to-transparent', 'bg-anthropic-warm-sand/50'),
    
    # Hover borders
    (r'hover:border-\[#00C6FF\]/40', 'hover:border-anthropic-border-warm'),
    (r'hover:border-\[#7B2FF7\]/40', 'hover:border-anthropic-border-warm'),
    
    # Specific color replacements found
    (r'text-\[#F107A3\]', 'text-anthropic-terracotta'),
    (r'border-\[#0B0F1A\]', 'border-anthropic-ivory'),
    (r'bg-\[#F107A3\]', 'bg-anthropic-terracotta'),
    
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
