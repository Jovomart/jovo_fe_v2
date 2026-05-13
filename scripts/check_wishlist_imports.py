from pathlib import Path

base = Path(r'C:\Users\user\Downloads\jovo-store-v3\jovo-store')
missing = []
for p in sorted(base.glob('app/(main)/**/*page.tsx')):
    text = p.read_text(encoding='utf-8')
    if 'useWishlist()' in text and 'import { useWishlist } from "@/context/WishlistContext"' not in text and "import { useWishlist } from '@/context/WishlistContext'" not in text:
        missing.append(p)

print(len(missing))
for p in missing:
    print(p)
