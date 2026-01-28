import re

path = "/Users/xoxo/Documents/epsilon/PRD_MOBILE_FULL.md"
with open(path, "r") as f:
    lines = f.readlines()

for line in lines[:50]:
    match = re.search(r"- \[ \] (\d+)\.", line)
    if match:
        print(f"Matched: {match.group(0)}")
