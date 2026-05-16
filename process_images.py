from PIL import Image
import os
import shutil

paths = [
    r"C:\Users\abhay\.gemini\antigravity\brain\11e9b1e0-325f-4f51-8fae-6734b6939516\watermelon_1778915674837.png",
    r"C:\Users\abhay\.gemini\antigravity\brain\11e9b1e0-325f-4f51-8fae-6734b6939516\apple_1778915691277.png",
    r"C:\Users\abhay\.gemini\antigravity\brain\11e9b1e0-325f-4f51-8fae-6734b6939516\orange_1778915708795.png",
    r"C:\Users\abhay\.gemini\antigravity\brain\11e9b1e0-325f-4f51-8fae-6734b6939516\bomb_1778915723863.png"
]

out_dir = r"c:\Users\abhay\Documents\fruit ninja\assets"
os.makedirs(out_dir, exist_ok=True)

for p in paths:
    if not os.path.exists(p): 
        print(f"File not found: {p}")
        continue
    img = Image.open(p).convert("RGBA")
    datas = img.getdata()
    new_data = []
    for item in datas:
        # white threshold
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    name = os.path.basename(p).split('_')[0] + '.png'
    img.save(os.path.join(out_dir, name))
    print(f"Saved {name}")

# copy background
bg_path = r"C:\Users\abhay\.gemini\antigravity\brain\11e9b1e0-325f-4f51-8fae-6734b6939516\game_bg_1778915658275.png"
if os.path.exists(bg_path):
    shutil.copy(bg_path, os.path.join(out_dir, "game_bg.png"))
    print("Saved game_bg.png")
else:
    print("Background not found")
