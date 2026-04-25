import os
import re

directory = 'src'

replacements = [
    (r'\btext-white\b', 'text-anthropic-near-black'),
    (r'\btext-slate-400\b', 'text-anthropic-stone-gray'),
    (r'\btext-slate-500\b', 'text-anthropic-olive-gray'),
    (r'\btext-slate-300\b', 'text-anthropic-stone-gray'),
    (r'\btext-slate-600\b', 'text-anthropic-olive-gray'),
    (r'text-\[#00D4FF\]', 'text-anthropic-focus'),
    (r'bg-\[#00D4FF\]', 'bg-anthropic-focus'),
    (r'border-\[#00D4FF\]', 'border-anthropic-focus'),
    (r'text-\[#F107A3\]', 'text-anthropic-terracotta'),
    (r'text-\[#7B2FF7\]', 'text-anthropic-terracotta'),
    (r'\btext-emerald-400\b', 'text-anthropic-terracotta'),
    
    (r'\btext-2xl\s+font-bold\b', 'text-sub-small'),
    (r'\btext-xl\s+font-bold\b', 'text-feature'),
    (r'\btext-xl\b', 'text-sub-small'),
    (r'\btext-sm\s+font-bold\b', 'text-body-nav'),
    (r'\btext-sm\s+font-medium\b', 'text-body-nav'),
    (r'\btext-xs\s+font-bold\b', 'text-label'),
    (r'\btext-xs\b', 'text-caption'),
    (r'\btext-sm\b', 'text-body-sm'),
    (r'\btext-base\b', 'text-body-std'),
    
    (r'\bbtn-gradient\b', 'btn-terracotta'),
    
    (r'bg-white/10', 'bg-anthropic-warm-sand'),
    (r'bg-white/5', 'bg-anthropic-warm-sand'),
    (r'bg-\[\#0B0F1A\]', 'bg-anthropic-parchment'),
    (r'bg-\[\#0D1117\]', 'bg-anthropic-ivory'),
    (r'bg-\[\#161B22\]', 'bg-anthropic-pure-white'),
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
