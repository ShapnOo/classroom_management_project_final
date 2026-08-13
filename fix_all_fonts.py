import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replacements
    content = content.replace('text-sm', 'text-[13px]')
    content = content.replace('text-base', 'text-sm')
    content = content.replace('text-lg', 'text-base')
    content = content.replace('text-xl', 'text-lg')
    content = content.replace('text-2xl', 'text-xl')
    
    # We want to replace font-bold and font-semibold with font-medium
    # but be careful not to replace it if it's already font-medium
    content = content.replace('font-bold', 'font-medium')
    content = content.replace('font-semibold', 'font-medium')

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    for filepath in glob.glob('src/**/*.tsx', recursive=True):
        process_file(filepath)
    print("Done")
