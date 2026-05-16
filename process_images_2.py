from PIL import Image
import os
import shutil

# Process gesture icon
icon_path = r"C:\Users\abhay\.gemini\antigravity\brain\11e9b1e0-325f-4f51-8fae-6734b6939516\gesture_icon_1778916610295.png"
out_dir = r"c:\Users\abhay\Documents\fruit ninja\assets"

if os.path.exists(icon_path):
    img = Image.open(icon_path).convert("RGBA")
    datas = img.getdata()
    new_data = []
    for item in datas:
        # white threshold
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    img.save(os.path.join(out_dir, "gesture_icon.png"))
    print("Saved gesture_icon.png")

# Process game over background
bg_path = r"C:\Users\abhay\.gemini\antigravity\brain\11e9b1e0-325f-4f51-8fae-6734b6939516\gameover_bg_1778916627164.png"
if os.path.exists(bg_path):
    shutil.copy(bg_path, os.path.join(out_dir, "gameover_bg.png"))
    print("Saved gameover_bg.png")
