from pathlib import Path

base = Path(r'c:\Users\user\Downloads\jovo-store-v3\jovo-store')
changes = []
replacements = [
    (r'href="/"', r'href="/shop"'),
    (r"href='/'", r"href='/shop'"),
    (r'Link href="/"', r'Link href="/shop"'),
    (r"Link href='/'", r"Link href='/shop'"),
    (r'router.push("/")', r'router.push("/shop")'),
    (r"router.push('/')", r"router.push('/shop')"),
    (r'router.replace("/")', r'router.replace("/shop")'),
    (r"router.replace('/')", r"router.replace('/shop')"),
    (r'onClick={() => router.push("/")}', r'onClick={() => router.push("/shop")}'),
    (r"onClick={() => router.push('/')}", r"onClick={() => router.push('/shop')}") ,
    (r'Back to Home', r'Back to Shop'),
    (r'>Home<', r'>Shop<'),
    (r'> Home <', r'> Shop <'),
    (r'Home</Link>', r'Shop</Link>'),
]

for p in base.rglob('*.tsx'):
    path_str = str(p).replace('/', '\\')
    if 'app\\(main)' not in path_str and 'app\\(auth)' not in path_str:
        continue
    text = p.read_text(encoding='utf-8')
    new = text
    for old, new_str in replacements:
        new = new.replace(old, new_str)
    if new != text:
        p.write_text(new, encoding='utf-8')
        changes.append(str(p))

print('changed', len(changes))
for p in changes:
    print(p)
